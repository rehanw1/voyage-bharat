<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Voyage Bharat

A full-stack tourism and travel platform for exploring Indian destinations, itineraries, and experiences.

## Tech Stack

- React + Vite on the frontend
- Node.js + Express on the backend
- Tourism knowledge base in `data/tourism-knowledge.json`

## Features

- Explore destinations, attractions, and travel itineraries
- Browse travel diaries and hidden gems
- Book accommodations and experiences
- Browse festivals and local artisan traditions
- Secure user authentication and payment processing
- Floating AI chatbot powered by OpenAI or Gemini, with optional PlayHT audio

## Run locally

**Prerequisites:** Node.js 20+ is recommended.

1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Set `SESSION_SECRET`
4. Set `OPENAI_API_KEY` or `GEMINI_API_KEY`
5. Optional: set `PLAY_HT_API_KEY`, `PLAY_HT_USER_ID`, and `PLAY_HT_VOICE_ID` for audio replies
6. Run `npm run dev`

The frontend runs on `http://localhost:3000` and the API runs on `http://localhost:3001`.

## Chatbot details

- Frontend: [src/components/TravelChat.tsx](/C:/Users/rehan/Downloads/voyage-bharat%20(1)/src/components/TravelChat.tsx)
- Backend route: [server/routes/chat.ts](/C:/Users/rehan/Downloads/voyage-bharat%20(1)/server/routes/chat.ts)
- Backend chat service: [server/services/travelChat.ts](/C:/Users/rehan/Downloads/voyage-bharat%20(1)/server/services/travelChat.ts)
The frontend uses `fetch` to call `POST /api/chat`, keeps recent chat history, auto-scrolls, and can play assistant audio when PlayHT is configured. The backend adapts the Python chatbot idea into TypeScript by using prompt-style memory, OpenAI-first text generation, Gemini fallback, and a clear error message if no provider succeeds.

See [SECURITY.md](SECURITY.md) for deployment and security notes.
