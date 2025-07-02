const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  bankName: { type: String, default: 'ABBANK' },
  accountNumber: { type: String, default: '0387473721' },
  accountHolder: { type: String, default: 'VU VAN MIEN' },
  minDeposit: { type: Number, default: 100000 },
  minWithdrawal: { type: Number, default: 100000 },
  maxWithdrawal: { type: Number, default: 100000 },
  cskh: { type: String, default: 'https://t.me/DICHVUCSKHLS' },
});

module.exports = mongoose.model('Settings', settingsSchema);