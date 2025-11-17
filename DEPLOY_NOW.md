# 🚀 Deploy Whisper to Production NOW

**Estimated Time: 5-10 minutes**

This guide will get your Whisper MVP live on the internet with a public URL.

## ✅ Production Verified

Your application has been tested and verified in production mode:
- ✅ API endpoints working
- ✅ Profile creation tested
- ✅ Review submission tested
- ✅ Aggregation working (test profile averages: 4.6/5.0)
- ✅ Static file serving working
- ✅ Database initialized successfully

## 🎯 Recommended: Deploy to Railway (Easiest)

Railway is the fastest and easiest option for this MVP. It supports SQLite out of the box.

### Step-by-Step Railway Deployment

#### 1. Prerequisites
- ✅ Code is already pushed to GitHub
- ✅ Branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`
- Create a Railway account at https://railway.app (free tier available)

#### 2. Create New Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub account
4. Select repository: `phoebusdev/whisper-mvp`
5. Select branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`

#### 3. Configure Deployment

Railway will auto-detect your project. Verify these settings:

**Build Configuration:**
- ✅ Auto-detected from `nixpacks.toml`
- Build command: `npm run build:prod`
- Start command: `npm start`

**Environment Variables:**
Railway auto-sets `PORT`. Optionally add:
```
NODE_ENV=production
```

#### 4. Deploy

1. Click "Deploy Now"
2. Wait 2-3 minutes for build to complete
3. Watch the deployment logs for:
   ```
   ✅ Database initialized successfully
   🚀 Server running on port XXXX
   ```

#### 5. Generate Public Domain

1. Go to your service settings
2. Click "Networking" tab
3. Click "Generate Domain"
4. Railway gives you a URL like: `whisper-mvp-production.up.railway.app`

#### 6. Test Your Deployment

Visit your Railway URL and test:

1. **Homepage** - Should load the Whisper landing page
2. **Create Profile** - Click "Create Your Feedback Profile"
3. **Copy Link** - Copy the review link
4. **Submit Review** - Open link in incognito, submit a test review
5. **View Results** - Go to your profile to see the aggregated feedback

**Test API Directly:**
```bash
curl https://your-app.up.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 🎉 You're Live!

Your application is now deployed at: `https://your-app.up.railway.app`

Share this URL with users to start collecting feedback!

---

## 🔄 Alternative: Deploy to Render

If you prefer Render over Railway:

### Step-by-Step Render Deployment

#### 1. Prerequisites
- Create a Render account at https://render.com (free tier available)

#### 2. Create Web Service

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select `phoebusdev/whisper-mvp`
5. Select branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`

#### 3. Configure Service

**Basic Settings:**
- Name: `whisper-mvp`
- Region: Choose closest to your users
- Branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`
- Runtime: `Node`

**Build & Deploy:**
- Build Command: `npm run build:prod`
- Start Command: `npm start`

**Environment Variables:**
```
NODE_ENV=production
```

#### 4. Deploy

1. Click "Create Web Service"
2. Wait for build (3-5 minutes)
3. Get your URL: `whisper-mvp.onrender.com`

**Note:** Render free tier spins down after 15min of inactivity (first request takes ~30s).

---

## 📊 Post-Deployment Checklist

After deploying:

- [ ] Test profile creation
- [ ] Test review submission
- [ ] Test profile viewing
- [ ] Test on mobile device
- [ ] Verify HTTPS is working
- [ ] Check API health endpoint
- [ ] Test copy-to-clipboard functionality
- [ ] Submit multiple reviews to test aggregation
- [ ] Share with 2-3 beta users for feedback

---

## 🔒 Important: SQLite in Production

**Current Setup:**
- SQLite database is stored in the container filesystem
- Data persists as long as the container is running
- **Redeployments will reset the database**

**For Production Use:**

### Railway - Add Persistent Volume
```bash
# In Railway dashboard:
1. Go to your service
2. Click "Volumes" tab
3. Click "New Volume"
4. Mount path: /app/server/data
5. Update database.js to use: /app/server/data/whisper.db
```

### Render - Use Persistent Disk
```bash
# In Render dashboard:
1. Go to service settings
2. Click "Disks" tab
3. Add disk: mount at /app/server/data
4. Update database.js path
```

### Or Migrate to PostgreSQL
For production at scale, consider migrating to PostgreSQL:
- Railway: Built-in PostgreSQL addon
- Render: Built-in PostgreSQL database
- See migration guide in docs/

---

## 📈 Monitoring Your Deployment

### Railway
- **Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Your Service → Metrics
- **Alerts**: Set up in Settings → Notifications

### Render
- **Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Your Service → Metrics
- **Health Checks**: Auto-configured at `/api/health`

---

## 🔄 Updating Your Deployment

To push updates:

```bash
# Make changes locally
git add .
git commit -m "Your update description"
git push origin claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX
```

Both Railway and Render auto-deploy on push!

---

## 🆘 Troubleshooting

### Deployment Fails
- Check build logs for errors
- Verify Node version (should be 18+)
- Ensure all dependencies are in package.json

### Database Not Found
- Check if database file is being created
- Verify write permissions in logs
- Consider adding persistent volume

### API Returns 404
- Verify API routes are correct
- Check server logs for errors
- Test health endpoint: `/api/health`

### Frontend Not Loading
- Verify build completed successfully
- Check if `client/dist` folder exists after build
- Ensure production env variable is set

### Rate Limiting Issues
- Check IP address in logs
- Adjust rate limits in `server/index.js` if needed
- Clear rate limit cache by restarting

---

## 🎯 Production Optimization

Once deployed, consider:

1. **Custom Domain**
   - Railway: Add custom domain in settings
   - Render: Add custom domain in settings
   - Both support automatic HTTPS

2. **Monitoring**
   - Add Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot, etc.)
   - Enable deployment notifications

3. **Backups**
   - If using persistent volume, set up automated backups
   - Or migrate to managed PostgreSQL with auto-backups

4. **Performance**
   - Enable Railway/Render's CDN for static assets
   - Add caching headers
   - Monitor response times

5. **Security**
   - Review rate limits based on actual usage
   - Add request logging
   - Monitor for abuse patterns

---

## 🎉 Success Metrics

After deployment, track:
- Number of profiles created
- Number of reviews submitted
- Average reviews per profile
- Response times
- Error rates

These are available in your platform's dashboard.

---

## 📞 Getting Help

If you encounter issues:

1. Check deployment platform docs:
   - Railway: https://docs.railway.app
   - Render: https://render.com/docs

2. Review application logs in dashboard

3. Test locally first:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

4. Check project README.md and QUICKSTART.md

---

## ✨ You're Ready!

**Choose your platform and deploy now:**

- **Railway** (Recommended): https://railway.app/new
- **Render**: https://dashboard.render.com/

Your Whisper MVP will be live in less than 10 minutes! 🚀

---

**After deployment, come back here and update this section with your URL:**

```
🌐 LIVE URL: ___________________________________
🎯 First deployed: ____________________________
📊 Status: ____________________________________
```
