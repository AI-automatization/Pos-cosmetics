export type AiWorkflowStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'HEALING'
  | 'CANCELLED';

export type AiTaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'SKIPPED';

export type AiAgentType =
  | 'PlannerAgent'
  | 'ResearchAgent'
  | 'AnalystAgent'
  | 'ReviewAgent'
  | 'ValidationAgent'
  | 'HealerAgent'
  | 'MonitoringAgent'
  | 'MemoryAgent'
  | 'ReportingAgent'
  | 'GovernanceAgent'
  | 'OptimizationAgent'
  | 'NotificationAgent';

export interface WorkflowCreateInput {
  tenantId: string;
  name: string;
  agentType: AiAgentType;
  input: Record<string, unknown>;
  autoMode?: boolean;
  triggeredBy?: string; // userId or 'AUTO_MODE'
}

export interface WorkflowResult {
  id: string;
  tenantId: string;
  name: string;
  status: AiWorkflowStatus;
  autoMode: boolean;
  triggeredBy: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  modelUsed: string | null;
  totalTokens: number;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface TaskResult {
  id: string;
  workflowId: string;
  agentType: string;
  status: AiTaskStatus;
  output: Record<string, unknown> | null;
  error: string | null;
  modelUsed: string | null;
  tokensUsed: number;
  attempt: number;
  completedAt: Date | null;
}

export interface AutoModeContext {
  tenantId: string;
  triggerReason: string;
  payload: Record<string, unknown>;
}
