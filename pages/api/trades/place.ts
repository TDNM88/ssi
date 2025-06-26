import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { placeTrade } from '@/lib/trade';
import { placeTradeSchema } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    // Validate request body
    const validatedData = placeTradeSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validatedData.error.errors,
      });
    }

    const { symbol, amount, direction, duration } = validatedData.data;

    // Place the trade
    const trade = await placeTrade(
      decoded.id,
      symbol,
      amount,
      direction,
      duration
    );

    if (!trade) {
      return res.status(400).json({ error: 'Failed to place trade' });
    }

    return res.status(201).json({
      message: 'Trade placed successfully',
      trade,
    });
  } catch (error) {
    console.error('Trade placement error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to place trade';
    return res.status(400).json({ 
      error: errorMessage,
      details: errorMessage,
    });
  }
}
