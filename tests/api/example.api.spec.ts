import { test, expect } from '@playwright/test';
import { ApiHelper } from '@/helpers/api';

// Skip these example tests unless TEST_SERVER_RUNNING is set to true
// These tests require a running API server at http://localhost:3000/api
test.describe.skip('Example API Tests', () => {
  test('should fetch users successfully', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Example test - replace with your actual endpoint
    const response = await apiHelper.get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  test('should create a new user', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Example test - replace with your actual endpoint
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const response = await apiHelper.post<{ id: string; name: string; email: string }>(
      '/users',
      userData
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect((response.body as { name: string }).name).toBe(userData.name);
  });

  test('should handle validation errors', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Example test - replace with your actual endpoint
    const invalidData = {
      name: '',
      email: 'invalid-email',
    };

    const response = await apiHelper.post('/users', invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  test('should authenticate and access protected endpoint', async ({ request }) => {
    const apiHelper = new ApiHelper(request);
    // Example test - replace with your actual endpoints
    // First, login
    const loginResponse = await apiHelper.post<{ token: string }>('/auth/login', {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    });

    expect(loginResponse.status).toBe(200);
    const token = (loginResponse.body as { token: string }).token;

    // Then, access protected endpoint
    const protectedResponse = await apiHelper.get('/protected/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(protectedResponse.status).toBe(200);
  });
});
