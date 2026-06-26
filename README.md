# httpSMS Web App

Send & receive SMS via the httpSMS API. Deploy on Railway for free.

## Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project → Deploy from GitHub repo**
3. Push this folder to a GitHub repo first, then select it
   - OR use **New Project → Empty Project → Add Service → GitHub Repo**
4. Railway auto-detects Node.js and runs `npm start`
5. Click your deployment → **Settings → Networking → Generate Domain**
6. Your app URL will be something like `https://httpsms-xxx.railway.app`

## Setup Webhook

1. Open your app URL in the browser
2. Go to ⚙️ Settings — copy the Webhook URL shown there
3. Go to [httpsms.com](https://httpsms.com) → **Webhooks → Add Webhook**
4. Paste the URL and select event: **message.received**
5. Save

Now when someone texts your SIM, it appears in the web app automatically!

## Files

- `server.js` — Express backend (webhook receiver + API)
- `public/index.html` — Android-style web app UI
- `messages.json` — All conversations saved here (auto-created)
- `config.json` — Settings saved here (auto-created)
