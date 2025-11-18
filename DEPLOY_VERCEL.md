# 🚀 Deploy Whisper to Vercel

**Estimated Time: 10-15 minutes**
**Updated: November 17, 2025**

This guide will deploy your Whisper MVP to Vercel with **Neon Postgres** (via Vercel Marketplace).

> **Note:** As of 2025, Vercel no longer offers built-in Postgres. They now partner with Neon to provide PostgreSQL databases. Your code is fully compatible!

---

## ✅ What's Been Configured

Your application is now ready for Vercel deployment with:
- ✅ Serverless API functions (no Express server needed)
- ✅ Vercel Postgres database adapter
- ✅ vercel.json configuration
- ✅ Automatic HTTPS
- ✅ Global CDN for frontend

---

## 🎯 Quick Deploy to Vercel

### Step 1: Prerequisites

1. **Vercel Account**
   - Sign up at https://vercel.com (free tier available)
   - Install Vercel CLI (optional but recommended):
     ```bash
     npm install -g vercel
     ```

2. **GitHub Repository**
   - ✅ Already pushed to: `phoebusdev/whisper-mvp`
   - ✅ Branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`

---

### Step 2: Deploy via Vercel Dashboard

#### A. Connect Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `phoebusdev/whisper-mvp`
4. Choose branch: `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`

#### B. Configure Project

**Framework Preset:** Other (it's auto-detected)

**Root Directory:** `./` (keep as root)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
client/dist
```

**Install Command:**
```bash
npm install
```

#### C. Environment Variables

No environment variables required initially (Vercel Postgres will be added next).

Click **"Deploy"**

---

### Step 3: Add Neon Postgres Database

#### A. Create Database (via Vercel Marketplace)

1. Go to your project dashboard on Vercel
2. Click **"Storage"** tab
3. Click **"Create"**
4. Select **"Neon Postgres"** (Vercel-Managed Integration)
5. Configure:
   - Database name: `whisper-db`
   - Region: Choose closest to your users
6. Click **"Create"**

**What happens:**
- Vercel provisions a Neon Postgres database
- Billing managed through Vercel
- Free tier: 0.5 GB storage included

#### B. Auto-Configuration

Vercel automatically adds these environment variables to your project:
- `POSTGRES_URL` (pooled connection - use this)
- `POSTGRES_URL_NON_POOLING` (direct connection)
- `POSTGRES_PRISMA_URL` (for Prisma ORM)
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**No manual configuration needed!** The database is connected via Neon's infrastructure.

#### C. Redeploy

After adding the database:
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete (~2 minutes)

---

### Step 4: Verify Deployment

Your app is now live at: `https://your-project.vercel.app`

**Test the deployment:**

1. **Visit your URL**
   ```
   https://your-project.vercel.app
   ```

2. **Test API Health**
   ```bash
   curl https://your-project.vercel.app/api/health
   ```

3. **Create a Profile**
   - Click "Create Your Feedback Profile"
   - Save the claim token
   - Copy the review link

4. **Submit a Review**
   - Open review link in incognito window
   - Fill out ratings
   - Submit feedback

5. **View Aggregated Results**
   - Visit your profile link
   - See aggregated scores

---

## 🔄 Alternative: Deploy via Vercel CLI

If you prefer using the CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: whisper-mvp
# - Directory: ./ (root)
# - Override build command? No
# - Override output directory? No

# Production deployment
vercel --prod
```

After deployment, add Postgres database via the dashboard.

---

## 📊 Vercel + Neon vs SQLite (Railway)

**Previous Setup (Railway/Render):**
- Used SQLite database (file-based)
- Single server with filesystem
- Simple but limited scaling

**New Setup (Vercel + Neon):**
- Uses Neon Postgres (managed PostgreSQL)
- Serverless functions (auto-scaling)
- Neon provides database infrastructure
- Vercel handles billing and integration

**Benefits:**
- ✅ Auto-scaling (both functions and database)
- ✅ Global CDN via Vercel Edge Network
- ✅ Managed database with automatic backups
- ✅ Serverless architecture (pay per use)
- ✅ Zero configuration SSL
- ✅ Preview deployments with database branches
- ✅ Automatic deployments on git push

---

## 🔧 Configuration Files

The following files enable Vercel deployment:

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

### api/index.js
Serverless function that handles all API routes

### api/database-postgres.js
PostgreSQL adapter for Vercel Postgres

---

## 🌐 Custom Domain (Optional)

Add your own domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `whisper.yourdomain.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your update"
git push origin claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX

# Vercel deploys automatically!
```

**Preview Deployments:**
- Every push gets a unique preview URL
- Test before merging to production
- Share preview links with team

---

## 📈 Monitoring & Analytics

### Built-in Analytics

Vercel provides:
- Real-time function logs
- Performance metrics
- Error tracking
- Traffic analytics

**Access:**
1. Project Dashboard → Analytics
2. View requests, errors, and performance

### Function Logs

View serverless function logs:
1. Project Dashboard → Functions
2. Click on a function
3. View real-time logs

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Build failed"

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `npm run build` works locally:
   ```bash
   npm install
   npm run build
   ```
3. Check Node version compatibility

### API Returns 404

**Error:** API endpoints not found

**Solution:**
1. Verify `/api` folder exists
2. Check vercel.json rewrites configuration
3. Redeploy the project

### Database Connection Error

**Error:** "Failed to connect to database"

**Solution:**
1. Verify Neon Postgres is created in Storage tab
2. Check environment variables in Project Settings → Environment Variables
3. Look for `POSTGRES_URL` variable
4. Redeploy after adding database
5. Check function logs for initialization errors

### CORS Issues

**Error:** CORS policy blocking requests

**Solution:**
Already configured in `api/index.js`:
```javascript
app.use(cors());
```

If issues persist, check browser console for specific error.

---

## 💾 Database Management

### View Database Data (Neon Console)

**Option 1: Via Vercel**
1. Go to Storage → whisper-db
2. Click "Manage Neon Database" (opens Neon console)
3. Browse tables in SQL Editor

**Option 2: Direct Neon Console**
1. Visit https://console.neon.tech
2. Select your project
3. Go to SQL Editor or Tables view

### Run SQL Queries

In Neon SQL Editor:
```sql
-- View all profiles
SELECT * FROM profiles;

-- View all reviews
SELECT * FROM reviews;

-- Count total reviews
SELECT COUNT(*) FROM reviews;

-- Get average ratings
SELECT profile_id, COUNT(*) as review_count
FROM reviews
GROUP BY profile_id;
```

### Database Backups

Neon automatically backs up your database:
- **Point-in-time recovery** (PITR)
- Restore to any point in last 7 days (Free tier)
- Longer retention on Pro tier
- Managed entirely by Neon

---

## 🔒 Security

### Environment Variables

Never commit sensitive data. Use Vercel environment variables:

1. Project Settings → Environment Variables
2. Add secrets securely
3. Available to serverless functions

### Rate Limiting

Already configured:
- 100 requests / 15 minutes (general)
- 10 reviews / hour (review submission)

**Note:** Vercel's edge network provides additional DDoS protection.

---

## 📊 Performance Optimization

### Edge Functions

For even better performance:
1. Convert API routes to Edge Functions
2. Deploy closer to users globally
3. Lower latency

### Caching

Add caching headers to improve performance:
```javascript
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
```

---

## 🆘 Common Issues

### Issue: Deployment Succeeds but Site Shows 404

**Solution:**
- Check output directory is `client/dist`
- Verify build command creates the dist folder
- Check vercel.json routes configuration

### Issue: Database Tables Not Created

**Solution:**
The database initializes on first API call. To manually initialize:
1. Visit `/api/health` endpoint
2. Check function logs for initialization message
3. Verify tables in Vercel dashboard → Storage → Data

### Issue: Reviews Not Saving

**Solution:**
1. Check function logs for errors
2. Verify database connection
3. Test locally first
4. Check rate limiting isn't blocking requests

---

## 🎯 Post-Deployment Checklist

After deployment:

- [ ] Test homepage loads
- [ ] Create a test profile
- [ ] Submit a test review
- [ ] View aggregated feedback
- [ ] Test on mobile device
- [ ] Verify HTTPS is working
- [ ] Check API health endpoint
- [ ] Test copy-to-clipboard
- [ ] Submit multiple reviews
- [ ] Verify rate limiting works
- [ ] Check function logs for errors
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring alerts

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Vercel Postgres Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Vercel CLI Docs:** https://vercel.com/docs/cli

---

## 🎉 Your Whisper MVP is Live on Vercel!

After following these steps, your app will be:
- ✅ Deployed globally on Vercel's edge network
- ✅ Using managed Postgres database
- ✅ Auto-deploying on git push
- ✅ Secured with HTTPS
- ✅ Scalable and performant

**Your URL:** `https://your-project.vercel.app`

**Next Steps:**
1. Share your URL with users
2. Monitor analytics in Vercel dashboard
3. Set up custom domain (optional)
4. Collect feedback and iterate!

---

## 💡 Pro Tips

1. **Preview Deployments:** Every git branch gets a preview URL
2. **Rollbacks:** Instantly rollback to previous deployments
3. **Analytics:** Monitor real-time traffic and performance
4. **Secrets:** Store API keys in environment variables
5. **Logs:** Real-time function logs for debugging

---

**Questions?** Check the [Vercel docs](https://vercel.com/docs) or see our other deployment guides in DEPLOYMENT.md

*Deployed with Vercel ▲*
