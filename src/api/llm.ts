export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async chat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
    // Simulate AI response for now
    // In a real app, this would call an actual LLM API
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      // Simple echo with a mock response
      return `I understand you said: "${lastMessage.content}". How can I help you and your pet today?`;
    }
    return 'Hello! How can I help you take care of your pet?';
  }
}
