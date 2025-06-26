import { NextApiRequest, NextApiResponse } from 'next';
import authenticateUser from '@/lib/auth';
import { loginSchema } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = loginSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validatedData.error.errors,
      });
    }

    const { email, password } = validatedData.data;

    // Authenticate user
    const result = await authenticateUser(email, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { user, token } = result;

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
