import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnalysisResultById, deleteAnalysisResult } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (req.method === 'GET') {
    try {
      const result = await getAnalysisResultById(id);

      if (!result) {
        return res.status(404).json({ error: 'Result not found' });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Failed to fetch result:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await deleteAnalysisResult(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Result not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to delete result:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
