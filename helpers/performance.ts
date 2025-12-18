import { Page, expect } from '@playwright/test';

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
  cumulativeLayoutShift?: number;
}

/**
 * Measures page load performance metrics
 */
export async function measurePageLoad(page: Page): Promise<PerformanceMetrics> {
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  const navigation = performanceTiming;
  const loadTime = navigation.loadEventEnd - navigation.navigationStart;
  const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;

  // Get Web Vitals if available
  const webVitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const metrics: any = {};

      if ('PerformanceObserver' in window) {
        // Observe paint entries
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        setTimeout(() => resolve(metrics), 1000);
      } else {
        resolve(metrics);
      }
    });
  });

  return {
    loadTime,
    domContentLoaded,
    ...webVitals,
  };
}

/**
 * Asserts page load time is within threshold
 */
export async function assertLoadTime(
  page: Page,
  maxLoadTimeMs: number
) {
  const metrics = await measurePageLoad(page);
  expect(metrics.loadTime).toBeLessThan(maxLoadTimeMs);
}

/**
 * Measures API response time
 */
export async function measureApiResponseTime(
  page: Page,
  urlPattern: string | RegExp
): Promise<number> {
  const startTime = Date.now();

  await page.waitForResponse(urlPattern);
  const endTime = Date.now();

  return endTime - startTime;
}

/**
 * Monitors network requests and responses
 */
export async function monitorNetworkRequests(page: Page) {
  const requests: Array<{ url: string; method: string; duration: number }> = [];

  page.on('request', (request) => {
    (request as any)._startTime = Date.now();
  });

  page.on('response', (response) => {
    const request = response.request();
    const endTime = Date.now();
    const startTime = (request as any)._startTime || endTime;

    requests.push({
      url: request.url(),
      method: request.method(),
      duration: endTime - startTime,
    });
  });

  return {
    getRequests: () => requests,
    getSlowestRequests: (count = 10) =>
      requests.sort((a, b) => b.duration - a.duration).slice(0, count),
  };
}

/**
 * Measures resource sizes
 */
export async function measureResourceSizes(page: Page): Promise<{
  total: number;
  byType: Record<string, number>;
}> {
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return entries.map(entry => ({
      name: entry.name,
      size: entry.transferSize || 0,
      type: entry.initiatorType,
    }));
  });

  const total = resources.reduce((sum, resource) => sum + resource.size, 0);
  const byType: Record<string, number> = {};

  resources.forEach(resource => {
    byType[resource.type] = (byType[resource.type] || 0) + resource.size;
  });

  return { total, byType };
}

/**
 * Captures performance trace
 */
export async function capturePerformanceTrace(
  page: Page,
  tracePath: string,
  action: () => Promise<void>
) {
  await page.context().tracing.start({ screenshots: true, snapshots: true });
  await action();
  await page.context().tracing.stop({ path: tracePath });
}
