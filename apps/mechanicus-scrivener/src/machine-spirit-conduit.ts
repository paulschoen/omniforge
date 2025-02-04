import { OpenAI } from 'openai';

export class MachineSpiritConduit {
  private client;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  public async receiveWisdom(prompt: string): Promise<string> {
    try {
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
    } catch (error) {
      console.error(
        '⚠ Machine Spirit failed to grant wisdom. The Omnissiah is angered by our lack of faith.:',
        error,
      );
      return '';
    }
  }
}
