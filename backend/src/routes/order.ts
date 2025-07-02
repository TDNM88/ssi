import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import User from '../models/User';
import Session from '../models/Session';

const router: Router = express.Router();

// Place order
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId, amount, prediction } = req.body;
    const user = await User.findById(req.user?.userId);
    const session = await Session.findOne({ sessionId });
    if (!user || !session) {
      return res.status(404).json({ message: 'User or session not found' });
    }
    if (!user.balance) {
      user.balance = { available: 0, frozen: 0 };
    }
    if (user.balance.available < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    user.balance.available -= amount;
    user.balance.frozen += amount;
    await user.save();
    // In a real app, save order to a collection
    res.json({ message: 'Order placed', balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;