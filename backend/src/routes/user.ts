import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router: Router = express.Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, fullName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      fullName,
      role: 'user',
      balance: { available: 0, frozen: 0 },
    });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;