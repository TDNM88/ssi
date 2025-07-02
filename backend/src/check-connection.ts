import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Session from './models/Session';
import path from 'path';

// Đảm bảo dotenv tải file từ vị trí chính xác
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkConnection() {
  try {
    console.log('Thông tin môi trường:');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI);
    console.log('- Đường dẫn .env:', path.resolve(__dirname, '../.env'));
    
    if (!process.env.MONGODB_URI) {
      throw new Error('Không tìm thấy biến môi trường MONGODB_URI trong file .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Kết nối MongoDB thành công!');
    
    // Đếm số lượng users
    const userCount = await User.countDocuments();
    console.log(`Số lượng users: ${userCount}`);
    
    // Liệt kê users
    const users = await User.find({}).select('username fullName role');
    console.log('Danh sách users:', JSON.stringify(users, null, 2));
    
    // Đếm số lượng sessions
    const sessionCount = await Session.countDocuments();
    console.log(`Số lượng sessions: ${sessionCount}`);
    
    // Liệt kê sessions
    const sessions = await Session.find({}).limit(5);
    console.log('Danh sách sessions:', JSON.stringify(sessions, null, 2));
    
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

checkConnection();
