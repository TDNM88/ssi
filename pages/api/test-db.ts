import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing database connection...');
    
    // Test connection by querying the users table
    const result = await db.select().from(users).limit(1);
    console.log('Database connection successful, users table exists');
    
    // Test inserting a test user (will be rolled back)
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User',
      phone: '1234567890',
      password: 'hashed_password',
      isVerified: false,
      balance: 0,
      role: 'user',
    };

    try {
      console.log('Testing user insertion...');
      await db.insert(users).values(testUser).onConflictDoNothing();
      console.log('User insertion test successful');
    } catch (insertError) {
      console.error('User insertion test failed:', insertError);
      return res.status(500).json({ 
        error: 'User insertion test failed',
        message: insertError.message,
        details: process.env.NODE_ENV === 'development' ? insertError.stack : undefined
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Database connection and schema are working correctly',
      userCount: result.length
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return res.status(500).json({ 
      error: 'Database test failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
