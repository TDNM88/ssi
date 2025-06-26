import { redis } from '../lib/redis';

// Define Redis keys structure
const REDIS_KEYS = {
  // Rate limiting
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  LOGIN_ATTEMPTS: (ip: string) => `login_attempts:${ip}`,
  
  // Application data
  USERS: 'users',
  SESSIONS: 'sessions',
  BLACKLIST: 'blacklist',
  
  // Cache
  CACHE: 'cache',
};

async function initializeRedis() {
  try {
    console.log('Initializing Redis database...');
    
    // Test connection
    await redis.set('test', 'Redis is working!');
    const test = await redis.get('test');
    console.log('✅ Redis connection test:', test);
    
    // Initialize data structures if they don't exist
    const initData = {
      initializedAt: new Date().toISOString(),
      appName: 'London Trading Platform',
      version: '1.0.0',
    };
    
    await redis.hset('app:info', initData);
    
    console.log('✅ Redis database initialized successfully');
    console.log('Initial data:', {
      ...initData,
      redisKeys: Object.entries(REDIS_KEYS).map(([key, value]) => ({
        key,
        example: typeof value === 'function' ? value('example') : value
      }))
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    process.exit(1);
  } finally {
    // No need to call quit() on Upstash Redis client
    process.exit(0);
  }
}

initializeRedis();