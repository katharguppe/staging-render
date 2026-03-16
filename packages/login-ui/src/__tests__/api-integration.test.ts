import { describe, it, expect } from 'vitest';

const API_BASE_URL = 'http://localhost:3001';

// Global variables to hold state across tests
let operatorToken = '';
let adminToken = '';
let testTenantId = '';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errBody = await response.json();
      errorMsg = errBody.message || errorMsg;
    } catch (e) {}
    throw new Error(`API Error ${response.status}: ${errorMsg}`);
  }
  
  // Only try to parse JSON if there's content to parse
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

describe('Full CRUD Integration - SaaS Auth API', () => {

  describe('Authentication Flow', () => {
    it('Operator Login', async () => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'operator@yoursaas.com',
          password: 'Operator@Secure123!',
          tenant_slug: 'system'
        })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      operatorToken = data.access_token;
      expect(operatorToken).toBeDefined();
      expect(data.user.role).toBe('operator');
    });

    it('Admin Login', async () => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@acme.com',
          password: 'Admin@Acme123!',
          tenant_slug: 'acme-corp'
        })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      adminToken = data.access_token;
      expect(adminToken).toBeDefined();
    });
  });

  describe('Tenant CRUD Operations (Operator Role)', () => {
    
    it('Should create a new tenant', async () => {
      const rand = Date.now();
      const payload = {
        name: `React Test Corp ${rand}`,
        slug: `react-test-corp-${rand}`,
        maxUsers: 10
      };
      const data = await apiRequest('/operator/tenants', {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}` },
        body: JSON.stringify(payload)
      });
      expect(data.tenant).toBeDefined();
      expect(data.tenant.slug).toBe(payload.slug);
      testTenantId = data.tenant.id;
    });

    it('Should list all tenants', async () => {
      const data = await apiRequest('/operator/tenants', {
        headers: { Authorization: `Bearer ${operatorToken}` }
      });
      expect(Array.isArray(data.tenants)).toBe(true);
      expect(data.total).toBeGreaterThan(0);
    });

    it('Should get tenant details', async () => {
      const data = await apiRequest(`/operator/tenants/${testTenantId}`, {
        headers: { Authorization: `Bearer ${operatorToken}` }
      });
      expect(data.id).toBe(testTenantId);
    });

    it('Should update tenant', async () => {
      const data = await apiRequest(`/operator/tenants/${testTenantId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${operatorToken}` },
        body: JSON.stringify({ maxUsers: 15, name: 'Updated React Corp' })
      });
      expect(data.tenant.maxUsers).toBe(15);
      expect(data.tenant.name).toBe('Updated React Corp');
    });

    it('Should suspend tenant', async () => {
      const data = await apiRequest(`/operator/tenants/${testTenantId}/suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}` }
      });
      // The API might return { message: '...' } or the actual tenant object directly
      if (data.tenant) {
        expect(data.tenant.status).toBe('suspended');
      } else {
        expect(data).toBeDefined();
        console.log('Suspend response:', data);
      }
    });

    it('Should activate tenant', async () => {
      const data = await apiRequest(`/operator/tenants/${testTenantId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${operatorToken}` }
      });
      if (data.tenant) {
        expect(data.tenant.status).toBe('active');
      } else {
        expect(data).toBeDefined();
        console.log('Activate response:', data);
      }
    });

    it('Should cancel (delete) tenant', async () => {
      const data = await apiRequest(`/operator/tenants/${testTenantId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${operatorToken}` }
      });
      // A 200/204 completion indicates success
      expect(data).toBeDefined();
    });
  });

  describe('User CRUD Operations (Admin Role in acme-corp)', () => {

    let testUserId = '';
    let adminUserId = '';

    it('Should list users in tenant', async () => {
      const data = await apiRequest('/admin/users', {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-slug': 'acme-corp' // Optional based on whether backend infers from token
        }
      });
      expect(Array.isArray(data.users)).toBe(true);
      if (data.users.length > 0) {
        adminUserId = data.users.find((u: any) => u.email === 'alice@acme.com')?.id;
      }
    });

    it('Should create a new user', async () => {
      const rand = Date.now();
      const payload = {
        email: `react_tester_${rand}@acme.com`,
        password: 'React@Tester123!',
        role: 'user'
      };
      const data = await apiRequest('/admin/users', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-slug': 'acme-corp'
        },
        body: JSON.stringify(payload)
      });
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(payload.email);
      testUserId = data.user.id;
    });

    it('Should get user details', async () => {
      const data = await apiRequest(`/admin/users/${testUserId}`, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-slug': 'acme-corp'
        }
      });
      expect(data.id).toBe(testUserId);
    });

    it('Should update user role', async () => {
      const data = await apiRequest(`/admin/users/${testUserId}`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-slug': 'acme-corp'
        },
        body: JSON.stringify({ role: 'admin' })
      });
      expect(data.user.role).toBe('admin');
    });

    it('Should disable user', async () => {
      const data = await apiRequest(`/admin/users/${testUserId}`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-slug': 'acme-corp'
        }
      });
      expect(data).toBeDefined();
    });
  });

  describe('License Management', () => {
    it('Should check license usage', async () => {
      const data = await apiRequest('/admin/license', {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'x-tenant-slug': 'acme-corp'
        }
      });
      expect(data.license).toBeDefined();
      expect(typeof data.license.max_users).toBe('number');
      expect(typeof data.license.active_users).toBe('number');
    });
  });

});
