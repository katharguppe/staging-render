const fs = require('fs');

// Test against live Render backend
const BASE_URL = 'https://saas-auth-backend.onrender.com';

let userToken = '';
let adminToken = '';
let operatorToken = '';
let adminUserId = '';
let betaUserId = '';
let tenantId = '';
let resetToken = '';

const results = {
  passed: 0,
  failed: 0,
  errors: [],
};

async function runRequest(name, method, endpoint, headers = {}, body = null, expectedStatus = 200) {
  process.stdout.write(`- [ ] ${name}... `);
  try {
    const options = { method, headers: { ...headers } };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => null);

    if (res.status === expectedStatus || (expectedStatus === 200 && (res.status === 200 || res.status === 201))) {
      console.log(`✅ PASS (${res.status})`);
      results.passed++;
      return { success: true, data, headers: res.headers };
    } else {
      console.log(`❌ FAIL (Expected ${expectedStatus}, got ${res.status})`);
      if (data) console.log(`   Response: ${JSON.stringify(data)}`);
      results.failed++;
      results.errors.push({ name, expected: expectedStatus, actual: res.status, data });
      return { success: false, data };
    }
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
    results.failed++;
    results.errors.push({ name, error: err.message });
    return { success: false };
  }
}

async function runAllTests() {
  console.log('🚀 SaaS Auth API Test Suite - Live Render Backend');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('\n--- 🔐 Core Auth Tests ---');

  // Test 1: Health Check
  await runRequest('Health Check', 'GET', '/health', {}, null, 200);

  // Test 2: Login - Admin
  let res = await runRequest('Login - Admin (admin@acme.com)', 'POST', '/auth/login', {}, 
    { email: 'admin@acme.com', password: 'Admin@Acme123!', tenant_slug: 'acme-corp' }, 200);
  if (res.success) adminToken = res.data.access_token;

  // Test 3: Login - Invalid
  await runRequest('Login - Invalid Credentials', 'POST', '/auth/login', {}, 
    { email: 'admin@acme.com', password: 'wrongpassword', tenant_slug: 'acme-corp' }, 401);

  // Test 4: Login - User
  res = await runRequest('Login - Regular User (alice@acme.com)', 'POST', '/auth/login', {}, 
    { email: 'alice@acme.com', password: 'User@Acme123!', tenant_slug: 'acme-corp' }, 200);
  if (res.success) userToken = res.data.access_token;

  // Test 5: Login - Disabled Account
  await runRequest('Login - Disabled Account', 'POST', '/auth/login', {}, 
    { email: 'disabled@acme.com', password: 'User@Acme123!', tenant_slug: 'acme-corp' }, 403);

  // Test 6: Login - Operator
  res = await runRequest('Login - Operator', 'POST', '/auth/login', {}, 
    { email: 'operator@yoursaas.com', password: 'Operator@Secure123!', tenant_slug: 'system' }, 200);
  if (res.success) operatorToken = res.data.access_token;

  // Test 7: Get Current User (with valid token)
  await runRequest('Get Current User (with JWT)', 'GET', '/auth/me', 
    { Authorization: `Bearer ${adminToken}` }, null, 200);

  // Test 8: Get Current User (without token)
  await runRequest('Get Current User (no JWT - should fail)', 'GET', '/auth/me', {}, null, 401);

  // Test 9: Forgot Password
  await runRequest('Forgot Password', 'POST', '/auth/forgot-password', {}, 
    { email: 'admin@acme.com', tenant_slug: 'acme-corp' }, 200);

  console.log('\n--- 👥 Admin Tests (Tenant-Scoped) ---');

  // Test 10: List Users
  res = await runRequest('List Users', 'GET', '/admin/users', 
    { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, null, 200);
  if (res.success && res.data?.users?.length > 0) {
    const user = res.data.users.find(u => u.email === 'alice@acme.com');
    if (user) adminUserId = user.id;
  }

  // Test 11: Get User
  if (adminUserId) {
    await runRequest('Get User by ID', 'GET', `/admin/users/${adminUserId}`, 
      { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, null, 200);
  }

  // Test 12: Create User
  const randomEmail = `test_${Date.now()}@acme.com`;
  res = await runRequest('Create New User', 'POST', '/admin/users', 
    { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, 
    { email: randomEmail, password: 'Test@User123!', role: 'user' }, 201);
  
  let newUserId = '';
  if (res.success) newUserId = res.data.user?.id;

  // Test 13: Create User - Duplicate
  await runRequest('Create User - Duplicate Email', 'POST', '/admin/users', 
    { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, 
    { email: 'alice@acme.com', password: 'Test@User123!', role: 'user' }, 409);

  // Test 14: Create User - Weak Password
  await runRequest('Create User - Weak Password', 'POST', '/admin/users', 
    { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, 
    { email: 'weak@acme.com', password: 'weak', role: 'user' }, 400);

  // Test 15: Update User Role
  if (newUserId) {
    await runRequest('Update User Role (user → admin)', 'PATCH', `/admin/users/${newUserId}`, 
      { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, 
      { role: 'admin' }, 200);
  }

  // Test 16: Disable User
  if (newUserId) {
    await runRequest('Disable User', 'DELETE', `/admin/users/${newUserId}`, 
      { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, null, 200);
  }

  // Test 17: Get License Info
  await runRequest('Get License Information', 'GET', '/admin/license', 
    { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'acme-corp' }, null, 200);

  console.log('\n--- 🌍 Operator Tests (Global Scope) ---');

  // Test 18: List All Tenants
  res = await runRequest('List All Tenants', 'GET', '/operator/tenants', 
    { Authorization: `Bearer ${operatorToken}` }, null, 200);
  if (res.success && res.data?.tenants?.length > 0) {
    const tenant = res.data.tenants.find(t => t.slug === 'acme-corp');
    if (tenant) tenantId = tenant.id;
  }

  // Test 19: Get Tenant Details
  if (tenantId) {
    await runRequest('Get Tenant Details', 'GET', `/operator/tenants/${tenantId}`, 
      { Authorization: `Bearer ${operatorToken}` }, null, 200);
  }

  // Test 20: Create New Tenant
  const randomSlug = `test-corp-${Date.now()}`;
  res = await runRequest('Create New Tenant', 'POST', '/operator/tenants', 
    { Authorization: `Bearer ${operatorToken}` }, 
    { name: `Test Corp ${Date.now()}`, slug: randomSlug, maxUsers: 10 }, 201);
  
  let newTenantId = '';
  if (res.success) newTenantId = res.data.tenant?.id;

  // Test 21: Create Tenant - Duplicate Slug
  await runRequest('Create Tenant - Duplicate Slug', 'POST', '/operator/tenants', 
    { Authorization: `Bearer ${operatorToken}` }, 
    { name: 'Duplicate Corp', slug: 'acme-corp', maxUsers: 10 }, 409);

  // Test 22: Create Tenant - Invalid Slug
  await runRequest('Create Tenant - Invalid Slug', 'POST', '/operator/tenants', 
    { Authorization: `Bearer ${operatorToken}` }, 
    { name: 'Invalid Corp', slug: 'INVALID_SLUG', maxUsers: 10 }, 400);

  // Test 23: Update Tenant
  if (newTenantId) {
    await runRequest('Update Tenant', 'PATCH', `/operator/tenants/${newTenantId}`, 
      { Authorization: `Bearer ${operatorToken}` }, 
      { name: 'Updated Test Corp', maxUsers: 15 }, 200);
  }

  // Test 24: Suspend Tenant
  if (newTenantId) {
    await runRequest('Suspend Tenant', 'POST', `/operator/tenants/${newTenantId}/suspend`, 
      { Authorization: `Bearer ${operatorToken}` }, null, 200);
  }

  // Test 25: Activate Tenant
  if (newTenantId) {
    await runRequest('Activate Tenant', 'POST', `/operator/tenants/${newTenantId}/activate`, 
      { Authorization: `Bearer ${operatorToken}` }, null, 200);
  }

  // Test 26: Delete Tenant
  if (newTenantId) {
    await runRequest('Delete Tenant', 'DELETE', `/operator/tenants/${newTenantId}`, 
      { Authorization: `Bearer ${operatorToken}` }, null, 200);
  }

  // Test 27: Get Operator Stats
  await runRequest('Get Global Stats', 'GET', '/operator/stats', 
    { Authorization: `Bearer ${operatorToken}` }, null, 200);

  console.log('\n--- 🔒 Security Tests ---');

  // Test 28: Cross-Tenant Access (Admin from acme trying to access beta-org user)
  await runRequest('Cross-Tenant Access (should fail)', 'GET', '/admin/users', 
    { Authorization: `Bearer ${adminToken}`, 'x-tenant-slug': 'beta-org' }, null, 403);

  // Test 29: Regular User Accessing Admin Route
  await runRequest('User Accessing Admin Route (should fail)', 'GET', '/admin/users', 
    { Authorization: `Bearer ${userToken}`, 'x-tenant-slug': 'acme-corp' }, null, 403);

  // Test 30: Missing JWT Token
  await runRequest('Admin Route without JWT (should fail)', 'GET', '/admin/users', 
    {}, null, 401);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📍 Backend: ${BASE_URL}`);
  console.log(`📅 Completed: ${new Date().toISOString()}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Failed Tests Details:');
    results.errors.forEach((err, i) => {
      console.log(`\n${i + 1}. ${err.name}`);
      if (err.expected) console.log(`   Expected: ${err.expected}, Got: ${err.actual}`);
      if (err.data) console.log(`   Response: ${JSON.stringify(err.data)}`);
      if (err.error) console.log(`   Error: ${err.error}`);
    });
  }

  // Write results to file
  const reportContent = `# API Test Results - Live Render Backend

**Date:** ${new Date().toISOString()}
**Backend:** ${BASE_URL}

## Summary
- ✅ Passed: ${results.passed}
- ❌ Failed: ${results.failed}
- 📊 Total: ${results.passed + results.failed}

## Status
${results.failed === 0 ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}

${results.failed > 0 ? `
## Failed Tests
${results.errors.map(err => `- ${err.name}`).join('\n')}
` : ''}
`;

  fs.writeFileSync('test-results-live.md', reportContent);
  console.log('\n📄 Full report saved to: test-results-live.md');
}

runAllTests().catch(console.error);
