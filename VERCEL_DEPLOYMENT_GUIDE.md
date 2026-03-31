# Voyage Bharat - Vercel Deployment Guide

## Why Chatbot Wasn't Working

Your project was using a **local Express server** (port 3001) that only works in development. Vercel uses **serverless functions** instead, so the chatbot API calls were failing.

---

## ✅ What I Fixed

1. **Created `/api/chat.ts`** - Serverless function to replace the Express server
2. **Updated `vite.config.ts`** - Disabled localhost proxy in production
3. **Added `vercel.json`** - Configuration for Vercel deployment
4. **Added `@vercel/node`** - Required dependency for serverless functions

---

## 📋 Deployment Steps

### Step 1: Set Environment Variables on Vercel

1. Go to **https://vercel.com/dashboard**
2. Select your **voyage-bharat** project
3. Click **Settings → Environment Variables**
4. Add these variables:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | `AIzaSyCfw2bOYxdQn-ukt7N5XDqEFP8PIyh6eUI` |
| `GEMINI_MODEL` | `gemini-2.5-flash-lite` |

> ⚠️ **Important**: Set these for **Production** environment only for security

### Step 2: Install Dependencies Locally

```bash
npm install
```

### Step 3: Test Locally

```bash
npm run dev
```

The chatbot should work at `http://localhost:3000`

### Step 4: Commit & Push to GitHub

```bash
git add .
git commit -m "Setup Vercel serverless functions for chatbot"
git push origin main
```

Vercel will automatically redeploy when you push to GitHub.

### Step 5: Test on Vercel

After deployment completes:
1. Visit your Vercel app URL
2. Open the chat widget
3. Send a message
4. Chatbot should respond with Gemini API answers

---

## 🧪 Troubleshooting

### "Chatbot not responding"
- ✅ Check **Environment Variables** are set in Vercel dashboard
- ✅ Check **API logs** in Vercel dashboard (Functions tab)
- ✅ Verify `GEMINI_API_KEY` is correct

### "500 Internal Server Error"
- ✅ Check Vercel function logs for errors
- ✅ Ensure dependencies are installed: `npm install`
- ✅ Try redeploying: Go to Settings → Deployments → Redeploy

### "CORS errors"
- ✅ The serverless function now handles CORS - should be resolved

---

## 📊 Project Structure After Setup

```
voyage-bharat/
├── api/
│   └── chat.ts (NEW - Serverless function)
├── src/
│   ├── components/
│   │   └── TravelChat.tsx (calls /api/chat)
│   └── ...
├── server/
│   ├── services/
│   │   ├── travelChat.ts
│   │   └── tourismRetriever.ts
│   └── ...
├── vercel.json (NEW - Deployment config)
├── vite.config.ts (UPDATED)
└── package.json (UPDATED)
```

---

## 🚀 Next Steps (Optional)

For better performance, consider:
1. **Vector embeddings** - Use Pinecone/Weaviate instead of JSON search
2. **Caching** - Cache frequent queries with Redis
3. **Rate limiting** - Add per-user rate limits on Vercel
4. **Analytics** - Track chatbot usage with Vercel Analytics

---

## ✨ How It Works Now

**Local Development** (npm run dev):
- Frontend: `http://localhost:3000`
- Backend Express: `http://localhost:3001`
- Vite proxy routes `/api` → Express server

**Production** (Vercel):
- Frontend + Serverless functions: `https://your-app.vercel.app`
- `/api/chat` → Serverless function in `/api/chat.ts`
- No persistent backend server needed

---

**Questions?** Check logs:
```bash
# Local logs
npm run dev

# Vercel logs
vercel logs --follow
```
