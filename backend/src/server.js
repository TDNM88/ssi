const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { wss, broadcastSessionUpdate } = require('./websocket');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const User = require('./models/User');
const Session = require('./models/Session');
const Deposit = require('./models/Deposit');
const Withdrawal = require('./models/Withdrawal');
const Order = require('./models/Order');
const Settings = require('./models/Settings');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

// Admin stats
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  const { startDate, endDate } = req.query;
  const query = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  const newUsers = await User.countDocuments(query);
  const totalDeposits = await Deposit.aggregate([
    { $match: { ...query, status: 'Đã duyệt' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalWithdrawals = await Withdrawal.aggregate([
    { $match: { ...query, status: 'Đã duyệt' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const totalUsers = await User.countDocuments();
  res.json({
    newUsers,
    totalDeposits: totalDeposits[0]?.total || 0,
    totalWithdrawals: totalWithdrawals[0]?.total || 0,
    totalUsers,
  });
});

// Admin users
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { page = 1, limit = 10, search = '', status = 'all', startDate, endDate } = req.query;
  const query = {};
  if (search) query.username = { $regex: search, $options: 'i' };
  if (status !== 'all') query['status.active'] = status === 'active';
  if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const users = await User.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(query);
  res.json({ users, total });
});

app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { username, password, balance, frozenBalance, fullName, bankName, accountNumber, accountHolder } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
  user.username = username || user.username;
  if (password) user.password = await bcrypt.hash(password, 10);
  user.balance.available = balance !== undefined ? balance : user.balance.available;
  user.balance.frozen = frozenBalance !== undefined ? frozenBalance : user.balance.frozen;
  user.fullName = fullName || user.fullName;
  user.bank = { name: bankName || user.bank.name, accountNumber: accountNumber || user.bank.accountNumber, accountHolder: accountHolder || user.bank.accountHolder };
  await user.save();
  res.json({ user, message: 'Cập nhật thành công' });
});

app.put('/api/admin/users/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
  user.status = { ...user.status, ...req.body };
  await user.save();
  res.json({ user, message: 'Cập nhật trạng thái thành công' });
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
  res.json({ message: 'Xóa thành công' });
});

// Admin orders
app.get('/api/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  const { page = 1, limit = 10, customer = '', status = 'all', startDate, endDate } = req.query;
  const query = {};
  if (customer) query.user = { $regex: customer, $options: 'i' };
  if (status !== 'all') query.type = status === 'buy' ? 'Lên' : 'Xuống';
  if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const orders = await Order.find(query)
    .populate('user', 'username')
    .populate('session', 'sessionId')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Order.countDocuments(query);
  res.json({ orders: orders.map(o => ({
    user: o.user.username,
    session: o.session.sessionId,
    type: o.type,
    amount: o.amount,
    result: o.result,
    time: o.createdAt,
  })), total });
});

// Sessions
app.get('/api/sessions', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const sessions = await Session.find()
    .sort({ startTime: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Session.countDocuments();
  res.json({ sessions, total });
});

app.put('/api/sessions/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { result } = req.body;
  const session = await Session.findById(req.params.id);
  if (!session) return res.status(404).json({ message: 'Phiên không tồn tại' });
  session.result = result;
  session.status = 'completed';
  await session.save();
  broadcastSessionUpdate(session);
  res.json({ sessionId: session.sessionId, message: 'Cập nhật thành công' });
});

// Deposits
app.get('/api/deposits', authMiddleware, async (req, res) => {
  const { customer = '', status = 'all', startDate, endDate } = req.query;
  const query = {};
  if (customer) query.user = { $regex: customer, $options: 'i' };
  if (status !== 'all') query.status = status;
  if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const deposits = await Deposit.find(query)
    .populate('user', 'username')
    .sort({ createdAt: -1 });
  res.json({ deposits: deposits.map(d => ({
    _id: d._id,
    time: d.createdAt,
    customer: d.user.username,
    amount: d.amount,
    bill: d.bill,
    status: d.status,
  })) });
});

app.put('/api/deposits/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const deposit = await Deposit.findById(req.params.id).populate('user');
  if (!deposit) return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
  deposit.status = status;
  if (status === 'Đã duyệt') {
    deposit.user.balance.available += deposit.amount;
    await deposit.user.save();
  }
  await deposit.save();
  res.json({ message: 'Cập nhật thành công' });
});

// Withdrawals
app.get('/api/withdrawals', authMiddleware, async (req, res) => {
  const { customer = '', status = 'all', startDate, endDate } = req.query;
  const query = {};
  if (customer) query.user = { $regex: customer, $options: 'i' };
  if (status !== 'all') query.status = status;
  if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const withdrawals = await Withdrawal.find(query)
    .populate('user', 'username')
    .sort({ createdAt: -1 });
  res.json({ withdrawals: withdrawals.map(w => ({
    _id: w._id,
    time: w.createdAt,
    customer: w.user.username,
    amount: w.amount,
    receivedAmount: w.receivedAmount,
    bank: w.bank,
    accountNumber: w.accountNumber,
    accountHolder: w.accountHolder,
    status: w.status,
  })) });
});

app.put('/api/withdrawals/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
  if (!withdrawal) return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
  withdrawal.status = status;
  if (status === 'Đã duyệt') {
    withdrawal.user.balance.available -= withdrawal.amount;
    await withdrawal.user.save();
  }
  await withdrawal.save();
  res.json({ message: 'Cập nhật thành công' });
});

// Settings
app.get('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings || {
    bankName: 'ABBANK',
    accountNumber: '0387473721',
    accountHolder: 'VU VAN MIEN',
    minDeposit: 100000,
    minWithdrawal: 100000,
    maxWithdrawal: 100000,
    cskh: 'https://t.me/DICHVUCSKHLS',
  });
});

app.put('/api/admin/settings', authMiddleware, adminMiddleware, async (req, res) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  res.json(settings);
});

server.listen(3000, () => console.log('Server running on port 3000'));