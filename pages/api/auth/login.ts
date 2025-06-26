import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { signIn } from 'next-auth/react';
import { loginSchema } from '@/lib/schema';
import { withRateLimit } from '@/lib/api-utils';
import { authOptions } from '@/lib/auth-options';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Authenticate user using NextAuth
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (!result?.ok) {
      return res.status(401).json({ 
        error: result?.error || 'Invalid email or password' 
      });
    }

    // Get the session to return user data
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Return user data without sensitive information
    const { password: _, ...userWithoutPassword } = session.user as any;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply rate limiting to login endpoint
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    return handler(req, res);
  }, 'auth-login', 'Too many login attempts. Please try again later.');
}
