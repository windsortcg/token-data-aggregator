/**
 * Token Data Aggregator - x402.jobs Job #1
 * 
 * Aggregates public token data from multiple free sources:
 * - CoinGecko (no API key needed)
 * - Etherscan (free API key required)
 * - CoinMarketCap (optional, free API key)
 * - DefiLlama (no API key needed)
 */

const fetch = require('node-fetch');

// Configuration - Add your API keys here
const CONFIG = {
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || 'YOUR_ETHERSCAN_API_KEY',
    baseUrl: 'https://api.etherscan.io/api'
  },
  coinmarketcap: {
    apiKey: process.env.CMC_API_KEY || '', // Optional
    baseUrl: 'https://pro-api.coinmarketcap.com/v1'
  },
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    // Free tier - no key needed
  },
  defillama: {
    baseUrl: 'https://coins.llama.fi'
  }
};

/**
 * Fetch token data from CoinGecko
 */
async function fetchCoinGeckoData(tokenIdentifier) {
  try {
    // First, search for the token to get its CoinGecko ID
    const searchUrl = `${CONFIG.coingecko.baseUrl}/search?query=${encodeURIComponent(tokenIdentifier)}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`CoinGecko search failed: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    // Find the best match (prioritize exact symbol matches)
    let coinId = null;
    if (searchData.coins && searchData.coins.length > 0) {
      const exactMatch = searchData.coins.find(
        coin => coin.symbol.toLowerCase() === tokenIdentifier.toLowerCase()
      );
      coinId = exactMatch ? exactMatch.id : searchData.coins[0].id;
    }
    
    if (!coinId) {
      return { error: 'Token not found on CoinGecko', available: false };
    }
    
    // Fetch detailed token data
    const detailUrl = `${CONFIG.coingecko.baseUrl}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const detailResponse = await fetch(detailUrl);
    
    if (!detailResponse.ok) {
      throw new Error(`CoinGecko detail fetch failed: ${detailResponse.status}`);
    }
    
    const data = await detailResponse.json();
    
    return {
      available: true,
      source: 'coingecko',
      data: {
        id: data.id,
        symbol: data.symbol?.toUpperCase(),
        name: data.name,
        contract_address: data.platforms?.ethereum || null,
        
        // Price data
        current_price_usd: data.market_data?.current_price?.usd || null,
        price_change_24h_percentage: data.market_data?.price_change_percentage_24h || null,
        price_change_7d_percentage: data.market_data?.price_change_percentage_7d || null,
        price_change_30d_percentage: data.market_data?.price_change_percentage_30d || null,
        
        // Market data
        market_cap_usd: data.market_data?.market_cap?.usd || null,
        market_cap_rank: data.market_cap_rank || null,
        fully_diluted_valuation_usd: data.market_data?.fully_diluted_valuation?.usd || null,
        fdv_to_market_cap_ratio: data.market_data?.fully_diluted_valuation?.usd && data.market_data?.market_cap?.usd
          ? (data.market_data.fully_diluted_valuation.usd / data.market_data.market_cap.usd).toFixed(2)
          : null,
        
        // Supply data
        total_supply: data.market_data?.total_supply || null,
        max_supply: data.market_data?.max_supply || null,
        circulating_supply: data.market_data?.circulating_supply || null,
        circulating_supply_percentage: data.market_data?.circulating_supply && data.market_data?.total_supply
          ? ((data.market_data.circulating_supply / data.market_data.total_supply) * 100).toFixed(2)
          : null,
        
        // Volume data
        trading_volume_24h_usd: data.market_data?.total_volume?.usd || null,
        volume_to_market_cap_ratio: data.market_data?.total_volume?.usd && data.market_data?.market_cap?.usd
          ? (data.market_data.total_volume.usd / data.market_data.market_cap.usd).toFixed(4)
          : null,
        
        // Additional metrics
        all_time_high_usd: data.market_data?.ath?.usd || null,
        all_time_high_date: data.market_data?.ath_date?.usd || null,
        ath_change_percentage: data.market_data?.ath_change_percentage?.usd || null,
        all_time_low_usd: data.market_data?.atl?.usd || null,
        all_time_low_date: data.market_data?.atl_date?.usd || null,
        
        // Metadata
        categories: data.categories || [],
        description: data.description?.en?.substring(0, 500) || null, // First 500 chars
        homepage: data.links?.homepage?.[0] || null,
        blockchain_site: data.links?.blockchain_site?.filter(url => url)?.[0] || null,
        
        // Social & Community
        twitter_handle: data.links?.twitter_screen_name || null,
        telegram_channel: data.links?.telegram_channel_identifier || null,
        
        // Last updated
        last_updated: data.last_updated
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

/**
 * Fetch token data from Etherscan
 */
async function fetchEtherscanData(contractAddress) {
  if (!contractAddress) {
    return { available: false, error: 'No contract address provided' };
  }
  
  if (CONFIG.etherscan.apiKey === 'YOUR_ETHERSCAN_API_KEY') {
    return { available: false, error: 'Etherscan API key not configured' };
  }
  
  try {
    // Token info
    const tokenInfoUrl = `${CONFIG.etherscan.baseUrl}?module=token&action=tokeninfo&contractaddress=${contractAddress}&apikey=${CONFIG.etherscan.apiKey}`;
    const response = await fetch(tokenInfoUrl);
    
    if (!response.ok) {
      throw new Error(`Etherscan fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      return { available: false, error: data.message || 'Token info not available' };
    }
    
    const tokenInfo = data.result?.[0] || data.result;
    
    // Get total supply
    const supplyUrl = `${CONFIG.etherscan.baseUrl}?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${CONFIG.etherscan.apiKey}`;
    const supplyResponse = await fetch(supplyUrl);
    const supplyData = await supplyResponse.json();
    
    return {
      available: true,
      source: 'etherscan',
      data: {
        contract_address: contractAddress,
        token_name: tokenInfo.name || null,
        token_symbol: tokenInfo.symbol || null,
        decimals: tokenInfo.decimals || null,
        total_supply_raw: supplyData.status === '1' ? supplyData.result : null,
        total_supply: supplyData.status === '1' && tokenInfo.decimals
          ? (parseInt(supplyData.result) / Math.pow(10, parseInt(tokenInfo.decimals))).toFixed(0)
          : null,
        
        // Contract verification
        contract_verified: tokenInfo.contractAddress ? true : false,
        
        // Links
        etherscan_url: `https://etherscan.io/token/${contractAddress}`
      }
    };
  } catch (error) {
    return {
      available: false,
      source: 'etherscan',
      error: error.message
    };
  }
}

/**
 * Fetch token data from CoinMarketCap
 */
async function fetchCoinMarketCapData(tokenSymbol) {
  if (!CONFIG.coinmarketcap.apiKey) {
    return { available: false, error: 'CoinMarketCap API key not configured' };
  }
  
  try {
    const url = `${CONFIG.coinmarketcap.baseUrl}/cryptocurrency/quotes/latest?symbol=${tokenSymbol.toUpperCase()}`;
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': CONFIG.coinmarketcap.apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`CoinMarketCap fetch failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.status?.error_code !== 0) {
      return { available: false, error: result.status?.error_message || 'Unknown error' };
    }
    
    const data = result.data?.[tokenSymbol.toUpperCase()];
    
    if (!data) {
      return { available: false, error: 'Token not found' };
    }
    
    return {
      available: true,
      source: 'coinmarketcap',
      data: {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        slug: data.slug,
        
        // Rankings
        cmc_rank: data.cmc_rank,
        
        // Supply
        circulating_supply: data.circulating_supply,
        total_supply: data.total_supply,
        max_supply: data.max_supply,
        
        // Price & Market data
        price_usd: data.quote?.USD?.price,
        volume_24h_usd: data.quote?.USD?.volume_24h,
        volume_change_24h: data.quote?.USD?.volume_change_24h,
        percent_change_1h: data.quote?.USD?.percent_change_1h,
        percent_change_24h: data.quote?.USD?.percent_change_24h,
        percent_change_7d: data.quote?.USD?.percent_change_7d,
        percent_change_30d: data.quote?.USD?.percent_change_30d,
        market_cap_usd: data.quote?.USD?.market_cap,
        market_cap_dominance: data.quote?.USD?.market_cap_dominance,
        fully_diluted_market_cap: data.quote?.USD?.fully_diluted_market_cap,
        
        // Metadata
        last_updated: data.quote?.USD?.last_updated,
        date_added: data.date_added,
        
        // Links
        coinmarketcap_url: `https://coinmarketcap.com/currencies/${data.slug}/`
      }
    };
  } catch (error) {
    return {
      available: false,
      source: 'coinmarketcap',
      error: error.message
    };
  }
}

/**
 * Fetch token data from DefiLlama
 */
async function fetchDefiLlamaData(contractAddress) {
  if (!contractAddress) {
    return { available: false, error: 'No contract address provided' };
  }
  
  try {
    // DefiLlama uses ethereum:ADDRESS format
    const chainPrefix = 'ethereum';
    const url = `${CONFIG.defillama.baseUrl}/prices/current/${chainPrefix}:${contractAddress}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DefiLlama fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    const tokenKey = `${chainPrefix}:${contractAddress.toLowerCase()}`;
    const tokenData = data.coins?.[tokenKey];
    
    if (!tokenData) {
      return { available: false, error: 'Token not found on DefiLlama' };
    }
    
    return {
      available: true,
      source: 'defillama',
      data: {
        price_usd: tokenData.price,
        symbol: tokenData.symbol,
        timestamp: tokenData.timestamp,
        confidence: tokenData.confidence || null,
        
        // DefiLlama-specific
        defillama_url: `https://defillama.com/token/${chainPrefix}:${contractAddress}`
      }
    };
  } catch (error) {
    return {
      available: false,
      source: 'defillama',
      error: error.message
    };
  }
}

/**
 * Main aggregation function
 */
async function aggregateTokenData(tokenIdentifier, includeSources = ['coingecko', 'etherscan', 'coinmarketcap', 'defillama']) {
  const startTime = Date.now();
  
  // Normalize token identifier
  const normalizedIdentifier = tokenIdentifier.trim();
  
  // Fetch CoinGecko first (provides contract address)
  const coinGeckoResult = await fetchCoinGeckoData(normalizedIdentifier);
  const contractAddress = coinGeckoResult.data?.contract_address;
  
  // Fetch from other sources in parallel
  const promises = [];
  
  if (includeSources.includes('etherscan') && contractAddress) {
    promises.push(fetchEtherscanData(contractAddress));
  }
  
  if (includeSources.includes('coinmarketcap')) {
    const symbol = coinGeckoResult.data?.symbol || normalizedIdentifier;
    promises.push(fetchCoinMarketCapData(symbol));
  }
  
  if (includeSources.includes('defillama') && contractAddress) {
    promises.push(fetchDefiLlamaData(contractAddress));
  }
  
  const results = await Promise.all(promises);
  
  // Combine all results
  const aggregatedData = {
    query: {
      token_identifier: normalizedIdentifier,
      timestamp: new Date().toISOString(),
      response_time_ms: Date.now() - startTime,
      sources_requested: includeSources,
      sources_succeeded: [coinGeckoResult, ...results].filter(r => r.available).map(r => r.source)
    },
    token_info: {
      name: coinGeckoResult.data?.name || null,
      symbol: coinGeckoResult.data?.symbol || null,
      contract_address: contractAddress || null,
      blockchain: 'ethereum'
    },
    sources: {
      coingecko: coinGeckoResult,
      etherscan: results.find(r => r.source === 'etherscan') || { available: false },
      coinmarketcap: results.find(r => r.source === 'coinmarketcap') || { available: false },
      defillama: results.find(r => r.source === 'defillama') || { available: false }
    },
    // Aggregated/best data (prioritize most reliable sources)
    aggregated: {
      price_usd: coinGeckoResult.data?.current_price_usd 
        || results.find(r => r.source === 'coinmarketcap')?.data?.price_usd
        || results.find(r => r.source === 'defillama')?.data?.price_usd
        || null,
      
      market_cap_usd: coinGeckoResult.data?.market_cap_usd
        || results.find(r => r.source === 'coinmarketcap')?.data?.market_cap_usd
        || null,
      
      fully_diluted_valuation_usd: coinGeckoResult.data?.fully_diluted_valuation_usd
        || results.find(r => r.source === 'coinmarketcap')?.data?.fully_diluted_market_cap
        || null,
      
      trading_volume_24h_usd: coinGeckoResult.data?.trading_volume_24h_usd
        || results.find(r => r.source === 'coinmarketcap')?.data?.volume_24h_usd
        || null,
      
      circulating_supply: coinGeckoResult.data?.circulating_supply
        || results.find(r => r.source === 'coinmarketcap')?.data?.circulating_supply
        || null,
      
      total_supply: coinGeckoResult.data?.total_supply
        || results.find(r => r.source === 'etherscan')?.data?.total_supply
        || results.find(r => r.source === 'coinmarketcap')?.data?.total_supply
        || null,
      
      max_supply: coinGeckoResult.data?.max_supply
        || results.find(r => r.source === 'coinmarketcap')?.data?.max_supply
        || null
    },
    metadata: {
      job_name: 'token-data-aggregator',
      job_version: '1.0.0',
      x402_compatible: true,
      cache_recommended_seconds: 300, // 5 minutes
      next_job_suggestions: [
        'token-unlock-analyzer',
        'whale-wallet-monitor',
        'technical-analysis',
        'sentiment-analyzer'
      ]
    }
  };
  
  return aggregatedData;
}

/**
 * Express.js handler (for x402 deployment)
 */
async function handleRequest(req, res) {
  try {
    const tokenIdentifier = req.query.token || req.body?.token;
    const includeSources = req.query.sources 
      ? req.query.sources.split(',') 
      : ['coingecko', 'etherscan', 'coinmarketcap', 'defillama'];
    
    if (!tokenIdentifier) {
      return res.status(400).json({
        error: 'Missing required parameter: token',
        usage: 'GET /token-data?token=ARB&sources=coingecko,etherscan'
      });
    }
    
    const result = await aggregateTokenData(tokenIdentifier, includeSources);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    aggregateTokenData,
    handleRequest,
    fetchCoinGeckoData,
    fetchEtherscanData,
    fetchCoinMarketCapData,
    fetchDefiLlamaData
  };
}

// CLI testing
if (require.main === module) {
  const token = process.argv[2] || 'ARB';
  console.log(`\n🔍 Fetching data for token: ${token}\n`);
  
  aggregateTokenData(token)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
}
