import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { createUser } from '@/lib/auth';
import { createUserSchema } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = createUserSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validatedData.error.errors,
      });
    }

    const { email, password, name } = validatedData.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user
    const result = await createUser({
      email,
      password,
      name,
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const { user, token } = result;

    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
