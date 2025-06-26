import { Redis as UpstashRedis } from '@upstash/redis';

// Initialize Redis client with provided credentials
export const redis = new UpstashRedis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
});

// Test the Redis connection
export async function testRedisConnection() {
  try {
    await redis.set('test', 'Hello from Upstash Redis!');
    const value = await redis.get('test');
    console.log('Redis connection test successful:', value);
    return true;
  } catch (error) {
    console.error('Redis connection test failed:', error);
    return false;
  }
}

// Rate limiting configuration
export const rateLimitConfig = {
  // Rate limiting for login attempts (per IP)
  login: {
    maxAttempts: 5,
    timeWindow: 60, // seconds
  },
  // Rate limiting for API requests (per user)
  api: {
    maxRequests: 100,
    timeWindow: 60, // seconds
  },
};

// Helper function to check rate limits
export async function checkRateLimit(
  key: string,
  max: number,
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  const keyWithPrefix = `rate_limit:${key}`;
  const current = await redis.get<number>(keyWithPrefix) || 0;
  
  if (current >= max) {
    return { allowed: false, remaining: 0 };
  }

  // Increment the counter and set expiration if this is the first request
  const multi = redis.multi();
  multi.incr(keyWithPrefix);
  if (current === 0) {
    multi.expire(keyWithPrefix, window);
  }
  await multi.exec();

  return { allowed: true, remaining: max - (current + 1) };
}
