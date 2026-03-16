# 🚨 URGENT: Add JWT Keys to Render Backend

**Date:** March 16, 2026  
**Status:** Database Seeded ✅ | JWT Keys Missing ⚠️

---

## Current Status

| Component | Status |
|-----------|--------|
| Backend Service | ✅ Running |
| Database | ✅ Connected & Seeded |
| Health Endpoint | ✅ Working |
| **JWT Keys** | ❌ **MISSING** - Need to add via Dashboard |
| Login API | ❌ Failing (500 error - can't sign tokens without keys) |

---

## 🔑 Add JWT Keys to Render (5 Minutes)

### Step 1: Go to Render Dashboard
Open: https://dashboard.render.com

### Step 2: Select Backend Service
Click on: **`saas-auth-backend`** (Web Service)

### Step 3: Go to Environment Tab
Click: **"Environment"** tab

### Step 4: Add JWT Private Key Secret

1. Scroll to **"Secrets"** section
2. Click **"Add Secret"**
3. Enter:
   - **Key:** `JWT_PRIVATE_KEY`
   - **Value:** Copy the ENTIRE private key below (including BEGIN/END lines)

```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCwmPQUJNUCx+xh
KUU98W33mr2EuM9pr2/7qSDjNs5JzFFsILSWdpZqFNWXr/WVHN6mYHzKUeuBzMBb
1Qgw5NR2Q5EUh9Bs9GmVfNN9hDk04fsIhbEAXme7il/zTi6pmdGghHj6TxyHN3lg
WOaAbxH1B6lJ9qGkfJuVQIQT4+TdjCMtO6KS/F+w+wVKa1nex2PLUp8O3MSEjSCB
2PB81VVsZUtyk0hadZlbdLpFvef5LBldebRu/M1+kqbPKg0S8JGdKfvBMuNdnEjm
kE/v1lSVJxfTRO4599wEA9mmSFNCIUjS2+I4Vs+wOevbQJe4GLOFnI4V3axQ424G
d+5nzkBlAgMBAAECggEAIFKaiA5Ww5fKmt0GLKiCH2n96qs14WroNPh3icbn+odw
VrlkvE5vyPJPxuAAs95xHSQ3awOT9rG+eoBzK5nSjmPfC9Iw8qRIqAENJ6HaI6UC
AMURiNb+pwuUdNC4Rzgdb4MXrn7o4pHjgCA9bkAGGiJhGKXQ362j/20rz4UsiGUW
P51Iua2hSbVNGJvjCPZnf8DadB66wQ9vKjk3S0rjkonSpxVGSZK1oTbnULSquGIZ
jOa18Fuh3xN8Jw4KLCAbauhfXz217uahadxy0PnNNmwWDILPr6R99pl1qQ7xn2Zq
V+5HvtAdnPhgFsXZ9wlFmIBUlRLOv8Yt6ncB9suyQQKBgQDgZd20Y4x/raXu/6y1
gY4CE//m2E0GPbTYKI6ni+OGTlhPq5MIjMu/MUHe7YIKZmkUr1drY8qS0Jj+XOzS
O4xyf9aQ3BcOTi0WcXtoKTzFBWLftORCmJGMZ3TC7M+Q6x34WGbYwTRPvsWgsWTk
OcHL6qffZgcW++Xt6pHGMSmKJQKBgQDJd8GL7bUZDAsSl1HCL+q2HTj81pQJIHlA
5wi+cugiKOkb9nd2O8bG01ImCIG1RK0R1l+ld9s62ekMmNekuZ+/4yA+opAzL5Lf
tGvzCl+dJA8OBneWWS47sp4Ie9sTrT+6TgrTalJt/i9U6ztl4DfvWhQO711Hykv/
LMQaOmVpQQKBgCxCKy4vDEEKgNXYu7m46cdjJm/jbZ2zgf24UhqdrqyIu0ZLct6W
1oDJOFK9yY4/kK4xvy5BKm02k1ZoAZWdhR/4MtuzbSC3LpFkpJBwwbmiTFQPG44/
BUYKCa+AgZf1p52Z4f8SbDzmRZhiJKIW+jA8Agw/1VolKL56K3JJtAW5AoGANpGI
S/VTovgfG6b+zyEZasBZiio4qIwyK4EoXiVTeMUp9pf4XX7tZTchvgl50HZMhlNR
Tsk7CSKyu+W+KvDYMyo6tpxjgGm3V35P6uF5al+08DCSPZfkLOlBYrzhZt/7LeQr
jH3027QIb/DTAtILdHoqiq0M0AAcO36NkykUBMECgYAJC92rF0ulA2sjVQu/s3BM
re71txF1S5/f4ll6MBROalAq0pkNA+gCeHDPk3rrPo1e7ZP4Ks0lBngVf2qtKLGW
bOijEDN0NhErJSVghZ4qZadQ1BV/YFRBsPyjegRyp0zaq5iEGoubh9epaaKLHGVu
TPCO9U0uUg7zB9dggiutww==
-----END PRIVATE KEY-----
```

4. Click **"Save Changes"**

### Step 5: Add JWT Public Key Secret

1. Click **"Add Secret"** again
2. Enter:
   - **Key:** `JWT_PUBLIC_KEY`
   - **Value:** Copy the ENTIRE public key below

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsJj0FCTVAsfsYSlFPfFt
95q9hLjPaa9v+6kg4zbOScxRbCC0lnaWahTVl6/1lRzepmB8ylHrgczAW9UIMOTU
dkORFIfQbPRplXzTfYQ5NOH7CIWxAF5nu4pf804uqZnRoIR4+k8chzd5YFjmgG8R
9QepSfahpHyblUCEE+Pk3YwjLTuikvxfsPsFSmtZ3sdjy1KfDtzEhI0ggdjwfNVV
bGVLcpNIWnWZW3S6Rb3n+SwZXXm0bvzNfpKmzyoNEvCRnSn7wTLjXZxI5pBP79ZU
lScX00TuOffcBAPZpkhTQiFI0tviOFbPsDnr20CXuBizhZyOFd2sUONuBnfuZ85A
ZQIDAQAB
-----END PUBLIC KEY-----
```

3. Click **"Save Changes"**

### Step 6: Update Environment Variables

In the same **Environment** tab, find and update these variables:

| Key | Value |
|-----|-------|
| `JWT_ISSUER` | `https://saas-auth-backend.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://saas-auth-front.onrender.com,http://localhost:5173` |

Click **"Save Changes"** after updating.

### Step 7: Redeploy Backend

1. Go to **"Manual Deploy"** section (or "Deploy" tab)
2. Click **"Deploy"** or **"Redeploy"**
3. Wait for deployment to complete (~2-3 minutes)

---

## ✅ Verify After Deploy

Once deployment completes:

1. **Test Health:**
   - Open: https://saas-auth-backend.onrender.com/health
   - Should show: `{"status":"ok","db":"connected",...}`

2. **Test Login:**
   ```bash
   curl -X POST https://saas-auth-backend.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"admin@acme.com\",\"password\":\"Admin@Acme123!\",\"tenant_slug\":\"acme-corp\"}"
   ```
   - Should return: `{"access_token":"eyJhbGciOiJSUzI1NiIs...",...}`

3. **Run Full Test Suite:**
   ```bash
   cd D:\staging-render
   node test-live-api.js
   ```
   - Expected: **20+ tests passing**

---

## 📊 Test Accounts (Ready to Use)

These accounts are already in the database:

| Role | Email | Password | Tenant |
|------|-------|----------|--------|
| Operator | operator@yoursaas.com | Operator@Secure123! | system |
| Admin | admin@acme.com | Admin@Acme123! | acme-corp |
| User | alice@acme.com | User@Acme123! | acme-corp |
| User | bob@acme.com | User@Acme123! | acme-corp |
| Admin | admin@betaorg.com | Admin@Beta123! | beta-org |
| User | carol@betaorg.com | User@Beta123! | beta-org |

---

## 📁 Files Modified

| File | Change |
|------|--------|
| `render-deployment/render.yaml` | Added preDeployCommand for migrations |
| `packages/auth-bff/.env.render` | Render database connection |
| `keys/private.pem` | JWT private key (generated) |
| `keys/public.pem` | JWT public key (generated) |

---

## 🆘 If Login Still Fails

Check Render logs:
1. Go to `saas-auth-backend` → **"Logs"** tab
2. Look for errors related to:
   - JWT key loading
   - File paths (`/etc/secrets/private.pem`)
   - Prisma database queries

Common issues:
- **Secrets not mounted:** Render mounts secrets at `/etc/secrets/` by default
- **Wrong key format:** Make sure to include `-----BEGIN...` and `-----END...` lines
- **Backend not redeployed:** Secrets only load on fresh deploy

---

**Last Updated:** March 16, 2026  
**Action Required:** Add JWT keys via Render Dashboard
