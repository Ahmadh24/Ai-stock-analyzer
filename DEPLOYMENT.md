# 🚀 Deployment Guide - Render

This guide will walk you through deploying your AI Stock Analyzer to Render.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **API Keys**: You'll need your Alpha Vantage and OpenAI API keys ready
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Prepare Your Repository

1. **Push to GitHub**: Ensure all your code is committed and pushed to GitHub
2. **Check Files**: Verify these files are in your repository:
   - `render.yaml` (deployment configuration)
   - `package.json` (root and frontend)
   - `backend/server.js`
   - `frontend/package.json`
   - `.gitignore`

## Step 2: Deploy Backend API

1. **Go to Render Dashboard**: Visit [dashboard.render.com](https://dashboard.render.com)
2. **Create New Service**: Click "New +" → "Web Service"
3. **Connect Repository**: Connect your GitHub repository
4. **Configure Service**:
   - **Name**: `ai-stock-analyzer-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free (or choose paid for better performance)

5. **Environment Variables**: Add these in the "Environment" tab:
   ```
   NODE_ENV=production
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   OPENAI_API_KEY=your_openai_key_here
   ```

6. **Deploy**: Click "Create Web Service"

## Step 3: Deploy Frontend

1. **Create Another Service**: Click "New +" → "Static Site"
2. **Connect Repository**: Same GitHub repository
3. **Configure Service**:
   - **Name**: `ai-stock-analyzer-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

4. **Environment Variables**: Add:
   ```
   REACT_APP_API_URL=https://your-backend-service-name.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

5. **Deploy**: Click "Create Static Site"

## Step 4: Update Configuration

After both services are deployed:

1. **Get Backend URL**: Copy the URL from your backend service
2. **Update Frontend**: Go to your frontend service settings
3. **Update Environment Variable**: Change `REACT_APP_API_URL` to your backend URL
4. **Redeploy Frontend**: Trigger a new deployment

## Step 5: Test Your Deployment

1. **Visit Frontend URL**: Your app should be live at the frontend URL
2. **Test Features**: Try searching for stocks, viewing charts, and AI analysis
3. **Check Console**: Monitor for any errors in the browser console

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Check that your backend CORS configuration includes your frontend URL
   - Verify environment variables are set correctly

2. **API Key Issues**:
   - Ensure API keys are correctly set in environment variables
   - Check that keys are valid and have sufficient credits

3. **Build Failures**:
   - Check build logs in Render dashboard
   - Verify all dependencies are in package.json
   - Ensure Node.js version compatibility

4. **Frontend Not Loading**:
   - Check that REACT_APP_API_URL is correct
   - Verify frontend build completed successfully

### Performance Tips:

1. **Upgrade Plan**: Consider upgrading from free tier for better performance
2. **Caching**: Implement caching for API responses
3. **CDN**: Use a CDN for static assets
4. **Database**: Consider adding a database for persistent data

## Environment Variables Reference

### Backend (.env):
```
NODE_ENV=production
ALPHA_VANTAGE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
PORT=5000
```

### Frontend (Environment Variables in Render):
```
REACT_APP_API_URL=https://your-backend-service.onrender.com
```

## Monitoring

1. **Logs**: Check service logs in Render dashboard
2. **Metrics**: Monitor performance and usage
3. **Alerts**: Set up alerts for service downtime
4. **Analytics**: Add analytics to track user behavior

## Security Considerations

1. **API Keys**: Never commit API keys to your repository
2. **HTTPS**: Render provides HTTPS by default
3. **Rate Limiting**: Implement rate limiting for your API
4. **Input Validation**: Validate all user inputs

## Cost Optimization

1. **Free Tier**: Start with free tier for testing
2. **Auto-sleep**: Free tier services sleep after inactivity
3. **Upgrade Strategically**: Upgrade only when needed
4. **Monitor Usage**: Keep track of API usage and costs

## Support

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **GitHub Issues**: Create issues in your repository for code-specific problems

---

🎉 **Congratulations!** Your AI Stock Analyzer is now live on Render! 