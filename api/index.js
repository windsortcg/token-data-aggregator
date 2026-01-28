/**
 * Vercel Serverless Function Entry Point
 */

require('dotenv').config();
const express = require('express');
const { handleRequest } = require('../token-data-aggregator');
const { x402Middleware, getPaymentStats } = require('../x402-middleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Payment, X-Payment-Proof');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Apply x402 payment middleware
app.use(x402Middleware());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'token-data-aggregator',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Payment statistics
app.get('/api/payment-stats', (req, res) => {
  res.json(getPaymentStats());
});

// Main token data endpoint
app.get('/api/token-data', handleRequest);
app.post('/api/token-data', handleRequest);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Token Data Aggregator',
    version: '1.0.0',
    description: 'Aggregates token data from CoinGecko, Etherscan, CoinMarketCap, and DefiLlama',
    endpoints: {
      health: '/health',
      token_data: '/api/token-data?token=ARB',
      payment_stats: '/api/payment-stats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: ['/', '/health', '/api/token-data', '/api/payment-stats']
  });
});

// Export for Vercel
module.exports = app;
```

