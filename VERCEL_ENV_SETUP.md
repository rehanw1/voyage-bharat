# Vercel Environment Variables Setup

## Critical Steps to Make Chatbot Work on Vercel

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click on your **voyage-bharat** project

### Step 2: Add Environment Variables
1. Click **Settings** → **Environment Variables**
2. Add these two variables:

#### Variable 1: GEMINI_API_KEY
- **Name**: `GEMINI_API_KEY`
- **Value**: `AIzaSyCfw2bOYxdQn-ukt7N5XDqEFP8PIyh6eUI`
- **Environments**: ✓ Production ✓ Preview ✓ Development
- Click **Save**

#### Variable 2: GEMINI_MODEL
- **Name**: `GEMINI_MODEL`
- **Value**: `gemini-2.5-flash-lite`
- **Environments**: ✓ Production ✓ Preview ✓ Development
- Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find the last deployment
3. Click the **•••** menu → **Redeploy**
4. Wait for deployment to complete (should show "Ready")

### Step 4: Test the Chatbot
1. Open your Vercel app URL
2. Click the chat bubble (bottom right)
3. Send a test message: "Hello"
4. You should see a response within 3-5 seconds

---

## Troubleshooting

### Chatbot still not responding
1. **Check API endpoint**: Open browser DevTools (F12) → Network tab
2. Look for `POST /api/chat` request
3. Check the response status:
   - `200` = Success ✓
   - `400` = Invalid request format
   - `500` = Server error (check logs below)

### View Server Logs
1. In Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. Click **Logs** tab
4. Look for error messages

### Resetting Deployment
If nothing works, try:
1. Go to **Settings** → **Advanced** → **Clear Build Cache**
2. Redeploy using the Deployments menu

---

## What Changed
- ✅ API now uses Gemini directly (simplified)
- ✅ Fallback responses for when API fails
- ✅ Proper environment variable configuration
- ✅ CORS enabled for frontend requests

## Testing Locally First
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Test in browser at http://localhost:5173
```

The chat should work locally if `GEMINI_API_KEY` is in your `.env.local` file.
