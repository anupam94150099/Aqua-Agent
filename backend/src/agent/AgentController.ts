import { AgentState, globalAgentState } from './AgentState.js';
import { activePlanner } from './Planner.js';
import { AdaptationEngine } from './AdaptationEngine.js';
import { EvaluationEngine } from './EvaluationEngine.js';
import { ToolRegistry } from '../tools/ToolRegistry.js';
import { dbManager } from '../db/database.js';
import { 
  SensorData, 
  SystemOutcome 
} from '../types/index.js';

export interface RunAgentOptions {
  stepDelayMs?: number;
  injectedSensorData?: SensorData;
}

export class AgentController {
  private state: AgentState;

  constructor(state: AgentState = globalAgentState) {
    this.state = state;
  }

  private async delay(ms: number) {
    if (ms > 0) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  public async runCycle(options: RunAgentOptions = {}): Promise<SystemOutcome> {
    const delayMs = options.stepDelayMs ?? 400;
    let wasAdapted = false;

    // 1. OBSERVE
    let sensorData: SensorData;
    if (options.injectedSensorData) {
      sensorData = options.injectedSensorData;
    } else {
      const sensorResult = await ToolRegistry.getSensorData();
      sensorData = sensorResult.data!;
    }
    this.state.updateSensorData(sensorData);

    this.state.emitEvent(
      'OBSERVE',
      'Telemetry Acquisition',
      `Sensor data received: Flow In: ${sensorData.flow_in.toFixed(1)} L/s, Flow Out: ${sensorData.flow_out.toFixed(1)} L/s, Pressure: ${sensorData.pressure.toFixed(2)} bar [${sensorData.zone}]`,
      { sensorData }
    );
    await this.delay(delayMs);

    // 2. ANALYZE
    const analysisResult = await ToolRegistry.analyzeLeakage(sensorData);
    const analysis = analysisResult.data!;
    this.state.updateAnalysis(analysis);

    if (analysis.severity === 'NORMAL') {
      this.state.emitEvent(
        'ANALYZE',
        'Nominal Mass Balance',
        `Flow balance within safe limits: Deficit ${(analysis.lossPercentage * 100).toFixed(1)}% (${analysis.loss.toFixed(1)} L/s), Pressure: ${analysis.pressure.toFixed(2)} bar.`,
        { analysis }
      );
      await this.delay(delayMs);

      this.state.updateDecision(
        `Normal pipeline operation confirmed in ${analysis.zone}. Pressure and flow within standard limits.`,
        'NO_ACTION'
      );
      this.state.setFinalOutcome('NORMAL_OPERATION');
      this.state.emitEvent('RESOLVED', 'Routine Monitoring', 'Pipeline operational integrity nominal. Standing by.');
      return 'NORMAL_OPERATION';
    }

    this.state.emitEvent(
      'ANALYZE',
      'Flow Deficit Detected',
      `${analysis.severity} severity leak detected: Flow mismatch of ${(analysis.lossPercentage * 100).toFixed(1)}% (${analysis.loss.toFixed(1)} L/s), Pressure: ${analysis.pressure.toFixed(2)} bar.`,
      { analysis }
    );
    await this.delay(delayMs);

    // 3. PLAN & DECIDE
    const plan = await activePlanner.createPlan(analysis, this.state.getState().attemptedActions);
    this.state.updateGoal(plan.goal);
    this.state.updateDecision(plan.primaryDecision.explanation, plan.primaryDecision.action);

    this.state.emitEvent(
      'DECIDE',
      'Action Strategy Selection',
      `${analysis.severity} severity decision: Target ${plan.primaryDecision.targetValve || 'No Valve'} (${plan.primaryDecision.action}). Reasoning: ${plan.primaryDecision.reason}`,
      { plan }
    );
    await this.delay(delayMs);

    // 4. ACT (Primary Action)
    const targetValve = plan.primaryDecision.targetValve || 'Valve 1';
    this.state.recordAttempt(targetValve);

    this.state.emitEvent(
      'ACT',
      'Actuator Command Dispatch',
      `Dispatching command to ${targetValve} -> CLOSE to isolate rupture point in ${analysis.zone}`,
      { valve: targetValve, action: 'close' }
    );
    await this.delay(delayMs);

    const actionResult = await ToolRegistry.controlValve(targetValve, 'close');
    this.state.recordActionResult(actionResult);

    // 5. EVALUATE / ADAPT
    if (!actionResult.success) {
      this.state.emitEvent(
        'FAILURE',
        'Actuator Execution Failed',
        `${targetValve} failed to close: ${actionResult.error || 'Hardware timeout/jam'}`,
        { error: actionResult.error, valve: targetValve }
      );
      await this.delay(delayMs);

      const currentMemory = this.state.getState();
      const adaptPlan = AdaptationEngine.handleActuatorFailure(
        actionResult, 
        currentMemory.attemptedActions, 
        analysis
      );

      this.state.emitEvent(
        'ADAPT',
        'Autonomous Dynamic Adaptation',
        adaptPlan.explanation,
        { adaptPlan }
      );
      await this.delay(delayMs);

      if (adaptPlan.nextActionType === 'RETRY_ALTERNATIVE_VALVE' && adaptPlan.suggestedValve) {
        wasAdapted = true;
        const backupValve = adaptPlan.suggestedValve;
        this.state.recordAttempt(backupValve);

        this.state.emitEvent(
          'ACT',
          'Backup Actuator Dispatch',
          `Dispatching fallback isolation command to ${backupValve} -> CLOSE`,
          { valve: backupValve, action: 'close' }
        );
        await this.delay(delayMs);

        const backupResult = await ToolRegistry.controlValve(backupValve, 'close');
        this.state.recordActionResult(backupResult);

        if (!backupResult.success) {
          this.state.emitEvent(
            'FAILURE',
            'Backup Actuator Failed',
            `${backupValve} also failed: ${backupResult.error || 'Actuator bus offline'}`,
            { error: backupResult.error, valve: backupValve }
          );
          await this.delay(delayMs);

          const escalatePlan = AdaptationEngine.handleActuatorFailure(
            backupResult,
            this.state.getState().attemptedActions,
            analysis
          );

          this.state.emitEvent(
            'ADAPT',
            'Final Adaptation - Emergency Escalation',
            escalatePlan.explanation,
            { escalatePlan }
          );
          await this.delay(delayMs);

          await ToolRegistry.sendAlert(
            escalatePlan.alertMessage || 'CRITICAL: Multiple actuator isolation failure.', 
            'CRITICAL'
          );

          this.state.setFinalOutcome('ESCALATED');
          this.state.emitEvent(
            'ESCALATED',
            'Human Maintenance Escalation',
            `Automatic isolation impossible. Field maintenance crew alerted with high-priority emergency dispatch.`
          );

          dbManager.saveIncident({
            id: `inc_${Date.now()}`,
            timestamp: new Date().toISOString(),
            zone: analysis.zone,
            severity: analysis.severity,
            outcome: 'ESCALATED',
            actions: 'Attempted Valve 1 (FAILED), Attempted Valve 2 (FAILED) -> Escalated to Emergency Field Crew',
            explanation: escalatePlan.explanation,
          });

          return 'ESCALATED';
        }
      } else {
        this.state.setFinalOutcome('ESCALATED');
        this.state.emitEvent('ESCALATED', 'Emergency Escalation', 'Direct human dispatch triggered.');
        return 'ESCALATED';
      }
    }

    // 6. EVALUATE & VERIFY
    this.state.emitEvent(
      'EVALUATE',
      'Telemetry Post-Actuation Evaluation',
      'Measuring post-isolation mass balance and pressure recovery curve...'
    );
    await this.delay(delayMs);

    const verifyResult = await ToolRegistry.verifyRecovery();
    const freshSensor = verifyResult.data!.sensorData;
    this.state.updateSensorData(freshSensor);

    const evaluation = EvaluationEngine.evaluateOutcome(analysis, freshSensor, wasAdapted);

    if (evaluation.success) {
      this.state.emitEvent(
        'VERIFY',
        'Hydraulic Recovery Verified',
        `Leak successfully isolated! Water loss dropped from ${evaluation.preLoss.toFixed(1)} L/s to ${evaluation.postLoss.toFixed(1)} L/s (${evaluation.lossReductionPercentage}% reduction). Pressure: ${evaluation.postPressure.toFixed(2)} bar.`,
        { evaluation }
      );
      await this.delay(delayMs);

      const finalOutcome: SystemOutcome = wasAdapted ? 'ADAPTED_AND_RESOLVED' : 'RESOLVED';
      this.state.setFinalOutcome(finalOutcome);

      this.state.emitEvent(
        finalOutcome,
        'Mission Objective Accomplished',
        wasAdapted 
          ? 'ADAPTED_AND_RESOLVED: Pipeline recovered via autonomous fallback strategy.' 
          : 'RESOLVED: Pipeline secured and nominal flow restored.'
      );

      dbManager.saveIncident({
        id: `inc_${Date.now()}`,
        timestamp: new Date().toISOString(),
        zone: analysis.zone,
        severity: analysis.severity,
        outcome: finalOutcome,
        actions: wasAdapted ? 'Valve 1 (FAILED) -> Valve 2 (CLOSED)' : `${targetValve} (CLOSED)`,
        explanation: evaluation.summary,
      });

      return finalOutcome;
    } else {
      this.state.setFinalOutcome('ESCALATED');
      this.state.emitEvent(
        'ESCALATED',
        'Verification Incomplete',
        'Post-action telemetry indicates leak persists. Escalating to human supervision.'
      );
      return 'ESCALATED';
    }
  }
}

export const globalAgentController = new AgentController();
