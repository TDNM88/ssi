require('dotenv').config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error('Không tìm thấy biến MONGODB_URI trong file .env');
  process.exit(1);
}

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Kết nối MongoDB thành công!');
    return mongoose.connection.db.admin().listDatabases();
  })
  .then(result => {
    console.log('Danh sách databases:', result.databases.map(db => db.name));
    process.exit(0);
  })
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err);
    process.exit(1);
  });
