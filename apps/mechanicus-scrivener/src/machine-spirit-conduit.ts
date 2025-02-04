import { OpenAI } from 'openai';
import { Logger } from './logger';

export class MachineSpiritConduit {
  private client;
  private logger = new Logger();

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  public async receiveWisdom(prompt: string): Promise<string> {
    try {
      this.logger.logInfo(
        'Requesting wisdom from the Machine Spirit, may he guide us to the truth.',
      );
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content ?? '';
    } catch (error: unknown) {
      this.logger.logError(
        '⚠ Machine Spirit failed to grant wisdom. The Omnissiah is angered by our lack of faith.:',
        (error as Error).message,
      );
      return '';
    }
  }
}
