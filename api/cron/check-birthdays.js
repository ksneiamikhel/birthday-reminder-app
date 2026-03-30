const GITHUB_API = 'https://api.github.com';
const TELEGRAM_API = 'https://api.telegram.org';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const REGISTRY_REPO = 'birthday-reminder-data';
const REGISTRY_OWNER = 'ksneiamikhel';
const REGISTRY_TOKEN = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;

function daysUntilBirthday(birthdayStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [, month, day] = birthdayStr.split('-').map(Number);
  let nextBirthday = new Date(today.getFullYear(), month - 1, day);
  nextBirthday.setHours(0, 0, 0, 0);

  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, month - 1, day);
    nextBirthday.setHours(0, 0, 0, 0);
  }

  const timeDiff = nextBirthday.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

async function getUsersRegistry() {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${REGISTRY_OWNER}/${REGISTRY_REPO}/contents/users.json`,
      {
        headers: {
          Authorization: `Bearer ${REGISTRY_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) return [];
    if (!response.ok) return [];

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString();
    return JSON.parse(content).users || [];
  } catch (error) {
    console.error('[CRON] Error reading users registry:', error);
    return [];
  }
}

async function getUserPeople(token, username, repo) {
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

    if (response.status === 404) return { people: [] };
    if (!response.ok) return { people: [] };

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString();
    return { people: JSON.parse(content).people || [], sha: data.sha };
  } catch (error) {
    console.error('[CRON] Error reading people.json:', error);
    return { people: [] };
  }
}

async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('[CRON] Error sending Telegram message:', error);
  }
}

export default async function handler(req, res) {
  // Verify CRON_SECRET to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[CRON] Birthday check started at', new Date().toISOString());

  try {
    const users = await getUsersRegistry();
    console.log(`[CRON] Found ${users.length} users to check`);

    let notificationsSent = 0;

    for (const user of users) {
      const { people } = await getUserPeople(user.githubToken, user.githubUsername, user.githubRepo);

      for (const person of people) {
        const days = daysUntilBirthday(person.birthday);

        // Send notification 7 days before (with 1-day tolerance)
        if (days >= 6 && days <= 8) {
          const currentYear = new Date().getFullYear();

          // Check if already notified this year
          if (person.lastNotifiedYear !== currentYear) {
            const message = `🎂 <b>${person.name}'s birthday is in ${days} day${days === 1 ? '' : 's'}!</b>\n📅 ${person.birthday.split('-').reverse().join('/')}\n\n🎁 Check the app for gift ideas!`;

            await sendTelegramMessage(user.telegramChatId, message);
            notificationsSent++;

            console.log(`[CRON] Sent notification for ${person.name} to ${user.telegramUsername}`);
          }
        }
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      usersChecked: users.length,
      notificationsSent,
    });
  } catch (error) {
    console.error('[CRON] Error:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
