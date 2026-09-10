# LiveSpaceXipo - Environment Configuration Guide

## Required Environment Variables for Vercel Deployment

### 1. **DATABASE_URL** (Required)
PostgreSQL connection string for your database.

**Format:**
```
postgresql://username:password@host:5432/database_name
```

**Options to get a free PostgreSQL database:**

#### A. Vercel Postgres (Easiest - Integrated)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Copy the connection string provided
7. Add to Environment Variables

#### B. Railway.app (Free with credit)
1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string from Variables tab
4. Use format: `postgresql://user:password@host:5432/db`

#### C. Supabase (Free tier)
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to "Connect" → "Connection strings"
4. Copy PostgreSQL URI
5. Change `[YOUR-PASSWORD]` with your password

#### D. Render.com (Free)
1. Sign up at [render.com](https://render.com)
2. Create PostgreSQL database
3. Copy External Database URL
4. Use it as DATABASE_URL

---

### 2. **ADMIN_PASSWORD** (Required)
Secret password for anonymous admin access to dashboard.

**Generate a strong password:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `SpaceX_IPO_Admin_2024!`

**How it works:**
- Admin endpoints use header: `x-admin-password: your-password`
- Controls access to:
  - Manage investors
  - Update market prices
  - Process deposits/withdrawals
  - Send notifications

---

### 3. **PORT** (Optional - Auto-set)
Server port for API.
- **Default:** `5000`
- **Vercel:** Usually auto-configured, keep as `5000`

---

### 4. **NODE_ENV** (Optional)
Node environment.
- **Value:** `production`
- **For Vercel:** Set to `production`

---

### 5. **LOG_LEVEL** (Optional)
Logging verbosity.
- **Options:** `debug`, `info`, `warn`, `error`
- **Recommended for production:** `info`

---

## How to Add Environment Variables to Vercel

### Method 1: Via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **LiveSpaceXipo** project
3. Click **Settings** (top menu)
4. Go to **Environment Variables**
5. Add each variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
   - **Environments:** Production, Preview, Development
6. Click **Save**
7. Repeat for `ADMIN_PASSWORD` and other variables

### Method 2: Via GitHub (if using GitHub Actions)
1. Go to GitHub → **corpdev13/LiveSpaceXipo**
2. Settings → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Complete Environment Variables Checklist

```env
# REQUIRED
DATABASE_URL=postgresql://user:password@host:5432/spacexipo
ADMIN_PASSWORD=your-secure-admin-password

# OPTIONAL (but recommended for production)
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
```

---

## Step-by-Step Setup

### Step 1: Get PostgreSQL Database
Choose one option above (Vercel Postgres recommended for easiest setup)
- Copy your connection string

### Step 2: Generate Admin Password
- Create a strong password (12+ chars, mixed case, numbers, symbols)
- Example: `SecureAdminPass_2024!`

### Step 3: Set in Vercel
1. Go to Vercel Dashboard → Your Project → Settings
2. Click "Environment Variables"
3. Add:
   - `DATABASE_URL` = [your connection string]
   - `ADMIN_PASSWORD` = [your strong password]
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `LOG_LEVEL` = `info`

### Step 4: Redeploy
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find latest deployment
4. Click "Redeploy" or push new commit to trigger redeploy

### Step 5: Test
```bash
# Test health endpoint (no auth needed)
curl https://your-project.vercel.app/api/health

# Test admin endpoint (requires password header)
curl -H "x-admin-password: your-admin-password" \
  https://your-project.vercel.app/api/admin/investors
```

---

## Security Notes

⚠️ **Do NOT commit credentials to GitHub**
- All passwords stored in Vercel Environment Variables only
- Never push `.env` files to repository
- `.env` files already in `.gitignore`

✅ **Best Practices:**
- Use strong, unique ADMIN_PASSWORD
- Rotate passwords periodically
- Use database provider's built-in security features
- Enable Vercel's endpoint protection if available

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Verify DATABASE_URL format is correct
- Check database firewall allows Vercel IPs
- Test connection string locally first

### Admin 401 Unauthorized
```
{"error": "Unauthorized."}
```
**Solution:**
- Verify `ADMIN_PASSWORD` env var is set in Vercel
- Send correct header: `x-admin-password: your-password`
- Check header capitalization: `x-admin-password` (lowercase)

### Deployment Build Fails
**Solution:**
- Check build logs in Vercel Dashboard
- Verify `pnpm run build` works locally
- Ensure all dependencies in `pnpm-lock.yaml`

---

## Ready for Input

**Please provide:**

1. **Database Choice** (which provider from options A-D above?)
2. **Database Connection String** (after setting up DB)
3. **Admin Password** (strong password for admin access)
4. **Any other API keys/secrets** (if applicable for future features)

Once you provide these, I'll add them to Vercel and trigger the deployment! 🚀

---

**Next:** Reply with your environment variable values and I'll configure everything in Vercel.
