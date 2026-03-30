export default async function handler(req, res) {
  // Verify CRON_SECRET to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[CRON] Birthday check started at', new Date().toISOString());

  // TODO: Implement full logic
  // 1. Get all users from somewhere (for now, hardcoded)
  // 2. For each user, read their people.json from GitHub
  // 3. Check which birthdays are 7 days away
  // 4. Send Telegram notifications
  // 5. Update lastNotifiedYear

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Birthday check completed',
  });
}
