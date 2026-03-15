# Render Deployment Tasks

**Project:** SaaS Auth Staging → Render.com
**Repository:** https://github.com/katharguppe/staging-render
**Started:** March 15, 2026

---

## Status Legend
- ✅ Completed
- ⬜ Pending
- 🔄 In Progress

---

## Phase 1: Repository Setup ✅

| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Create render.yaml | ✅ |
| 1.2 | Create Dockerfile | ✅ |
| 1.3 | Create .renderignore | ✅ |
| 1.4 | Create .env.render.example | ✅ |
| 1.5 | Create frontend .env.render.example | ✅ |
| 1.6 | Push to GitHub (staging-render repo) | ✅ |

---

## Phase 2: Render Infrastructure Setup

| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Create Render Account | ✅ |
| 2.2 | Connect GitHub to Render | ✅ |
| 2.3 | Deploy PostgreSQL Database | ✅ |
| 2.4 | Deploy Backend Web Service | ⬜ |
| 2.5 | Deploy Frontend Static Site | ⬜ |

---

## Phase 3: Configuration

| Task | Description | Status |
|------|-------------|--------|
| 3.1 | Add Backend Environment Variables | ⬜ |
| 3.2 | Add Frontend Environment Variables | ⬜ |
| 3.3 | Add JWT Keys as Secrets | ⬜ |
| 3.4 | Configure CORS for production URLs | ⬜ |

---

## Phase 4: Verification

| Task | Description | Status |
|------|-------------|--------|
| 4.1 | Verify Backend Health Endpoint | ⬜ |
| 4.2 | Verify Database Migrations | ⬜ |
| 4.3 | Run Seed Script | ⬜ |
| 4.4 | Test Login Flow | ⬜ |
| 4.5 | Test API Endpoints | ⬜ |

---

## Detailed Instructions

### Task 2.4: Deploy Backend Web Service ⬜

1. Go to: https://dashboard.render.com/web
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `katharguppe/staging-render`
4. Configure:
   - **Name:** `saas-auth-backend`
   - **Region:** Oregon (same as database)
   - **Branch:** `master`
   - **Root Directory:** `packages/auth-bff`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Choose free/starter option

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<paste Internal Database URL from render-credentials.txt>
   JWT_PRIVATE_KEY_PATH=/etc/secrets/private.pem
   JWT_PUBLIC_KEY_PATH=/etc/secrets/public.pem
   JWT_ISSUER=https://<will-get-after-deploy>
   JWT_AUDIENCE=saas-platform
   CORS_ALLOWED_ORIGINS=*
   EMAIL_PROVIDER=smtp
   SMTP_HOST=localhost
   SMTP_PORT=1025
   SMTP_FROM=noreply@yoursaas.com
   OPERATOR_EMAIL=operator@yoursaas.com
   OPERATOR_PASSWORD=Operator@Secure123!
   ```

6. Click **"Create Web Service"**
7. Wait for deployment to complete
8. Copy the service URL (e.g., `https://saas-auth-backend.onrender.com`)

---

### Task 2.5: Deploy Frontend Static Site ⬜

1. Go to: https://dashboard.render.com/static
2. Click **"New +"** → **"Static Site"**
3. Connect repository: `katharguppe/staging-render`
4. Configure:
   - **Name:** `saas-auth-frontend`
   - **Region:** Oregon
   - **Branch:** `master`
   - **Root Directory:** `packages/login-ui`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Choose free/starter option

5. Add Environment Variable:
   ```
   VITE_API_URL=https://<backend-url-from-task-2.4>.onrender.com
   ```

6. Click **"Create Static Site"**

---

### Task 3.3: Add JWT Keys as Secrets ⬜

1. Go to Backend service dashboard
2. Click **"Environment"** tab
3. Click **"Add Secret File"** or **"Add Secret"**
4. Add:
   - **Path:** `/etc/secrets/private.pem`
   - **Value:** Contents of `keys/private.pem` from local repo

5. Add another:
   - **Path:** `/etc/secrets/public.pem`
   - **Value:** Contents of `keys/public.pem` from local repo

---

### Task 4.1: Verify Backend Health ⬜

```bash
curl https://<backend-url>.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

---

### Task 4.3: Run Seed Script ⬜

1. Go to Backend service in Render Dashboard
2. Click **"Shell"** tab
3. Run: `npm run db:seed`
4. Check logs for success

---

### Task 4.4: Test Login Flow ⬜

1. Open frontend URL in browser
2. Login with:
   - **Email:** `admin@acme.com`
   - **Password:** `Admin@Acme123!`
   - **Tenant:** `acme-corp`
3. Verify successful login

---

## Test Accounts (After Seeding)

| Role | Email | Password | Tenant |
|------|-------|----------|--------|
| Operator | operator@yoursaas.com | Operator@Secure123! | system |
| Admin | admin@acme.com | Admin@Acme123! | acme-corp |
| User | alice@acme.com | User@Acme123! | acme-corp |
| Admin | admin@betaorg.com | Admin@Beta123! | beta-org |

---

## Render Dashboard Quick Links

- **Main Dashboard:** https://dashboard.render.com
- **Web Services:** https://dashboard.render.com/web
- **Static Sites:** https://dashboard.render.com/static
- **Databases:** https://dashboard.render.com/databases
- **Logs:** https://dashboard.render.com/logs

---

**Created:** March 15, 2026
**Last Updated:** March 15, 2026
