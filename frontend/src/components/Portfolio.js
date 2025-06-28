import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import axios from 'axios';
import config from '../config';

const Portfolio = ({ stock }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addToPortfolio = async () => {
    if (!stock || !quantity || !purchasePrice) return;

    const newHolding = {
      symbol: stock.symbol,
      name: stock.name,
      quantity: parseInt(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: new Date().toISOString()
    };

    setPortfolio([...portfolio, newHolding]);
    setQuantity('');
    setPurchasePrice('');
    setShowAddForm(false);
  };

  const removeFromPortfolio = (index) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(newPortfolio);
  };

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = stockPrices[holding.symbol] || holding.purchasePrice;
      return total + (holding.quantity * currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = stockPrices[holding.symbol] || holding.purchasePrice;
      const gainLoss = (currentPrice - holding.purchasePrice) * holding.quantity;
      return total + gainLoss;
    }, 0);
  };

  const updateStockPrices = async () => {
    const symbols = portfolio.map(holding => holding.symbol);
    const prices = {};
    
    for (const symbol of symbols) {
      try {
        const response = await axios.get(`${config.apiUrl}/api/stocks/quote/${symbol}`);
        prices[symbol] = parseFloat(response.data.price);
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        prices[symbol] = portfolio.find(h => h.symbol === symbol)?.purchasePrice || 0;
      }
    }
    
    setStockPrices(prices);
  };

  useEffect(() => {
    if (portfolio.length > 0) {
      updateStockPrices();
    }
  }, [portfolio]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Portfolio</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Stock
        </button>
      </div>

      {showAddForm && stock && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add {stock.symbol} to Portfolio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of shares"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Price per share"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={addToPortfolio}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Add to Portfolio
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-gray-600">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ${calculatePortfolioValue().toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <span className="text-sm font-medium text-gray-600">Total Gain/Loss</span>
          </div>
          <p className={`text-2xl font-bold ${calculateTotalGainLoss() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {calculateTotalGainLoss() >= 0 ? '+' : ''}${calculateTotalGainLoss().toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-600">Holdings</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{portfolio.length}</p>
        </div>
      </div>

      {portfolio.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No stocks in your portfolio yet.</p>
          <p className="text-sm text-gray-400">Search for a stock and add it to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolio.map((holding, index) => {
            const currentPrice = stockPrices[holding.symbol] || holding.purchasePrice;
            const gainLoss = (currentPrice - holding.purchasePrice) * holding.quantity;
            const gainLossPercent = ((currentPrice - holding.purchasePrice) / holding.purchasePrice) * 100;

            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{holding.symbol}</h3>
                    <p className="text-sm text-gray-600">{holding.name}</p>
                    <p className="text-sm text-gray-500">
                      {holding.quantity} shares @ ${holding.purchasePrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(holding.quantity * currentPrice).toFixed(2)}</p>
                    <div className="flex items-center gap-1">
                      {gainLoss >= 0 ? (
                        <TrendingUp className="text-green-600" size={16} />
                      ) : (
                        <TrendingDown className="text-red-600" size={16} />
                      )}
                      <span className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromPortfolio(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Portfolio; 