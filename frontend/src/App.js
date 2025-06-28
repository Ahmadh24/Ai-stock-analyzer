import React, { useState } from 'react';
import { Search, TrendingUp, Brain, BarChart3, Settings } from 'lucide-react';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import AIAnalysis from './components/AIAnalysis';
import MarketOverview from './components/MarketOverview';
import PortfolioManager from './components/PortfolioManager';

function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('search');

  const tabs = [
    { id: 'search', name: 'Stock Search', icon: Search },
    { id: 'chart', name: 'Charts', icon: BarChart3 },
    { id: 'ai', name: 'AI Analysis', icon: Brain },
    { id: 'market', name: 'Market Overview', icon: TrendingUp },
    { id: 'portfolio', name: 'Portfolio', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <StockSearch onStockSelect={setSelectedStock} />;
      case 'chart':
        return selectedStock ? <StockChart stock={selectedStock} /> : <div className="text-center text-gray-500 mt-8">Select a stock to view charts</div>;
      case 'ai':
        return selectedStock ? <AIAnalysis stock={selectedStock} /> : <div className="text-center text-gray-500 mt-8">Select a stock for AI analysis</div>;
      case 'market':
        return <MarketOverview />;
      case 'portfolio':
        return <PortfolioManager />;
      default:
        return <StockSearch onStockSelect={setSelectedStock} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">AI Stock Analyzer</h1>
            </div>
            {selectedStock && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Selected:</span>
                <span className="text-sm font-medium text-gray-900">{selectedStock.symbol}</span>
                <span className={`text-sm font-medium ${selectedStock.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  ${selectedStock.price} ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.change}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App; 