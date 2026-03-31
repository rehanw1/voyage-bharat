import { Router } from 'express';
import { ZodError, z } from 'zod';
import { generateTravelChatReply } from '../services/travelChat';
import type { ChatHistoryMessage } from '../services/tourismRetriever';

const router = Router();

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

router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = chatRequestSchema.parse(req.body);
    const chatResponse = await generateTravelChatReply({ message, history: history as ChatHistoryMessage[] });

    res.json(chatResponse);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: error.issues[0]?.message || 'Invalid chat request.',
      });
      return;
    }

    next(error);
  }
});

export default router;
