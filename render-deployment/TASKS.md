# Render Deployment Tasks

## Project: SaaS Auth Staging → Render Deployment
**Location**: `D:\staging-render`  
**Target**: Deploy to Render.com

---

## Task List

### Phase 1: Local Repository Setup

#### Task 1.1: Create render.yaml
- **File**: `D:\staging-render\render.yaml`
- **Purpose**: Infrastructure as Code blueprint for Render
- **Status**: ⬜ Pending

```yaml
services:
  - type: web
    name: saas-auth-backend
    env: node
    region: oregon
    plan: free
    rootDir: packages/auth-bff
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: saas-auth-db
          property: connectionString
      - key: JWT_PRIVATE_KEY_PATH
        value: /etc/secrets/private.pem
      - key: JWT_PUBLIC_KEY_PATH
        value: /etc/secrets/public.pem
      - key: JWT_ISSUER
        sync: false
      - key: JWT_AUDIENCE
        value: saas-platform
      - key: CORS_ALLOWED_ORIGINS
        sync: false
      - key: EMAIL_PROVIDER
        value: smtp
      - key: SMTP_HOST
        value: localhost
      - key: SMTP_PORT
        value: 1025
      - key: SMTP_FROM
        value: noreply@yoursaas.com
      - key: OPERATOR_EMAIL
        value: operator@yoursaas.com
      - key: OPERATOR_PASSWORD
        sync: false

  - type: web
    name: saas-auth-frontend
    env: static
    region: oregon
    plan: free
    rootDir: packages/login-ui
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        sync: false

databases:
  - name: saas-auth-db
    databaseName: authdb
    user: authuser
    plan: free
    region: oregon
```

---

#### Task 1.2: Create Dockerfile for Backend
- **File**: `D:\staging-render\packages\auth-bff\Dockerfile`
- **Purpose**: Container definition for backend service
- **Status**: ⬜ Pending

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY package-lock.json ./

# Copy auth-bff package
COPY packages/auth-bff/package*.json ./packages/auth-bff/
COPY packages/auth-bff/prisma ./packages/auth-bff/prisma/
COPY packages/auth-bff/src ./packages/auth-bff/src/
COPY packages/auth-bff/tsconfig.json ./packages/auth-bff/

# Install dependencies
RUN npm install

# Build the application
WORKDIR /app/packages/auth-bff
RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files for production install
COPY package*.json ./
COPY package-lock.json ./
COPY packages/auth-bff/package*.json ./packages/auth-bff/
COPY packages/auth-bff/prisma ./packages/auth-bff/prisma/
COPY packages/auth-bff/dist ./packages/auth-bff/dist/
COPY packages/auth-bff/node_modules ./packages/auth-bff/node_modules/

WORKDIR /app/packages/auth-bff

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start"]
```

---

#### Task 1.3: Create .renderignore
- **File**: `D:\staging-render\.renderignore`
- **Purpose**: Exclude files from Render deployment
- **Status**: ⬜ Pending

```
node_modules
dist
.env
.env.local
.env.render
*.log
coverage
.git
.gitignore
keys/
docker-compose.yml
verify-checkpoint-02.js
run_all_tests.js
test-results*.md
checkpoint.md
tasks-remaining.md
```

---

#### Task 1.4: Create .env.render Template
- **File**: `D:\staging-render\.env.render.example`
- **Purpose**: Environment variable template for Render
- **Status**: ⬜ Pending

```env
# ─── Database (from Render PostgreSQL) ──────────────────────────────────
DATABASE_URL=postgresql://authuser:authpass@<render-db-host>:5432/authdb?sslmode=require

# ─── JWT Configuration ──────────────────────────────────────────────────
JWT_PRIVATE_KEY_PATH=/etc/secrets/private.pem
JWT_PUBLIC_KEY_PATH=/etc/secrets/public.pem
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=604800
JWT_ISSUER=https://<your-backend>.onrender.com
JWT_AUDIENCE=saas-platform

# ─── App Configuration ──────────────────────────────────────────────────
PORT=3001
NODE_ENV=production
CORS_ALLOWED_ORIGINS=https://<your-frontend>.onrender.com

# ─── Email Configuration ────────────────────────────────────────────────
EMAIL_PROVIDER=smtp
SMTP_HOST=<your-smtp-host>
SMTP_PORT=587
SMTP_FROM=noreply@yoursaas.com

# ─── Rate Limiting ──────────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_LOGIN_MAX=10

# ─── Operator Bootstrap ─────────────────────────────────────────────────
OPERATOR_EMAIL=operator@yoursaas.com
OPERATOR_PASSWORD=Operator@Secure123!
```

---

#### Task 1.5: Create Frontend Environment File
- **File**: `D:\staging-render\packages\login-ui\.env.render.example`
- **Purpose**: Frontend environment variables for Render
- **Status**: ⬜ Pending

```env
# API URL (update after backend deployment)
VITE_API_URL=https://<your-backend>.onrender.com
```

---

### Phase 2: GitHub Repository Setup

#### Task 2.1: Initialize Git Repository
- **Location**: `D:\staging-render`
- **Commands**:
```bash
cd D:\staging-render
git init
git add .
git commit -m "Initial commit: SaaS Auth staging for Render deployment"
```
- **Status**: ⬜ Pending

---

#### Task 2.2: Create GitHub Repository
- **URL**: https://github.com/new
- **Name**: `staging-render` (or your preferred name)
- **Visibility**: Public or Private
- **Status**: ⬜ Pending

---

#### Task 2.3: Push to GitHub
- **Commands**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/staging-render.git
git branch -M main
git push -u origin main
```
- **Status**: ⬜ Pending

---

### Phase 3: Render Dashboard Setup

#### Task 3.1: Create Render Account
- **URL**: https://dashboard.render.com/register
- **Status**: ⬜ Pending

---

#### Task 3.2: Connect GitHub to Render
- **URL**: https://dashboard.render.com/git-connection
- **Steps**:
  1. Click "Connect Git"
  2. Authorize Render to access GitHub
  3. Select your repository
- **Status**: ⬜ Pending

---

#### Task 3.3: Deploy PostgreSQL Database
- **URL**: https://dashboard.render.com/databases
- **Configuration**:
  - Name: `saas-auth-staging-db`
  - Database Name: `authdb`
  - User: `authuser`
  - Plan: Free
  - Region: Oregon (or closest to users)
- **Output**: Copy the `DATABASE_URL`
- **Status**: ⬜ Pending

---

#### Task 3.4: Deploy Backend Web Service
- **URL**: https://dashboard.render.com/web
- **Configuration**:
  - Name: `saas-auth-backend`
  - Root Directory: `packages/auth-bff`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start`
  - Pre-Deploy Command: `npx prisma migrate deploy`
- **Environment Variables**:
  - Add all from `.env.render.example`
  - Add `DATABASE_URL` from Task 3.2
  - Add JWT keys as secrets
- **Status**: ⬜ Pending

---

#### Task 3.5: Deploy Frontend Static Site
- **URL**: https://dashboard.render.com/static
- **Configuration**:
  - Name: `saas-auth-frontend`
  - Root Directory: `packages/login-ui`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Backend URL from Task 3.4
- **Status**: ⬜ Pending

---

### Phase 4: Post-Deployment Verification

#### Task 4.1: Verify Backend Health
- **Command**:
```bash
curl https://saas-auth-backend.onrender.com/api/health
```
- **Expected**: `{"status":"ok","timestamp":"..."}`
- **Status**: ⬜ Pending

---

#### Task 4.2: Verify Database Migrations
- **Check**: Render dashboard → Logs → Backend
- **Look for**: Prisma migration success messages
- **Status**: ⬜ Pending

---

#### Task 4.3: Run Seed Script
- **Method**: Render Dashboard → Backend → Shell
- **Command**: `npm run db:seed`
- **Status**: ⬜ Pending

---

#### Task 4.4: Test Login Flow
- **URL**: Frontend URL from Task 3.5
- **Test Credentials**:
  - Email: `admin@acme.com`
  - Password: `Admin@Acme123!`
- **Status**: ⬜ Pending

---

#### Task 4.5: Test API Endpoints
- **Commands**:
```bash
# Health check
curl https://saas-auth-backend.onrender.com/api/health

# Login
curl -X POST https://saas-auth-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"Admin@Acme123!","tenantSlug":"acme-corp"}'
```
- **Status**: ⬜ Pending

---

## Quick Reference

### Render Dashboard URLs
- Main Dashboard: https://dashboard.render.com
- Web Services: https://dashboard.render.com/web
- Static Sites: https://dashboard.render.com/static
- Databases: https://dashboard.render.com/databases
- Logs: https://dashboard.render.com/logs
- Git Connection: https://dashboard.render.com/git-connection

### Default URLs After Deployment
- Backend: `https://saas-auth-backend.onrender.com`
- Frontend: `https://saas-auth-frontend.onrender.com`
- PostgreSQL: Internal (use DATABASE_URL)

### Test Accounts (After Seeding)
| Role | Email | Password | Tenant |
|------|-------|----------|--------|
| Operator | operator@yoursaas.com | Operator@Secure123! | system |
| Admin | admin@acme.com | Admin@Acme123! | acme-corp |
| User | alice@acme.com | User@Acme123! | acme-corp |
| Admin | admin@betaorg.com | Admin@Beta123! | beta-org |

---

## Completion Checklist

- [ ] Task 1.1: render.yaml created
- [ ] Task 1.2: Dockerfile created
- [ ] Task 1.3: .renderignore created
- [ ] Task 1.4: .env.render.example created
- [ ] Task 1.5: Frontend .env.render.example created
- [ ] Task 2.1: Git repository initialized
- [ ] Task 2.2: GitHub repository created
- [ ] Task 2.3: Code pushed to GitHub
- [ ] Task 3.1: Render account created
- [ ] Task 3.2: GitHub connected to Render
- [ ] Task 3.3: PostgreSQL deployed
- [ ] Task 3.4: Backend deployed
- [ ] Task 3.5: Frontend deployed
- [ ] Task 4.1: Backend health verified
- [ ] Task 4.2: Database migrations verified
- [ ] Task 4.3: Seed script executed
- [ ] Task 4.4: Login flow tested
- [ ] Task 4.5: API endpoints tested

---

**Created**: 2026-03-14  
**Last Updated**: 2026-03-14
