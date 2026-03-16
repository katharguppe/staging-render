# UI Developer Guide - SaaS Auth API Integration

**Version:** 1.0.0  
**Backend URL:** https://saas-auth-backend.onrender.com  
**Frontend URL:** https://saas-auth-front.onrender.com  
**Date:** March 16, 2026

---

## 🚀 Quick Start for UI Developers

### Option 1: Use the Live Staging API (Recommended)

Point your frontend to the live backend:

```javascript
// In your React/Vue/Angular app
const API_BASE_URL = 'https://saas-auth-backend.onrender.com';

// Example login call
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@acme.com',
    password: 'Admin@Acme123!',
    tenant_slug: 'acme-corp'
  })
});

const data = await response.json();
// data.access_token contains your JWT
```

### Option 2: Run Local Backend for Development

If you need to run the backend locally:

```bash
# Clone the repo
git clone https://github.com/katharguppe/staging-render.git
cd staging-render

# Setup
npm install
copy .env.example .env
copy packages\auth-bff\.env.example packages\auth-bff\.env
npm run setup:keys

# Start Docker (PostgreSQL + Mailhog)
npm run docker:up

# Migrate and seed database
npm run db:migrate
npm run db:seed

# Start backend
cd packages/auth-bff
npm run dev
```

Backend will be available at: `http://localhost:3001`

---

## 📋 API Endpoints Reference

### Base URL
```
Production: https://saas-auth-backend.onrender.com
Local:      http://localhost:3001
```

---

## 🔐 Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "admin@acme.com",
  "password": "Admin@Acme123!",
  "tenant_slug": "acme-corp"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "expires_in": 900,
  "user": {
    "id": "usr_abc123",
    "email": "admin@acme.com",
    "role": "admin",
    "tenant_id": "tnt_xyz789",
    "tenant_slug": "acme-corp"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid credentials
{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}

// 403 Forbidden - Account disabled
{
  "code": "ACCOUNT_DISABLED",
  "message": "This account has been disabled"
}

// 400 Bad Request - Missing fields
{
  "code": "VALIDATION_ERROR",
  "message": "Email, password, and tenant_slug are required"
}
```

---

### 2. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "usr_abc123",
  "email": "admin@acme.com",
  "role": "admin",
  "tenant_id": "tnt_xyz789",
  "tenant_slug": "acme-corp",
  "status": "active",
  "created_at": "2026-03-16T00:00:00Z"
}
```

---

### 3. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. Forgot Password
**POST** `/auth/forgot-password`

**Request:**
```json
{
  "email": "admin@acme.com",
  "tenant_slug": "acme-corp"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent if account exists"
}
```

---

## 👥 Admin Endpoints (Tenant-Scoped)

All admin endpoints require:
- Valid JWT token with `admin` or `operator` role
- Header: `x-tenant-slug: <tenant_slug>` (optional if inferred from token)

### 1. List Users
**GET** `/admin/users`

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "usr_001",
      "email": "admin@acme.com",
      "role": "admin",
      "status": "active",
      "created_at": "2026-03-16T00:00:00Z"
    },
    {
      "id": "usr_002",
      "email": "alice@acme.com",
      "role": "user",
      "status": "active",
      "created_at": "2026-03-16T00:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 2. Get User
**GET** `/admin/users/:id`

**Response (200 OK):**
```json
{
  "id": "usr_001",
  "email": "admin@acme.com",
  "role": "admin",
  "status": "active",
  "tenant_id": "tnt_xyz789",
  "created_at": "2026-03-16T00:00:00Z"
}
```

---

### 3. Create User
**POST** `/admin/users`

**Request:**
```json
{
  "email": "newuser@acme.com",
  "password": "Secure@Password123!",
  "role": "user"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Response (201 Created):**
```json
{
  "user": {
    "id": "usr_new123",
    "email": "newuser@acme.com",
    "role": "user",
    "status": "active",
    "created_at": "2026-03-16T00:00:00Z"
  },
  "message": "User created successfully"
}
```

**Error Responses:**
```json
// 409 Conflict - Email already exists
{
  "code": "DUPLICATE_EMAIL",
  "message": "A user with this email already exists"
}

// 400 Bad Request - Weak password
{
  "code": "WEAK_PASSWORD",
  "message": "Password does not meet security requirements"
}

// 402 Payment Required - License limit exceeded
{
  "code": "LICENSE_LIMIT_EXCEEDED",
  "message": "Cannot add more users. Current plan allows 10 users"
}
```

---

### 4. Update User
**PATCH** `/admin/users/:id`

**Request:**
```json
{
  "role": "admin"
}
```

**Allowed Fields:**
- `role`: "admin" | "user"
- `status`: "active" | "disabled"

**Response (200 OK):**
```json
{
  "user": {
    "id": "usr_001",
    "email": "admin@acme.com",
    "role": "admin",
    "status": "active"
  },
  "message": "User updated successfully"
}
```

---

### 5. Disable User
**DELETE** `/admin/users/:id`

**Response (200 OK):**
```json
{
  "message": "User disabled successfully"
}
```

---

### 6. Get License Info
**GET** `/admin/license`

**Response (200 OK):**
```json
{
  "license": {
    "max_users": 10,
    "active_users": 3,
    "remaining": 7,
    "plan": "starter"
  }
}
```

---

## 🌍 Operator Endpoints (Global Scope)

All operator endpoints require:
- Valid JWT token with `operator` role

### 1. List All Tenants
**GET** `/operator/tenants`

**Response (200 OK):**
```json
{
  "tenants": [
    {
      "id": "tnt_001",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "status": "active",
      "maxUsers": 10,
      "created_at": "2026-03-16T00:00:00Z"
    },
    {
      "id": "tnt_002",
      "name": "Beta Org",
      "slug": "beta-org",
      "status": "active",
      "maxUsers": 5,
      "created_at": "2026-03-16T00:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 2. Get Tenant Details
**GET** `/operator/tenants/:id`

**Response (200 OK):**
```json
{
  "id": "tnt_001",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "status": "active",
  "maxUsers": 10,
  "users": [
    {
      "id": "usr_001",
      "email": "admin@acme.com",
      "role": "admin"
    },
    {
      "id": "usr_002",
      "email": "alice@acme.com",
      "role": "user"
    }
  ],
  "created_at": "2026-03-16T00:00:00Z"
}
```

---

### 3. Create Tenant
**POST** `/operator/tenants`

**Request:**
```json
{
  "name": "New Corp",
  "slug": "new-corp",
  "maxUsers": 10
}
```

**Slug Requirements:**
- Lowercase letters, numbers, and hyphens only
- Must be unique
- 3-50 characters

**Response (201 Created):**
```json
{
  "tenant": {
    "id": "tnt_new123",
    "name": "New Corp",
    "slug": "new-corp",
    "status": "active",
    "maxUsers": 10
  },
  "message": "Tenant created successfully"
}
```

**Error Responses:**
```json
// 409 Conflict - Slug already exists
{
  "code": "DUPLICATE_SLUG",
  "message": "A tenant with this slug already exists"
}

// 400 Bad Request - Invalid slug format
{
  "code": "INVALID_SLUG",
  "message": "Slug must contain only lowercase letters, numbers, and hyphens"
}
```

---

### 4. Update Tenant
**PATCH** `/operator/tenants/:id`

**Request:**
```json
{
  "name": "Updated Corp Name",
  "maxUsers": 15
}
```

**Response (200 OK):**
```json
{
  "tenant": {
    "id": "tnt_001",
    "name": "Updated Corp Name",
    "slug": "acme-corp",
    "maxUsers": 15
  },
  "message": "Tenant updated successfully"
}
```

---

### 5. Suspend Tenant
**POST** `/operator/tenants/:id/suspend`

**Response (200 OK):**
```json
{
  "message": "Tenant suspended successfully"
}
```

---

### 6. Activate Tenant
**POST** `/operator/tenants/:id/activate`

**Response (200 OK):**
```json
{
  "message": "Tenant activated successfully"
}
```

---

### 7. Cancel (Delete) Tenant
**DELETE** `/operator/tenants/:id`

**Response (200 OK):**
```json
{
  "message": "Tenant cancelled successfully"
}
```

**Error Response:**
```json
// 400 Bad Request - Has active users
{
  "code": "TENANT_HAS_USERS",
  "message": "Cannot delete tenant with active users. Please remove all users first."
}
```

---

## 🔒 Security & Error Handling

### Authentication Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `ACCOUNT_DISABLED` | 403 | User account is disabled |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CROSS_TENANT_ACCESS` | 403 | Trying to access another tenant's data |

### Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Missing or invalid fields |
| `WEAK_PASSWORD` | 400 | Password doesn't meet requirements |
| `INVALID_SLUG` | 400 | Tenant slug format invalid |
| `DUPLICATE_EMAIL` | 409 | Email already exists |
| `DUPLICATE_SLUG` | 409 | Tenant slug already exists |

### Resource Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `LICENSE_LIMIT_EXCEEDED` | 402 | User limit reached |
| `TENANT_HAS_USERS` | 400 | Cannot delete tenant with users |

---

## 🧪 Test Accounts

Use these accounts for testing:

| Role | Email | Password | Tenant Slug |
|------|-------|----------|-------------|
| **Operator** | operator@yoursaas.com | Operator@Secure123! | system |
| **Admin** | admin@acme.com | Admin@Acme123! | acme-corp |
| **User** | alice@acme.com | User@Acme123! | acme-corp |
| **User** | bob@acme.com | User@Acme123! | acme-corp |
| **Disabled** | disabled@acme.com | User@Acme123! | acme-corp |
| **Admin** | admin@betaorg.com | Admin@Beta123! | beta-org |
| **User** | carol@betaorg.com | User@Beta123! | beta-org |

---

## 💡 Integration Examples

### React Hook Example

```typescript
// hooks/useAuth.ts
import { useState } from 'react';

const API_BASE_URL = 'https://saas-auth-backend.onrender.com';

interface User {
  id: string;
  email: string;
  role: string;
  tenant_slug: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, tenantSlug: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenant_slug: tenantSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.access_token);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  return { user, token, loading, error, login, logout };
}
```

### Usage in Component

```typescript
// LoginComponent.tsx
import { useAuth } from './hooks/useAuth';

export function LoginComponent() {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await login(
        formData.get('email') as string,
        formData.get('password') as string,
        formData.get('tenant') as string
      );
      // Navigate to dashboard
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="tenant" type="text" defaultValue="acme-corp" />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

---

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Make sure your frontend URL is added to `CORS_ALLOWED_ORIGINS` on the backend
2. For local development, use: `http://localhost:5173,http://localhost:3000`

### Token Expired
When you get a 401 with `TOKEN_EXPIRED`:
1. Use the `refresh_token` to get a new access token
2. Or prompt the user to login again

### Cross-Tenant Access Denied
If you get 403 `CROSS_TENANT_ACCESS`:
1. Make sure the user's token matches the tenant they're trying to access
2. Admin from `acme-corp` cannot access `beta-org` resources

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the API response error messages
3. Check browser console for detailed error logs
4. Contact the backend team with error codes

---

**Last Updated:** March 16, 2026  
**Backend Version:** 1.0.0  
**Status:** ✅ All endpoints verified and working
