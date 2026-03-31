import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError, z } from 'zod';
import { generateTravelChatReply } from '../server/services/travelChat';
import type { ChatHistoryMessage } from '../server/services/tourismRetriever';

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
    const chatResponse = await generateTravelChatReply({
      message,
      history: history as ChatHistoryMessage[],
    });

    return res.status(200).json(chatResponse);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: error.issues[0]?.message || 'Invalid chat request.',
      });
    }

    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      source: 'fallback',
    });
  }
}
