import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import alertRoutes from './routes/alerts';
import creditRoutes from './routes/credit';
import seedRoutes from './routes/seed';
import chatRoutes from './routes/chat';
import fraudRoutes from './routes/fraud';
import { authenticate } from './middleware/authenticate';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Extremely simple pseudo rate limiting mock
let requestCounts: Record<string, number> = {};
setInterval(() => { requestCounts = {}; }, 15 * 60 * 1000); // 15 mins
const generalLimiter = (req: any, res: any, next: any) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (!requestCounts[ip]) requestCounts[ip] = 0;
  requestCounts[ip]++;
  if (requestCounts[ip] > 100) return res.status(429).json({ error: 'Too many requests' });
  next();
};
app.use(generalLimiter);

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/transactions', authenticate, transactionRoutes);
app.use('/api/budgets', authenticate, budgetRoutes);
app.use('/api/alerts', authenticate, alertRoutes);
app.use('/api/credit', authenticate, creditRoutes);
app.use('/api/chat', authenticate, chatRoutes);
app.use('/api/fraud', authenticate, fraudRoutes);
app.use('/api/seed', authenticate, seedRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Server Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`PaySense AI server running on :${PORT}`);
});
