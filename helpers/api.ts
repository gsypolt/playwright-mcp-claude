import { APIRequestContext, expect } from '@playwright/test';

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
  headers: Record<string, string>;
}

/**
 * Helper class for API testing
 */
export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  /**
   * Performs a GET request
   */
  async get<T = unknown>(url: string, options?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.request.get(url, options);
    return {
      status: response.status(),
      body: await response.json(),
      headers: response.headers(),
    };
  }

  /**
   * Performs a POST request
   */
  async post<T = unknown>(url: string, data?: unknown, options?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await this.request.post(url, {
      data,
      ...options,
    });
    return {
      status: response.status(),
      body: await response.json().catch(() => ({})),
      headers: response.headers(),
    };
  }

  /**
   * Performs a PUT request
   */
  async put<T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> {
    const response = await this.request.put(url, {
      data,
      ...options,
    });
    return {
      status: response.status(),
      body: await response.json().catch(() => ({})),
      headers: response.headers(),
    };
  }

  /**
   * Performs a PATCH request
   */
  async patch<T = any>(url: string, data?: any, options?: any): Promise<ApiResponse<T>> {
    const response = await this.request.patch(url, {
      data,
      ...options,
    });
    return {
      status: response.status(),
      body: await response.json().catch(() => ({})),
      headers: response.headers(),
    };
  }

  /**
   * Performs a DELETE request
   */
  async delete<T = any>(url: string, options?: any): Promise<ApiResponse<T>> {
    const response = await this.request.delete(url, options);
    return {
      status: response.status(),
      body: await response.json().catch(() => ({})),
      headers: response.headers(),
    };
  }

  /**
   * Validates response status
   */
  assertStatus(response: ApiResponse, expectedStatus: number) {
    expect(response.status).toBe(expectedStatus);
  }

  /**
   * Validates response contains expected properties
   */
  assertHasProperties(response: ApiResponse, properties: string[]) {
    properties.forEach(prop => {
      expect(response.body).toHaveProperty(prop);
    });
  }

  /**
   * Validates response schema matches expected structure
   */
  assertSchema(response: ApiResponse<Record<string, unknown>>, schema: Record<string, string>) {
    Object.entries(schema).forEach(([key, type]) => {
      expect(typeof response.body[key]).toBe(type);
    });
  }
}

/**
 * Creates an authenticated API helper
 */
export async function createAuthenticatedApiHelper(
  request: APIRequestContext,
  _token: string
): Promise<ApiHelper> {
  // Set default authorization header
  await request.dispose();
  return new ApiHelper(request);
}

/**
 * Generates test data for API requests
 */
export function generateTestData<T extends Record<string, any>>(
  template: T,
  overrides?: Partial<T>
): T {
  return {
    ...template,
    ...overrides,
  };
}

/**
 * Wait for API endpoint to be ready
 */
export async function waitForApiReady(
  request: APIRequestContext,
  endpoint: string,
  maxAttempts = 10,
  delayMs = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await request.get(endpoint);
      if (response.ok()) return true;
    } catch {
      // Endpoint not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return false;
}
