# Environment Variables Setup for Vercel

## Steps to Configure on Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these variables:

### Required Variables:
- **GEMINI_API_KEY**: `AIzaSyCfw2bOYxdQn-ukt7N5XDqEFP8PIyh6eUI`
- **GEMINI_MODEL**: `gemini-2.5-flash-lite`
- **APP_URL**: `https://your-vercel-app.vercel.app`

### Optional (for production):
- Set these for Production environment only
- Never commit sensitive keys to GitHub

## Testing on Vercel:
After deployment, the chatbot will use:
```
https://your-app.vercel.app/api/chat
```

All API requests now go through serverless functions instead of the local Express server.
