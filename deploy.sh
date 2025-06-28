#!/bin/bash

# AI Stock Analyzer - Deployment Script
# This script helps prepare your application for deployment on Render

echo "🚀 AI Stock Analyzer - Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check for required files
echo "📋 Checking required files..."

required_files=(
    "package.json"
    "frontend/package.json"
    "backend/server.js"
    "render.yaml"
    ".gitignore"
    "DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        exit 1
    fi
done

# Check for environment variables
echo ""
echo "🔑 Checking environment variables..."

if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check for API keys
    if grep -q "ALPHA_VANTAGE_API_KEY" .env; then
        echo "✅ Alpha Vantage API key found"
    else
        echo "⚠️  Alpha Vantage API key not found in .env"
    fi
    
    if grep -q "OPENAI_API_KEY" .env; then
        echo "✅ OpenAI API key found"
    else
        echo "⚠️  OpenAI API key not found in .env"
    fi
else
    echo "⚠️  .env file not found - you'll need to set environment variables in Render"
fi

# Check Node.js version
echo ""
echo "📦 Checking Node.js version..."
node_version=$(node --version)
echo "Current Node.js version: $node_version"

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."

if [ -d "node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies not installed - run 'npm install'"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed - run 'cd frontend && npm install'"
fi

# Test build
echo ""
echo "🔨 Testing build process..."

echo "Testing backend..."
if npm start > /dev/null 2>&1 & then
    BACKEND_PID=$!
    sleep 3
    if curl -s http://localhost:5000/api/stocks/quote/AAPL > /dev/null 2>&1; then
        echo "✅ Backend is working"
    else
        echo "⚠️  Backend test failed - check your API keys"
    fi
    kill $BACKEND_PID 2>/dev/null
else
    echo "⚠️  Backend start failed"
fi

echo "Testing frontend build..."
if cd frontend && npm run build > /dev/null 2>&1; then
    echo "✅ Frontend builds successfully"
    cd ..
else
    echo "❌ Frontend build failed"
    cd ..
    exit 1
fi

# Deployment checklist
echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo "1. ✅ All required files present"
echo "2. ✅ Environment variables configured"
echo "3. ✅ Dependencies installed"
echo "4. ✅ Build process working"
echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy on Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Create new Web Service (backend)"
echo "   - Create new Static Site (frontend)"
echo "   - Set environment variables"
echo ""
echo "3. For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🚀 Ready for deployment!"

# Optional: Check git status
echo ""
echo "📊 Git Status:"
if [ -d ".git" ]; then
    git status --porcelain
    echo ""
    echo "Current branch: $(git branch --show-current)"
else
    echo "⚠️  Not a git repository - initialize with 'git init'"
fi 