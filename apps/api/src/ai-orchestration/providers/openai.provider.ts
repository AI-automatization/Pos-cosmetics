import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ILlmProvider,
  LlmCallInput,
  LlmCallOutput,
  calcCostUsd,
} from './ai-provider.interface';

@Injectable()
export class OpenAiProvider implements ILlmProvider {
  readonly name = 'openai';
  readonly defaultModel = 'gpt-4o-mini';

  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY', ''),
    });
  }

  async call(input: LlmCallInput): Promise<LlmCallOutput> {
    const model = input.model ?? this.defaultModel;
    const maxTokens = input.maxTokens ?? 4096;

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: input.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0 };
    const promptTokens = usage.prompt_tokens;
    const outputTokens = usage.completion_tokens;
    const content = response.choices[0]?.message?.content ?? '';

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
    const key = this.config.get<string>('OPENAI_API_KEY');
    return !!(key && key.length > 10);
  }
}
