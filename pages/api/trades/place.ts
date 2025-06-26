import { NextApiRequest, NextApiResponse } from 'next';
import { placeTrade } from '@/lib/trade';
import { placeTradeSchema } from '@/lib/schema';
import { withRateLimit, requireAuth } from '@/lib/api-utils';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

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
      parseInt(session.user.id, 10),
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

// Apply rate limiting and authentication
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    const authedHandler = requireAuth(handler);
    return authedHandler(req, res);
  }, 'trades-place', 'Too many trade requests. Please try again later.');
}
