import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getActiveTrades } from '@/lib/trade';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get active trades
    const activeTrades = await getActiveTrades(parseInt(session.user.id, 10));

    return res.status(200).json({
      trades: activeTrades,
    });
  } catch (error) {
    console.error('Error fetching active trades:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
