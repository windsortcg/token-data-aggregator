/**
 * Express Server for Token Data Aggregator
 * Deployable as an x402.jobs endpoint
 */

require('dotenv').config();
const express = require('express');
const { handleRequest } = require('./token-data-aggregator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for x402 compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Payment');
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

// Main endpoint
app.get('/api/token-data', handleRequest);
app.post('/api/token-data', handleRequest);

// Root endpoint with usage info
app.get('/', (req, res) => {
  res.json({
    service: 'Token Data Aggregator',
    version: '1.0.0',
    description: 'Aggregates token data from CoinGecko, Etherscan, CoinMarketCap, and DefiLlama',
    endpoints: {
      main: {
        path: '/api/token-data',
        method: 'GET or POST',
        parameters: {
          token: 'Token symbol, name, or contract address (required)',
          sources: 'Comma-separated list of sources (optional, defaults to all)'
        },
        example: '/api/token-data?token=ARB&sources=coingecko,etherscan'
      },
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      }
    },
    sources: ['coingecko', 'etherscan', 'coinmarketcap', 'defillama'],
    pricing: {
      suggested_x402_price: '$0.02-0.03 per query',
      cache_duration: '300 seconds (5 minutes)'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: ['/', '/health', '/api/token-data']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Token Data Aggregator running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API endpoint: http://localhost:${PORT}/api/token-data?token=ARB`);
  console.log(`\n💡 Set environment variables:`);
  console.log(`   ETHERSCAN_API_KEY=your_key_here`);
  console.log(`   CMC_API_KEY=your_key_here (optional)\n`);
});

module.exports = app;
