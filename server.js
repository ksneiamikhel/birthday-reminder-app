import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const GITHUB_API = 'https://api.github.com';
const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8579587091:AAEk3rHveGggMVeKWw0rCe8dUuaRTDZjRdg';

// In-memory store for user Telegram chat IDs (in production, store in GitHub)
const userStore = new Map();

// Read people.json from GitHub
app.post('/api/read', async (req, res) => {
  const { token, username, repo } = req.body;

  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${username}/${repo}/contents/people.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      return res.json({ schemaVersion: 1, people: [] });
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = atob(data.content); // Decode base64
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Write people.json to GitHub
app.post('/api/write', async (req, res) => {
  const { token, username, repo, data } = req.body;

  console.log(`[WRITE] Attempting to write to ${username}/${repo}`);

  try {
    // Get current file SHA
    let sha = null;
    try {
      const getResponse = await fetch(
        `${GITHUB_API}/repos/${username}/${repo}/contents/people.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
        console.log('[WRITE] Found existing file, SHA:', sha);
      }
    } catch (e) {
      console.log('[WRITE] File does not exist yet, creating new');
    }

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const requestBody = {
      message: `Update birthday data - ${new Date().toISOString()}`,
      content,
    };

    if (sha) {
      requestBody.sha = sha;
    }

    console.log('[WRITE] Sending PUT request to GitHub...');
    const response = await fetch(
      `${GITHUB_API}/repos/${username}/${repo}/contents/people.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseText = await response.text();
    console.log('[WRITE] GitHub response status:', response.status);
    console.log('[WRITE] GitHub response:', responseText);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${responseText}`);
    }

    console.log('[WRITE] Success!');
    res.json({ success: true });
  } catch (error) {
    console.error('[WRITE] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Telegram webhook - receive messages from bot
app.post(`/api/telegram/webhook`, (req, res) => {
  const update = req.body;

  if (update.message && update.message.text === '/start') {
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;

    // Store chat ID in memory (would be GitHub in production)
    userStore.set(userId.toString(), chatId);
    console.log(`[TELEGRAM] User ${userId} linked, Chat ID: ${chatId}`);

    // Send confirmation message
    sendTelegramMessage(chatId, '✅ Birthday Reminder connected! I\'ll notify you 7 days before each birthday.');
  }

  res.json({ ok: true });
});

// Send Telegram message
async function sendTelegramMessage(chatId, text) {
  try {
    const response = await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('[TELEGRAM] Failed to send message:', response.statusText);
    }
  } catch (error) {
    console.error('[TELEGRAM] Error sending message:', error);
  }
}

// Check birthdays and send notifications
app.post('/api/cron/check-birthdays', async (req, res) => {
  console.log('[CRON] Checking birthdays...');

  // For now, just return success
  // In production: read all users' people.json from GitHub, check dates, send messages
  res.json({ success: true, checked: 0 });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📱 Telegram Bot Token: ${BOT_TOKEN.substring(0, 20)}...`);
});
