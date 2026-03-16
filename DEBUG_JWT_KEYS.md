# Test JWT Key Paths on Render

The backend is running but login fails with 500 error. This script helps diagnose the issue.

## Possible Issues

### 1. JWT Keys Not Mounted Correctly

On Render, secrets added via Dashboard are mounted at `/etc/secrets/<SECRET_NAME>`.

**Check in Render Dashboard:**
1. Go to https://dashboard.render.com
2. Click `saas-auth-backend`
3. Go to "Shell" tab
4. Run:
   ```bash
   ls -la /etc/secrets/
   cat /etc/secrets/private.pem
   ```

If files don't exist, the secrets weren't added correctly.

### 2. Environment Variables Not Set

The `JWT_ISSUER` and `CORS_ALLOWED_ORIGINS` are marked as `sync: false` in render.yaml, which means they need to be set manually in the Dashboard.

**Set these in Render Dashboard:**
1. Go to `saas-auth-backend` → "Environment" tab
2. Add/Update:
   - `JWT_ISSUER` = `https://saas-auth-backend.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = `https://saas-auth-front.onrender.com,http://localhost:5173`

### 3. Backend Didn't Reload Secrets

Secrets are only loaded when the service starts. If you added secrets but didn't redeploy, they won't be available.

**Redeploy:**
1. Go to `saas-auth-backend` → "Manual Deploy"
2. Click "Deploy"
3. Wait for completion
4. Check logs for any errors

---

## Debug Steps

### Step 1: Check Render Logs

1. Go to https://dashboard.render.com
2. Click `saas-auth-backend` → "Logs" tab
3. Look for errors related to:
   - "Private key not found"
   - "JWT"
   - "Token"

### Step 2: Test via Shell

1. Go to `saas-auth-backend` → "Shell" tab
2. Run:
   ```bash
   cd /opt/render/project/src
   echo $JWT_PRIVATE_KEY_PATH
   ls -la /etc/secrets/
   cat /etc/secrets/private.pem | head -1
   ```

### Step 3: Check Environment Variables

In Shell, run:
```bash
printenv | grep JWT
```

Should show:
```
JWT_PRIVATE_KEY_PATH=/etc/secrets/private.pem
JWT_PUBLIC_KEY_PATH=/etc/secrets/public.pem
JWT_ISSUER=https://saas-auth-backend.onrender.com
```

---

## Quick Fix Checklist

- [ ] JWT_PRIVATE_KEY secret added in Dashboard (not just env var)
- [ ] JWT_PUBLIC_KEY secret added in Dashboard
- [ ] JWT_ISSUER env var set to `https://saas-auth-backend.onrender.com`
- [ ] CORS_ALLOWED_ORIGINS env var set to `https://saas-auth-front.onrender.com`
- [ ] Backend redeployed after adding secrets
- [ ] No errors in Render logs

---

## Test After Fix

Run:
```bash
cd D:\staging-render
node test-live-api.js
```

Expected: Login tests should pass (200 OK) and return access_token.
