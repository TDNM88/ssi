import { NextApiRequest, NextApiResponse } from 'next';
import { ratelimit } from './rate-limit';

export async function withRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: () => Promise<void>,
  identifier: string = 'api',
  errorMessage: string = 'Too many requests. Please try again later.'
) {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '127.0.0.1';
    const identifierKey = `${identifier}:${ip}`;
    
    const { success, limit, reset, remaining } = await ratelimit.limit(identifierKey);
    
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', reset.toString());
      
      return res.status(429).json({
        error: errorMessage,
        retryAfter,
      });
    }
    
    // Add rate limit headers to all responses
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());
    
    await handler();
  } catch (error) {
    console.error('Rate limit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// No-op authentication for mock user environment
export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Always pass through with a mock user object
    return handler(req, res, { user: { id: '1' } });
  };
}

// No-op role checking for mock user environment
export function requireRole(roles: string | string[]) {
  return (handler: Function) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Always pass through with a mock user object
      return handler(req, res, { user: { id: '1' } });
    };
  };
}
