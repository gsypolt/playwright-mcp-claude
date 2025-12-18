import { test, expect } from '@playwright/test';
import { ApiHelper } from '@/helpers/api';

test.describe('Example API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test('should fetch users successfully', async () => {
    // Example test - replace with your actual endpoint
    const response = await apiHelper.get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  test('should create a new user', async () => {
    // Example test - replace with your actual endpoint
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const response = await apiHelper.post('/users', userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(userData.name);
  });

  test('should handle validation errors', async () => {
    // Example test - replace with your actual endpoint
    const invalidData = {
      name: '',
      email: 'invalid-email',
    };

    const response = await apiHelper.post('/users', invalidData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  test('should authenticate and access protected endpoint', async () => {
    // Example test - replace with your actual endpoints
    // First, login
    const loginResponse = await apiHelper.post('/auth/login', {
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD,
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token;

    // Then, access protected endpoint
    const protectedResponse = await apiHelper.get('/protected/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(protectedResponse.status).toBe(200);
  });
});
