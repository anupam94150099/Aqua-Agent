import { SensorData, LeakAnalysis, LeakSeverity, AgentDecision, AnomalyType } from '../types/index.js';

export class DecisionEngine {
  public static analyzeLeakage(sensorData: SensorData): LeakAnalysis {
    const flow_in = Math.max(0, sensorData.flow_in);
    const flow_out = Math.max(0, sensorData.flow_out);
    const pressure = sensorData.pressure;
    const loss = Math.max(0, flow_in - flow_out);
    const lossPercentage = flow_in > 0 ? loss / flow_in : 0;

    let severity: LeakSeverity = 'NORMAL';
    let anomalyType: AnomalyType = 'NONE';
    let leakProbability = 0.04;
    let theftProbability = 0.02;
    let isLeak = false;
    let message = 'Flow balance and pressure across all distribution sectors are within nominal design specifications.';

    if (lossPercentage >= 0.10) {
      isLeak = true;

      // Distinguish between Physical Rupture vs. Water Theft / Unauthorized Tapping
      if (pressure >= 2.5) {
        // High water deficit + Intact line pressure = Water Theft / Illegal Tapping!
        severity = 'MEDIUM';
        anomalyType = 'WATER_THEFT';
        theftProbability = 0.94;
        leakProbability = 0.12;
        message = `🚨 WATER THEFT / ILLEGAL TAPPING DETECTED in ${sensorData.zone}: Unmetered siphoning of ${(lossPercentage * 100).toFixed(1)}% (${loss.toFixed(1)} L/s) with stable hydraulic line pressure (${pressure.toFixed(2)} bar). Flagged for automated flow restriction and municipal enforcement.`;
      } else {
        // Pressure collapsed = Physical Pipe Burst / Rupture
        anomalyType = 'LEAK_RUPTURE';
        theftProbability = 0.05;
        if (lossPercentage >= 0.25 || pressure < 2.0) {
          severity = 'HIGH';
          leakProbability = Math.min(0.99, 0.75 + lossPercentage * 0.2);
          message = `💥 CRITICAL PHYSICAL PIPE RUPTURE in ${sensorData.zone}: Acute flow deficit of ${(lossPercentage * 100).toFixed(1)}% (${loss.toFixed(1)} L/s) with severe pressure collapse to ${pressure.toFixed(2)} bar. Immediate motorized valve isolation triggered.`;
        } else {
          severity = 'MEDIUM';
          leakProbability = 0.70;
          message = `⚠️ MODERATE LEAK DETECTED in ${sensorData.zone}: Mass balance deficit of ${(lossPercentage * 100).toFixed(1)}% (${loss.toFixed(1)} L/s). Planned branch isolation recommended.`;
        }
      }
    }

    return {
      flow_in,
      flow_out,
      loss: parseFloat(loss.toFixed(2)),
      lossPercentage: parseFloat(lossPercentage.toFixed(4)),
      pressure: parseFloat(pressure.toFixed(2)),
      severity,
      anomalyType,
      leakProbability: parseFloat(leakProbability.toFixed(2)),
      theftProbability: parseFloat(theftProbability.toFixed(2)),
      isLeak,
      zone: sensorData.zone,
      message,
    };
  }

  public static decideAction(analysis: LeakAnalysis, attemptedActions: string[]): AgentDecision {
    if (analysis.severity === 'NORMAL' || analysis.anomalyType === 'NONE') {
      return {
        action: 'NO_ACTION',
        severity: 'NORMAL',
        anomalyType: 'NONE',
        targetZone: analysis.zone,
        reason: 'All distribution branches operating within nominal mass balance limits.',
        explanation: 'Mass balance deficit is below 10% and line pressure is stable above 2.5 bar. Continuous passive telemetry monitoring active.',
      };
    }

    // Water Theft Handler
    if (analysis.anomalyType === 'WATER_THEFT') {
      return {
        action: 'RESTRICT_THEFT_BRANCH',
        targetValve: 'Valve 3',
        valveAction: 'close',
        severity: 'MEDIUM',
        anomalyType: 'WATER_THEFT',
        targetZone: 'Zone 2: Commercial & Hospital District',
        reason: 'Illegal tapping detected. Restricting branch Valve 3 to halt unmetered loss and prevent revenue drainage.',
        explanation: `Autonomous action: Closing feeder Valve 3 in Zone 2 to isolate unauthorized siphoning (${analysis.loss.toFixed(1)} L/s) and dispatching digital evidence to utility audit enforcement.`,
      };
    }

    // Physical Pipe Rupture Handler
    if (!attemptedActions.includes('Valve 1')) {
      return {
        action: 'ISOLATE_PRIMARY',
        targetValve: 'Valve 1',
        valveAction: 'close',
        severity: analysis.severity,
        anomalyType: 'LEAK_RUPTURE',
        targetZone: analysis.zone,
        reason: `Physical rupture detected in ${analysis.zone}. Triggering primary upstream isolation on Valve 1.`,
        explanation: `Autonomous decision: Isolating primary upstream Valve 1 to arrest ${(analysis.loss).toFixed(1)} L/s water loss and prevent pressure collapse across distribution grid.`,
      };
    }

    if (!attemptedActions.includes('Valve 2')) {
      return {
        action: 'ISOLATE_SECONDARY',
        targetValve: 'Valve 2',
        valveAction: 'close',
        severity: analysis.severity,
        anomalyType: 'LEAK_RUPTURE',
        targetZone: analysis.zone,
        reason: `Primary actuator (Valve 1) failed. Adapting execution plan to redundant backup isolation on Valve 2.`,
        explanation: `Re-routing isolation command to redundant backup actuator Valve 2 in ${analysis.zone}.`,
      };
    }

    return {
      action: 'ESCALATE_HUMAN',
      severity: analysis.severity,
      anomalyType: analysis.anomalyType,
      targetZone: analysis.zone,
      reason: 'All automated isolation actuators (Valve 1 & Valve 2) failed to actuate. Automatic isolation impossible.',
      explanation: 'Critical emergency: Autonomous isolation exhausted. Escalating immediately to municipal emergency dispatch and dispatching field repair crew.',
    };
  }
}
