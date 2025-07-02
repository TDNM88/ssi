import express from 'express';
import User from '../models/User';
import Deposit from '../models/Deposit';
import Withdrawal from '../models/Withdrawals';
import { io } from '../index';

const router = express.Router();

router.get('/stats', async (req: any, res) => {
  const { startDate, endDate } = req.query;

  try {
    const query = startDate && endDate ? {
      createdAt: { $gte: new Date(startDate as string), $lte: new Date(endDate as string) },
    } : {};

    const newUsers = await User.countDocuments({ ...query, role: 'user' });
    const totalDeposits = await Deposit.aggregate([
      { $match: { ...query, status: 'Đã duyệt' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalWithdrawals = await Withdrawal.aggregate([
      { $match: { ...query, status: 'Đã duyệt' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      newUsers,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalUsers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/settings', async (req: any, res) => {
  try {
    // Mock settings data (in a real app, this would come from a database)
    const settings = {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountHolder: 'Trading Platform',
      minDeposit: 100000,
      minWithdrawal: 200000,
      maxWithdrawal: 100000000,
      cskh: 'https://t.me/support',
    };
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/settings', async (req: any, res) => {
  const { bankName, accountNumber, accountHolder, minDeposit, minWithdrawal, maxWithdrawal, cskh } = req.body;

  try {
    // Mock saving settings (in a real app, save to database)
    const settings = {
      bankName,
      accountNumber,
      accountHolder,
      minDeposit,
      minWithdrawal,
      maxWithdrawal,
      cskh,
    };
    io.emit('settingsUpdate', { message: 'Cài đặt hệ thống đã được cập nhật' });
    res.json({ message: 'Cập nhật thành công', settings });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

export default router;