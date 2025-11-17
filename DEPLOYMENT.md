# Whisper MVP - Deployment Guide

This guide provides step-by-step instructions for deploying the Whisper application to various platforms.

## 🚀 Quick Deploy to Railway

Railway is the recommended platform for this MVP due to its simplicity and SQLite support.

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps

1. **Push code to GitHub** (already done!)
   ```bash
   git push origin claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX
   ```

2. **Deploy to Railway**
   - Go to [Railway](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `whisper-mvp` repository
   - Select the branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`
   - Railway will auto-detect the configuration and deploy

3. **Environment Variables**
   Railway will automatically set `PORT`. Optionally add:
   - `NODE_ENV=production`

4. **Get Your URL**
   - Once deployed, Railway provides a public URL (e.g., `your-app.up.railway.app`)
   - Click "Settings" → "Generate Domain" to get your public URL

5. **Test Your Deployment**
   - Visit your Railway URL
   - Create a profile
   - Submit a review
   - View aggregated feedback

### Railway Configuration

The project includes `railway.json` which configures:
- Build command: Auto-detected
- Start command: `npm start`
- Restart policy: On failure with max 10 retries

## 🌐 Alternative: Deploy to Render

### Steps

1. Go to [Render](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm run build:prod`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variable:
   - `NODE_ENV=production`
6. Click "Create Web Service"

## 🔧 Alternative: Deploy to Fly.io

### Prerequisites
- Install flyctl: https://fly.io/docs/hands-on/install-flyctl/

### Steps

1. **Initialize Fly App**
   ```bash
   fly launch
   ```

2. **Configure fly.toml**
   ```toml
   app = "whisper-mvp"

   [build]
     [build.args]
       NODE_ENV = "production"

   [env]
     NODE_ENV = "production"

   [[services]]
     http_checks = []
     internal_port = 5000
     processes = ["app"]
     protocol = "tcp"

     [[services.ports]]
       force_https = true
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

3. **Deploy**
   ```bash
   fly deploy
   ```

## 💾 Database Persistence

### Railway
- SQLite database persists in the container filesystem
- For production, consider mounting a volume:
  ```bash
  railway volume create whisper-data
  ```
- Update database path to use the volume mount point

### Render / Fly.io
- Use persistent disk/volume features
- Or migrate to PostgreSQL for better persistence

## 🔒 Security Checklist

Before going to production:

- ✅ Rate limiting is enabled (already configured)
- ✅ CORS is configured
- ✅ HTTPS is enabled (automatic on Railway/Render)
- ✅ No sensitive data in git
- ✅ Environment variables are set
- ⚠️ Consider adding database backups
- ⚠️ Set up monitoring (Railway/Render provide built-in monitoring)

## 📊 Monitoring & Logs

### Railway
- View logs in the Railway dashboard
- Set up log drains for long-term storage

### Render
- View logs in the Render dashboard
- Logs are retained for 7 days

## 🔄 Updates & Maintenance

To deploy updates:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Railway/Render will auto-deploy on push

## 🆘 Troubleshooting

### Build Failures
- Check logs in deployment platform
- Verify all dependencies are in `package.json`
- Ensure Node version compatibility (18+)

### Database Issues
- Check if SQLite file is being created
- Verify write permissions
- Consider migrating to PostgreSQL for production

### Port Issues
- Ensure app uses `process.env.PORT`
- Default is 5000 but platforms override this

## 🎯 Production Optimization

For production use, consider:

1. **Database Migration**: Switch from SQLite to PostgreSQL
2. **CDN**: Use Cloudflare or similar for static assets
3. **Monitoring**: Add Sentry for error tracking
4. **Analytics**: Add basic usage analytics
5. **Backups**: Implement automated database backups
6. **Scaling**: Enable auto-scaling on your platform

## 📧 Support

For deployment issues, check:
- Platform documentation
- Project README.md
- GitHub issues

---

**Ready to deploy?** Railway is the easiest option - just connect your repo and you're live in minutes!
