const GITHUB_API = 'https://api.github.com';
const REGISTRY_REPO = 'birthday-reminder-data';
const REGISTRY_OWNER = 'ksneiamikhel';
const REGISTRY_TOKEN = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;

async function getRegistryFile() {
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

    if (response.status === 404) {
      return { users: [], sha: null };
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString();
    return { users: JSON.parse(content).users, sha: data.sha };
  } catch (error) {
    console.error('Error reading users.json:', error);
    return { users: [], sha: null };
  }
}

async function saveRegistryFile(users, sha) {
  try {
    const content = Buffer.from(JSON.stringify({ users }, null, 2)).toString('base64');
    const requestBody = {
      message: `Register/update user - ${new Date().toISOString()}`,
      content,
    };

    if (sha) {
      requestBody.sha = sha;
    }

    const response = await fetch(
      `${GITHUB_API}/repos/${REGISTRY_OWNER}/${REGISTRY_REPO}/contents/users.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${REGISTRY_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to save users.json: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving users.json:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { githubToken, githubUsername, githubRepo, telegramChatId, telegramUsername } = req.body;

  if (!githubToken || !githubUsername || !githubRepo || !telegramChatId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get current users
    const { users, sha } = await getRegistryFile();

    // Check if user already exists
    const existingIndex = users.findIndex(u => u.githubUsername === githubUsername);

    const newUser = {
      githubToken,
      githubUsername,
      githubRepo,
      telegramChatId,
      telegramUsername: telegramUsername || 'anonymous',
      registeredAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing user
      users[existingIndex] = { ...users[existingIndex], ...newUser };
    } else {
      // Add new user
      users.push(newUser);
    }

    const success = await saveRegistryFile(users, sha);

    if (success) {
      res.json({
        success: true,
        message: existingIndex >= 0 ? 'User updated' : 'User registered',
        user: githubUsername,
      });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    res.status(500).json({ error: error.message });
  }
}
