const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// AI-powered stock analysis
router.post('/analyze', async (req, res) => {
  try {
    const { symbol, price, change, volume, historicalData, newsData } = req.body;

    const prompt = `
    Analyze the following stock data and provide insights:
    
    Stock: ${symbol}
    Current Price: $${price}
    Change: ${change}
    Volume: ${volume}
    
    Historical Data (last 5 days):
    ${historicalData ? historicalData.slice(-5).map(day => 
      `${day.date}: Open: $${day.open}, Close: $${day.close}, Volume: ${day.volume}`
    ).join('\n') : 'No historical data available'}
    
    Please provide:
    1. Technical Analysis (trends, support/resistance levels)
    2. Risk Assessment (volatility, market conditions)
    3. Investment Recommendation (Buy/Hold/Sell with reasoning)
    4. Key Factors to Watch
    5. Short-term and Long-term Outlook
    
    Format your response as JSON with these keys: technicalAnalysis, riskAssessment, recommendation, keyFactors, outlook
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional stock analyst with expertise in technical analysis and market trends. Provide clear, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const analysis = response.data.choices[0].message.content;
    
    // Try to parse JSON response, fallback to text if needed
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (e) {
      parsedAnalysis = {
        analysis: analysis,
        technicalAnalysis: 'Analysis provided in text format',
        riskAssessment: 'See full analysis above',
        recommendation: 'Review full analysis for recommendation',
        keyFactors: 'See full analysis above',
        outlook: 'See full analysis above'
      };
    }

    res.json(parsedAnalysis);
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ error: 'Failed to analyze stock with AI' });
  }
});

// AI-powered market sentiment analysis
router.post('/sentiment', async (req, res) => {
  try {
    const { newsData, socialData } = req.body;

    const prompt = `
    Analyze the market sentiment based on the following data:
    
    News Headlines:
    ${newsData ? newsData.map(news => `- ${news.title}`).join('\n') : 'No news data available'}
    
    Social Media Sentiment:
    ${socialData ? socialData.map(social => `- ${social.sentiment}: ${social.text}`).join('\n') : 'No social data available'}
    
    Please provide:
    1. Overall Market Sentiment (Bullish/Bearish/Neutral)
    2. Confidence Level (0-100%)
    3. Key Sentiment Drivers
    4. Potential Market Impact
    5. Recommendations for Investors
    
    Format your response as JSON with these keys: sentiment, confidence, drivers, impact, recommendations
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a market sentiment analyst. Analyze news and social media data to determine market sentiment and provide actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const sentiment = response.data.choices[0].message.content;
    
    let parsedSentiment;
    try {
      parsedSentiment = JSON.parse(sentiment);
    } catch (e) {
      parsedSentiment = {
        sentiment: 'Neutral',
        confidence: 50,
        drivers: 'See full analysis above',
        impact: 'See full analysis above',
        recommendations: 'See full analysis above',
        fullAnalysis: sentiment
      };
    }

    res.json(parsedSentiment);
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment with AI' });
  }
});

// AI-powered portfolio recommendations
router.post('/portfolio-recommendations', async (req, res) => {
  try {
    const { currentHoldings, riskTolerance, investmentGoals, marketConditions } = req.body;

    const prompt = `
    Provide portfolio recommendations based on:
    
    Current Holdings: ${JSON.stringify(currentHoldings)}
    Risk Tolerance: ${riskTolerance}
    Investment Goals: ${investmentGoals}
    Market Conditions: ${marketConditions}
    
    Please provide:
    1. Portfolio Allocation Recommendations
    2. Stocks to Consider Adding
    3. Stocks to Consider Reducing/Selling
    4. Risk Management Strategies
    5. Rebalancing Suggestions
    
    Format your response as JSON with these keys: allocation, addStocks, reduceStocks, riskManagement, rebalancing
    `;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a portfolio management expert. Provide personalized investment recommendations based on individual circumstances and market conditions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const recommendations = response.data.choices[0].message.content;
    
    let parsedRecommendations;
    try {
      parsedRecommendations = JSON.parse(recommendations);
    } catch (e) {
      parsedRecommendations = {
        allocation: 'See full analysis above',
        addStocks: 'See full analysis above',
        reduceStocks: 'See full analysis above',
        riskManagement: 'See full analysis above',
        rebalancing: 'See full analysis above',
        fullAnalysis: recommendations
      };
    }

    res.json(parsedRecommendations);
  } catch (error) {
    console.error('Error in portfolio recommendations:', error);
    res.status(500).json({ error: 'Failed to generate portfolio recommendations' });
  }
});

module.exports = router; 