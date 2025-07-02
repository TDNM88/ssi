const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bill: { type: String, default: '' },
  status: { type: String, enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'], default: 'Chờ duyệt' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Deposit', depositSchema);