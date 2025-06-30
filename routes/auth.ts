// routes/auth.ts
import express from "express";
import bcrypt from "bcryptjs";
import { kvSet, kvGet } from "../lib/kv";

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const exist = await kvGet(`user:${username}`);
  if (exist) return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  await kvSet(`user:${username}`, hash);
  res.status(201).json({ message: "Register successful" });
});

export default router;
