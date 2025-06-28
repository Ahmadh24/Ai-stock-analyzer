import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Brain, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import axios from 'axios';

const PortfolioManager = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [newStock, setNewStock] = useState({ symbol: '', shares: '', purchasePrice: '' });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load portfolio from localStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addStock = async () => {
    if (!newStock.symbol || !newStock.shares || !newStock.purchasePrice) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.get(`/api/stocks/quote/${newStock.symbol.toUpperCase()}`);
      const stockData = response.data;
      
      const stock = {
        symbol: stockData.symbol,
        shares: parseFloat(newStock.shares),
        purchasePrice: parseFloat(newStock.purchasePrice),
        currentPrice: stockData.price,
        name: stockData.symbol // You could add company name if available
      };

      setPortfolio([...portfolio, stock]);
      setNewStock({ symbol: '', shares: '', purchasePrice: '' });
    } catch (error) {
      alert('Error adding stock. Please check the symbol and try again.');
    }
  };

  const removeStock = (index) => {
    const updatedPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(updatedPortfolio);
  };

  const updatePrices = async () => {
    setLoading(true);
    try {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (stock) => {
          try {
            const response = await axios.get(`/api/stocks/quote/${stock.symbol}`);
            return { ...stock, currentPrice: response.data.price };
          } catch (error) {
            return stock;
          }
        })
      );
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPortfolioRecommendations = async () => {
    if (portfolio.length === 0) {
      alert('Please add some stocks to your portfolio first.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ai/portfolio-recommendations', {
        currentHoldings: portfolio.map(stock => ({
          symbol: stock.symbol,
          shares: stock.shares,
          purchasePrice: stock.purchasePrice,
          currentPrice: stock.currentPrice
        })),
        riskTolerance: 'Moderate',
        investmentGoals: 'Growth',
        marketConditions: 'Current market conditions'
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Error getting AI recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((total, stock) => {
      return total + (stock.shares * stock.currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return portfolio.reduce((total, stock) => {
      const currentValue = stock.shares * stock.currentPrice;
      const purchaseValue = stock.shares * stock.purchasePrice;
      return total + (currentValue - purchaseValue);
    }, 0);
  };

  const calculateGainLossPercentage = () => {
    const totalPurchaseValue = portfolio.reduce((total, stock) => {
      return total + (stock.shares * stock.purchasePrice);
    }, 0);
    
    if (totalPurchaseValue === 0) return 0;
    return (calculateTotalGainLoss() / totalPurchaseValue) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{portfolio.length}</div>
            <div className="text-sm text-gray-500">Stocks</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">${calculateTotalValue().toFixed(2)}</div>
            <div className="text-sm text-gray-500">Total Value</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${calculateTotalGainLoss() >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              ${calculateTotalGainLoss().toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Total P&L</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${calculateGainLossPercentage() >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {calculateGainLossPercentage().toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500">P&L %</div>
          </div>
        </div>
      </div>

      {/* Add Stock Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Symbol (e.g., AAPL)"
            value={newStock.symbol}
            onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Shares"
            value={newStock.shares}
            onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Purchase Price"
            value={newStock.purchasePrice}
            onChange={(e) => setNewStock({ ...newStock, purchasePrice: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addStock}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Portfolio Holdings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Holdings</h3>
          <button
            onClick={updatePrices}
            disabled={loading}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {loading ? 'Updating...' : 'Update Prices'}
          </button>
        </div>
        
        {portfolio.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No stocks in portfolio. Add some stocks to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.map((stock, index) => {
                  const marketValue = stock.shares * stock.currentPrice;
                  const gainLoss = marketValue - (stock.shares * stock.purchasePrice);
                  const gainLossPercent = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stock.shares}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${stock.purchasePrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${stock.currentPrice.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${marketValue.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${gainLoss >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          ${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeStock(index)}
                          className="text-danger-600 hover:text-danger-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Portfolio Recommendations</h3>
          <button
            onClick={getPortfolioRecommendations}
            disabled={loading}
            className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <Brain className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Get Recommendations'}
          </button>
        </div>
        
        {recommendations && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Portfolio Allocation</h4>
              <p className="text-blue-800">{recommendations.allocation}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Stocks to Consider Adding</h4>
              <p className="text-green-800">{recommendations.addStocks}</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Stocks to Consider Reducing</h4>
              <p className="text-yellow-800">{recommendations.reduceStocks}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Risk Management</h4>
              <p className="text-purple-800">{recommendations.riskManagement}</p>
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Rebalancing Suggestions</h4>
              <p className="text-indigo-800">{recommendations.rebalancing}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManager; 