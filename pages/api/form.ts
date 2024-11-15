import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db'; // Adjust the path as necessary

async function testCredentials(githubUsername: string, githubToken: string): Promise<boolean> {
  const response = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  return response.ok; // Returns true if the credentials are valid, false otherwise
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { githubUsername, githubPassword, githubEmail, githubToken } = req.body;

    try {
      // Test GitHub credentials
      const areCredentialsValid = await testCredentials(githubUsername, githubToken);
      if (!areCredentialsValid) {
        return res.status(401).json({
          error: 'Invalid GitHub credentials. Please check your username and token.',
        });
      }

      // Check if the email already exists
      const existingEmail = await query(
        `
        SELECT 1 FROM upload.github_accounts WHERE githubUserEmail = $1
        `,
        [githubEmail]
      );

      // Return an error if the email exists
      if (existingEmail!.rows.length > 0) {
        return res.status(400).json({
          error: 'An account with this email already exists. Please use a different email address.',
        });
      }

      const currentTimestamp = new Date().toISOString();

      // Insert the new record into the database
      await query(
        `
        INSERT INTO upload.github_accounts (githubUsername, githubUserPassword, githubUserEmail, accessToken, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [githubUsername, githubPassword, githubEmail, githubToken, currentTimestamp, currentTimestamp]
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}