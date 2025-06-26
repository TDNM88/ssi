import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { ratelimit } from './rate-limit';
import { authOptions } from './auth';

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

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    return handler(req, res, session);
  };
}

export function requireRole(roles: string | string[]) {
  return (handler: Function) => 
    async (req: NextApiRequest, res: NextApiResponse, session?: any) => {
      if (!session) {
        session = await getServerSession(req, res, authOptions);
      }
      
      if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userRoles = Array.isArray(session.user.role) 
        ? session.user.role 
        : [session.user.role];
      
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      return handler(req, res, session);
    };
}
