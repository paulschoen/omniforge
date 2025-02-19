import { OpenAI } from 'openai';
import { Logger } from '@omniforge/utils';

export class MachineSpiritConduit {
  private client;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  public async receiveWisdom({
    model = 'gpt-4o-mini',
    messages = [],
    temperature = 0.7,
    maxTokens = 200,
  }: {
    model?: `${OpenAI.Chat.ChatModel}`;
    messages?: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    try {
      Logger.info(
        'Requesting wisdom from the Machine Spirit, may he guide us to the truth.',
      );
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      return response.choices[0]?.message?.content ?? '';
    } catch (error: unknown) {
      Logger.error(
        `⚠ Machine Spirit failed to grant wisdom. The Omnissiah is angered by our lack of faith.: ${(error as Error).message}`,
      );
      return '';
    }
  }
}
