export interface AgentExecuteInput {
  tenantId: string;
  workflowId: string;
  taskId: string;
  prompt: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  model?: string;
}

export interface AgentExecuteOutput {
  content: string;
  model: string;
  provider: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  metadata?: Record<string, unknown>;
}

export interface IAgent {
  readonly agentType: string;
  execute(input: AgentExecuteInput): Promise<AgentExecuteOutput>;
}
