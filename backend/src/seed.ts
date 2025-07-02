import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db';
import User from './models/User';
import Session from './models/Session';
import dotenv from 'dotenv';

dotenv.config();

async function seedDB() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully!');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Session.deleteMany({});
    console.log('Existing data cleared.');

    // Seed admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      balance: { available: 0, frozen: 0 },
      bank: { name: '', accountNumber: '', accountHolder: '' },
      verification: { verified: true, cccdFront: '', cccdBack: '' },
      status: { active: true, betLocked: false, withdrawLocked: false },
    });
    const savedAdmin = await adminUser.save();
    console.log('Admin user created:', savedAdmin._id);

    // Seed sample user
    console.log('Creating sample user...');
    const userPassword = await bcrypt.hash('user123', 10);
    const sampleUser = new User({
      username: 'user1',
      password: userPassword,
      fullName: 'Sample User',
      role: 'user',
      balance: { available: 1000000, frozen: 0 },
      bank: { name: 'Vietcombank', accountNumber: '1234567890', accountHolder: 'Sample User' },
      verification: { verified: false, cccdFront: '', cccdBack: '' },
      status: { active: true, betLocked: false, withdrawLocked: false },
    });
    const savedUser = await sampleUser.save();
    console.log('Sample user created:', savedUser._id);

    // Seed sample sessions
    console.log('Creating sample sessions...');
    const sessions = [
      {
        sessionId: 'SESSION001',
        result: '',
        status: 'pending',
        startTime: new Date(),
      },
      {
        sessionId: 'SESSION002',
        result: 'Lên',
        status: 'completed',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 60 * 1000),
      },
    ];
    const savedSessions = await Session.insertMany(sessions);
    console.log(`${savedSessions.length} sessions created.`);

    // Verify data was inserted
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    console.log(`Database seeded successfully. Total: ${userCount} users, ${sessionCount} sessions`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDB();