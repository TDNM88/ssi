import mongoose, { Schema } from 'mongoose';

const sessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  result: { type: String, enum: ['Lên', 'Xuống', ''], default: '' },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

export default mongoose.model('Session', sessionSchema);