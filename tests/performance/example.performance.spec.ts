import { test, expect } from '@playwright/test';
import {
  measurePageLoad,
  assertLoadTime,
  measureApiResponseTime,
  measureResourceSizes,
} from '@/helpers/performance';

test.describe('Example Performance Tests', () => {
  test('should load homepage within performance threshold', async ({ page }) => {
    const maxLoadTime = parseInt(process.env.PERFORMANCE_THRESHOLD_MS || '3000');

    await page.goto('/');

    const metrics = await measurePageLoad(page);

    console.log('Performance Metrics:', {
      loadTime: `${metrics.loadTime}ms`,
      domContentLoaded: `${metrics.domContentLoaded}ms`,
      firstContentfulPaint: `${metrics.firstContentfulPaint || 'N/A'}ms`,
      largestContentfulPaint: `${metrics.largestContentfulPaint || 'N/A'}ms`,
    });

    expect(metrics.loadTime).toBeLessThan(maxLoadTime);
  });

  test('should have fast API response time', async ({ page }) => {
    await page.goto('/');

    // Measure API response time
    const responseTime = await measureApiResponseTime(page, /\/api\/users/);

    console.log(`API Response Time: ${responseTime}ms`);

    expect(responseTime).toBeLessThan(1000); // Less than 1 second
  });

  test('should have reasonable page weight', async ({ page }) => {
    await page.goto('/');

    const resourceSizes = await measureResourceSizes(page);

    console.log('Resource Sizes:', {
      total: `${(resourceSizes.total / 1024).toFixed(2)} KB`,
      byType: Object.entries(resourceSizes.byType).map(([type, size]) => ({
        type,
        size: `${(size / 1024).toFixed(2)} KB`,
      })),
    });

    // Assert total page weight is less than 2MB
    expect(resourceSizes.total).toBeLessThan(2 * 1024 * 1024);
  });

  test('should have good Web Vitals', async ({ page }) => {
    await page.goto('/');

    const metrics = await measurePageLoad(page);

    // First Contentful Paint should be less than 1.8s (good)
    if (metrics.firstContentfulPaint) {
      expect(metrics.firstContentfulPaint).toBeLessThan(1800);
    }

    // Largest Contentful Paint should be less than 2.5s (good)
    if (metrics.largestContentfulPaint) {
      expect(metrics.largestContentfulPaint).toBeLessThan(2500);
    }
  });

  test('should handle concurrent requests efficiently', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();

    // Simulate multiple concurrent API calls
    const requests = Array.from({ length: 5 }, (_, i) =>
      measureApiResponseTime(page, new RegExp(`/api/data\\?page=${i + 1}`))
    );

    await Promise.all(requests);

    const totalTime = Date.now() - startTime;

    console.log(`Concurrent requests completed in: ${totalTime}ms`);

    // All 5 requests should complete in less than 3 seconds
    expect(totalTime).toBeLessThan(3000);
  });

  test('should assert page load with helper function', async ({ page }) => {
    await page.goto('/');

    // Using the assertLoadTime helper
    await assertLoadTime(page, 3000);
  });
});
