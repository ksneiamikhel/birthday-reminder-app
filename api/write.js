const GITHUB_API = 'https://api.github.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, username, repo, data } = req.body;

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
      }
    } catch (e) {
      console.log('File does not exist yet');
    }

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const requestBody = {
      message: `Update birthday data - ${new Date().toISOString()}`,
      content,
    };

    if (sha) {
      requestBody.sha = sha;
    }

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

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${text}`);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
