// LLM API client for chat responses
import { ref } from 'vue';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';

/**
 * Send chat request to LLM API
 * @param messages Array of chat messages
 * @param model Model name to use
 * @returns AI response content
 */
export async function chatWithAI(messages: ChatMessage[], model: string = 'gpt-3.5-turbo'): Promise<string> {
  if (!API_KEY) {
    console.error('API key is not configured');
    throw new Error('API key is not configured. Please set VITE_API_KEY environment variable.');
  }

  const request: ChatRequest = {
    messages,
    model,
    temperature: 0.7,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat with AI failed:', error);
    throw error;
  }
}

/**
 * Check if API is configured
 */
export function isAPIConfigured(): boolean {
  return !!API_KEY && API_KEY.length > 10; // Basic validation
}
