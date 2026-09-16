import { LeakAnalysis, AgentDecision } from '../types/index.js';
import { DecisionEngine } from './DecisionEngine.js';

export interface PlanStep {
  stepNumber: number;
  tool: string;
  args: Record<string, any>;
  description: string;
  isContingency?: boolean;
}

export interface ExecutionPlan {
  goal: string;
  primaryDecision: AgentDecision;
  steps: PlanStep[];
  contingencyStrategy: string;
  plannerType: 'Deterministic' | 'LLM-Augmented';
}

export interface AgentPlanner {
  createPlan(analysis: LeakAnalysis, attemptedActions: string[]): Promise<ExecutionPlan>;
  generateExplanation?(analysis: LeakAnalysis, outcome: string): Promise<string>;
}

export class DeterministicPlanner implements AgentPlanner {
  public async createPlan(analysis: LeakAnalysis, attemptedActions: string[]): Promise<ExecutionPlan> {
    const decision = DecisionEngine.decideAction(analysis, attemptedActions);
    const steps: PlanStep[] = [];

    if (decision.action === 'NO_ACTION') {
      steps.push({
        stepNumber: 1,
        tool: 'sendAlert',
        args: { message: `System operating within nominal range in ${analysis.zone}.`, severity: 'INFO' },
        description: 'Log routine operational telemetry check.',
      });
      return {
        goal: 'Maintain safe nominal pipeline monitoring',
        primaryDecision: decision,
        steps,
        contingencyStrategy: 'Continue sensor polling loop.',
        plannerType: 'Deterministic',
      };
    }

    if (decision.action === 'ISOLATE_PRIMARY') {
      steps.push({
        stepNumber: 1,
        tool: 'controlValve',
        args: { valveId: 'Valve 1', action: 'close' },
        description: 'Command primary isolation valve (Valve 1) to CLOSE.',
      });
      steps.push({
        stepNumber: 2,
        tool: 'verifyRecovery',
        args: {},
        description: 'Verify flow deficit reduction and pressure stabilization.',
      });
      return {
        goal: `Isolate ${analysis.severity} leak in ${analysis.zone} using primary valve`,
        primaryDecision: decision,
        steps,
        contingencyStrategy: 'If Valve 1 fails, adapt immediately to secondary isolation actuator Valve 2.',
        plannerType: 'Deterministic',
      };
    }

    if (decision.action === 'ISOLATE_SECONDARY') {
      steps.push({
        stepNumber: 1,
        tool: 'controlValve',
        args: { valveId: 'Valve 2', action: 'close' },
        description: 'Command secondary isolation valve (Valve 2) to CLOSE.',
      });
      steps.push({
        stepNumber: 2,
        tool: 'verifyRecovery',
        args: {},
        description: 'Re-verify hydraulic parameters to confirm successful isolation.',
      });
      return {
        goal: `Execute adaptive secondary isolation for ${analysis.zone}`,
        primaryDecision: decision,
        steps,
        contingencyStrategy: 'If Valve 2 also fails, trigger immediate emergency human maintenance escalation.',
        plannerType: 'Deterministic',
      };
    }

    steps.push({
      stepNumber: 1,
      tool: 'sendAlert',
      args: {
        message: `CRITICAL ALERT: Multiple actuator failure in ${analysis.zone}. Automatic isolation impossible. Immediate on-site intervention required.`,
        severity: 'CRITICAL',
      },
      description: 'Dispatch emergency alert to municipal field maintenance crew.',
    });

    return {
      goal: `Emergency escalation: Field intervention required in ${analysis.zone}`,
      primaryDecision: decision,
      steps,
      contingencyStrategy: 'Await physical crew acknowledgment and manual bypass execution.',
      plannerType: 'Deterministic',
    };
  }
}

export class OptionalLLMPlanner implements AgentPlanner {
  private deterministicFallback = new DeterministicPlanner();
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.LLM_MODEL || 'gpt-4o-mini';
  }

  public async createPlan(analysis: LeakAnalysis, attemptedActions: string[]): Promise<ExecutionPlan> {
    const basePlan = await this.deterministicFallback.createPlan(analysis, attemptedActions);

    if (!this.apiKey) {
      return basePlan;
    }

    try {
      const prompt = `You are AquaAgent AI Planner. Analyze the pipeline telemetry:
Zone: ${analysis.zone}
Flow In: ${analysis.flow_in} L/s
Flow Out: ${analysis.flow_out} L/s
Loss: ${analysis.loss} L/s (${(analysis.lossPercentage * 100).toFixed(1)}%)
Pressure: ${analysis.pressure} bar
Severity: ${analysis.severity}
Attempted Actions: ${attemptedActions.join(', ') || 'None'}

Provide a 2-sentence tactical reasoning statement for the control action.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.2,
        }),
      });

      if (response.ok) {
        const json: any = await response.json();
        const llmReasoning = json?.choices?.[0]?.message?.content?.trim();
        if (llmReasoning) {
          basePlan.primaryDecision.explanation = `[LLM-Augmented Analysis] ${llmReasoning}`;
          basePlan.plannerType = 'LLM-Augmented';
        }
      }
    } catch (err) {
      console.warn('[OptionalLLMPlanner] LLM call skipped, using deterministic planner.');
    }

    return basePlan;
  }
}

export const activePlanner: AgentPlanner = process.env.OPENAI_API_KEY 
  ? new OptionalLLMPlanner() 
  : new DeterministicPlanner();
