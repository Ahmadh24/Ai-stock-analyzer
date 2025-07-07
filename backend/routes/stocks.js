const express = require('express');
const axios = require('axios');
const router = express.Router();

// Yahoo Finance API (no rate limits, free)
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';

// Debug: Check if we're using Yahoo Finance
console.log('Using Yahoo Finance API - No rate limits!');

// Test API connectivity
router.get('/test', async (req, res) => {
  try {
    // Test with a simple API call to Yahoo Finance
    const response = await axios.get(`${YAHOO_BASE_URL}/chart/AAPL`, {
      params: {
        interval: '1d',
        range: '1d'
      }
    });

    res.json({
      hasKey: false, // No API key needed for Yahoo Finance
      keyLength: 0,
      response: response.data,
      status: 'Yahoo Finance API is working - No rate limits!'
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({ 
      error: 'API test failed',
      hasKey: false,
      keyLength: 0,
      message: error.message
    });
  }
});

// Get real-time stock quote
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching quote for:', symbol);
    
    const response = await axios.get(`${YAHOO_BASE_URL}/chart/${symbol.toUpperCase()}`, {
      params: {
        interval: '1d',
        range: '1d'
      }
    });

    console.log('Yahoo Finance response received');

    const result = response.data.chart.result[0];
    if (!result || !result.meta || !result.timestamp) {
      console.log('No quote data found in response');
      return res.status(404).json({ error: 'Stock not found' });
    }

    const meta = result.meta;
    const timestamp = result.timestamp[0];
    const quote = result.indicators.quote[0];
    
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    res.json({
      symbol: meta.symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent.toFixed(2) + '%',
      volume: meta.regularMarketVolume,
      previousClose: previousClose,
      open: meta.regularMarketOpen,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow
    });
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Get historical data
router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1d' } = req.query;
    
    // Map interval to Yahoo Finance format
    const yahooInterval = interval === 'daily' ? '1d' : 
                         interval === 'weekly' ? '1wk' : '1mo';
    
    const range = interval === 'daily' ? '1mo' : 
                  interval === 'weekly' ? '3mo' : '1y';
    
    const response = await axios.get(`${YAHOO_BASE_URL}/chart/${symbol.toUpperCase()}`, {
      params: {
        interval: yahooInterval,
        range: range
      }
    });

    const result = response.data.chart.result[0];
    if (!result || !result.timestamp) {
      return res.status(404).json({ error: 'Historical data not found' });
    }

    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    const historicalData = timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quote.open[index] || 0,
      high: quote.high[index] || 0,
      low: quote.low[index] || 0,
      close: quote.close[index] || 0,
      volume: quote.volume[index] || 0
    })).filter(item => item.close > 0); // Filter out invalid data

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Search stocks (using Yahoo Finance search)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    // Yahoo Finance search endpoint
    const response = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search`, {
      params: {
        q: query,
        quotesCount: 10,
        newsCount: 0
      }
    });

    const quotes = response.data.quotes || [];
    const results = quotes.map(quote => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname,
      type: quote.quoteType,
      region: quote.market,
      currency: quote.currency
    }));

    res.json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// Get market overview (top gainers/losers)
router.get('/market-overview', async (req, res) => {
  try {
    // Get popular stocks for market overview
    const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
    const marketData = {
      top_gainers: [],
      top_losers: []
    };

    // Fetch data for popular stocks
    const promises = popularStocks.map(async (symbol) => {
      try {
        const response = await axios.get(`${YAHOO_BASE_URL}/chart/${symbol}`, {
          params: {
            interval: '1d',
            range: '1d'
          }
        });

        const result = response.data.chart.result[0];
        if (result && result.meta) {
          const meta = result.meta;
          const change = meta.regularMarketPrice - meta.previousClose;
          const changePercent = (change / meta.previousClose) * 100;

          return {
            ticker: symbol,
            price: meta.regularMarketPrice,
            change_amount: change,
            change_percentage: changePercent,
            volume: meta.regularMarketVolume
          };
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    });

    const results = await Promise.all(promises);
    const validResults = results.filter(result => result);

    // Sort by change percentage
    validResults.sort((a, b) => b.change_percentage - a.change_percentage);

    marketData.top_gainers = validResults.filter(stock => stock.change_percentage > 0).slice(0, 5);
    marketData.top_losers = validResults.filter(stock => stock.change_percentage < 0).slice(0, 5);

    res.json(marketData);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

module.exports = router; 