import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import User from '../models/User';

const router: Router = express.Router();

// Submit deposit request
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, bankDetails } = req.body;
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // In a real app, save deposit request to a collection and process it
    if (!user.balance) {
      user.balance = { available: 0, frozen: 0 };
    }
    user.balance.available += amount;
    await user.save();
    res.json({ message: 'Deposit request submitted', balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;