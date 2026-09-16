import { ToolResult, LeakAnalysis, ValveId } from '../types/index.js';

export interface AdaptationPlan {
  adaptationRequired: boolean;
  reason: string;
  nextActionType: 'RETRY_ALTERNATIVE_VALVE' | 'ESCALATE_HUMAN';
  suggestedValve?: ValveId;
  suggestedAction?: 'close' | 'open';
  alertMessage?: string;
  explanation: string;
}

export class AdaptationEngine {
  public static handleActuatorFailure(
    failedResult: ToolResult,
    attemptedActions: string[],
    analysis: LeakAnalysis
  ): AdaptationPlan {
    const failedValve = failedResult.valve || 'Unknown Valve';
    const failureMsg = failedResult.error || 'Actuator did not respond to command.';

    if (failedValve === 'Valve 1' && !attemptedActions.includes('Valve 2')) {
      return {
        adaptationRequired: true,
        reason: `Primary actuator (${failedValve}) experienced hardware failure: "${failureMsg}". Re-planning autonomous recovery path.`,
        nextActionType: 'RETRY_ALTERNATIVE_VALVE',
        suggestedValve: 'Valve 2',
        suggestedAction: 'close',
        explanation: `Dynamic Adaptation: Upstream Valve 1 jammed. Re-routing isolation command to redundant downstream isolation actuator Valve 2 in ${analysis.zone}.`,
      };
    }

    return {
      adaptationRequired: true,
      reason: `Both primary and secondary actuators (Valve 1 & Valve 2) have failed in ${analysis.zone}. Automatic pipeline isolation is unachievable.`,
      nextActionType: 'ESCALATE_HUMAN',
      alertMessage: `CRITICAL ALERT: Multi-actuator failure in ${analysis.zone}. Both Valve 1 and Valve 2 failed. Automated isolation aborted. Urgent on-site manual intervention requested.`,
      explanation: `Dynamic Adaptation: Automated tool options exhausted. Escalating pipeline incident to human field maintenance dispatch.`,
    };
  }
}
