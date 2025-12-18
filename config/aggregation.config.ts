/**
 * Test Results Aggregation Configuration
 *
 * Supported methods:
 * - 'database': Self-managed database + Grafana
 * - 'testdino': TestDino platform integration
 * - 'json': JSON export for CI/CD
 * - 'none': Disable aggregation
 */

export type AggregationMethod = 'database' | 'testdino' | 'json' | 'none';

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface TestDinoConfig {
  apiKey: string;
  projectId: string;
  uploadEndpoint?: string;
}

export interface JsonConfig {
  outputPath: string;
  includeStdio?: boolean;
  includeAttachments?: boolean;
}

export interface AggregationConfig {
  method: AggregationMethod;
  database?: DatabaseConfig;
  testdino?: TestDinoConfig;
  json?: JsonConfig;
}

// Default configuration
export const defaultConfig: AggregationConfig = {
  method: (process.env.AGGREGATION_METHOD as AggregationMethod) || 'none',
  database: {
    type: (process.env.DB_TYPE as 'postgresql' | 'mysql') || 'postgresql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'playwright_results',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
  },
  testdino: {
    apiKey: process.env.TESTDINO_API_KEY || '',
    projectId: process.env.TESTDINO_PROJECT_ID || '',
    uploadEndpoint: process.env.TESTDINO_ENDPOINT,
  },
  json: {
    outputPath: process.env.JSON_OUTPUT_PATH || './test-results/aggregated-results.json',
    includeStdio: process.env.JSON_INCLUDE_STDIO === 'true',
    includeAttachments: process.env.JSON_INCLUDE_ATTACHMENTS === 'true',
  },
};

export function getAggregationConfig(): AggregationConfig {
  return defaultConfig;
}
