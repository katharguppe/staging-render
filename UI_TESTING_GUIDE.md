# 🧪 UI Testing Guide - SaaS Auth Platform

**For:** UI/Frontend Developers  
**Date:** March 16, 2026  
**Status:** ✅ **Backend Ready - All APIs Tested (30/30 Passing)**

---

## 🎯 Quick Start

Your backend is **live and fully functional**. Use this guide to test your UI components against the production API.

### Backend URL
```
https://saas-auth-backend.onrender.com
```

### Frontend URL (if deployed)
```
https://saas-auth-front.onrender.com
```

---

## 📋 Table of Contents

1. [Test Accounts](#-test-accounts)
2. [API Endpoints Reference](#-api-endpoints-reference)
3. [Login Flow Testing](#-login-flow-testing)
4. [Admin Dashboard Testing](#-admin-dashboard-testing)
5. [Error Handling Tests](#-error-handling-tests)
6. [Security Tests](#-security-tests)
7. [Troubleshooting](#-troubleshooting)

---

## 👥 Test Accounts

Use these pre-seeded accounts for testing. All passwords are secure and ready for production testing.

| Role | Email | Password | Tenant | What They Can Do |
|------|-------|----------|--------|------------------|
| **Platform Operator** | operator@yoursaas.com | Operator@Secure123! | system | Manage all tenants |
| **Tenant Admin** | admin@acme.com | Admin@Acme123! | acme-corp | Manage users in acme-corp |
| **Regular User** | alice@acme.com | User@Acme123! | acme-corp | View-only access |
| **Regular User** | bob@acme.com | User@Acme123! | acme-corp | View-only access |
| **Disabled User** | disabled@acme.com | User@Acme123! | acme-corp | ❌ Cannot login |
| **Tenant Admin** | admin@betaorg.com | Admin@Beta123! | beta-org | Manage users in beta-org |
| **Regular User** | carol@betaorg.com | User@Beta123! | beta-org | View-only access |

---

## 🔌 API Endpoints Reference

### Authentication Endpoints

#### POST `/auth/login`
**Purpose:** Authenticate user and get access token

**Request:**
```json
{
  "email": "admin@acme.com",
  "password": "Admin@Acme123!",
  "tenant_slug": "acme-corp"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "admin@acme.com",
    "role": "admin",
    "tenant_id": "uuid",
    "tenant_name": "Acme Corp"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account disabled
- `404` - Tenant not found

---

#### GET `/auth/me`
**Purpose:** Get current user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "email": "admin@acme.com",
  "role": "admin",
  "status": "active",
  "tenant": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp"
  },
  "last_login_at": "2026-03-16T10:00:00.000Z",
  "created_at": "2026-03-01T00:00:00.000Z"
}
```

---

#### POST `/auth/forgot-password`
**Purpose:** Request password reset

**Request:**
```json
{
  "email": "admin@acme.com",
  "tenant_slug": "acme-corp"
}
```

**Success Response (200):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### Admin Endpoints (Tenant-Scoped)

All admin endpoints require:
- `Authorization: Bearer <token>` header
- `x-tenant-slug: <tenant-slug>` header (or infer from token)

#### GET `/admin/users`
**Purpose:** List all users in tenant

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "alice@acme.com",
      "role": "user",
      "status": "active",
      "lastLoginAt": "2026-03-16T09:00:00.000Z",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "total": 3,
  "license": {
    "max_users": 5,
    "active_users": 3,
    "remaining": 2,
    "usage_percentage": 60
  }
}
```

---

#### POST `/admin/users`
**Purpose:** Create new user

**Request:**
```json
{
  "email": "newuser@acme.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "newuser@acme.com",
    "role": "user",
    "status": "active"
  }
}
```

**Error Responses:**
- `400` - Password doesn't meet requirements
- `409` - Email already exists
- `402` - License limit reached

---

#### PATCH `/admin/users/:id`
**Purpose:** Update user (role, status, email)

**Request:**
```json
{
  "role": "admin"
}
```

**Success Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid",
    "email": "alice@acme.com",
    "role": "admin",
    "status": "active"
  }
}
```

---

#### DELETE `/admin/users/:id`
**Purpose:** Disable user (soft delete)

**Success Response (200):**
```json
{
  "message": "User disabled successfully"
}
```

---

#### GET `/admin/license`
**Purpose:** Get license/quota information

**Success Response (200):**
```json
{
  "license": {
    "max_users": 5,
    "active_users": 3,
    "disabled_users": 1,
    "total_users": 4,
    "usage_percentage": 60,
    "tenant_status": "active"
  }
}
```

---

### Operator Endpoints (Global Scope)

All operator endpoints require:
- `Authorization: Bearer <token>` header
- User must have `operator` role

#### GET `/operator/tenants`
**Purpose:** List all tenants

**Success Response (200):**
```json
{
  "tenants": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active",
      "maxUsers": 5,
      "activeUsers": 3,
      "availableSlots": 2
    }
  ],
  "total": 3
}
```

---

#### POST `/operator/tenants`
**Purpose:** Create new tenant

**Request:**
```json
{
  "name": "New Corp",
  "slug": "new-corp",
  "maxUsers": 10
}
```

**Success Response (201):**
```json
{
  "message": "Tenant created successfully",
  "tenant": {
    "id": "uuid",
    "name": "New Corp",
    "slug": "new-corp",
    "status": "active",
    "maxUsers": 10
  }
}
```

---

#### POST `/operator/tenants/:id/suspend`
**Purpose:** Suspend tenant

**Success Response (200):**
```json
{
  "message": "Tenant suspended successfully"
}
```

---

#### POST `/operator/tenants/:id/activate`
**Purpose:** Activate suspended tenant

**Success Response (200):**
```json
{
  "message": "Tenant activated successfully"
}
```

---

#### DELETE `/operator/tenants/:id`
**Purpose:** Cancel tenant (soft delete)

**Success Response (200):**
```json
{
  "message": "Tenant cancelled successfully"
}
```

---

## 🔐 Login Flow Testing

### Test Case 1: Successful Admin Login
```
1. Enter: admin@acme.com
2. Enter: Admin@Acme123!
3. Enter: acme-corp
4. Click Login
5. Expected: Redirect to dashboard, token stored
```

### Test Case 2: Successful User Login
```
1. Enter: alice@acme.com
2. Enter: User@Acme123!
3. Enter: acme-corp
4. Click Login
5. Expected: Redirect to dashboard (limited access)
```

### Test Case 3: Invalid Password
```
1. Enter: admin@acme.com
2. Enter: wrongpassword
3. Enter: acme-corp
4. Click Login
5. Expected: Error message "Invalid email or password"
```

### Test Case 4: Disabled Account
```
1. Enter: disabled@acme.com
2. Enter: User@Acme123!
3. Enter: acme-corp
4. Click Login
5. Expected: Error message "Account is disabled"
```

### Test Case 5: Invalid Tenant
```
1. Enter: admin@acme.com
2. Enter: Admin@Acme123!
3. Enter: non-existent-tenant
4. Click Login
5. Expected: Error message "Tenant not found"
```

---

## 📊 Admin Dashboard Testing

### Test Case 6: View Users List
```
Prerequisite: Logged in as admin@acme.com

1. Navigate to Users page
2. Expected: See list of users in acme-corp
3. Expected: See license usage (3/5 users)
```

### Test Case 7: Create New User
```
Prerequisite: Logged in as admin@acme.com

1. Click "Add User"
2. Enter: test@acme.com
3. Enter: TestPass123!
4. Select Role: User
5. Click Create
6. Expected: Success message, user appears in list
```

### Test Case 8: Create User - Duplicate Email
```
Prerequisite: Logged in as admin@acme.com

1. Click "Add User"
2. Enter: alice@acme.com (existing user)
3. Enter: TestPass123!
4. Click Create
5. Expected: Error "Email already exists"
```

### Test Case 9: Create User - Weak Password
```
Prerequisite: Logged in as admin@acme.com

1. Click "Add User"
2. Enter: test2@acme.com
3. Enter: weak (too short)
4. Click Create
5. Expected: Error "Password must be at least 10 characters"
```

### Test Case 10: Promote User to Admin
```
Prerequisite: Logged in as admin@acme.com

1. Find user alice@acme.com
2. Click "Edit"
3. Change Role: User → Admin
4. Click Save
5. Expected: Success, role updated
```

### Test Case 11: Disable User
```
Prerequisite: Logged in as admin@acme.com

1. Find a test user
2. Click "Disable" or "Delete"
3. Confirm action
4. Expected: User status changes to "disabled"
```

### Test Case 12: View License Info
```
Prerequisite: Logged in as admin@acme.com

1. Navigate to Settings or License page
2. Expected: See max_users, active_users, remaining slots
```

---

## 🌍 Operator Dashboard Testing

### Test Case 13: Operator Login
```
1. Enter: operator@yoursaas.com
2. Enter: Operator@Secure123!
3. Enter: system
4. Click Login
5. Expected: Redirect to operator dashboard
```

### Test Case 14: View All Tenants
```
Prerequisite: Logged in as operator

1. Navigate to Tenants page
2. Expected: See all tenants (acme-corp, beta-org, etc.)
3. Expected: See active users count per tenant
```

### Test Case 15: Create New Tenant
```
Prerequisite: Logged in as operator

1. Click "Create Tenant"
2. Enter: Test Corp
3. Enter: test-corp-123
4. Enter: 10 (max users)
5. Click Create
6. Expected: Success, tenant appears in list
```

### Test Case 16: Suspend Tenant
```
Prerequisite: Logged in as operator

1. Find a test tenant
2. Click "Suspend"
3. Confirm action
4. Expected: Tenant status changes to "suspended"
```

### Test Case 17: Activate Suspended Tenant
```
Prerequisite: Logged in as operator

1. Find suspended tenant
2. Click "Activate"
3. Expected: Tenant status changes to "active"
```

---

## ⚠️ Error Handling Tests

### Test Case 18: API Returns 401 (Unauthorized)
```
Scenario: Token expired or missing

Expected UI Behavior:
- Show "Session expired" message
- Redirect to login page
- Clear stored token
```

### Test Case 19: API Returns 403 (Forbidden)
```
Scenario: User tries to access admin route without permission

Expected UI Behavior:
- Show "Access denied" message
- Redirect to appropriate page
- Don't crash
```

### Test Case 20: API Returns 409 (Conflict)
```
Scenario: Creating duplicate user/tenant

Expected UI Behavior:
- Show specific error: "Email already exists" or "Slug already taken"
- Keep form open for correction
- Don't lose entered data
```

### Test Case 21: API Returns 402 (Payment Required)
```
Scenario: License limit reached

Expected UI Behavior:
- Show "Maximum users reached" message
- Suggest upgrading plan
- Disable "Add User" button
```

### Test Case 22: API Returns 500 (Server Error)
```
Scenario: Unexpected backend error

Expected UI Behavior:
- Show friendly error: "Something went wrong"
- Offer to retry
- Log error for debugging
```

---

## 🔒 Security Tests

### Test Case 23: Cross-Tenant Access Blocked
```
Scenario: Admin from acme-corp tries to access beta-org data

Steps:
1. Login as admin@acme.com
2. Try to change tenant context to beta-org
3. Expected: 403 Forbidden error
4. Expected: No data from beta-org is shown
```

### Test Case 24: Regular User Cannot Access Admin Routes
```
Scenario: User tries to access admin features

Steps:
1. Login as alice@acme.com (regular user)
2. Try to access user management
3. Expected: 403 Forbidden error
4. Expected: Admin buttons/links hidden or disabled
```

### Test Case 25: Token Expiry Handling
```
Scenario: Access token expires after 1 hour

Steps:
1. Login successfully
2. Wait for token to expire (or manually invalidate)
3. Make API request
4. Expected: 401 error, redirect to login
```

### Test Case 26: Logout Clears All Tokens
```
Scenario: User logs out

Steps:
1. Login successfully
2. Click Logout
3. Expected: Token cleared from storage
4. Expected: Redirect to login page
5. Expected: Back button doesn't show protected pages
```

---

## 🛠️ Troubleshooting

### Issue: Login Returns 500 Error
**Possible Cause:** Backend misconfiguration

**Solution:**
1. Check browser console for error details
2. Verify tenant slug is correct (lowercase, hyphens)
3. Contact backend team if issue persists

---

### Issue: Login Returns 401 But Credentials Are Correct
**Possible Cause:** Account locked due to failed attempts

**Solution:**
1. Wait 15 minutes for account to unlock
2. Or contact administrator to reset failed attempts

---

### Issue: API Calls Return 401 After Successful Login
**Possible Cause:** Token not being attached to requests

**Solution:**
1. Check if token is stored correctly
2. Verify Authorization header format: `Bearer <token>`
3. Check token expiry time

---

### Issue: Cross-Origin (CORS) Errors
**Possible Cause:** Frontend domain not in allowed origins

**Solution:**
1. Verify frontend URL is configured in backend CORS
2. For local development, use: `http://localhost:5173`
3. For production, ensure Render frontend URL is added

---

### Issue: User Created But Not Showing in List
**Possible Cause:** RLS or caching issue

**Solution:**
1. Refresh the user list
2. Check browser console for errors
3. Verify you're logged in as admin

---

## 📞 Quick Reference

### Backend Health Check
```
GET https://saas-auth-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "db": "connected",
  "version": "1.0.0"
}
```

### Test Credentials Summary
```
Operator:  operator@yoursaas.com / Operator@Secure123!
Admin:     admin@acme.com / Admin@Acme123!
User:      alice@acme.com / User@Acme123!
Disabled:  disabled@acme.com / User@Acme123!
```

### Password Requirements
- Minimum 10 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

## ✅ Testing Checklist

Use this checklist to track your testing progress:

### Authentication
- [ ] Admin login works
- [ ] User login works
- [ ] Operator login works
- [ ] Invalid password shows error
- [ ] Disabled account shows error
- [ ] Invalid tenant shows error
- [ ] Forgot password works
- [ ] Logout works

### Admin Features
- [ ] View users list
- [ ] Create new user
- [ ] Duplicate email blocked
- [ ] Weak password blocked
- [ ] Update user role
- [ ] Disable user
- [ ] View license info

### Operator Features
- [ ] View all tenants
- [ ] Create new tenant
- [ ] Duplicate slug blocked
- [ ] Invalid slug blocked
- [ ] Suspend tenant
- [ ] Activate tenant
- [ ] Cancel tenant

### Security
- [ ] Cross-tenant access blocked
- [ ] User cannot access admin routes
- [ ] Token expiry handled
- [ ] Logout clears tokens
- [ ] API errors handled gracefully

---

## 📚 Additional Resources

- **API Documentation:** `README_CONSOLIDATED.md`
- **UI Companion Guide:** `README_UI.md`
- **Backend Test Report:** `BACKEND_TEST_REPORT.md`
- **Test Results:** `test-results-live.md`

---

**Last Updated:** March 16, 2026  
**Backend Status:** ✅ All 30 API Tests Passing  
**Ready for UI Integration:** ✅ Yes

**Jai Jagannath! 🙏**
