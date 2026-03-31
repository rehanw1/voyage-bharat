import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LoaderCircle, MessageCircleMore, SendHorizontal, Sparkles, X } from 'lucide-react';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  audioUrl?: string;
  source?: 'openai' | 'gemini' | 'fallback';
};

type ChatApiResponse = {
  reply: string;
  audioUrl?: string;
  source: 'openai' | 'gemini' | 'fallback';
};

const starterMessage: ChatMessage = {
  id: 'welcome-message',
  role: 'assistant',
  content:
    'Namaste! I can help with travel questions, trip ideas, and general chat. What would you like to ask?',
};

function createMessage(
  role: ChatRole,
  content: string,
  extras?: Pick<ChatMessage, 'audioUrl' | 'source'>
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    ...extras,
  };
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-[24px] rounded-bl-md bg-white px-4 py-3 text-sm text-stone-500 shadow-sm ring-1 ring-stone-200">
        <div className="flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin text-orange-500" />
          <span>Planning your reply...</span>
        </div>
      </div>
    </div>
  );
}

export default function TravelChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage = createMessage('user', trimmedInput);
    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: trimmedInput,
          history: messages.slice(-5).map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as ChatApiResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while contacting the chatbot.');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage('assistant', data.reply, {
          audioUrl: data.audioUrl,
          source: data.source,
        }),
      ]);
    } catch (requestError) {
      const fallbackError =
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong while contacting the chatbot.';

      setError(fallbackError);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex justify-end sm:inset-x-6 sm:bottom-6">
      <div className="pointer-events-auto flex max-w-full flex-col items-end gap-3">
        {isOpen ? (
          <section className="w-[min(100vw-1.5rem,26rem)] overflow-hidden rounded-[28px] border border-orange-100 bg-stone-50 shadow-[0_24px_80px_-24px_rgba(120,53,15,0.45)] backdrop-blur xl:w-[28rem]">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.35),_transparent_55%),linear-gradient(135deg,#7c2d12,#c2410c_55%,#ea580c)] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-orange-100">Voyage Bharat AI</p>
                      <p className="text-xs text-white/75">AI chat with memory and optional voice</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close travel chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(255,247,237,0.96),rgba(255,255,255,0.96))]">
              <div className="hide-scrollbar flex max-h-[24rem] min-h-[20rem] flex-col gap-3 overflow-y-auto px-4 py-4 sm:max-h-[28rem]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === 'user'
                          ? 'rounded-br-md bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'rounded-bl-md bg-white text-stone-700 ring-1 ring-stone-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && message.audioUrl ? (
                        <audio controls preload="none" className="mt-3 w-full">
                          <source src={message.audioUrl} type="audio/mpeg" />
                          Your browser does not support audio playback.
                        </audio>
                      ) : null}
                    </div>
                  </div>
                ))}

                {isLoading ? <LoadingBubble /> : null}
                <div ref={scrollAnchorRef} />
              </div>

              <div className="border-t border-orange-100 bg-white/90 px-4 py-4">
                {error ? (
                  <p className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </p>
                ) : null}

                <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-2 shadow-inner">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    maxLength={2000}
                    placeholder="Try: Plan a Goa trip or ask me anything..."
                    className="max-h-32 min-h-[52px] w-full resize-none bg-transparent px-3 py-2 text-sm text-stone-700 outline-none placeholder:text-stone-400"
                  />
                  <div className="flex items-center justify-between gap-3 px-2 pb-1">
                    <p className="text-xs text-stone-400">Press Enter to send</p>
                    <button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={isLoading || !input.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-orange-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <SendHorizontal className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_60px_-20px_rgba(234,88,12,0.9)] transition hover:-translate-y-0.5"
          aria-label={isOpen ? 'Close travel chat' : 'Open travel chat'}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
            <MessageCircleMore className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-sm leading-none">Ask Voyage Bharat AI</p>
            <p className="mt-1 text-xs text-white/80">Get itinerary help and audio replies</p>
          </div>
        </button>
      </div>
    </div>
  );
}
