# 🚀 Deploy to Vercel - Step by Step Guide

## Overview

This guide will walk you through deploying your Token Data Aggregator to Vercel using GitHub. The entire process takes about 10-15 minutes.

---

## Prerequisites

✅ GitHub account: https://github.com/alexdinunzio  
✅ Vercel account (free tier): Already set up  
✅ API keys configured:
- Etherscan: `8G2AVJWJ2PYY8KF4HWNN6CPCXH5JWXFHMB`
- CoinMarketCap: `a6429e1190a24f1696dc12ee3d0be34c`

---

## Step 1: Create GitHub Repository

### Option A: Via GitHub Website (Easiest)

1. Go to https://github.com/alexdinunzio
2. Click the **"+"** icon in top right → **"New repository"**
3. Fill in:
   - **Repository name**: `token-data-aggregator`
   - **Description**: `x402 job: Ethereum token data aggregator from CoinGecko, Etherscan, CMC, DefiLlama`
   - **Visibility**: Public (so agents can discover it) or Private
   - ✅ **Add a README file** (check this box)
   - **Choose a license**: MIT License (recommended)
4. Click **"Create repository"**

### Option B: Via Command Line (If you prefer)

```bash
# Navigate to your project directory
cd /path/to/token-data-aggregator

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Token Data Aggregator with x402 payment"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/alexdinunzio/token-data-aggregator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Upload Project Files to GitHub

You need to upload these files to your new repository:

### Essential Files:
- ✅ `token-data-aggregator.js` (core logic)
- ✅ `server.js` (Express server with x402)
- ✅ `x402-middleware.js` (payment handling)
- ✅ `package.json` (dependencies)
- ✅ `vercel.json` (Vercel configuration)
- ✅ `llms.txt` (agent discovery)
- ✅ `README.md` (documentation)
- ⚠️ `.env.example` (template only, don't upload .env with real keys!)

### Via GitHub Website:

1. Go to your repository: `https://github.com/alexdinunzio/token-data-aggregator`
2. Click **"Add file"** → **"Upload files"**
3. Drag and drop all the files listed above
4. Scroll down and click **"Commit changes"**

### Via Command Line:

```bash
# If you have the files locally
cd /path/to/token-data-aggregator
git add .
git commit -m "Add all project files"
git push origin main
```

### Important: .gitignore

Create a `.gitignore` file to prevent uploading sensitive data:

```
node_modules/
.env
.DS_Store
*.log
.vercel
test-result-*.json
token-data-*.json
```

Upload this file to your repository too!

---

## Step 3: Connect GitHub to Vercel

1. **Go to Vercel**: https://vercel.com/login
2. **Log in** with your Vercel account
3. On the dashboard, click **"Add New..."** → **"Project"**
4. **Import from GitHub**:
   - If first time: Click **"Install Vercel for GitHub"**
   - Authorize Vercel to access your GitHub account
   - Select **"Only select repositories"**
   - Choose: `alexdinunzio/token-data-aggregator`
   - Click **"Install"**

5. **Import the repository**:
   - You should now see `token-data-aggregator` in the list
   - Click **"Import"**

---

## Step 4: Configure Vercel Project

On the "Configure Project" screen:

### Framework Preset:
- Select: **"Other"** (it's a Node.js Express app)

### Root Directory:
- Leave as: `./` (root of repository)

### Build and Output Settings:
- **Build Command**: Leave empty (Node.js doesn't need build)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### Environment Variables (CRITICAL):

Click **"Environment Variables"** and add these:

| Name | Value | Environment |
|------|-------|-------------|
| `ETHERSCAN_API_KEY` | `8G2AVJWJ2PYY8KF4HWNN6CPCXH5JWXFHMB` | Production, Preview, Development |
| `CMC_API_KEY` | `a6429e1190a24f1696dc12ee3d0be34c` | Production, Preview, Development |
| `X402_REQUIRE_PAYMENT` | `false` | Production, Preview, Development |

**Note**: Set `X402_REQUIRE_PAYMENT` to `false` initially for testing. Change to `true` when ready to require payments.

---

## Step 5: Deploy! 🚀

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build your project
   - Deploy to their edge network
   - This takes 1-2 minutes

3. **Watch the build logs** - you'll see:
   ```
   Installing dependencies...
   Running build command...
   Deploying...
   ```

4. When done, you'll see: **"🎉 Congratulations!"**

---

## Step 6: Get Your URLs

After deployment, Vercel gives you:

### Production URL:
```
https://token-data-aggregator.vercel.app
```
or
```
https://token-data-aggregator-alexdinunzio.vercel.app
```

### Your API Endpoints:
- **Service Info**: `https://your-app.vercel.app/`
- **Token Data**: `https://your-app.vercel.app/api/token-data?token=ARB`
- **Health Check**: `https://your-app.vercel.app/health`
- **Discovery**: `https://your-app.vercel.app/llms.txt`
- **Payment Stats**: `https://your-app.vercel.app/api/payment-stats`

---

## Step 7: Test Your Deployment

### Test 1: Service Info
```bash
curl https://your-app.vercel.app/
```

Expected: JSON with service information

### Test 2: Token Data (ARB)
```bash
curl "https://your-app.vercel.app/api/token-data?token=ARB"
```

Expected: Full token data from 4 sources

### Test 3: Different Token (ETH)
```bash
curl "https://your-app.vercel.app/api/token-data?token=ETH"
```

Expected: Ethereum token data

### Test 4: Check Payment Status
```bash
curl https://your-app.vercel.app/api/payment-stats
```

Expected:
```json
{
  "totalPayments": 0,
  "requirePayment": false,
  "pricing": {...}
}
```

### In Your Browser:

Just visit:
- `https://your-app.vercel.app/api/token-data?token=ARB`
- You should see JSON data!

---

## Step 8: Enable x402 Payments (When Ready)

### To Start Requiring Payments:

1. Go to Vercel dashboard
2. Select your project: `token-data-aggregator`
3. Click **"Settings"** → **"Environment Variables"**
4. Find `X402_REQUIRE_PAYMENT`
5. Change value from `false` to `true`
6. Click **"Save"**
7. Vercel will automatically redeploy

### Set Your Payment Wallet:

Add another environment variable:
- **Name**: `X402_FACILITATOR_ADDRESS`
- **Value**: Your USDC wallet address on Base or Solana
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1`

Now when users call your API:
- Without payment → Get 402 response with payment instructions
- With payment → Get data

---

## Step 9: Custom Domain (Optional)

Want a custom URL like `api.yourname.com`?

1. Go to project **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, takes a few minutes)

---

## Step 10: Monitor Usage

### Vercel Analytics:

1. Go to your project dashboard
2. Click **"Analytics"** tab
3. See:
   - Requests per day
   - Response times
   - Error rates
   - Top endpoints

### Payment Tracking:

Visit: `https://your-app.vercel.app/api/payment-stats`

Track:
- Total payments received
- Payment status
- Configuration

---

## Troubleshooting

### "Build failed"
- Check build logs in Vercel
- Ensure `package.json` is present
- Verify no syntax errors in code

### "Environment variables not working"
- Go to Settings → Environment Variables
- Make sure they're set for all environments
- Redeploy after changing variables

### "API returns errors"
- Check function logs in Vercel dashboard
- Verify API keys are correct
- Test locally first: `npm start`

### "Payment not working"
- Check `X402_REQUIRE_PAYMENT` is `true`
- Verify `X402_FACILITATOR_ADDRESS` is set
- Test payment flow with x402 client library

---

## Next Steps After Deployment

### 1. Update Your llms.txt
Edit the file to include your real Vercel URL:
```
## Main Endpoint
https://your-app.vercel.app/api/token-data
```

Commit and push to GitHub - Vercel auto-deploys!

### 2. Test with Real Payments
Use Coinbase AgentKit or x402 SDK to test payment flow

### 3. Monitor First Week
- Check Vercel analytics daily
- Monitor for errors
- Adjust pricing if needed

### 4. Market Your Service
- Tweet your API URL
- Share in Discord communities
- List on x402 marketplaces

### 5. Build Job #2
Start building the Token Unlock Analyzer to create job chains!

---

## Vercel Free Tier Limits

Your free tier includes:
- ✅ 100 GB bandwidth/month
- ✅ 100 hours serverless function execution/month
- ✅ Unlimited API calls
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ Git integration

**Estimated capacity**:
- ~10,000-50,000 API calls/month (depends on response size)
- More than enough to start!

---

## Continuous Deployment

Now every time you push to GitHub:
1. Vercel automatically detects changes
2. Runs build
3. Deploys new version
4. Zero downtime!

```bash
# Make changes
git add .
git commit -m "Updated pricing"
git push origin main

# Vercel automatically deploys!
```

---

## Summary

You now have:
- ✅ Live API on Vercel
- ✅ x402 payment integration (can enable when ready)
- ✅ Automatic deployments from GitHub
- ✅ Free hosting with SSL
- ✅ Scalable infrastructure
- ✅ Analytics and monitoring

**Your API is live and ready to earn!** 🎉

---

## Quick Reference Commands

```bash
# Clone your repo
git clone https://github.com/alexdinunzio/token-data-aggregator.git

# Make changes
cd token-data-aggregator
# ... edit files ...

# Deploy (via GitHub → Vercel auto-deploy)
git add .
git commit -m "Your message"
git push origin main

# Test your API
curl "https://your-app.vercel.app/api/token-data?token=ARB"
```

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **x402 Protocol**: https://x402.org
- **GitHub Issues**: Create one in your repo
- **Discord**: Join x402 community

**You're ready to deploy! Let's do this! 🚀**
