/**
 * Test Agent - Interactive CLI for test generation
 * Prompts user to select test type and generates appropriate test template
 */

import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

export type TestType = 'api' | 'ui' | 'performance' | 'storybook' | 'component';

export interface TestConfig {
  type: TestType;
  name: string;
  description: string;
  outputPath: string;
}

const TEST_TEMPLATES: Record<TestType, string> = {
  api: `import { test, expect } from '@playwright/test';
import { ApiHelper } from '@/helpers/api';

test.describe('{{TEST_NAME}} - API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test('{{TEST_DESCRIPTION}}', async () => {
    // TODO: Implement API test
    const response = await apiHelper.get('/endpoint');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
`,

  ui: `import { test, expect } from '@playwright/test';
import { BasePage } from '@/components/base-page';

test.describe('{{TEST_NAME}} - UI Tests', () => {
  let page: BasePage;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new BasePage(playwrightPage);
    await page.goto('/');
  });

  test('{{TEST_DESCRIPTION}}', async () => {
    // TODO: Implement UI test
    await page.waitForReady();

    const title = await page.getTitle();
    expect(title).toBeTruthy();
  });
});
`,

  performance: `import { test, expect } from '@playwright/test';
import { measurePageLoad, assertLoadTime } from '@/helpers/performance';

test.describe('{{TEST_NAME}} - Performance Tests', () => {
  test('{{TEST_DESCRIPTION}}', async ({ page }) => {
    // TODO: Implement performance test
    await page.goto('/');

    const metrics = await measurePageLoad(page);

    // Assert load time is under 3 seconds
    expect(metrics.loadTime).toBeLessThan(3000);

    console.log('Performance Metrics:', metrics);
  });
});
`,

  storybook: `import { test, expect } from '@playwright/test';

test.describe('{{TEST_NAME}} - Storybook Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Storybook story
    await page.goto('http://localhost:6006/?path=/story/{{STORY_PATH}}');

    // Wait for story to load
    await page.waitForSelector('#storybook-preview-iframe');
  });

  test('{{TEST_DESCRIPTION}}', async ({ page }) => {
    // TODO: Implement Storybook test
    const iframe = page.frameLocator('#storybook-preview-iframe');

    // Test component in isolation
    await expect(iframe.locator('body')).toBeVisible();
  });
});
`,

  component: `import { test, expect } from '@playwright/test';

test.describe('{{TEST_NAME}} - Component Tests', () => {
  test('{{TEST_DESCRIPTION}}', async ({ page, mount }) => {
    // TODO: Implement component test
    // Note: Requires @playwright/experimental-ct-react (or -vue, -svelte)

    await page.goto('/');

    // Test component behavior
    const component = page.locator('[data-testid="{{COMPONENT_ID}}"]');
    await expect(component).toBeVisible();
  });
});
`,
};

export class TestAgent {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async selectTestType(): Promise<TestType> {
    console.log('\nSelect Test Type:');
    console.log('1. API Test - Test REST/GraphQL endpoints');
    console.log('2. UI Test - Test user interface and interactions');
    console.log('3. Performance Test - Measure page load and performance metrics');
    console.log('4. Storybook Test - Test Storybook components');
    console.log('5. Web Component Test - Test individual web components');

    const choice = await this.prompt('\nEnter choice (1-5): ');

    const typeMap: Record<string, TestType> = {
      '1': 'api',
      '2': 'ui',
      '3': 'performance',
      '4': 'storybook',
      '5': 'component',
    };

    return typeMap[choice] || 'ui';
  }

  private async getTestDetails(type: TestType): Promise<{ name: string; description: string }> {
    console.log(`\nCreating ${type.toUpperCase()} test...\n`);

    const name = await this.prompt('Test name (e.g., login, checkout): ');
    const description = await this.prompt('Test description: ');

    return { name, description };
  }

  private generateTest(config: TestConfig): string {
    let template = TEST_TEMPLATES[config.type];

    template = template
      .replace(/{{TEST_NAME}}/g, config.name)
      .replace(/{{TEST_DESCRIPTION}}/g, config.description)
      .replace(/{{STORY_PATH}}/g, config.name.toLowerCase().replace(/\s+/g, '-'))
      .replace(/{{COMPONENT_ID}}/g, config.name.toLowerCase().replace(/\s+/g, '-'));

    return template;
  }

  private async saveTest(config: TestConfig, content: string): Promise<void> {
    const testDir = path.join(process.cwd(), 'tests', config.type);
    await fs.mkdir(testDir, { recursive: true });

    const fileName = `${config.name.toLowerCase().replace(/\s+/g, '-')}.${config.type}.spec.ts`;
    const filePath = path.join(testDir, fileName);

    await fs.writeFile(filePath, content, 'utf-8');

    console.log(`\n✓ Test created: ${filePath}`);
  }

  async run(): Promise<void> {
    console.log('=================================');
    console.log('  Playwright Test Generator');
    console.log('  Powered by Claude + MCP');
    console.log('=================================');

    const type = await this.selectTestType();
    const { name, description } = await this.getTestDetails(type);

    const config: TestConfig = {
      type,
      name,
      description,
      outputPath: `tests/${type}/${name}.spec.ts`,
    };

    const testContent = this.generateTest(config);
    await this.saveTest(config, testContent);

    console.log('\nNext steps:');
    console.log(`1. Review the generated test: ${config.outputPath}`);
    console.log(`2. Implement test logic where marked with TODO`);
    console.log(`3. Run test: npm run test:${type}`);

    this.rl.close();
  }
}

// CLI entry point
if (require.main === module) {
  const agent = new TestAgent();
  agent.run().catch(console.error);
}
