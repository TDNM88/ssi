import express, { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware';
import Session from '../models/Session';

const router: Router = express.Router();

// Get all sessions
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Create session (admin only)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  try {
    const { sessionId } = req.body;
    const session = new Session({ sessionId, status: 'pending', startTime: new Date() });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: 'Error creating session', error: err });
  }
});

export default router;