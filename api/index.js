/**
 * Vercel Serverless Function - Simplified
 */

const express = require('express');
const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'token-data-aggregator',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Payment stats
app.get('/api/payment-stats', (req, res) => {
  res.json({
    totalPayments: 0,
    requirePayment: process.env.X402_REQUIRE_PAYMENT === 'true',
    network: process.env.X402_PAYMENT_NETWORK || 'base',
    facilitatorAddress: process.env.X402_FACILITATOR_ADDRESS || 'NOT_SET',
    pricing: {
      '/api/token-data': {
        amount: 0.025,
        currency: 'USDC',
        network: process.env.X402_PAYMENT_NETWORK || 'base'
      }
    }
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'Token Data Aggregator',
    status: 'Working!',
    endpoints: {
      health: '/health',
      payment_stats: '/api/payment-stats'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

module.exports = app;
