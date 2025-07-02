import express from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { io } from '../index';

const router = express.Router();

router.get('/', async (req: any, res) => {
  const { search, status, startDate, endDate } = req.query;
  const query: any = {};
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
    ];
  }
  if (status && status !== 'all') {
    query['status.active'] = status === 'active';
  }
  if (startDate && endDate) {
    query.createdAt = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
  }

  try {
    const users = await User.find(query).select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/:id/status', async (req: any, res) => {
  const { active, verified, betLocked, withdrawLocked } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (active !== undefined) user.status.active = active;
    if (verified !== undefined) user.verification.verified = verified;
    if (betLocked !== undefined) user.status.betLocked = betLocked;
    if (withdrawLocked !== undefined) user.status.withdrawLocked = withdrawLocked;

    await user.save();
    io.emit('userUpdate', { message: `Trạng thái người dùng ${user.username} đã được cập nhật` });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/:id', async (req: any, res) => {
  const { username, password, balance, frozenBalance, fullName, bankName, accountNumber, accountHolder } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (balance !== undefined) user.balance.available = balance;
    if (frozenBalance !== undefined) user.balance.frozen = frozenBalance;
    if (fullName) user.fullName = fullName;
    if (bankName) user.bank.name = bankName;
    if (accountNumber) user.bank.accountNumber = accountNumber;
    if (accountHolder) user.bank.accountHolder = accountHolder;

    await user.save();
    io.emit('userUpdate', { message: `Thông tin người dùng ${user.username} đã được cập nhật` });
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/:id', async (req: any, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    io.emit('userUpdate', { message: `Người dùng ${user.username} đã bị xóa` });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;