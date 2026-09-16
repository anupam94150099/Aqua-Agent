import { SensorData, LeakAnalysis, SystemOutcome } from '../types/index.js';
import { DecisionEngine } from './DecisionEngine.js';

export interface EvaluationReport {
  success: boolean;
  preLoss: number;
  postLoss: number;
  lossReductionPercentage: number;
  pressureRestored: boolean;
  postPressure: number;
  finalSeverity: string;
  recommendedOutcome: SystemOutcome;
  summary: string;
}

export class EvaluationEngine {
  public static evaluateOutcome(
    preAnalysis: LeakAnalysis,
    postSensor: SensorData,
    wasAdapted: boolean
  ): EvaluationReport {
    const postAnalysis = DecisionEngine.analyzeLeakage(postSensor);
    const preLoss = preAnalysis.loss;
    const postLoss = postAnalysis.loss;
    const lossDiff = preLoss - postLoss;
    const lossReductionPercentage = preLoss > 0 ? (lossDiff / preLoss) * 100 : 0;
    const pressureRestored = postSensor.pressure >= 2.5;

    const isFullyResolved = postAnalysis.severity === 'NORMAL' && postAnalysis.lossPercentage < 0.10 && pressureRestored;

    let recommendedOutcome: SystemOutcome = 'IN_PROGRESS';
    let summary = '';

    if (isFullyResolved) {
      recommendedOutcome = wasAdapted ? 'ADAPTED_AND_RESOLVED' : 'RESOLVED';
      summary = `Hydraulic Verification Confirmed: Water loss reduced from ${preLoss.toFixed(1)} L/s to ${postLoss.toFixed(1)} L/s (${lossReductionPercentage.toFixed(1)}% recovery). Line pressure recovered to ${postSensor.pressure.toFixed(2)} bar. Leak successfully isolated.`;
    } else {
      recommendedOutcome = 'IN_PROGRESS';
      summary = `Hydraulic Verification Incomplete: Post-action water loss is still ${postLoss.toFixed(1)} L/s (${(postAnalysis.lossPercentage * 100).toFixed(1)}%). Further adaptation or human escalation required.`;
    }

    return {
      success: isFullyResolved,
      preLoss,
      postLoss,
      lossReductionPercentage: parseFloat(lossReductionPercentage.toFixed(1)),
      pressureRestored,
      postPressure: postSensor.pressure,
      finalSeverity: postAnalysis.severity,
      recommendedOutcome,
      summary,
    };
  }
}
