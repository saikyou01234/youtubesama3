import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllAnalysisResults } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = await getAllAnalysisResults();
    return res.status(200).json(results);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
