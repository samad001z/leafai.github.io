require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const scanRoutes = require('./routes/scan');
const translationRoutes = require('./routes/translation');

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_PORT_RETRIES = 10;
const normalizeOrigin = (origin) => (typeof origin === 'string' ? origin.trim().replace(/\/+$/, '') : '');

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'https://leafai-github-io.vercel.app',
  ...configuredOrigins,
]);

// Middleware
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);
    // Allow server-to-server tools and whitelisted browser origins.
    if (!origin || allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/translate', translationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PlantCare API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB (optional - app works without it in demo mode)
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI);
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.log('MongoDB connection failed:', err.message);
      console.log('Running in demo mode without database');
    }
  } else {
    console.log('No MongoDB URI provided - running in demo mode');
  }
};

// Start server with automatic fallback when preferred port is occupied.
const startServer = (port, attempt = 0) => {
  const server = app.listen(port, () => {
    if (attempt > 0) {
      console.log(`Preferred port ${PORT} was busy, switched to ${port}`);
    }
    console.log(`Server running on port ${port}`);
    console.log(`API available at http://localhost:${port}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRIES) {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} is in use, retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
};

connectDB().then(() => {
  startServer(Number(PORT));
});

module.exports = app;
