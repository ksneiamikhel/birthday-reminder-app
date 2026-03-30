import type { PeopleFile } from '../types';

const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

/**
 * Read people.json from GitHub (via backend API)
 */
export async function readPeopleFile(
  token: string,
  username: string,
  repo: string
): Promise<PeopleFile> {
  try {
    const response = await fetch(`${API_URL}/api/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username, repo }),
    });

    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error reading people.json from GitHub:', error);
    throw error;
  }
}

/**
 * Write people.json to GitHub (via backend API)
 */
export async function writePeopleFile(
  token: string,
  username: string,
  repo: string,
  data: PeopleFile
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username, repo, data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to write file: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error writing people.json to GitHub:', error);
    throw error;
  }
}

/**
 * Test GitHub connection
 */
export async function testGitHubConnection(
  token: string,
  username: string,
  repo: string
): Promise<boolean> {
  try {
    const data = await readPeopleFile(token, username, repo);
    return data !== null;
  } catch (error) {
    console.error('GitHub connection test failed:', error);
    return false;
  }
}
