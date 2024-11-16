import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db'; // Adjust the path as necessary

async function testCredentials(githubUsername: string, githubEmail: string, githubToken: string): Promise<boolean> {
  try {
    // Make a request to the GitHub API to get the user information using the provided token
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    // If the response is not OK (status code 2xx), return false
    if (!response.ok) {
      console.log('Invalid token or request failed');
      return false;
    }

    const userData = await response.json();

    // Check if the username and email match the authenticated user data
    if (userData.login !== githubUsername) {
      console.log('Username does not match');
      return false;
    }

    // The token, username, and email are valid
    console.log('Credentials are valid');
    return true;

  } catch (error) {
    console.error('Error verifying credentials:', error);
    return false;
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { githubUsername, githubPassword, githubEmail, githubToken } = req.body;

    try {
      // Test GitHub credentials
      const areCredentialsValid = await testCredentials(githubUsername,githubEmail, githubToken);
      if (!areCredentialsValid) {
        return res.status(401).json({
          error: 'Invalid GitHub credentials. Please check your username and token.',
        });
      }

      // Check if the email already exists
      const existingUser = await query(
        `
        SELECT githubUserEmail, githubUsername 
        FROM upload.github_accounts 
        WHERE githubUserEmail = $1 OR githubUsername = $2
        `,
        [githubEmail, githubUsername]
      );
      // Return an error if the email exists
      if (existingUser!.rows.length > 0) {
        return res.status(400).json({
          error: 'An account already exists. Please use a different account.',
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