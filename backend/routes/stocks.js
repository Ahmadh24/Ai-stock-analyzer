const express = require('express');
const axios = require('axios');
const router = express.Router();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Debug: Check if API key is loaded
console.log('Alpha Vantage API Key loaded:', ALPHA_VANTAGE_API_KEY ? 'YES' : 'NO');

// Test API key and connectivity
router.get('/test', async (req, res) => {
  try {
    if (!ALPHA_VANTAGE_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        hasKey: false 
      });
    }

    // Test with a simple API call
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'AAPL',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    res.json({
      hasKey: true,
      keyLength: ALPHA_VANTAGE_API_KEY.length,
      response: response.data,
      status: 'API is working'
    });
  } catch (error) {
    console.error('API test error:', error);
    res.status(500).json({ 
      error: 'API test failed',
      hasKey: !!ALPHA_VANTAGE_API_KEY,
      keyLength: ALPHA_VANTAGE_API_KEY ? ALPHA_VANTAGE_API_KEY.length : 0,
      message: error.message
    });
  }
});

// Get real-time stock quote
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching quote for:', symbol); // Debug log
    
    if (!ALPHA_VANTAGE_API_KEY) {
      console.error('API key is missing!');
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    console.log('Alpha Vantage response:', JSON.stringify(response.data, null, 2)); // Debug log

    // Check for API errors first
    if (response.data['Error Message']) {
      console.error('Alpha Vantage API Error:', response.data['Error Message']);
      return res.status(500).json({ error: 'API Error: ' + response.data['Error Message'] });
    }

    // Check for rate limit or information messages
    if (response.data['Information']) {
      console.error('Alpha Vantage Information:', response.data['Information']);
      return res.status(429).json({ error: 'Rate limit exceeded or API issue: ' + response.data['Information'] });
    }

    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      console.log('No quote data found in response');
      return res.status(404).json({ error: 'Stock not found' });
    }

    res.json({
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low'])
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
    const { interval = 'daily' } = req.query;
    
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_' + interval.toUpperCase(),
        symbol: symbol.toUpperCase(),
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const timeSeriesKey = `Time Series (${interval.charAt(0).toUpperCase() + interval.slice(1)})`;
    const timeSeries = response.data[timeSeriesKey];
    
    if (!timeSeries) {
      return res.status(404).json({ error: 'Historical data not found' });
    }

    const historicalData = Object.entries(timeSeries).map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'])
    })).reverse();

    res.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Search stocks
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    const matches = response.data.bestMatches || [];
    const results = matches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency']
    }));

    res.json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// Get market overview
router.get('/market-overview', async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

module.exports = router; 