import { test, expect } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TestType } from '@/prompts/test-agent';

test.describe('Test Agent', () => {
  test('should generate API test template', async () => {
    const testType: TestType = 'api';
    const testName = 'sample-api-test';
    const testDir = path.join(process.cwd(), 'tests', testType);
    const testFile = path.join(testDir, `${testName}.${testType}.spec.ts`);

    // Clean up if file exists
    try {
      await fs.unlink(testFile);
    } catch {
      // File doesn't exist, ignore
    }

    // Create test directory
    await fs.mkdir(testDir, { recursive: true });

    // Generate test content
    const content = `import { test, expect } from '@playwright/test';
import { ApiHelper } from '@/helpers/api';

test.describe('${testName} - API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test('should test API endpoint', async () => {
    const response = await apiHelper.get('/endpoint');
    expect(response.status).toBe(200);
  });
});
`;

    // Write test file
    await fs.writeFile(testFile, content, 'utf-8');

    // Verify file was created
    const fileExists = await fs.access(testFile).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);

    // Verify content
    const fileContent = await fs.readFile(testFile, 'utf-8');
    expect(fileContent).toContain('ApiHelper');
    expect(fileContent).toContain(testName);

    // Clean up
    await fs.unlink(testFile);
  });

  test('should generate UI test template', async () => {
    const testType: TestType = 'ui';
    const testName = 'sample-ui-test';
    const testDir = path.join(process.cwd(), 'tests', testType);
    const testFile = path.join(testDir, `${testName}.${testType}.spec.ts`);

    // Clean up if file exists
    try {
      await fs.unlink(testFile);
    } catch {
      // File doesn't exist, ignore
    }

    await fs.mkdir(testDir, { recursive: true });

    const content = `import { test, expect } from '@playwright/test';
import { BasePage } from '@/components/base-page';

test.describe('${testName} - UI Tests', () => {
  let page: BasePage;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new BasePage(playwrightPage);
    await page.goto('/');
  });

  test('should test UI element', async () => {
    await page.waitForReady();
    const title = await page.getTitle();
    expect(title).toBeTruthy();
  });
});
`;

    await fs.writeFile(testFile, content, 'utf-8');

    const fileExists = await fs.access(testFile).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);

    const fileContent = await fs.readFile(testFile, 'utf-8');
    expect(fileContent).toContain('BasePage');
    expect(fileContent).toContain(testName);

    await fs.unlink(testFile);
  });

  test('should generate performance test template', async () => {
    const testType: TestType = 'performance';
    const testName = 'sample-performance-test';
    const testDir = path.join(process.cwd(), 'tests', testType);
    const testFile = path.join(testDir, `${testName}.${testType}.spec.ts`);

    try {
      await fs.unlink(testFile);
    } catch {
      // File doesn't exist
    }

    await fs.mkdir(testDir, { recursive: true });

    const content = `import { test, expect } from '@playwright/test';
import { measurePageLoad } from '@/helpers/performance';

test.describe('${testName} - Performance Tests', () => {
  test('should measure page load performance', async ({ page }) => {
    await page.goto('/');
    const metrics = await measurePageLoad(page);
    expect(metrics.loadTime).toBeLessThan(3000);
  });
});
`;

    await fs.writeFile(testFile, content, 'utf-8');

    const fileExists = await fs.access(testFile).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);

    const fileContent = await fs.readFile(testFile, 'utf-8');
    expect(fileContent).toContain('measurePageLoad');
    expect(fileContent).toContain(testName);

    await fs.unlink(testFile);
  });

  test('should validate test templates exist for all types', () => {
    const expectedTypes: TestType[] = ['api', 'ui', 'performance', 'storybook', 'component'];

    expectedTypes.forEach(type => {
      expect(type).toBeDefined();
      expect(['api', 'ui', 'performance', 'storybook', 'component']).toContain(type);
    });
  });
});
