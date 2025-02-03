import { OpenAI } from 'openai';

export class MachineSpiritConduit {
  private client;
  private systemPrompt;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.systemPrompt =
      process.env.SYSTEM_PROMPT ??
      'You are to deliver a summary of a news article in 1 sentence.';
  }

  public async receiveWisdom(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return (
        response.choices[0]?.message?.content ??
        '⚠ Machine Spirit failed to grant wisdom. The Omnissiah is angered by our lack of faith.'
      );
    } catch (error) {
      console.error('❌ Machine Spirit wisdom creation failed:', error);
      return '⚠ Machine Spirit error: Unable to generate wisdom.';
    }
  }
}
