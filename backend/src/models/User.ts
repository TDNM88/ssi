import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    balance: {
      available: { type: Number, default: 0 },
      frozen: { type: Number, default: 0 },
    },
    bank: {
      name: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountHolder: { type: String, default: '' },
    },
    verification: {
      verified: { type: Boolean, default: false },
      cccdFront: { type: String, default: '' },
      cccdBack: { type: String, default: '' },
    },
    status: {
      active: { type: Boolean, default: true },
      betLocked: { type: Boolean, default: false },
      withdrawLocked: { type: Boolean, default: false },
    },
    loginInfo: { type: String, default: '' },
});

export default mongoose.model('User', userSchema);