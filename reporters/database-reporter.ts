import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
  Suite,
  FullConfig,
} from '@playwright/test/reporter';
import { Pool, PoolConfig } from 'pg';
import { createPool, Pool as MySQLPool, PoolOptions } from 'mysql2/promise';
import { getAggregationConfig, DatabaseConfig } from '../config/aggregation.config';
import * as crypto from 'crypto';

// Unused interfaces kept for future reference
// interface _TestCaseData {
//   testId: string;
//   title: string;
//   filePath: string;
//   projectName: string;
//   browser: string;
//   testType: string;
//   tags: string;
// }

// interface _TestResultData {
//   runId: string;
//   testCaseId: number;
//   status: string;
//   durationMs: number;
//   retryCount: number;
//   errorMessage?: string;
//   errorStack?: string;
//   stdout?: string;
//   stderr?: string;
//   startedAt: Date;
//   finishedAt: Date;
// }

export class DatabaseReporter implements Reporter {
  private pool: Pool | MySQLPool | null = null;
  private config: DatabaseConfig;
  private runId: string;
  private dbType: 'postgresql' | 'mysql';
  private startTime: Date;
  private testCases: Map<string, number> = new Map();
  private _fullConfig: FullConfig | null = null;

  constructor() {
    const aggregationConfig = getAggregationConfig();
    if (!aggregationConfig.database) {
      throw new Error('Database configuration is missing');
    }
    this.config = aggregationConfig.database;
    this.dbType = this.config.type;
    this.runId = this.generateRunId();
    this.startTime = new Date();
  }

  private generateRunId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  async onBegin(config: FullConfig, suite: Suite) {
    this._fullConfig = config;
    await this.initializeDatabase();
    await this.createTestRun(suite);
  }

  private async initializeDatabase() {
    if (this.dbType === 'postgresql') {
      const poolConfig: PoolConfig = {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        max: 10,
      };
      this.pool = new Pool(poolConfig);
    } else {
      const poolConfig: PoolOptions = {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        waitForConnections: true,
        connectionLimit: 10,
      };
      this.pool = createPool(poolConfig);
    }

    console.log(`[DatabaseReporter] Connected to ${this.dbType} database`);
  }

  private async createTestRun(suite: Suite) {
    const query = `
      INSERT INTO test_runs (
        run_id, project_name, branch_name, commit_sha, ci_provider,
        ci_build_id, environment, started_at, status, total_tests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const totalTests = this.countTests(suite);
    const values = [
      this.runId,
      process.env.PROJECT_NAME || 'playwright-mcp-claude',
      process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || 'main',
      process.env.COMMIT_SHA || process.env.GITHUB_SHA || '',
      process.env.CI_PROVIDER || process.env.GITHUB_ACTIONS ? 'github' : 'local',
      process.env.BUILD_ID || process.env.GITHUB_RUN_ID || '',
      process.env.ENVIRONMENT || 'test',
      this.startTime,
      'running',
      totalTests,
    ];

    await this.executeQuery(query, values);
    console.log(`[DatabaseReporter] Created test run: ${this.runId}`);
  }

  private countTests(suite: Suite): number {
    let count = 0;
    for (const child of suite.suites) {
      count += this.countTests(child);
    }
    count += suite.tests.length;
    return count;
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    try {
      // Insert or get test case
      const testCaseId = await this.insertTestCase(test);

      // Insert test result
      await this.insertTestResult(test, result, testCaseId);

      // Insert attachments if any
      if (result.attachments?.length > 0) {
        // We'll implement this later if needed
      }
    } catch (error) {
      console.error('[DatabaseReporter] Error saving test result:', error);
    }
  }

  private async insertTestCase(test: TestCase): Promise<number> {
    const testId = this.getTestId(test);

    // Check cache first
    if (this.testCases.has(testId)) {
      return this.testCases.get(testId)!;
    }

    const testType = this.inferTestType(test.location.file);
    const browser = test.parent.project()?.name || 'chromium';

    const query = `
      INSERT INTO test_cases (test_id, title, file_path, project_name, browser, test_type, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (test_id, file_path, project_name, browser)
      DO UPDATE SET title = EXCLUDED.title, updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const values = [
      testId,
      test.title,
      test.location.file,
      test.parent.project()?.name || 'default',
      browser,
      testType,
      this.extractTags(test.title),
    ];

    const result = await this.executeQuery(query, values);
    const id = this.dbType === 'postgresql' ? result.rows[0].id : result[0].insertId;

    this.testCases.set(testId, id);
    return id;
  }

  private async insertTestResult(test: TestCase, result: TestResult, testCaseId: number) {
    const query = `
      INSERT INTO test_results (
        run_id, test_case_id, status, duration_ms, retry_count,
        error_message, error_stack, stdout, stderr, started_at, finished_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const values = [
      this.runId,
      testCaseId,
      result.status,
      result.duration,
      result.retry,
      result.error?.message || null,
      result.error?.stack || null,
      result.stdout?.map(s => s.toString()).join('\n') || null,
      result.stderr?.map(s => s.toString()).join('\n') || null,
      new Date(result.startTime),
      new Date(result.startTime + result.duration),
    ];

    const insertResult = await this.executeQuery(query, values);
    const resultId = this.dbType === 'postgresql' ? insertResult.rows[0].id : insertResult[0].insertId;

    // Insert performance metrics if this is a performance test
    if (this.inferTestType(test.location.file) === 'performance') {
      await this.insertPerformanceMetrics(resultId, result);
    }
  }

  private async insertPerformanceMetrics(resultId: number, result: TestResult) {
    // Extract performance metrics from stdout/attachments
    // This is a placeholder - implement based on your performance test output format
    const stdout = result.stdout?.map(s => s.toString()).join('\n') || '';
    const metricsMatch = stdout.match(/Performance Metrics: ({.*})/);

    if (metricsMatch) {
      try {
        const metrics = JSON.parse(metricsMatch[1]);
        for (const [name, value] of Object.entries(metrics)) {
          if (typeof value === 'number') {
            const query = `
              INSERT INTO test_metrics (test_result_id, metric_name, metric_value, metric_unit)
              VALUES ($1, $2, $3, $4)
            `;
            await this.executeQuery(query, [resultId, name, value, 'ms']);
          }
        }
      } catch (error) {
        console.error('[DatabaseReporter] Error parsing performance metrics:', error);
      }
    }
  }

  async onEnd(result: FullResult) {
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - this.startTime.getTime();

    // Count results by status
    const stats = await this.getRunStats();

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

    const values = [
      finishedAt,
      durationMs,
      result.status === 'passed' ? 'completed' : 'failed',
      stats.passed,
      stats.failed,
      stats.skipped,
      stats.flaky,
      this.runId,
    ];

    await this.executeQuery(query, values);

    console.log(`[DatabaseReporter] Test run completed: ${this.runId}`);
    console.log(`  Passed: ${stats.passed}, Failed: ${stats.failed}, Skipped: ${stats.skipped}, Flaky: ${stats.flaky}`);

    await this.closeDatabase();
  }

  private async getRunStats(): Promise<{
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
  }> {
    const query = `
      SELECT
        status,
        COUNT(*) as count
      FROM test_results
      WHERE run_id = $1
      GROUP BY status
    `;

    const result = await this.executeQuery(query, [this.runId]);
    const rows = this.dbType === 'postgresql' ? result.rows : result[0];

    const stats = { passed: 0, failed: 0, skipped: 0, flaky: 0 };

    for (const row of rows) {
      const status = row.status;
      const count = parseInt(row.count);

      if (status === 'passed') stats.passed = count;
      else if (status === 'failed') stats.failed = count;
      else if (status === 'skipped') stats.skipped = count;
      else if (status === 'flaky') stats.flaky = count;
    }

    return stats;
  }

  private getTestId(test: TestCase): string {
    const path = test.location.file;
    const title = test.titlePath().join(' › ');
    return crypto.createHash('md5').update(`${path}::${title}`).digest('hex');
  }

  private inferTestType(filePath: string): string {
    if (filePath.includes('.api.spec')) return 'api';
    if (filePath.includes('.ui.spec')) return 'ui';
    if (filePath.includes('.performance.spec')) return 'performance';
    if (filePath.includes('.component.spec')) return 'component';
    if (filePath.includes('storybook')) return 'storybook';
    return 'e2e';
  }

  private extractTags(title: string): string {
    const tagRegex = /@(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(title)) !== null) {
      tags.push(match[1]);
    }

    return tags.join(',');
  }

  private async executeQuery(query: string, values: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database pool is not initialized');
    }

    // Convert PostgreSQL-style $1, $2 placeholders to MySQL-style ?
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
      console.log('[DatabaseReporter] Database connection closed');
    }
  }
}
