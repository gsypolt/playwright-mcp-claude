import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
  Suite,
  FullConfig,
} from '@playwright/test/reporter';
import { getAggregationConfig, TestDinoConfig } from '../config/aggregation.config';
import * as fs from 'fs';
import * as path from 'path';

interface TestDinoResult {
  projectId: string;
  runId: string;
  branch: string;
  commit: string;
  startedAt: string;
  finishedAt: string;
  duration: number;
  status: string;
  environment: string;
  tests: TestDinoTest[];
}

interface TestDinoTest {
  id: string;
  title: string;
  file: string;
  line: number;
  status: string;
  duration: number;
  retries: number;
  error?: {
    message: string;
    stack: string;
  };
  attachments?: {
    name: string;
    contentType: string;
    path: string;
  }[];
}

/**
 * TestDino Reporter
 *
 * Integrates with TestDino platform for AI-powered test insights
 * https://testdino.com
 *
 * Features:
 * - Automatic failure analysis
 * - Historical trends
 * - Flakiness detection
 * - Easy CLI integration
 */
export class TestDinoReporter implements Reporter {
  private config: TestDinoConfig;
  private runId: string;
  private startTime: number = 0;
  private tests: TestDinoTest[] = [];
  private outputPath: string;

  constructor() {
    const aggregationConfig = getAggregationConfig();
    if (!aggregationConfig.testdino) {
      throw new Error('TestDino configuration is missing');
    }
    this.config = aggregationConfig.testdino;

    if (!this.config.apiKey || !this.config.projectId) {
      throw new Error('TestDino API key and project ID are required');
    }

    this.runId = `run-${Date.now()}`;
    this.outputPath = path.join(process.cwd(), 'test-results', 'testdino-results.json');
  }

  async onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log('[TestDinoReporter] Test run started');
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    const testData: TestDinoTest = {
      id: this.getTestId(test),
      title: test.titlePath().join(' › '),
      file: test.location.file,
      line: test.location.line,
      status: result.status,
      duration: result.duration,
      retries: result.retry,
    };

    if (result.error) {
      testData.error = {
        message: result.error.message || '',
        stack: result.error.stack || '',
      };
    }

    if (result.attachments?.length > 0) {
      testData.attachments = result.attachments.map(att => ({
        name: att.name,
        contentType: att.contentType,
        path: att.path || '',
      }));
    }

    this.tests.push(testData);
  }

  async onEnd(result: FullResult) {
    const finishedAt = Date.now();
    const duration = finishedAt - this.startTime;

    const testDinoResult: TestDinoResult = {
      projectId: this.config.projectId,
      runId: this.runId,
      branch: process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'main',
      commit: process.env.COMMIT_SHA || process.env.GITHUB_SHA || '',
      startedAt: new Date(this.startTime).toISOString(),
      finishedAt: new Date(finishedAt).toISOString(),
      duration,
      status: result.status,
      environment: process.env.ENVIRONMENT || 'test',
      tests: this.tests,
    };

    // Save results to file
    await this.saveResults(testDinoResult);

    // Upload to TestDino
    await this.uploadResults(testDinoResult);

    console.log(`[TestDinoReporter] Test run completed: ${this.runId}`);
    console.log(`  Total tests: ${this.tests.length}`);
    console.log(`  Duration: ${duration}ms`);
  }

  private async saveResults(result: TestDinoResult) {
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, JSON.stringify(result, null, 2));
    console.log(`[TestDinoReporter] Results saved to: ${this.outputPath}`);
  }

  private async uploadResults(result: TestDinoResult) {
    try {
      const endpoint = this.config.uploadEndpoint || 'https://api.testdino.com/v1/results';

      console.log(`[TestDinoReporter] Uploading results to TestDino...`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Project-ID': this.config.projectId,
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log(`[TestDinoReporter] ✓ Results uploaded successfully`);
      console.log(`  View results: ${data.url || 'https://testdino.com/results/' + this.runId}`);
    } catch (error) {
      console.error('[TestDinoReporter] ✗ Failed to upload results:', error);
      console.error('  Results are saved locally and can be uploaded manually');
      console.error(`  Run: npx tdpw upload ${this.outputPath}`);
    }
  }

  private getTestId(test: TestCase): string {
    const path = test.location.file;
    const title = test.titlePath().join(' › ');
    const hash = require('crypto').createHash('md5').update(`${path}::${title}`).digest('hex');
    return hash;
  }
}

/**
 * Standalone function to upload results to TestDino
 * Can be used from CLI or CI/CD scripts
 */
export async function uploadToTestDino(resultsPath: string, config?: TestDinoConfig) {
  const testDinoConfig = config || getAggregationConfig().testdino;

  if (!testDinoConfig || !testDinoConfig.apiKey || !testDinoConfig.projectId) {
    throw new Error('TestDino configuration is required');
  }

  const resultsData = fs.readFileSync(resultsPath, 'utf-8');
  const results = JSON.parse(resultsData);

  const endpoint = testDinoConfig.uploadEndpoint || 'https://api.testdino.com/v1/results';

  console.log('Uploading to TestDino...');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testDinoConfig.apiKey}`,
      'X-Project-ID': testDinoConfig.projectId,
    },
    body: resultsData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  console.log('✓ Upload successful');
  console.log(`View results: ${data.url}`);

  return data;
}
