import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getDBStatus } from '../server/dist/config/db.js';
import productRoutes from '../server/dist/routes/productRoutes.js';
import authRoutes from '../server/dist/routes/authRoutes.js';
import orderRoutes from '../server/dist/routes/orderRoutes.js';
import quoteRoutes from '../server/dist/routes/quoteRoutes.js';
import settingsRoutes from '../server/dist/routes/settingsRoutes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

// Auto-connect to MongoDB Atlas before processing serverless requests
app.use(async (_req, _res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  } catch (e) {
    console.error('MongoDB Atlas Serverless Connection Notice:', e);
  }
  next();
});

// API Health Check
app.get('/api/health', (_req, res) => {
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
    version: '1.0.3',
    release: 'lead-capture-responsive-cancel',
    deployment: 'Vercel Serverless Function'
  });
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/settings', settingsRoutes);

export default app;
