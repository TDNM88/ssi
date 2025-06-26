import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { depositWithdrawSchema } from '@/lib/schema';
import { processDeposit } from '@/lib/transaction';

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
    const validatedData = depositWithdrawSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validatedData.error.errors,
      });
    }

    const { amount, method } = validatedData.data;

    // Process deposit
    const transaction = await processDeposit(decoded.id, amount, method);
    if (!transaction) {
      return res.status(500).json({ error: 'Failed to process deposit' });
    }

    return res.status(200).json({
      message: 'Deposit request received',
      transaction,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
