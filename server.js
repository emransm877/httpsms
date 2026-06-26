const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const MESSAGES_FILE = path.join(__dirname, 'messages.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

// ── Init files ──
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify({ conversations: {} }, null, 2));
}
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    apiKey: process.env.API_KEY || '',
    fromNumber: process.env.FROM_NUMBER || '',
    numbers: ['+8801788656714', '+8801804998282']
  }, null, 2));
}

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ──
function readMessages() {
  try { return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8')); }
  catch { return { conversations: {} }; }
}
function writeMessages(data) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(data, null, 2));
}
function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return {}; }
}
function writeConfig(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

// ══════════════════════════════════════
//  WEBHOOK — httpSMS posts incoming SMS here
//  Set this URL in httpsms.com dashboard:
//  https://your-app.railway.app/webhook
// ══════════════════════════════════════
app.post('/webhook', (req, res) => {
  try {
    const payload = req.body;
    console.log('Webhook received:', JSON.stringify(payload));

    // httpSMS sends different event types
    const eventType = payload.event_type || payload.type || '';
    const data = payload.data || payload;

    // Only handle incoming messages
    if (eventType === 'message.received' || data.owner || data.contact) {
      const from = data.contact || data.from || data.owner || 'unknown';
      const content = data.content || data.message || data.body || '';
      const ts = data.created_at ? new Date(data.created_at).getTime() : Date.now();

      if (content) {
        const db = readMessages();
        if (!db.conversations[from]) {
          db.conversations[from] = { number: from, name: '', messages: [] };
        }
        db.conversations[from].messages.push({
          id: Date.now().toString(),
          dir: 'in',
          text: content,
          ts,
          status: 'received'
        });
        writeMessages(db);
        console.log(`Saved incoming message from ${from}: ${content}`);
      }
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── GET all messages ──
app.get('/api/messages', (req, res) => {
  res.json(readMessages());
});

// ── POST save messages (from web app) ──
app.post('/api/messages', (req, res) => {
  writeMessages(req.body);
  res.json({ ok: true });
});

// ── GET config (without apiKey) ──
app.get('/api/config', (req, res) => {
  const config = readConfig();
  const { apiKey, ...safe } = config;
  res.json(safe);
});

// ── POST save config ──
app.post('/api/config', (req, res) => {
  const current = readConfig();
  writeConfig({ ...current, ...req.body });
  res.json({ ok: true });
});

// ── Health check ──
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.listen(PORT, () => {
  console.log(`\n✅ httpSMS server running on port ${PORT}`);
  console.log(`📡 Webhook URL: https://your-app.railway.app/webhook\n`);
});
