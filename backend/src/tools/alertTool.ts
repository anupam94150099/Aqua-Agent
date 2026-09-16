import { ToolResult } from '../types/index.js';

export async function sendAlert(message: string, severity: 'INFO' | 'WARNING' | 'CRITICAL'): Promise<ToolResult> {
  const alertPayload = {
    message,
    severity,
    dispatchedAt: new Date().toISOString(),
    channel: severity === 'CRITICAL' ? 'EMERGENCY_DISPATCH_AND_SMS' : 'MONITORING_DASHBOARD',
    status: 'DELIVERED',
  };

  return {
    success: true,
    tool: 'sendAlert',
    data: alertPayload,
    timestamp: new Date().toISOString(),
  };
}
