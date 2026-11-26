const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

function createApp() {
  const app = express();

  const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
  app.use(
    cors({
      origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map((s) => s.trim()),
      credentials: true
    })
  );
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (_req, res) => {
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      status: 'ok',
      service: 'flipkart-shop-backend',
      environment: process.env.NODE_ENV || 'development',
      database: dbStates[mongoose.connection.readyState] || 'unknown',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  app.use((err, _req, res, _next) => {
    console.error('[Error]', err);
    const status = err.statusCode || 500;
    res.status(status).json({
      message: err.message || 'Internal server error'
    });
  });

  return app;
}

module.exports = { createApp };
