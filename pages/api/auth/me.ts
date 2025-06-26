import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        balance: users.balance,
        role: users.role,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
