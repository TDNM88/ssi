import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { createUserSchema } from '@/lib/schema';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { config } from '@/config';
import { withRateLimit } from '@/lib/api-utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create new user
    const [newUser] = await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
      role: 'user',  // Using lowercase 'user' to match the enum
      isVerified: false,
      balance: '0',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if (!newUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token using the JWT secret from config
    const token = sign(
      { 
        id: newUser.id.toString(), 
        email: newUser.email, 
        role: newUser.role 
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const { password: _, ...user } = newUser;

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

// Apply rate limiting to registration endpoint
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    return handler(req, res);
  }, 'auth-register', 'Too many registration attempts. Please try again later.');
}
