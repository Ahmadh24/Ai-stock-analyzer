import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import config from '../config';

const StockSearch = ({ onStockSelect }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popularStocks] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'NFLX', name: 'Netflix Inc.' }
  ]);

  const searchStocks = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/stocks/search/${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockQuote = async (symbol) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/stocks/quote/${symbol}`);
      onStockSelect(response.data);
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      alert('Error fetching stock data. Please try again.');
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchStocks(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Stocks</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for stocks (e.g., AAPL, Apple)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Search Results */}
        {loading && (
          <div className="mt-4 text-center text-gray-500">
            Searching...
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
            {searchResults.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => getStockQuote(stock.symbol)}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className="text-sm text-gray-400">{stock.region}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Stocks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => getStockQuote(stock.symbol)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-900">{stock.symbol}</div>
              <div className="text-sm text-gray-500 truncate">{stock.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => getStockQuote('SPY')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-success-600 mr-2" />
            <span className="font-medium">S&P 500 ETF</span>
          </button>
          <button
            onClick={() => getStockQuote('QQQ')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-success-600 mr-2" />
            <span className="font-medium">NASDAQ ETF</span>
          </button>
          <button
            onClick={() => getStockQuote('VTI')}
            className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-success-600 mr-2" />
            <span className="font-medium">Total Market ETF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSearch; 