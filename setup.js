#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AI Stock Analyzer Setup\n');

console.log('This script will help you set up your environment variables.\n');

console.log('You will need:');
console.log('1. Alpha Vantage API key (free at https://www.alphavantage.co/)');
console.log('2. OpenAI API key (free tier at https://platform.openai.com/)\n');

rl.question('Do you have your API keys ready? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('\nPlease get your API keys first:');
    console.log('- Alpha Vantage: https://www.alphavantage.co/');
    console.log('- OpenAI: https://platform.openai.com/');
    console.log('\nThen run this setup script again.');
    rl.close();
    return;
  }

  console.log('\nLet\'s set up your environment variables...\n');

  rl.question('Enter your Alpha Vantage API key: ', (alphaVantageKey) => {
    rl.question('Enter your OpenAI API key: ', (openaiKey) => {
      const envContent = `# API Keys
ALPHA_VANTAGE_API_KEY=${alphaVantageKey}
OPENAI_API_KEY=${openaiKey}

# Server Configuration
PORT=5000
NODE_ENV=development
`;

      const envPath = path.join(__dirname, 'backend', '.env');
      
      try {
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ Environment variables configured successfully!');
        console.log(`📁 Created: ${envPath}`);
        
        console.log('\n🎉 Setup complete! You can now run the application:');
        console.log('npm run dev');
        
      } catch (error) {
        console.error('\n❌ Error creating .env file:', error.message);
        console.log('\nPlease create the .env file manually in the backend directory.');
      }
      
      rl.close();
    });
  });
}); 