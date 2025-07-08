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
    
    // Try the chart endpoint first
    const chartResponse = await axios.get(`${YAHOO_BASE_URL}/chart/${symbol.toUpperCase()}`, {
      params: {
        interval: '1d',
        range: '5d' // Get 5 days to ensure we have previous close
      }
    });

    console.log('Yahoo Finance chart response received');

    const result = chartResponse.data.chart.result[0];
    if (!result || !result.meta || !result.timestamp) {
      console.log('No quote data found in response');
      return res.status(404).json({ error: 'Stock not found' });
    }

    const meta = result.meta;
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    console.log('Meta data:', {
      symbol: meta.symbol,
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      open: meta.regularMarketOpen,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume
    });
    
    const currentPrice = meta.regularMarketPrice;
    
    // Try multiple approaches to get previous close
    let previousClose = meta.previousClose;
    
    // If previousClose is not available in meta, try to get it from the quote data
    if (!previousClose || previousClose <= 0) {
      console.log('Previous close not in meta, trying quote data...');
      // Get the last two data points to calculate change
      if (quote.close && quote.close.length >= 2) {
        const lastIndex = quote.close.length - 1;
        const currentClose = quote.close[lastIndex];
        const previousCloseFromQuote = quote.close[lastIndex - 1];
        
        if (currentClose && previousCloseFromQuote && previousCloseFromQuote > 0) {
          previousClose = previousCloseFromQuote;
          console.log('Using previous close from quote data:', previousClose);
        }
      }
    }
    
    // Calculate change
    let change = 0;
    let changePercent = 0;
    
    if (previousClose && previousClose > 0) {
      change = currentPrice - previousClose;
      changePercent = (change / previousClose) * 100;
      console.log('Change calculation:', { currentPrice, previousClose, change, changePercent });
    } else {
      console.log('Previous close is still null or invalid, trying alternative method...');
      
      // Try using the quote endpoint as a fallback
      try {
        const quoteResponse = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote`, {
          params: {
            symbols: symbol.toUpperCase()
          }
        });
        
        console.log('Quote endpoint response:', quoteResponse.data);
        
        if (quoteResponse.data.quoteResponse && quoteResponse.data.quoteResponse.result && quoteResponse.data.quoteResponse.result.length > 0) {
          const quoteData = quoteResponse.data.quoteResponse.result[0];
          if (quoteData.regularMarketPreviousClose && quoteData.regularMarketPreviousClose > 0) {
            previousClose = quoteData.regularMarketPreviousClose;
            change = currentPrice - previousClose;
            changePercent = (change / previousClose) * 100;
            console.log('Using quote endpoint data:', { currentPrice, previousClose, change, changePercent });
          }
        }
      } catch (quoteError) {
        console.log('Quote endpoint failed, using open price for change calculation');
        // Try to get a reasonable estimate from the day's range
        if (meta.regularMarketOpen && meta.regularMarketOpen > 0) {
          change = currentPrice - meta.regularMarketOpen;
          changePercent = (change / meta.regularMarketOpen) * 100;
          console.log('Using open price for change calculation:', { currentPrice, open: meta.regularMarketOpen, change, changePercent });
        }
      }
    }

    const responseData = {
      symbol: meta.symbol,
      price: currentPrice,
      change: parseFloat(changePercent.toFixed(2)),
      changePercent: changePercent.toFixed(2) + '%',
      volume: meta.regularMarketVolume,
      previousClose: previousClose,
      open: meta.regularMarketOpen,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow
    };

    console.log('Sending response:', responseData);
    res.json(responseData);
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
    // For now, return a simple response to test the endpoint
    res.json({
      top_gainers: [
        {
          ticker: 'AAPL',
          price: 211.98,
          change_amount: 2.43,
          change_percentage: 1.16,
          volume: 18662430
        },
        {
          ticker: 'GOOGL',
          price: 178.53,
          change_amount: 4.99,
          change_percentage: 2.88,
          volume: 108140200
        }
      ],
      top_losers: [
        {
          ticker: 'TSLA',
          price: 250.00,
          change_amount: -5.00,
          change_percentage: -1.96,
          volume: 50000000
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

module.exports = router; 