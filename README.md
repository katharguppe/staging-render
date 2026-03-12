# SaaS Auth Staging Setup

🛑 **STOP! Read this carefully before doing anything else.** 🛑

You **must** clone this repository. **DO NOT** use the main components repository. 

Follow these steps exactly in order. Do not skip any step.

## Step 1: Clone the Staging Repository

Open your terminal or command prompt and run exactly this command:

```bash
git clone https://github.com/katharguppe/staging.git
```

This will create a `staging` folder. 

## Step 2: Navigate into the folder

```bash
cd staging
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start the Infrastructure

You must have **Docker Desktop** running on your computer first! Open Docker Desktop, wait for it to fully start, and then run:

```bash
npm run docker:up
```

## Step 5: Setup the Database

Run these two commands one after the other:

```bash
npm run db:migrate
npm run db:seed
```

## Step 6: Start the Backend API

Run these commands to start the backend server:

```bash
cd packages/auth-bff
npm run dev
```

🛑 **LEAVE THIS TERMINAL WINDOW OPEN AND RUNNING.** Do not close it. 🛑

## Step 7: Start the Frontend UI

Open a **BRAND NEW** terminal window. Navigate to the folder where you cloned the repo (e.g. `cd staging`). Then run:

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
