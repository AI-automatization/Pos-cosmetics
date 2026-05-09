export type AiTaskComplexity = 'trivial' | 'medium' | 'deep';

export interface LlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmCallInput {
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string; // override auto-routing
}

export interface LlmCallOutput {
  content: string;
  model: string;
  provider: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface ILlmProvider {
  readonly name: string; // 'anthropic' | 'openai'
  readonly defaultModel: string;
  call(input: LlmCallInput): Promise<LlmCallOutput>;
  isAvailable(): Promise<boolean>;
}

/**
 * Token cost per 1M tokens (USD).
 * Keep in sync with provider pricing.
 */
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  // Anthropic Claude
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
  'claude-opus-4-6': { input: 15.00, output: 75.00 },
  // OpenAI
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
};

export function calcCostUsd(model: string, promptTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model];
  if (!costs) return 0;
  return (promptTokens / 1_000_000) * costs.input + (outputTokens / 1_000_000) * costs.output;
}
