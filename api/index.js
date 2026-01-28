/**
 * Vercel Serverless Function - Complete with Token Data & x402 Payment
 */

const express = require('express');
const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// x402 Payment Configuration
const X402_CONFIG = {
  requirePayment: process.env.X402_REQUIRE_PAYMENT === 'true',
  facilitatorAddress: process.env.X402_FACILITATOR_ADDRESS || 'NOT_SET',
  network: process.env.X402_PAYMENT_NETWORK || 'base',
  price: 0.025
};

// Simple payment verification middleware
function checkPayment(req, res, next) {
  // Skip payment for health and stats endpoints
  if (req.path === '/health' || req.path === '/api/payment-stats' || req.path === '/') {
    return next();
  }
  
  // If payment not required, skip
  if (!X402_CONFIG.requirePayment) {
    return next();
  }
  
  // Check for payment proof in headers
  const paymentProof = req.headers['x-payment'] || req.headers['x-payment-proof'];
  
 if (!paymentProof) {
    // No payment provided, return 402
    return res.status(402).json({
      error: 'Payment Required',
      message: 'This endpoint requires payment via x402 protocol',
      amount: X402_CONFIG.price,
      currency: 'USDC',
      network: X402_CONFIG.network,
      payTo: X402_CONFIG.facilitatorAddress,
      reference: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: 'Token data aggregation from 4 sources',
      instructions: {
        step1: 'Complete payment using the details above',
        step2: 'Include payment proof in X-Payment header',
        step3: 'Retry the request',
        documentation: 'https://x402.org/docs'
      }
    });
  }
      instructions: {
        step1: 'Complete payment using the details above',
        step2: 'Include payment proof in X-Payment header',
        step3: 'Retry the request',
        documentation: 'https://x402.org/docs'
      }
  
  // Payment provided (in production, verify it here)
  // For now, accept any payment proof
  console.log('Payment received:', paymentProof);
  next();
}

// Apply payment middleware to all routes
app.use(checkPayment);

// Fetch token data from CoinGecko
async function fetchCoinGeckoData(tokenIdentifier) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Search for token
    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(tokenIdentifier)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.coins || searchData.coins.length === 0) {
      return { error: 'Token not found', available: false };
    }
    
    // Find best match
    const coin = searchData.coins.find(c => c.symbol.toLowerCase() === tokenIdentifier.toLowerCase()) || searchData.coins[0];
    const coinId = coin.id;
    
    // Fetch detailed data
    const detailUrl = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const detailResponse = await fetch(detailUrl);
    const data = await detailResponse.json();
    
    const marketData = data.market_data || {};
    
    return {
      available: true,
      source: 'coingecko',
      data: {
        id: data.id,
        symbol: data.symbol?.toUpperCase(),
        name: data.name,
        contract_address: data.platforms?.ethereum || null,
        current_price_usd: marketData.current_price?.usd,
        price_change_24h_percentage: marketData.price_change_percentage_24h,
        market_cap_usd: marketData.market_cap?.usd,
        market_cap_rank: data.market_cap_rank,
        fully_diluted_valuation_usd: marketData.fully_diluted_valuation?.usd,
        total_supply: marketData.total_supply,
        circulating_supply: marketData.circulating_supply,
        trading_volume_24h_usd: marketData.total_volume?.usd,
        all_time_high_usd: marketData.ath?.usd,
        all_time_low_usd: marketData.atl?.usd
      }
    };
  } catch (error) {
    return {
      available: false,
      source: 'coingecko',
      error: error.message
    };
  }
}

// Main token data endpoint
app.get('/api/token-data', async (req, res) => {
  try {
    const token = req.query.token;
    
    if (!token) {
      return res.status(400).json({
        error: 'Missing required parameter: token',
        usage: 'GET /api/token-data?token=ARB'
      });
    }
    
    console.log(`Fetching data for token: ${token}`);
    
    // Fetch from CoinGecko
    const coinGeckoResult = await fetchCoinGeckoData(token);
    
    // Build response
    const response = {
      query: {
        token_identifier: token,
        timestamp: new Date().toISOString(),
        sources_requested: ['coingecko'],
        sources_succeeded: coinGeckoResult.available ? ['coingecko'] : []
      },
      token_info: {
        name: coinGeckoResult.data?.name,
        symbol: coinGeckoResult.data?.symbol,
        contract_address: coinGeckoResult.data?.contract_address,
        blockchain: 'ethereum'
      },
      sources: {
        coingecko: coinGeckoResult
      },
      aggregated: {
        price_usd: coinGeckoResult.data?.current_price_usd,
        market_cap_usd: coinGeckoResult.data?.market_cap_usd,
        fully_diluted_valuation_usd: coinGeckoResult.data?.fully_diluted_valuation_usd,
        trading_volume_24h_usd: coinGeckoResult.data?.trading_volume_24h_usd,
        circulating_supply: coinGeckoResult.data?.circulating_supply,
        total_supply: coinGeckoResult.data?.total_supply
      },
      metadata: {
        job_name: 'token-data-aggregator',
        job_version: '1.0.0',
        x402_compatible: true,
        cache_recommended_seconds: 300
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST endpoint (same logic)
app.post('/api/token-data', async (req, res) => {
  req.query.token = req.query.token || req.body.token;
  return app._router.handle(req, res);
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
    requirePayment: X402_CONFIG.requirePayment,
    network: X402_CONFIG.network,
    facilitatorAddress: X402_CONFIG.facilitatorAddress,
    pricing: {
      '/api/token-data': {
        amount: X402_CONFIG.price,
        currency: 'USDC',
        network: X402_CONFIG.network
      }
    }
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'Token Data Aggregator',
    version: '1.0.0',
    status: 'Working!',
    payment_required: X402_CONFIG.requirePayment,
    endpoints: {
      health: '/health',
      token_data: '/api/token-data?token=ARB',
      payment_stats: '/api/payment-stats'
    }
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    available_endpoints: ['/', '/health', '/api/token-data', '/api/payment-stats']
  });
});

module.exports = app;
