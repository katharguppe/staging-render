# Render Deployment Implementation Plan

## Overview
Deploy the SaaS Auth staging application to Render.com hosting platform.

---

## Architecture on Render

| Component | Render Service Type | Notes |
|-----------|---------------------|-------|
| Backend API (auth-bff) | Web Service | Node.js, port 3001 |
| Frontend UI (login-ui) | Static Site | Vite build output |
| PostgreSQL | Managed Database | Render PostgreSQL |
| Mailhog | Not deployed | Use SendGrid/SMTP in production |
| Redis (future) | Managed Redis | For rate limiting/caching |

---

## Prerequisites

1. **Render Account** - Sign up at https://render.com
2. **GitHub Repository** - Push `D:\staging-render` to GitHub
3. **Render CLI** (optional) - For local testing: `npm install -g @render-cloud/cli`

---

## Step-by-Step Deployment Plan

### Phase 1: Repository Preparation (Local)

#### 1.1 Create Render Configuration Files
- [ ] `render.yaml` - Infrastructure as Code blueprint
- [ ] `Dockerfile` - For backend containerization
- [ ] `.renderignore` - Files to exclude from deployment

#### 1.2 Update Environment Configuration
- [ ] Create `.env.render` template for Render environment variables
- [ ] Update CORS origins for production URLs
- [ ] Configure JWT issuer for production domain

#### 1.3 Database Migration Setup
- [ ] Ensure Prisma migrations are production-ready
- [ ] Create seed script for production data

---

### Phase 2: Render Infrastructure Setup

#### 2.1 Create PostgreSQL Database on Render
- **Dashboard**: https://dashboard.render.com/databases
- **Steps**:
  1. Click "New" → "PostgreSQL"
  2. Name: `saas-auth-staging-db`
  3. Region: Select closest to users
  4. Plan: Free tier (for staging)
  5. Click "Create Database"
- **Output**: Save the `DATABASE_URL` connection string

#### 2.2 Deploy Backend Web Service
- **Dashboard**: https://dashboard.render.com/web
- **Steps**:
  1. Click "New" → "Web Service"
  2. Connect GitHub repository
  3. Configure:
     - **Name**: `saas-auth-backend`
     - **Region**: Same as database
     - **Branch**: `main` (or `master`)
     - **Root Directory**: `packages/auth-bff`
     - **Runtime**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start`
     - **Pre-Deploy Command**: `npm run db:migrate:prod`
  4. Add Environment Variables:
     - `DATABASE_URL` (from PostgreSQL)
     - `NODE_ENV=production`
     - `PORT=3001`
     - `JWT_PRIVATE_KEY_PATH` (use Render Secrets)
     - `JWT_PUBLIC_KEY_PATH` (use Render Secrets)
     - `JWT_ISSUER=https://your-app.onrender.com`
     - `CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com`
  5. Click "Create Web Service"

#### 2.3 Deploy Frontend Static Site
- **Dashboard**: https://dashboard.render.com/static
- **Steps**:
  1. Click "New" → "Static Site"
  2. Connect GitHub repository
  3. Configure:
     - **Name**: `saas-auth-frontend`
     - **Branch**: `main`
     - **Build Command**: `cd packages/login-ui && npm install && npm run build`
     - **Publish Directory**: `packages/login-ui/dist`
  4. Add Environment Variables:
     - `VITE_API_URL=https://saas-auth-backend.onrender.com`
  5. Click "Create Static Site"

---

### Phase 3: Security Configuration

#### 3.1 JWT Keys as Render Secrets
```bash
# Generate keys locally if not exists
npm run setup:keys

# Add to Render Secrets (Dashboard → Environment → Add Secret)
# Or via CLI:
render secrets set JWT_PRIVATE_KEY="$(cat keys/private.pem)"
render secrets set JWT_PUBLIC_KEY="$(cat keys/public.pem)"
```

#### 3.2 Update CORS Configuration
Update `.env` or Render environment variables:
```
CORS_ALLOWED_ORIGINS=https://saas-auth-frontend.onrender.com
```

#### 3.3 Update JWT Issuer
```
JWT_ISSUER=https://saas-auth-backend.onrender.com
```

---

### Phase 4: Post-Deployment Verification

#### 4.1 Health Check
```bash
curl https://saas-auth-backend.onrender.com/api/health
```

#### 4.2 Database Connection
- Verify migrations ran in Render logs
- Check database tables in Render PostgreSQL dashboard

#### 4.3 Frontend-Backend Integration
- Access frontend URL
- Test login flow
- Verify API calls succeed

---

## Files to Create in D:\staging-render

### 1. render.yaml (Infrastructure Blueprint)
```yaml
services:
  - type: web
    name: saas-auth-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: saas-auth-db
          property: connectionString

databases:
  - name: saas-auth-db
    databaseName: authdb
    user: authuser
    plan: free
    region: oregon
```

### 2. Dockerfile (packages/auth-bff)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start"]
```

### 3. .renderignore
```
node_modules
dist
.env
.env.local
*.log
coverage
.git
```

---

## Environment Variables Reference

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | From Render PostgreSQL | Render Dashboard |
| `NODE_ENV` | `production` | Manual |
| `PORT` | `3001` | Manual |
| `JWT_PRIVATE_KEY_PATH` | `/etc/secrets/private.pem` | Render Secrets |
| `JWT_PUBLIC_KEY_PATH` | `/etc/secrets/public.pem` | Render Secrets |
| `JWT_ISSUER` | `https://<backend>.onrender.com` | Manual |
| `JWT_AUDIENCE` | `saas-platform` | Manual |
| `CORS_ALLOWED_ORIGINS` | `https://<frontend>.onrender.com` | Manual |
| `EMAIL_PROVIDER` | `sendgrid` (or SMTP) | Manual |
| `SENDGRID_API_KEY` | From SendGrid | SendGrid Dashboard |

---

## Testing Checklist

- [ ] Backend health endpoint responds
- [ ] Database migrations applied
- [ ] User can register/login
- [ ] JWT tokens are issued correctly
- [ ] Cross-tenant isolation works
- [ ] Admin operations scoped to tenant
- [ ] Operator operations work globally
- [ ] Email sending configured (if needed)
- [ ] Rate limiting active
- [ ] Error handling graceful

---

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is in same region
   - Check Render logs for connection errors

2. **CORS Errors**
   - Update CORS_ALLOWED_ORIGINS with exact frontend URL
   - Include protocol (https://)

3. **JWT Verification Failed**
   - Ensure keys are properly formatted (no extra newlines)
   - Check file paths match Render secrets mount point

4. **Build Failures**
   - Check Node version compatibility (>=20)
   - Verify all dependencies in package.json
   - Review build logs in Render dashboard

---

## Cost Estimation (Free Tier)

| Service | Free Tier Limits | Notes |
|---------|-----------------|-------|
| Web Service | 750 hours/month | May sleep after 15min inactivity |
| Static Site | 100GB bandwidth/month | Always on |
| PostgreSQL | 1GB storage, 25k row reads/day | Auto-sleep after 90 days |

**Upgrade Path**: Paid plans start at $7/month for web services, $9/month for PostgreSQL

---

## Next Steps

1. Push `D:\staging-render` to GitHub
2. Create `render.yaml` and `Dockerfile`
3. Follow Phase 2 steps in Render Dashboard
4. Test and verify deployment
