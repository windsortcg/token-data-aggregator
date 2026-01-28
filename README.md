# Token Data Aggregator - x402.jobs Job #1

A comprehensive Ethereum token data aggregator that pulls information from multiple free sources: CoinGecko, Etherscan, CoinMarketCap, and DefiLlama.

## 🎯 Purpose

This is the first job in a suite of crypto trading tools designed for x402.jobs. It aggregates token data from multiple sources to provide comprehensive information for trading decisions, portfolio tracking, and automated workflows.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
ETHERSCAN_API_KEY=your_etherscan_key_here
CMC_API_KEY=your_coinmarketcap_key_here  # Optional
```

**Getting API Keys:**
- **Etherscan** (Required): https://etherscan.io/apis - Free tier: 5 calls/sec, 100K/day
- **CoinMarketCap** (Optional): https://pro.coinmarketcap.com/signup - Free tier: ~10K calls/month
- **CoinGecko**: No API key needed! Free tier works out of the box
- **DefiLlama**: No API key needed! Completely free

### 3. Test the Service

Test with a token symbol:
```bash
npm run test:arb    # Test with ARB token
npm run test:eth    # Test with ETH token
npm run test:usdc   # Test with USDC token
```

Or test with a custom token:
```bash
node token-data-aggregator.js LINK
```

### 4. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3000`

## 📡 API Usage

### Main Endpoint

**GET /api/token-data**

Query a token and get aggregated data from all sources.

**Parameters:**
- `token` (required): Token symbol (e.g., "ARB"), name, or contract address
- `sources` (optional): Comma-separated sources to query. Default: all sources
  - Options: `coingecko`, `etherscan`, `coinmarketcap`, `defillama`

**Examples:**

```bash
# Get all data for ARB token
curl "http://localhost:3000/api/token-data?token=ARB"

# Get only CoinGecko and Etherscan data
curl "http://localhost:3000/api/token-data?token=ARB&sources=coingecko,etherscan"

# Query by contract address
curl "http://localhost:3000/api/token-data?token=0x912CE59144191C1204E64559FE8253a0e49E6548"
```

### Response Structure

```json
{
  "query": {
    "token_identifier": "ARB",
    "timestamp": "2026-01-28T15:30:00.000Z",
    "response_time_ms": 847,
    "sources_requested": ["coingecko", "etherscan", "coinmarketcap", "defillama"],
    "sources_succeeded": ["coingecko", "etherscan", "defillama"]
  },
  "token_info": {
    "name": "Arbitrum",
    "symbol": "ARB",
    "contract_address": "0x912CE59144191C1204E64559FE8253a0e49E6548",
    "blockchain": "ethereum"
  },
  "sources": {
    "coingecko": {
      "available": true,
      "data": {
        "current_price_usd": 1.23,
        "market_cap_usd": 3500000000,
        "trading_volume_24h_usd": 89000000,
        // ... more fields
      }
    },
    "etherscan": {
      "available": true,
      "data": {
        "contract_address": "0x...",
        "total_supply": "10000000000",
        "decimals": "18"
      }
    },
    "coinmarketcap": {
      "available": false,
      "error": "CoinMarketCap API key not configured"
    },
    "defillama": {
      "available": true,
      "data": {
        "price_usd": 1.23
      }
    }
  },
  "aggregated": {
    "price_usd": 1.23,
    "market_cap_usd": 3500000000,
    "fully_diluted_valuation_usd": 11000000000,
    "trading_volume_24h_usd": 89000000,
    "circulating_supply": 3181818181,
    "total_supply": 10000000000,
    "max_supply": 10000000000
  },
  "metadata": {
    "job_name": "token-data-aggregator",
    "job_version": "1.0.0",
    "x402_compatible": true,
    "cache_recommended_seconds": 300,
    "next_job_suggestions": [
      "token-unlock-analyzer",
      "whale-wallet-monitor",
      "technical-analysis",
      "sentiment-analyzer"
    ]
  }
}
```

### Other Endpoints

**GET /** - Service information and usage guide

**GET /health** - Health check endpoint

## 📊 Data Fields Explained

### Price Data
- `current_price_usd`: Current token price in USD
- `price_change_24h_percentage`: 24-hour price change
- `price_change_7d_percentage`: 7-day price change
- `all_time_high_usd`: Highest price ever reached
- `all_time_low_usd`: Lowest price ever reached

### Market Data
- `market_cap_usd`: Current market capitalization
- `fully_diluted_valuation_usd`: FDV (if all tokens were in circulation)
- `fdv_to_market_cap_ratio`: Ratio indicating how much supply is locked
- `market_cap_rank`: Ranking by market cap
- `trading_volume_24h_usd`: 24-hour trading volume
- `volume_to_market_cap_ratio`: Volume/MCap ratio (liquidity indicator)

### Supply Data
- `circulating_supply`: Tokens currently in circulation
- `total_supply`: Total tokens that exist
- `max_supply`: Maximum possible token supply
- `circulating_supply_percentage`: % of total supply circulating

### Contract Data
- `contract_address`: Ethereum contract address
- `decimals`: Token decimal places
- `contract_verified`: Whether contract is verified on Etherscan

## 🔗 Job Chaining

This job is designed to be the **first step** in x402 job chains:

### Example Chain 1: Token Unlock Analysis
1. **Token Data Aggregator** (this job) → Get current market data
2. **Token Unlock Analyzer** → Check upcoming unlock events
3. **Historical Impact Analyzer** → See how past unlocks affected price
4. **Position Recommendation** → Suggest trading position

### Example Chain 2: Whale Monitoring
1. **Token Data Aggregator** → Get token contract address
2. **Whale Wallet Monitor** → Track large holders
3. **Movement Alerts** → Notify when whales move tokens
4. **Sentiment Analyzer** → Check if movement is bullish/bearish

### Example Chain 3: Portfolio Tracking
1. **Token Data Aggregator** → Get current prices
2. **Portfolio Calculator** → Calculate total value
3. **Rebalancing Suggester** → Recommend adjustments
4. **Execution Optimizer** → Find best trade routes

## 💰 x402 Integration

### Suggested Pricing
- **Recommended**: $0.02-0.03 USD per query
- **High-volume discount**: $0.01 for 1000+ queries/day
- **Enterprise**: Custom pricing for dedicated infrastructure

### Payment Flow
1. Agent/user calls your endpoint
2. Server returns 402 Payment Required with payment details
3. Agent pays via USDC on Base/Solana
4. Server verifies payment and returns data

### Cache Strategy
- Recommend 5-minute cache to clients (reduces costs)
- Internal cache can be 1-2 minutes for fresher data
- Balance between data freshness and API rate limits

## 🛠 Development

### Project Structure
```
token-data-aggregator/
├── token-data-aggregator.js  # Main aggregation logic
├── server.js                 # Express server
├── package.json              # Dependencies
├── .env.example              # Configuration template
├── llms.txt                  # x402 job discovery file
└── README.md                 # This file
```

### Adding New Data Sources

To add a new data source:

1. Create a new fetch function:
```javascript
async function fetchNewSource(tokenIdentifier) {
  // Implementation
  return {
    available: true/false,
    source: 'source_name',
    data: { ... }
  };
}
```

2. Add to the aggregation logic in `aggregateTokenData()`

3. Update the `includeSources` array default

### Error Handling

The service continues even if some sources fail:
- Individual source errors are captured
- Other sources still return data
- `sources_succeeded` shows which sources worked
- `aggregated` section uses best available data

## 🚀 Deployment

### Deploying to x402.jobs

1. Upload your code to x402.jobs platform
2. Set environment variables in the platform dashboard
3. Configure x402 payment middleware
4. Set your pricing (recommended: $0.02-0.03)
5. Upload `llms.txt` for agent discovery

### Deploying to Other Platforms

**Vercel / Netlify:**
```bash
# Install dependencies
npm install

# Deploy
vercel deploy  # or netlify deploy
```

**Docker:**
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Railway / Render / Heroku:**
- All support Node.js out of the box
- Set environment variables in dashboard
- Deploy via Git or CLI

## 📈 Usage Statistics

Track these metrics for optimization:
- Requests per second/hour/day
- Most queried tokens
- Source success rates
- Response times
- Cache hit rates
- Revenue per query

## 🔒 Security

- Never commit API keys to Git
- Use environment variables
- Implement rate limiting if needed
- Consider request authentication for production
- Monitor for abuse patterns

## 🐛 Troubleshooting

### "CoinGecko rate limit exceeded"
- Add caching layer
- Reduce polling frequency
- Use multiple CoinGecko API keys

### "Etherscan API key invalid"
- Verify key at etherscan.io/myapikey
- Check key is for mainnet (not testnet)
- Ensure key has sufficient rate limit

### "Token not found"
- Check token symbol is correct
- Try contract address instead
- Verify token is on Ethereum mainnet
- Check token is listed on CoinGecko

### Slow response times
- Enable only needed sources
- Implement caching
- Use Promise.all for parallel fetching (already implemented)

## 🎯 Next Steps

1. ✅ Get Etherscan API key
2. ⏳ Get CoinMarketCap API key (optional)
3. 🔄 Test with various tokens
4. 🚀 Deploy to x402.jobs
5. 📝 Build Job #2: Token Unlock Analyzer

## 📚 Additional Resources

- [x402.jobs Documentation](https://www.x402.jobs/docs)
- [CoinGecko API Docs](https://www.coingecko.com/en/api)
- [Etherscan API Docs](https://docs.etherscan.io/)
- [DefiLlama API Docs](https://defillama.com/docs/api)

## 📄 License

MIT

## 🤝 Contributing

This is a proof-of-concept for x402.jobs. Feel free to:
- Suggest improvements
- Add new data sources
- Optimize performance
- Report bugs

---

**Built for the x402 autonomous payment ecosystem** 🚀
