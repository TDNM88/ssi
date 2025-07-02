const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  type: { type: String, enum: ['Lên', 'Xuống'], required: true },
  amount: { type: Number, required: true },
  result: { type: String, enum: ['Thắng', 'Thua', ''], default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);