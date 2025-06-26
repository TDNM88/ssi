import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { getUserTrades } from '@/lib/trade';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get query parameters
    const { page = '1', limit = '20' } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 20;

    // Get user trades
    const { trades, total } = await getUserTrades(
      decoded.id,
      limitNumber,
      (pageNumber - 1) * limitNumber
    );

    return res.status(200).json({
      trades,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
