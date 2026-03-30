const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8579587091:AAEk3rHveGggMVeKWw0rCe8dUuaRTDZjRdg';
const WELCOME_MESSAGE = process.env.TELEGRAM_WELCOME_MESSAGE ||
  '✅ Birthday Reminder Connected!\n\nI will notify you 7 days before each birthday with gift suggestions. 🎁';

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
      return false;
    }
    return true;
  } catch (error) {
    console.error('[TELEGRAM] Error sending message:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update = req.body;

  if (update.message && update.message.text === '/start') {
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const username = update.message.from.username || `user_${userId}`;

    console.log(`[TELEGRAM] User ${username} (${userId}) started bot, Chat ID: ${chatId}`);

    // Send customized welcome message
    await sendTelegramMessage(chatId, WELCOME_MESSAGE);
  }

  res.json({ ok: true });
}
