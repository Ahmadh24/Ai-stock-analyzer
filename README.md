# 🤖 AI Stock Analyzer

An intelligent stock analysis application that combines real-time financial data with AI-powered insights using OpenAI GPT-4 and Alpha Vantage API.

## ✨ Features

- **Real-time Stock Data**: Live quotes, historical data, and market information
- **AI-Powered Analysis**: Intelligent insights and recommendations using GPT-4
- **Interactive Charts**: Beautiful visualizations with Chart.js
- **Portfolio Management**: Track your investments and performance
- **Market Overview**: Real-time market trends and indices
- **Responsive Design**: Modern UI with Tailwind CSS

## 🚀 Live Demo

**[Deploy on Render](https://render.com/deploy/schema-new?template=https://github.com/yourusername/ai-stock-analyzer)**

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Chart.js, Lucide React
- **Backend**: Node.js, Express.js
- **APIs**: Alpha Vantage (financial data), OpenAI GPT-4 (AI analysis)
- **Deployment**: Render (Backend + Frontend)

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Alpha Vantage API key
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-stock-analyzer.git
   cd ai-stock-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🌐 Deployment

### Quick Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy/schema-new?template=https://github.com/yourusername/ai-stock-analyzer)

### Manual Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📊 API Endpoints

### Stock Data
- `GET /api/stocks/quote/:symbol` - Get real-time stock quote
- `GET /api/stocks/historical/:symbol` - Get historical data
- `GET /api/stocks/search/:query` - Search for stocks

### Market Data
- `GET /api/market/overview` - Get market overview

### AI Analysis
- `POST /api/ai/analyze` - Get AI-powered stock analysis

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

### API Keys Setup

1. **Alpha Vantage**: Sign up at [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. **OpenAI**: Get your key at [platform.openai.com](https://platform.openai.com/api-keys)

## 🎯 Usage

1. **Search Stocks**: Use the search bar to find stocks by symbol or company name
2. **View Data**: See real-time quotes, charts, and historical data
3. **AI Analysis**: Get intelligent insights and recommendations
4. **Portfolio**: Add stocks to your portfolio and track performance
5. **Market Overview**: Monitor overall market trends

## 📱 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for financial data
- [OpenAI](https://openai.com/) for AI capabilities
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Render](https://render.com/) for hosting

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](./DEPLOYMENT.md#troubleshooting)
2. Create an issue in this repository
3. Contact: [your-email@example.com]

---

⭐ **Star this repository if you found it helpful!** 