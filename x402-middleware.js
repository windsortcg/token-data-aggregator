/**
 * x402 Payment Middleware
 * Handles payment verification for x402 protocol
 */

// Simple in-memory payment cache (in production, use Redis or database)
const paymentCache = new Map();
const CACHE_TTL = 300000; // 5 minutes

/**
 * x402 Payment Configuration
 */
const X402_CONFIG = {
  // Pricing per endpoint
  pricing: {
    '/api/token-data': {
      amount: 0.025, // $0.025 USDC
      currency: 'USDC',
      network: process.env.X402_PAYMENT_NETWORK || 'base', // 'base' or 'solana'
      description: 'Token data aggregation from 4 sources'
    }
  },
  
  // Payment facilitator address (you'll need to set this up)
  facilitatorAddress: process.env.X402_FACILITATOR_ADDRESS || 'YOUR_WALLET_ADDRESS',
  
  // Enable/disable payment requirement (for testing)
  requirePayment: process.env.X402_REQUIRE_PAYMENT === 'true'
};

/**
 * Generate x402 payment request
 */
function generatePaymentRequest(endpoint, req) {
  const config = X402_CONFIG.pricing[endpoint];
  
  if (!config) {
    return null;
  }
  
  // Generate unique payment reference
  const paymentRef = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    version: '1.0',
    amount: config.amount,
    currency: config.currency,
    network: config.network,
    recipient: X402_CONFIG.facilitatorAddress,
    reference: paymentRef,
    description: config.description,
    metadata: {
      endpoint: endpoint,
      query: req.query,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Verify payment (simplified version)
 * 
 * In production, this should:
 * 1. Verify the payment signature
 * 2. Check blockchain for actual transaction
 * 3. Verify amount and recipient
 * 4. Ensure payment hasn't been used before (no replay attacks)
 */
async function verifyPayment(paymentProof) {
  try {
    // Parse payment proof from header
    const payment = typeof paymentProof === 'string' 
      ? JSON.parse(paymentProof) 
      : paymentProof;
    
    // Check if payment has been used (prevent replay attacks)
    const paymentKey = payment.reference || payment.txHash;
    
    if (paymentCache.has(paymentKey)) {
      const cached = paymentCache.get(paymentKey);
      // Payment already used or too old
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return { valid: false, error: 'Payment already used' };
      }
    }
    
    // In production, verify on-chain:
    // - Check transaction exists on blockchain
    // - Verify amount matches
    // - Verify recipient is correct
    // - Verify transaction is confirmed
    
    // For now, accept any payment proof (TESTING ONLY)
    // TODO: Implement real blockchain verification
    
    const isValid = payment.reference && payment.amount;
    
    if (isValid) {
      // Cache payment to prevent reuse
      paymentCache.set(paymentKey, {
        timestamp: Date.now(),
        payment: payment
      });
      
      // Clean up old cache entries
      cleanupPaymentCache();
    }
    
    return {
      valid: isValid,
      payment: payment
    };
    
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Clean up expired payment cache entries
 */
function cleanupPaymentCache() {
  const now = Date.now();
  for (const [key, value] of paymentCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      paymentCache.delete(key);
    }
  }
}

/**
 * x402 Payment Middleware
 * 
 * Checks for payment before allowing request through
 * Returns 402 Payment Required if no valid payment
 */
function x402Middleware(options = {}) {
  return async (req, res, next) => {
    // Skip payment check for certain endpoints
    const skipPayment = ['/health', '/', '/llms.txt', '/favicon.ico'].includes(req.path);
    
    if (skipPayment) {
      return next();
    }
    
    // Skip if payment not required (for testing)
    if (!X402_CONFIG.requirePayment) {
      console.log('⚠️  Payment verification disabled (testing mode)');
      return next();
    }
    
    // Check for payment proof in headers
    const paymentProof = req.headers['x-payment'] || req.headers['x-payment-proof'];
    
    if (!paymentProof) {
      // No payment provided, return 402 with payment request
      const paymentRequest = generatePaymentRequest(req.path, req);
      
      if (!paymentRequest) {
        // Endpoint not configured for payment
        return next();
      }
      
      return res.status(402).json({
        error: 'Payment Required',
        message: 'This endpoint requires payment via x402 protocol',
        payment: paymentRequest,
        instructions: {
          step1: 'Complete payment using the details above',
          step2: 'Include payment proof in X-Payment header',
          step3: 'Retry the request',
          documentation: 'https://x402.org/docs'
        }
      });
    }
    
    // Verify payment
    const verification = await verifyPayment(paymentProof);
    
    if (!verification.valid) {
      return res.status(402).json({
        error: 'Invalid Payment',
        message: verification.error || 'Payment verification failed',
        payment: generatePaymentRequest(req.path, req)
      });
    }
    
    // Payment verified, attach to request
    req.payment = verification.payment;
    
    console.log('✅ Payment verified:', verification.payment.reference);
    
    next();
  };
}

/**
 * Payment stats endpoint (optional)
 */
function getPaymentStats() {
  return {
    totalPayments: paymentCache.size,
    requirePayment: X402_CONFIG.requirePayment,
    pricing: X402_CONFIG.pricing
  };
}

module.exports = {
  x402Middleware,
  X402_CONFIG,
  getPaymentStats,
  verifyPayment,
  generatePaymentRequest
};
