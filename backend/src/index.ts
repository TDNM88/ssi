import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import { connectDB } from './config/db';
import userRoutes from './routes/user';
import depositRoutes from './routes/deposit';
import withdrawalRoutes from './routes/withdrawals';
import sessionRoutes from './routes/session';
import orderRoutes from './routes/order';
import { authMiddleware } from './middleware';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/deposits', authMiddleware, depositRoutes);
app.use('/api/withdrawals', authMiddleware, withdrawalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);

io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  socket.on('joinTrade', (sessionId: string) => {
    socket.join(sessionId);
  });
  // Handle real-time trade updates
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});