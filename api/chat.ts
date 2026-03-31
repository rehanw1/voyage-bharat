import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError, z } from 'zod';

const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message is required.').max(2000, 'Message is too long.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .max(12, 'History is too long.')
    .optional()
    .default([]),
});

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

async function generateGeminiReply(message: string, history: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured');
    return null;
  }

  try {
    const conversationHistory = history
      .slice(-5)
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: 'You are a helpful AI assistant for the Voyage Bharat travel website. Be friendly, practical, and concise. Provide useful travel information when asked.',
            },
          ],
        },
        contents: [...conversationHistory, { role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}

async function generateFallbackReply(message: string): Promise<string> {
  // Fallback responses based on keywords
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Namaste! Welcome to Voyage Bharat. How can I help you plan your journey through India?';
  }

  if (lowerMessage.includes('destination') || lowerMessage.includes('where')) {
    return 'India has amazing destinations! From the Taj Mahal in Agra to the beaches of Goa, Kerala backwaters, and the mountains of Himachal Pradesh. What region interests you?';
  }

  if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('budget')) {
    return 'Budget travel in India is very affordable. A comfortable trip can range from $25-50 USD per day depending on region. Would you like specific recommendations?';
  }

  if (lowerMessage.includes('best time') || lowerMessage.includes('when')) {
    return 'The best time to visit India is October to March (winter). It has pleasant weather and is ideal for most destinations.';
  }

  return 'Great question! I can help you with travel planning, destination recommendations, bookings, and general questions about India. What would you like to know?';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = chatRequestSchema.parse(req.body);

    // Try Gemini first
    let reply = await generateGeminiReply(message, (history || []) as ChatMessage[]);

    // Fallback if Gemini fails
    if (!reply) {
      reply = await generateFallbackReply(message);
    }

    return res.status(200).json({
      reply,
      source: reply ? 'gemini' : 'fallback',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.issues[0]?.message || 'Invalid chat request.',
      });
    }

    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Sorry, the chatbot is temporarily unavailable. Please try again later.',
      source: 'fallback',
      reply: 'I apologize for the inconvenience. Please try your message again.',
    });
  }
}
