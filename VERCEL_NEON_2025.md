# Vercel + Neon Postgres Setup Guide (Updated Nov 2025)

## Current State (As of November 17, 2025)

Vercel **no longer offers built-in Postgres**. Instead, they partner with **Neon** to provide PostgreSQL databases through the Vercel Marketplace.

### What This Means

- **Vercel Postgres is now powered by Neon**
- All new Postgres databases use Neon infrastructure
- Your code using `@vercel/postgres` **still works** (it connects to Neon)
- You have 3 integration options (see below)

---

## ✅ Your Code is Compatible

Your application uses `@vercel/postgres`, which is **fully compatible** with Neon since Neon is the backend provider.

**No code changes required** - it will work as-is!

---

## 🎯 How to Add Neon Postgres to Vercel

### Option 1: Vercel-Managed Integration (Recommended for MVP)

**Best for:** New projects, unified billing through Vercel

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **Storage** tab
   - Click **Create** → **Neon Postgres**
   - Or visit: https://vercel.com/marketplace/neon

2. **Configure:**
   - Database name: `whisper-db`
   - Region: Choose closest to your users
   - Click **Create**

3. **Automatic Setup:**
   - Vercel automatically adds environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click latest → Three dots → **Redeploy**

**Billing:** Managed through Vercel subscription

### Option 2: Neon-Managed Integration

**Best for:** Existing Neon users, separate billing

1. **Create Neon account:** https://neon.tech
2. **In Neon Dashboard:**
   - Create a new project
   - Go to **Integrations**
   - Click **Vercel**
   - Connect your Vercel account

3. **Link to Vercel project:**
   - Select your Vercel project
   - Neon automatically configures environment variables

**Billing:** Managed through Neon account

### Option 3: Manual Connection

**Best for:** Custom CI/CD, advanced setups

1. Create Neon database manually
2. Copy connection string
3. Add to Vercel environment variables manually

---

## 📦 Package Compatibility

### Current Setup (Works Fine)

```json
{
  "dependencies": {
    "@vercel/postgres": "^0.5.1"
  }
}
```

**Status:** ✅ Fully compatible with Neon (no changes needed)

### Alternative: Neon Serverless Driver (Optional)

For better performance and flexibility, you can migrate to Neon's native driver:

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0"
  }
}
```

**Benefits:**
- HTTP queries via `fetch` (edge-friendly)
- WebSocket support for transactions
- Better Neon-specific features
- Full node-postgres compatibility

**Migration:** See `NEON_MIGRATION.md` (I can create this if needed)

---

## 🚀 Deployment Steps (Updated for 2025)

### Step 1: Deploy to Vercel

1. **Go to:** https://vercel.com/new
2. **Import:** `phoebusdev/whisper-mvp`
3. **Branch:** `claude/whisper-feedback-mvp-0119ZDwSGhKYRQPoT7V8FqeX`
4. **Configure:**
   - Project Name: `whisper-feedback` (or unique name)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`
5. **Deploy** (wait ~2-3 minutes)

### Step 2: Add Neon Postgres

1. **In your deployed project:**
   - Click **Storage** tab
   - Click **Create**
   - Select **Neon Postgres** (Vercel-Managed)
   - Database name: `whisper-db`
   - Click **Create**

2. **Wait for provisioning** (~30 seconds)

### Step 3: Redeploy with Database

1. **Go to Deployments** tab
2. **Latest deployment** → Three dots → **Redeploy**
3. **Wait** ~2 minutes for build + deployment

### Step 4: Verify

```bash
# Replace YOUR-URL with your actual Vercel URL
curl https://YOUR-URL.vercel.app/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## 🔍 Integration Comparison

| Feature | Vercel-Managed | Neon-Managed | Manual |
|---------|---------------|--------------|---------|
| **Billing** | Through Vercel | Through Neon | Through Neon |
| **Setup** | One click | Link accounts | Manual config |
| **Preview Branches** | ✅ Auto | ✅ Auto | ❌ Manual |
| **Environment Vars** | ✅ Auto | ✅ Auto | ❌ Manual |
| **Best For** | New users | Existing Neon users | Custom setups |

---

## 💰 Pricing (Neon via Vercel)

**Free Tier (Hobby):**
- 0.5 GB storage
- Shared compute
- 3 Neon projects
- 10 branches per project
- Good for MVP/prototypes

**Pro Tier:**
- 10 GB storage
- Dedicated compute
- Autoscaling
- Unlimited projects
- Starts at $19/month

**Note:** Vercel-Managed billing appears on Vercel invoice

---

## 🐛 Troubleshooting

### Database Not Connecting

**Check:**
1. Storage tab shows "Connected" status
2. Environment variables are set (Settings → Environment Variables)
3. Redeploy after adding database

**Fix:**
```bash
# Check env vars in your function
console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
```

### "Module not found: @vercel/postgres"

**Fix:**
```bash
# Ensure it's in root package.json dependencies
npm install @vercel/postgres
git add package.json package-lock.json
git commit -m "Add @vercel/postgres dependency"
git push
```

### Tables Not Created

**Cause:** Database initialization runs on first API call

**Fix:**
1. Visit `/api/health` endpoint
2. Check function logs (Deployments → Latest → View Function Logs)
3. Should see "Database initialization" messages

### Connection Pool Errors

**Cause:** Too many concurrent connections

**Fix:** Use `POSTGRES_URL` (pooled connection) not `POSTGRES_URL_NON_POOLING`

---

## 📊 Environment Variables (Auto-Set by Vercel)

After adding Neon via Vercel:

```bash
POSTGRES_URL               # Pooled connection (use this)
POSTGRES_URL_NON_POOLING  # Direct connection (for migrations)
POSTGRES_PRISMA_URL       # For Prisma ORM
POSTGRES_USER             # Database user
POSTGRES_HOST             # Database host
POSTGRES_PASSWORD         # Database password
POSTGRES_DATABASE         # Database name
```

**Your code automatically uses these** via `@vercel/postgres`

---

## ✅ Current Code Compatibility

### api/index.js

```javascript
import { sql } from '@vercel/postgres';
// ✅ This works with Neon (no changes needed)

await sql`SELECT * FROM profiles`;
// ✅ Uses Neon connection automatically
```

**Status:** 100% compatible with Neon integration

---

## 🔄 Optional: Migrate to Neon Native Driver

If you want to use Neon's native driver for better performance:

### 1. Update package.json

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0"
    // Remove @vercel/postgres if migrating completely
  }
}
```

### 2. Update api/index.js

```javascript
// Old
import { sql } from '@vercel/postgres';

// New
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
```

### 3. Update queries

Query syntax is very similar:

```javascript
// Old and New (same syntax)
const { rows } = await sql`SELECT * FROM profiles`;
```

**Note:** This is optional. Current code works fine!

---

## 🎯 Summary

✅ **Your code is ready** - uses `@vercel/postgres` which works with Neon
✅ **Integration is simple** - Add Neon via Vercel Storage tab
✅ **Auto-configuration** - Environment variables set automatically
✅ **Free tier available** - 0.5 GB storage included
✅ **No code changes needed** - Works as-is

**Next Step:** Add Neon Postgres in Vercel Storage tab, then redeploy.

---

## 📚 Additional Resources

- **Neon Docs:** https://neon.tech/docs/guides/vercel-overview
- **Vercel + Neon:** https://vercel.com/marketplace/neon
- **Migration Guide:** https://neon.tech/docs/guides/vercel-postgres-transition-guide
- **Neon Serverless Driver:** https://github.com/neondatabase/serverless

---

*Last Updated: November 17, 2025*
