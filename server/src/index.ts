import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// API Health & Status Diagnostic
app.get('/api/health', (_req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'online',
    store: 'GR Enterprises (Meerut, UP)',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      host: dbStatus.host,
      name: dbStatus.database,
      readyState: dbStatus.readyState === 1 ? 'Connected (Ready)' : 'Disconnected / Connecting',
    },
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/settings', settingsRoutes);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect MongoDB
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 [GR Enterprises Server] Running on http://localhost:${PORT}`);
    console.log(`📡 [Health Check] Visit http://localhost:${PORT}/api/health`);
  });
};

startServer();
