import { GoogleGenAI } from '@google/genai';
import type { ChatHistoryMessage } from './tourismRetriever';

type GenerateTravelChatReplyArgs = {
  message: string;
  history: ChatHistoryMessage[];
};

export type TravelChatResponse = {
  reply: string;
  audioUrl?: string;
  source: 'openai' | 'gemini' | 'fallback';
};

type OpenAIChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
const PLAY_HT_TTS_URL = 'https://play.ht/api/v2/tts';

function formatConversationHistory(history: ChatHistoryMessage[]): string {
  return history
    .slice(-5)
    .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
    .join('\n');
}

function buildPrompt(message: string, history: ChatHistoryMessage[]): string {
  const chatHistory = formatConversationHistory(history);

  return [
    'You are a helpful AI assistant for the Voyage Bharat travel website.',
    'Be friendly, practical, and concise.',
    'If the user asks about travel, provide useful trip planning help.',
    'If the user asks something non-travel-related, still answer helpfully.',
    '',
    chatHistory ? `Conversation history:\n${chatHistory}` : '',
    `User: ${message}`,
    'Assistant:',
  ]
    .filter(Boolean)
    .join('\n');
}

function extractUrls(text: string): string[] {
  return text.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
}

async function generateAudioUrl(text: string): Promise<string | undefined> {
  const apiKey = process.env.PLAY_HT_API_KEY;
  const userId = process.env.PLAY_HT_USER_ID;
  const voiceId = process.env.PLAY_HT_VOICE_ID;

  if (!apiKey || !userId || !voiceId) {
    return undefined;
  }

  try {
    const response = await fetch(PLAY_HT_TTS_URL, {
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'content-type': 'application/json',
        AUTHORIZATION: `Bearer ${apiKey}`,
        'X-USER-ID': userId,
      },
      body: JSON.stringify({
        text,
        voice: voiceId,
        quality: 'medium',
        output_format: 'mp3',
        speed: 1,
        sample_rate: 24000,
        seed: null,
        temperature: null,
      }),
    });

    const rawBody = await response.text();

    if (!response.ok) {
      throw new Error(rawBody || 'PlayHT request failed.');
    }

    return extractUrls(rawBody).at(-1);
  } catch (error) {
    console.error('[travel-chat-audio]', error);
    return undefined;
  }
}

async function generateOpenAIReply(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `OpenAI request failed with ${response.status}.`);
  }

  const payload = JSON.parse(rawBody) as OpenAIChatCompletionsResponse;
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

async function generateGeminiReply(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: DEFAULT_GEMINI_MODEL,
    contents: prompt,
  });

  return response.text?.trim() || null;
}

function getProviderErrorMessage(error: unknown): string {
  const text = String(error);

  if (text.includes('RESOURCE_EXHAUSTED') || text.includes('"code":429') || text.includes('quota')) {
    return 'Gemini usage limit reached. Please wait a little and try again, or use a different API key/model.';
  }

  if (text.includes('API key expired') || text.includes('API_KEY_INVALID') || text.includes('invalid API key')) {
    return 'The AI API key is invalid or expired. Please update the server API key and restart the app.';
  }

  if (text.includes('401') || text.includes('403')) {
    return 'The AI provider rejected this request. Please check API access, billing, and model permissions.';
  }

  return 'AI chat is temporarily unavailable. Please check your API configuration and try again.';
}

export async function generateTravelChatReply({
  message,
  history,
}: GenerateTravelChatReplyArgs): Promise<TravelChatResponse> {
  const prompt = buildPrompt(message, history);
  let providerErrorMessage: string | null = null;

  try {
    const openAIReply = await generateOpenAIReply(prompt);

    if (openAIReply) {
      return {
        reply: openAIReply,
        audioUrl: await generateAudioUrl(openAIReply),
        source: 'openai',
      };
    }
  } catch (error) {
    console.error('[travel-chat-openai]', error);
    providerErrorMessage = getProviderErrorMessage(error);
  }

  try {
    const geminiReply = await generateGeminiReply(prompt);

    if (geminiReply) {
      return {
        reply: geminiReply,
        audioUrl: await generateAudioUrl(geminiReply),
        source: 'gemini',
      };
    }
  } catch (error) {
    console.error('[travel-chat-gemini]', error);
    providerErrorMessage = getProviderErrorMessage(error);
  }

  const fallbackReply =
    providerErrorMessage || 'AI chat is temporarily unavailable. Please check your API configuration and try again.';

  return {
    reply: fallbackReply,
    audioUrl: await generateAudioUrl(fallbackReply),
    source: 'fallback',
  };
}
