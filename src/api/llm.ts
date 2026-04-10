/**
 * LLM API Service
 * Handles communication with the LLM service
 */

// Configuration
const LLM_API_URL = import.meta.env.VITE_LLM_API_URL || 'http://localhost:11434/api/chat';
const LLM_API_KEY = import.meta.env.VITE_LLM_API_KEY || '';
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || 'llama3';

/**
 * API Error class for handling LLM API errors
 */
export class LLMError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = 'LLMError';
    this.statusCode = statusCode;
  }
}

/**
 * Simulated LLM response (fallback when no API available)
 * @param {string} prompt - The user's message
 * @returns {Promise<string>} Simulated AI response
 */
async function simulateResponse(prompt) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `I'm here! You said: "${prompt}". Tell me more about that.`,
        `That's interesting! What else would you like to know?`,
        `I understand. How does that make you feel?`,
        `Let's explore that topic further. What specifically interests you?`,
        `I'm processing that information...${prompt.length > 10 ? ' That is quite a topic!' : ''}`
      ];
      resolve(responses[Math.floor(Math.random() * responses.length)]);
    }, 800 + Math.random() * 500);
  });
}

/**
 * Call LLM API with the given prompt
 * @param {string} prompt - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} AI response
 */
export async function callLLM(prompt, conversationHistory = []) {
  // Build the system message
  const systemMessage = {
    role: 'system',
    content: 'You are a helpful, friendly pet care companion. You help users with pet care advice, answer their questions, and keep them company. Be warm, encouraging, and provide practical advice.'
  };

  // Build the message history
  const messages = [systemMessage, ...conversationHistory, { role: 'user', content: prompt }];

  try {
    // Check if we should use the simulated mode (no API key or local mode)
    const useSimulation = !LLM_API_KEY || LLM_API_URL.includes('localhost');

    if (useSimulation) {
      return await simulateResponse(prompt);
    }

    // Real API call
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(LLM_API_KEY && { 'Authorization': `Bearer ${LLM_API_KEY}` })
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new LLMError(`API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'I received your message, but I\'m having trouble forming a response.';

  } catch (error) {
    console.error('Error calling LLM:', error);
    // Fall back to simulated response on error
    return await simulateResponse(prompt);
  }
}

/**
 * Get a knowledge sharing message based on context
 * @param {string} context - The conversation context
 * @returns {Promise<string>} Knowledge sharing message
 */
export async function getKnowledgeSharing(context = '') {
  const knowledgeBase = [
    'Did you know? Dogs can understand up to 250 words and gestures!',
    'Fun fact: Cats sleep for about 12-16 hours a day to conserve energy.',
    'Did you know? Regular playtime can significantly reduce your pet\'s anxiety.',
    'Interesting: Exercise helps dogs maintain a healthy weight and improves their mood.',
    'Did you know? Providing mental stimulation through puzzles keeps pets sharp.',
    'Fun fact: Birds can recognize their owners\' faces and voices!',
    'Did you know? Regular grooming helps prevent skin problems in pets.',
    'Interesting: Pets can sense when their owners are feeling sad or stressed.',
    'Did you know? Daily walks are essential for a dog\'s physical and mental health.',
    'Fun fact: Cats use their whiskers to navigate and sense their environment.'
  ];

  if (context) {
    // Generate a context-aware response (simplified)
    return `Based on our conversation, here\'s something interesting: ${knowledgeBase[Math.floor(Math.random() * knowledgeBase.length)]}`;
  }

  return knowledgeBase[Math.floor(Math.random() * knowledgeBase.length)];
}
