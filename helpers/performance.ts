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
  const performanceTiming = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = globalThis as any;
    return JSON.parse(JSON.stringify(win.performance.timing));
  });

  const navigation = performanceTiming as Record<string, number>;
  const loadTime = navigation.loadEventEnd - navigation.navigationStart;
  const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;

  // Get Web Vitals if available
  const webVitals = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Promise((resolve: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metrics: any = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof PerformanceObserver !== 'undefined') {
        // Observe paint entries
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paintObserver = new (PerformanceObserver as any)((list: any) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // LCP
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lcpObserver = new (PerformanceObserver as any)((list: any) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            metrics.largestContentfulPaint = lastEntry.startTime;
          }
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
    ...(typeof webVitals === 'object' && webVitals !== null ? webVitals : {}),
  };
}

/**
 * Asserts page load time is within threshold
 */
export async function assertLoadTime(page: Page, maxLoadTimeMs: number) {
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

  page.on('request', request => {
    (request as any)._startTime = Date.now();
  });

  page.on('response', response => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = performance.getEntriesByType('resource') as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return entries.map((entry: any) => ({
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
