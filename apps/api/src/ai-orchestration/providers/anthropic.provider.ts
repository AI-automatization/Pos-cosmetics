import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  ILlmProvider,
  LlmCallInput,
  LlmCallOutput,
  calcCostUsd,
} from './ai-provider.interface';

@Injectable()
export class AnthropicProvider implements ILlmProvider {
  readonly name = 'anthropic';
  readonly defaultModel = 'claude-sonnet-4-6';

  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async call(input: LlmCallInput): Promise<LlmCallOutput> {
    const model = input.model ?? this.defaultModel;
    const maxTokens = input.maxTokens ?? 4096;

    const systemMsg = input.messages.find((m) => m.role === 'system');
    const userMsgs = input.messages.filter((m) => m.role !== 'system');

    const response = await this.client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemMsg?.content,
      messages: userMsgs.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const promptTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const content =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    return {
      content,
      model,
      provider: this.name,
      promptTokens,
      outputTokens,
      totalTokens: promptTokens + outputTokens,
      costUsd: calcCostUsd(model, promptTokens, outputTokens),
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Lightweight check — just create a client instance (no API call)
      return !!this.config.get<string>('ANTHROPIC_API_KEY');
    } catch {
      return false;
    }
  }
}
