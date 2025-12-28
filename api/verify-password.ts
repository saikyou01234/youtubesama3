import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const correctPassword = process.env.SITE_PASSWORD;

    if (!correctPassword) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (password === correctPassword) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
