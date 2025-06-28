require('dotenv').config();

module.exports = {
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development'
}; 