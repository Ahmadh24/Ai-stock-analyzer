const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check environment variables
console.log('Environment check:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'LOADED' : 'NOT LOADED');
console.log('Using Yahoo Finance API - No rate limits!');

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ai-stock-analyzer-frontend.onrender.com', 'http://localhost:3000']
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.json({ message: 'AI Stock Analyzer API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 