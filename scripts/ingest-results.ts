/**
 * Test Results Ingestion Script
 *
 * Reads Playwright JSON report and ingests into database
 * Useful for CI/CD pipelines that generate JSON reports
 *
 * Usage:
 *   npx ts-node scripts/ingest-results.ts <path-to-json-report>
 */

import * as fs from 'fs';
import { Pool } from 'pg';
import { createPool, Pool as MySQLPool } from 'mysql2/promise';
import { getAggregationConfig } from '../config/aggregation.config';
import * as crypto from 'crypto';

interface PlaywrightJsonReport {
  config: Record<string, unknown>;
  suites: Suite[];
  stats: {
    startTime: string;
    duration: number;
    expected: number;
    skipped: number;
    unexpected: number;
    flaky: number;
  };
}

interface Suite {
  title: string;
  file: string;
  line: number;
  column: number;
  specs: Spec[];
  suites?: Suite[];
}

interface Spec {
  title: string;
  ok: boolean;
  tags: string[];
  tests: Test[];
  id: string;
  file: string;
  line: number;
  column: number;
}

interface Test {
  timeout: number;
  annotations: unknown[];
  expectedStatus: string;
  projectName: string;
  projectId: string;
  results: TestResult[];
  status: string;
}

interface TestResult {
  workerIndex: number;
  status: string;
  duration: number;
  error?: {
    message: string;
    stack: string;
  };
  errors: unknown[];
  stdout: unknown[];
  stderr: unknown[];
  retry: number;
  startTime: string;
  attachments: unknown[];
}

class ResultsIngester {
  private pool: Pool | MySQLPool | null = null;
  private dbType: 'postgresql' | 'mysql';
  private runId: string;

  constructor() {
    const config = getAggregationConfig();
    if (!config.database) {
      throw new Error('Database configuration is missing');
    }
    this.dbType = config.database.type;
    this.runId = this.generateRunId();
  }

  private generateRunId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  async ingest(jsonPath: string) {
    console.log(`Ingesting test results from: ${jsonPath}`);

    // Read JSON report
    const reportData = fs.readFileSync(jsonPath, 'utf-8');
    const report: PlaywrightJsonReport = JSON.parse(reportData);

    // Initialize database
    await this.initializeDatabase();

    try {
      // Create test run
      await this.createTestRun(report);

      // Process all suites and tests
      for (const suite of report.suites) {
        await this.processSuite(suite);
      }

      // Update final stats
      await this.updateTestRunStats(report);

      console.log(`✓ Successfully ingested test run: ${this.runId}`);
    } finally {
      await this.closeDatabase();
    }
  }

  private async initializeDatabase() {
    const config = getAggregationConfig().database!;

    if (this.dbType === 'postgresql') {
      this.pool = new Pool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
        ssl: config.ssl,
      });
    } else {
      this.pool = createPool({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.username,
        password: config.password,
      });
    }

    console.log(`Connected to ${this.dbType} database`);
  }

  private async createTestRun(report: PlaywrightJsonReport) {
    const query = `
      INSERT INTO test_runs (
        run_id, project_name, branch_name, commit_sha, ci_provider,
        ci_build_id, environment, started_at, status, total_tests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      this.runId,
      process.env.PROJECT_NAME || 'playwright-mcp-claude',
      process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'main',
      process.env.COMMIT_SHA || process.env.GITHUB_SHA || '',
      process.env.CI_PROVIDER || (process.env.GITHUB_ACTIONS ? 'github' : 'local'),
      process.env.BUILD_ID || process.env.GITHUB_RUN_ID || '',
      process.env.ENVIRONMENT || 'test',
      new Date(report.stats.startTime),
      'running',
      report.stats.expected + report.stats.unexpected + report.stats.skipped,
    ];

    await this.executeQuery(query, values);
  }

  private async processSuite(suite: Suite) {
    for (const spec of suite.specs || []) {
      await this.processSpec(spec, suite);
    }

    for (const childSuite of suite.suites || []) {
      await this.processSuite(childSuite);
    }
  }

  private async processSpec(spec: Spec, suite: Suite) {
    // Insert test case
    const testCaseId = await this.insertTestCase(spec, suite);

    // Insert results for each test
    for (const test of spec.tests) {
      for (const result of test.results) {
        await this.insertTestResult(testCaseId, test, result);
      }
    }
  }

  private async insertTestCase(spec: Spec, _suite: Suite): Promise<number> {
    const testId = this.getTestId(spec.file, spec.title);
    const testType = this.inferTestType(spec.file);

    const query = `
      INSERT INTO test_cases (test_id, title, file_path, project_name, browser, test_type, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (test_id, file_path, project_name, browser)
      DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const projectName = spec.tests[0]?.projectName || 'default';
    const values = [
      testId,
      spec.title,
      spec.file,
      projectName,
      projectName,
      testType,
      spec.tags?.join(',') || '',
    ];

    const result = await this.executeQuery(query, values);
    return this.dbType === 'postgresql' ? result.rows[0].id : result[0].insertId;
  }

  private async insertTestResult(testCaseId: number, _test: Test, result: TestResult) {
    const query = `
      INSERT INTO test_results (
        run_id, test_case_id, status, duration_ms, retry_count,
        error_message, error_stack, stdout, stderr, started_at, finished_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    const startedAt = new Date(result.startTime);
    // round duration to integer ms
    const durationMs = Math.round(result.duration);
    const finishedAt = new Date(startedAt.getTime() + durationMs);

    const values = [
      this.runId,
      testCaseId,
      result.status,
      durationMs,
      result.retry,
      result.error?.message || null,
      result.error?.stack || null,
      result.stdout?.map(s => String(s)).join('\n') || null,
      result.stderr?.map(s => String(s)).join('\n') || null,
      startedAt,
      finishedAt,
    ];

    await this.executeQuery(query, values);
  }

  private async updateTestRunStats(report: PlaywrightJsonReport) {
    const endTime = new Date(new Date(report.stats.startTime).getTime() + report.stats.duration);

    const query = `
      UPDATE test_runs
      SET finished_at = $1,
          duration_ms = $2,
          status = $3,
          passed_tests = $4,
          failed_tests = $5,
          skipped_tests = $6,
          flaky_tests = $7
      WHERE run_id = $8
    `;

    const durationMs = Math.round(report.stats.duration);
    const values = [
      endTime,
      durationMs,
      'completed',
      report.stats.expected,
      report.stats.unexpected,
      report.stats.skipped,
      report.stats.flaky,
      this.runId,
    ];

    await this.executeQuery(query, values);
  }

  private getTestId(filePath: string, title: string): string {
    return crypto.createHash('md5').update(`${filePath}::${title}`).digest('hex');
  }

  private inferTestType(filePath: string): string {
    if (filePath.includes('.api.spec')) return 'api';
    if (filePath.includes('.ui.spec')) return 'ui';
    if (filePath.includes('.performance.spec')) return 'performance';
    if (filePath.includes('.component.spec')) return 'component';
    if (filePath.includes('storybook')) return 'storybook';
    return 'e2e';
  }

  private async executeQuery(query: string, values: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database pool is not initialized');
    }

    if (this.dbType === 'mysql') {
      query = query.replace(/\$\d+/g, '?');
    }

    if (this.dbType === 'postgresql') {
      return await (this.pool as Pool).query(query, values);
    } else {
      return await (this.pool as MySQLPool).query(query, values);
    }
  }

  private async closeDatabase() {
    if (this.pool) {
      if (this.dbType === 'postgresql') {
        await (this.pool as Pool).end();
      } else {
        await (this.pool as MySQLPool).end();
      }
    }
  }
}

// CLI entry point
if (require.main === module) {
  const jsonPath = process.argv[2];

  if (!jsonPath) {
    console.error('Usage: npx ts-node scripts/ingest-results.ts <path-to-json-report>');
    process.exit(1);
  }

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  const ingester = new ResultsIngester();
  ingester.ingest(jsonPath).catch(error => {
    console.error('Error ingesting results:', error);
    process.exit(1);
  });
}

export { ResultsIngester };
