// pages/api/github.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db'; // Adjust the path as necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { githubUsername, githubPassword, githubEmail, githubToken } = req.body;

    try {
      // Check if the email already exists
      const existingEmail = await query(
        `
        SELECT 1 FROM upload.github_accounts WHERE githubUser Email = $1
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
        INSERT INTO upload.github_accounts (githubUsername, githubUser Password, githubUser Email, accessToken, createdAt, updatedAt)
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