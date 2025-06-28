import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';
import config from '../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const StockChart = ({ stock }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('daily');

  const timeframes = [
    { value: 'daily', label: '1D' },
    { value: 'weekly', label: '1W' },
    { value: 'monthly', label: '1M' }
  ];

  useEffect(() => {
    fetchHistoricalData();
  }, [stock.symbol, timeframe]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/api/stocks/historical/${stock.symbol}?interval=${timeframe}`);
      setHistoricalData(response.data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: historicalData.map(item => new Date(item.date)),
    datasets: [
      {
        label: `${stock.symbol} Price`,
        data: historicalData.map(item => item.close),
        borderColor: stock.change >= 0 ? '#22c55e' : '#ef4444',
        backgroundColor: stock.change >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: stock.change >= 0 ? '#22c55e' : '#ef4444',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return new Date(context[0].label).toLocaleDateString();
          },
          label: function(context) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe === 'daily' ? 'day' : timeframe === 'weekly' ? 'week' : 'month',
          displayFormats: {
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        position: 'right',
        grid: {
          color: '#e5e7eb'
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stock Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{stock.symbol}</h2>
            <p className="text-gray-500">${stock.price.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold ${stock.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500">
              {stock.change >= 0 ? '+' : ''}{stock.changePercent}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Open</div>
            <div className="font-medium">${stock.open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">High</div>
            <div className="font-medium">${stock.high.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Low</div>
            <div className="font-medium">${stock.low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Volume</div>
            <div className="font-medium">{stock.volume.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeframe === tf.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default StockChart; 