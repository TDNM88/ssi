const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  receivedAmount: { type: Number, required: true },
  bank: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountHolder: { type: String, required: true },
  status: { type: String, enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'], default: 'Chờ duyệt' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);