import type { PeopleFile } from '../types';

const APP_FOLDER_NAME = 'BirthdayReminderApp';
const PEOPLE_FILE_NAME = 'people.json';

// Initialize Google API client
export async function initializeGoogleApi(accessToken: string) {
  return {
    accessToken,
    folderPromise: null as Promise<string> | null,
  };
}

// Find or create the app folder in Google Drive
export async function findOrCreateAppFolder(accessToken: string): Promise<string> {
  try {
    // Search for existing folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&spaces=drive&pageSize=1&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchResponse.ok) throw new Error('Failed to search for folder');
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder if it doesn't exist
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?fields=id',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: APP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      }
    );

    if (!createResponse.ok) throw new Error('Failed to create folder');
    const createData = await createResponse.json();
    return createData.id;
  } catch (error) {
    console.error('Error with app folder:', error);
    throw error;
  }
}

// Read people.json from Google Drive
export async function readPeopleFile(
  accessToken: string,
  folderId: string
): Promise<PeopleFile> {
  try {
    // Search for people.json in the folder
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${PEOPLE_FILE_NAME}' and '${folderId}' in parents and trashed=false&spaces=drive&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchResponse.ok) throw new Error('Failed to search for people.json');
    const searchData = await searchResponse.json();

    if (!searchData.files || searchData.files.length === 0) {
      // File doesn't exist, return empty structure
      return { schemaVersion: 1, people: [] };
    }

    const fileId = searchData.files[0].id;

    // Read the file content
    const readResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!readResponse.ok) throw new Error('Failed to read people.json');
    const content = await readResponse.text();
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading people.json:', error);
    throw error;
  }
}

// Write people.json to Google Drive
export async function writePeopleFile(
  accessToken: string,
  folderId: string,
  data: PeopleFile
): Promise<void> {
  try {
    // Search for existing file
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${PEOPLE_FILE_NAME}' and '${folderId}' in parents and trashed=false&spaces=drive&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchResponse.ok) throw new Error('Failed to search for people.json');
    const searchData = await searchResponse.json();

    const fileContent = JSON.stringify(data, null, 2);

    if (searchData.files && searchData.files.length > 0) {
      // Update existing file
      const fileId = searchData.files[0].id;
      const updateResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: fileContent,
        }
      );

      if (!updateResponse.ok) throw new Error('Failed to update people.json');
    } else {
      // Create new file
      const createResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: createMultipartBody(
            PEOPLE_FILE_NAME,
            folderId,
            fileContent
          ),
        }
      );

      if (!createResponse.ok) throw new Error('Failed to create people.json');
    }
  } catch (error) {
    console.error('Error writing people.json:', error);
    throw error;
  }
}

// Helper function to create multipart body for file creation
function createMultipartBody(
  fileName: string,
  folderId: string,
  content: string
): string {
  const boundary = 'boundary_string';
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId],
  };

  return `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
}
