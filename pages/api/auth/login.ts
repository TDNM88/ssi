// This file is not needed as NextAuth handles the login flow through the [...nextauth].ts route
// The login functionality is handled by the CredentialsProvider in auth-options.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ error: 'Not found' });
}

// Apply rate limiting to login endpoint
export default async function rateLimitedHandler(req: NextApiRequest, res: NextApiResponse) {
  return withRateLimit(req, res, async () => {
    return handler(req, res);
  }, 'auth-login', 'Too many login attempts. Please try again later.');
}
