import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import config from '../config';

const AIAnalysis = ({ stock }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [error, setError] = useState(null);

  console.log('AIAnalysis rendered with stock:', stock);

  useEffect(() => {
    if (stock && stock.symbol) {
      fetchHistoricalData();
    }
  }, [stock?.symbol]);

  useEffect(() => {
    if (historicalData.length > 0) {
      performAIAnalysis();
    }
  }, [historicalData]);

  const fetchHistoricalData = async () => {
    if (!stock || !stock.symbol) return;
    
    try {
      console.log('Fetching historical data for AI analysis:', stock.symbol);
      const response = await axios.get(`${config.apiUrl}/api/stocks/historical/${stock.symbol}?interval=daily`);
      console.log('Historical data for AI:', response.data);
      setHistoricalData(response.data);
    } catch (error) {
      console.error('Error fetching historical data for AI:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const performAIAnalysis = async () => {
    if (!stock || !stock.symbol) return;
    
    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      console.log('Performing AI analysis for:', stock.symbol);
      const response = await axios.post(`${config.apiUrl}/api/ai/analyze`, {
        symbol: stock.symbol,
        price: stock.price,
        change: stock.change,
        volume: stock.volume,
        historicalData: historicalData.slice(-5)
      });
      console.log('AI analysis response:', response.data);
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to analyze stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Early return if stock is null or undefined
  if (!stock) {
    console.log('AIAnalysis: stock is null, showing placeholder');
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Please select a stock for AI analysis</p>
          </div>
        </div>
      </div>
    );
  }

  const getRecommendationColor = (recommendation) => {
    if (!recommendation || typeof recommendation !== 'string') return 'text-gray-500';
    const lower = recommendation.toLowerCase();
    if (lower.includes('buy')) return 'text-success-600';
    if (lower.includes('sell')) return 'text-danger-600';
    if (lower.includes('hold')) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getRecommendationIcon = (recommendation) => {
    if (!recommendation || typeof recommendation !== 'string') return Clock;
    const lower = recommendation.toLowerCase();
    if (lower.includes('buy')) return TrendingUp;
    if (lower.includes('sell')) return TrendingDown;
    if (lower.includes('hold')) return AlertTriangle;
    return Clock;
  };

  // Generic helper to render any field that may be a string or object
  const renderField = (field, fallback = 'Not available.') => {
    if (!field) return fallback;
    if (typeof field === 'string') return field;
    if (typeof field === 'object') {
      return (
        <ul className="list-disc pl-5">
          {Object.entries(field).map(([key, value]) => (
            <li key={key}>
              <strong className="capitalize">{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
            </li>
          ))}
        </ul>
      );
    }
    return String(field);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-8 w-8 text-primary-600 mx-auto mb-2 animate-pulse" />
            <div className="text-gray-500">AI is analyzing {stock.symbol}...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          No analysis available. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">AI Analysis for {stock.symbol}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">${(stock.price || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-500">Current Price</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${(stock.change || 0) >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {(stock.change || 0) >= 0 ? '+' : ''}{(stock.change || 0).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500">Today's Change</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{(stock.volume || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500">Volume</div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendation</h3>
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          {(() => {
            const Icon = getRecommendationIcon(analysis.recommendation);
            return <Icon className={`h-8 w-8 mr-4 ${getRecommendationColor(analysis.recommendation)}`} />;
          })()}
          <div>
            <div className={`text-xl font-bold ${getRecommendationColor(analysis.recommendation)}`}>
              {renderField(analysis.recommendation, 'Analysis in progress...')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Based on technical analysis and market conditions
            </div>
          </div>
        </div>
      </div>

      {/* Technical Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Analysis</h3>
        <div className="prose prose-sm max-w-none">
          {renderField(analysis.technicalAnalysis, 'Technical analysis not available.')}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
        <div className="prose prose-sm max-w-none">
          {renderField(analysis.riskAssessment, 'Risk assessment not available.')}
        </div>
      </div>

      {/* Key Factors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Factors to Watch</h3>
        <div className="prose prose-sm max-w-none">
          {renderField(analysis.keyFactors, 'Key factors analysis not available.')}
        </div>
      </div>

      {/* Outlook */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Outlook</h3>
        <div className="prose prose-sm max-w-none">
          {renderField(analysis.outlook, 'Market outlook not available.')}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not be considered as financial advice. Always conduct your own research and consult with a financial advisor before making investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis; 