import { testRedisConnection } from '../lib/rate-limit';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('Testing Redis connection...');
  const result = await testRedisConnection();
  
  if (result.success) {
    console.log('✅ Redis connection successful!');
    console.log('Test value:', result.value);
    process.exit(0);
  } else {
    console.error('❌ Redis connection failed:', result.error);
    process.exit(1);
  }
}

runTest().catch(console.error);
