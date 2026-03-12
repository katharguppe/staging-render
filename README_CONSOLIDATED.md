# SaaS Auth Staging - Complete Setup & Testing Guide

This document contains foolproof setup instructions for the staging environment AND the complete automated test suite proving all API endpoints function correctly.

---

## Part 1: Setup Instructions for the UI Team

🛑 **STOP!** Read this carefully before doing anything else. You **must** clone the staging repository. **DO NOT** use the main components repository. Follow these steps exactly in order. Do not skip any step.

### Step 1: Clone the Staging Repository
Open your terminal or command prompt and run exactly this command:
```bash
git clone https://github.com/katharguppe/staging.git
```
This will create a `staging` folder.

### Step 2: Navigate into the folder
```bash
cd staging
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the Infrastructure
You must have **Docker Desktop** running on your computer first! Open Docker Desktop, wait for it to fully start, and then run:
```bash
npm run docker:up
```

### Step 5: Setup the Database
Run these two commands one after the other:
```bash
npm run db:migrate
npm run db:seed
```

### Step 6: Start the Backend API
Run these commands to start the backend server:
```bash
cd packages/auth-bff
npm run dev
```
🛑 **LEAVE THIS TERMINAL WINDOW OPEN AND RUNNING.** Do not close it. 🛑

### Step 7: Start the Frontend UI
Open a **BRAND NEW** terminal window. Navigate to the folder where you cloned the repo (`cd staging`). Then run:
```bash
cd packages/login-ui
npm run dev
```
The UI is now available at: **http://localhost:5173**

---

## 🔑 Test Accounts Available

Use these accounts to test the login screen:

| Role | Email | Password | Tenant |
|------|-------|----------|--------|
| **Admin** | admin@acme.com | Admin@Acme123! | acme-corp |
| **User** | alice@acme.com | User@Acme123! | acme-corp |
| **User** | bob@acme.com | User@Acme123! | acme-corp |
| **Disabled** | disabled@acme.com | User@Acme123! | acme-corp |
| **Operator** | operator@yoursaas.com | Operator@Secure123! | system |
| **Admin** | admin@betaorg.com | Admin@Beta123! | beta-org |
| **User** | carol@betaorg.com | User@Beta123! | beta-org |

---

## Part 2: Comprehensive API Test Suite

We have written and executed a comprehensive test suite (`run_all_tests.js`) against the staging APIs that executes every required test from the original documentation in milliseconds.

**To run the test suite yourself:**
Open a new terminal in the `staging` folder and simply run:
```bash
node run_all_tests.js
```

### Test Results

The following endpoints have all been verified and are passing exactly as specified in the original testing guidelines:

**Core Auth Endpoints:**
- ✅ GET `/health` - Returns 200 OK
- ✅ POST `/auth/login` (Admin/Regular User) - Returns 200 OK
- ✅ POST `/auth/login` (Invalid Credentials) - Returns 401 Unauthorized
- ✅ POST `/auth/login` (Disabled Account) - Returns 403 Forbidden
- ✅ GET `/auth/me` - Returns 200 OK (Current User Profile)
- ✅ POST `/auth/forgot-password` - Returns 200 OK

**Admin Operations (Tenant Scoped):**
- ✅ GET `/admin/users` - List all users in tenant
- ✅ GET `/admin/users/:id` - Get specific user profile
- ✅ POST `/admin/users` - Create new user
- ✅ POST `/admin/users` (Duplicate Email) - Blocked (409 Conflict)
- ✅ POST `/admin/users` (Weak password) - Blocked (400 Bad Request)
- ✅ PATCH `/admin/users/:id` - Update User Role
- ✅ DELETE `/admin/users/:id` - Disable User
- ✅ GET `/admin/license` - Retrieve license/quota
- ✅ POST `/admin/users` (License Limit Exceeded) - Blocked (402 Payment Required)

**Operator Operations (Global Scope):**
- ✅ GET `/operator/tenants` - List all tenants globally
- ✅ GET `/operator/tenants/:id` - View Tenant breakdown
- ✅ POST `/operator/tenants` - Create new Tenant
- ✅ POST `/operator/tenants` (Duplicate slug) - Blocked (409 Conflict)
- ✅ POST `/operator/tenants` (Invalid slug) - Blocked (400 Bad Request)
- ✅ PATCH `/operator/tenants/:id` - Update Tenant Max Users quota
- ✅ POST `/operator/tenants/:id/suspend` - Suspend Tenant
- ✅ POST `/operator/tenants/:id/activate` - Activate Tenant
- ✅ DELETE `/operator/tenants/:id` - Cancel Tenant
- ✅ GET `/operator/stats` - Global Platform Statistics
- ✅ DELETE `/operator/tenants/:id` (With Active Users) - Blocked (400 Bad Request)

**Security Checks Contexts:**
- ✅ **Cross-Tenant Isolation**: Admin from `acme-corp` attempting `GET` on `beta-org` user - Blocked (403 Forbidden)
- ✅ **Missing Tokens**: Requesting Secure API without JWT - Blocked (401 Unauthorized)
- ✅ **Role Enforcement**: Regular User attempting to `GET` Admin Routes - Blocked (403 Forbidden)
