/**
 * Test Results Aggregation Setup Agent
 *
 * Interactive CLI to help users configure test results aggregation
 * Supports: Database + Grafana, TestDino, JSON Export
 */

import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type AggregationMethod = 'database' | 'testdino' | 'json' | 'none';

interface SetupConfig {
  method: AggregationMethod;
  dbType?: 'postgresql' | 'mysql';
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  testdinoApiKey?: string;
  testdinoProjectId?: string;
  jsonOutputPath?: string;
  useDocker?: boolean;
  setupGithubActions?: boolean;
}

export class AggregationAgent {
  private rl: readline.Interface;
  private config: SetupConfig = { method: 'none' };

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

  private async selectAggregationMethod(): Promise<AggregationMethod> {
    console.log('\n📊 Test Results Aggregation Setup\n');
    console.log('Choose your aggregation method:\n');
    console.log('1. 🗄️  Self-Managed (Database + Grafana)');
    console.log('   • Full control and unlimited history');
    console.log('   • Custom Grafana dashboards');
    console.log('   • Advanced SQL queries');
    console.log('   • Setup time: 10-30 minutes\n');

    console.log('2. 🚀 TestDino Platform');
    console.log('   • Zero infrastructure (managed service)');
    console.log('   • AI-powered failure analysis');
    console.log('   • Team collaboration features');
    console.log('   • Setup time: 5 minutes\n');

    console.log('3. 📄 JSON Export (CI/CD)');
    console.log('   • Maximum flexibility');
    console.log('   • No runtime dependencies');
    console.log('   • Easy CI/CD integration');
    console.log('   • Setup time: 2 minutes\n');

    console.log('4. ❌ None (Disable aggregation)\n');

    const choice = await this.prompt('Enter choice (1-4): ');

    const methodMap: Record<string, AggregationMethod> = {
      '1': 'database',
      '2': 'testdino',
      '3': 'json',
      '4': 'none',
    };

    return methodMap[choice] || 'none';
  }

  private async setupDatabase(): Promise<void> {
    console.log('\n🗄️  Database + Grafana Setup\n');

    // Ask if user wants to use Docker
    const dockerChoice = await this.prompt('Use Docker for setup? (recommended) [Y/n]: ');
    this.config.useDocker = dockerChoice.toLowerCase() !== 'n';

    if (this.config.useDocker) {
      await this.setupDatabaseDocker();
    } else {
      await this.setupDatabaseManual();
    }
  }

  private async setupDatabaseDocker(): Promise<void> {
    console.log('\n🐳 Docker Setup\n');

    // Check if Docker is installed
    try {
      await execAsync('docker --version');
      console.log('✓ Docker is installed');
    } catch {
      console.log('✗ Docker is not installed');
      console.log('\nPlease install Docker:');
      console.log('  macOS: brew install --cask docker');
      console.log('  Windows: https://docs.docker.com/desktop/install/windows-install/');
      console.log('  Linux: https://docs.docker.com/engine/install/');
      return;
    }

    // Set defaults
    this.config.dbType = 'postgresql';
    this.config.dbHost = 'localhost';
    this.config.dbPort = '5432';
    this.config.dbName = 'playwright_results';
    this.config.dbUser = 'postgres';

    const dbPassword = await this.prompt('Database password [postgres]: ');
    this.config.dbPassword = dbPassword || 'postgres';

    console.log('\n📝 Configuration:');
    console.log(`  Database: ${this.config.dbType}`);
    console.log(`  Host: ${this.config.dbHost}:${this.config.dbPort}`);
    console.log(`  Database: ${this.config.dbName}`);
    console.log(`  User: ${this.config.dbUser}`);

    const confirm = await this.prompt('\nProceed with setup? [Y/n]: ');
    if (confirm.toLowerCase() === 'n') {
      console.log('Setup cancelled.');
      return;
    }

    console.log('\n🚀 Starting services...\n');

    try {
      // Start Docker services
      await execAsync('npm run db:start');
      console.log('✓ PostgreSQL started');
      console.log('✓ Grafana started');

      console.log('\n📊 Services running:');
      console.log('  PostgreSQL: http://localhost:5432');
      console.log('  Grafana: http://localhost:3000 (admin/admin)');
      console.log('  PgAdmin: http://localhost:5050 (optional, use --profile tools)');

      console.log('\n✓ Database + Grafana setup complete!');
    } catch (error: any) {
      console.error('\n✗ Setup failed:', error.message);
      console.log('\nManual setup:');
      console.log('  1. Run: docker-compose up -d');
      console.log('  2. Wait for services to start');
      console.log('  3. Access Grafana at http://localhost:3000');
    }
  }

  private async setupDatabaseManual(): Promise<void> {
    console.log('\n📝 Manual Database Configuration\n');

    const dbType = await this.prompt('Database type [postgresql/mysql]: ');
    this.config.dbType = (dbType || 'postgresql') as 'postgresql' | 'mysql';

    this.config.dbHost = await this.prompt('Database host [localhost]: ') || 'localhost';

    const defaultPort = this.config.dbType === 'postgresql' ? '5432' : '3306';
    this.config.dbPort = await this.prompt(`Database port [${defaultPort}]: `) || defaultPort;

    this.config.dbName = await this.prompt('Database name [playwright_results]: ') || 'playwright_results';
    this.config.dbUser = await this.prompt('Database user [postgres]: ') || 'postgres';
    this.config.dbPassword = await this.prompt('Database password: ');

    console.log('\n📝 Manual setup steps:');
    console.log(`\n1. Install ${this.config.dbType}:`);
    if (this.config.dbType === 'postgresql') {
      console.log('   macOS: brew install postgresql@16');
      console.log('   Ubuntu: sudo apt install postgresql');
    } else {
      console.log('   macOS: brew install mysql');
      console.log('   Ubuntu: sudo apt install mysql-server');
    }

    console.log('\n2. Create database:');
    console.log(`   createdb ${this.config.dbName}`);
    console.log(`   psql ${this.config.dbName} < database/schema.sql`);

    console.log('\n3. Install dependencies:');
    console.log('   npm install pg mysql2 --save-dev');

    console.log('\n4. Install Grafana:');
    console.log('   macOS: brew install grafana');
    console.log('   Ubuntu: sudo apt install grafana');

    console.log('\n5. Configure Grafana:');
    console.log('   - Open http://localhost:3000');
    console.log('   - Add PostgreSQL data source');
    console.log('   - Import dashboard from grafana/dashboards/');
  }

  private async setupTestDino(): Promise<void> {
    console.log('\n🚀 TestDino Platform Setup\n');

    console.log('1. Sign up at https://testdino.com');
    console.log('2. Create a new project');
    console.log('3. Get your API credentials\n');

    const hasAccount = await this.prompt('Do you have a TestDino account? [y/N]: ');

    if (hasAccount.toLowerCase() !== 'y') {
      console.log('\n📝 Next steps:');
      console.log('  1. Visit https://testdino.com');
      console.log('  2. Sign up for an account');
      console.log('  3. Run this setup again with your credentials');
      return;
    }

    this.config.testdinoApiKey = await this.prompt('TestDino API Key: ');
    this.config.testdinoProjectId = await this.prompt('TestDino Project ID: ');

    if (!this.config.testdinoApiKey || !this.config.testdinoProjectId) {
      console.log('\n✗ API key and Project ID are required');
      return;
    }

    console.log('\n✓ TestDino configuration complete!');
    console.log('\nAfter running tests, view results at:');
    console.log(`  https://testdino.com/projects/${this.config.testdinoProjectId}`);
  }

  private async setupJSON(): Promise<void> {
    console.log('\n📄 JSON Export Setup\n');

    const defaultPath = './test-results/aggregated-results.json';
    const outputPath = await this.prompt(`JSON output path [${defaultPath}]: `);
    this.config.jsonOutputPath = outputPath || defaultPath;

    console.log('\n✓ JSON export configuration complete!');
    console.log('\nResults will be exported to:');
    console.log(`  ${this.config.jsonOutputPath}`);
    console.log('\nTo ingest into database later:');
    console.log(`  npm run ingest ${this.config.jsonOutputPath}`);
  }

  private async updateEnvFile(): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch {
      // .env doesn't exist, copy from .env.example
      try {
        envContent = await fs.readFile(path.join(process.cwd(), '.env.example'), 'utf-8');
      } catch {
        console.log('\n✗ Could not find .env.example');
        return;
      }
    }

    // Update AGGREGATION_METHOD
    envContent = envContent.replace(
      /AGGREGATION_METHOD=.*/,
      `AGGREGATION_METHOD=${this.config.method}`
    );

    // Update database config if applicable
    if (this.config.method === 'database') {
      envContent = envContent.replace(/DB_TYPE=.*/, `DB_TYPE=${this.config.dbType}`);
      envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${this.config.dbHost}`);
      envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${this.config.dbPort}`);
      envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${this.config.dbName}`);
      envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${this.config.dbUser}`);
      envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${this.config.dbPassword}`);
    }

    // Update TestDino config if applicable
    if (this.config.method === 'testdino') {
      envContent = envContent.replace(/TESTDINO_API_KEY=.*/, `TESTDINO_API_KEY=${this.config.testdinoApiKey}`);
      envContent = envContent.replace(/TESTDINO_PROJECT_ID=.*/, `TESTDINO_PROJECT_ID=${this.config.testdinoProjectId}`);
    }

    // Update JSON config if applicable
    if (this.config.method === 'json') {
      envContent = envContent.replace(/JSON_OUTPUT_PATH=.*/, `JSON_OUTPUT_PATH=${this.config.jsonOutputPath}`);
    }

    await fs.writeFile(envPath, envContent);
    console.log('\n✓ Updated .env file');
  }

  private async updatePlaywrightConfig(): Promise<void> {
    const configPath = path.join(process.cwd(), 'playwright.config.ts');

    try {
      const configContent = await fs.readFile(configPath, 'utf-8');

      // Check if reporter is already configured
      if (configContent.includes('DatabaseReporter') ||
          configContent.includes('TestDinoReporter')) {
        console.log('✓ Playwright config already has custom reporters');
        return;
      }

      console.log('\n📝 To complete setup, update playwright.config.ts:');

      if (this.config.method === 'database') {
        console.log('\nAdd to playwright.config.ts:');
        console.log('```typescript');
        console.log("import { DatabaseReporter } from './reporters/database-reporter';");
        console.log('');
        console.log('export default defineConfig({');
        console.log('  reporter: [');
        console.log("    ['html'],");
        console.log('    [DatabaseReporter],');
        console.log('  ],');
        console.log('  // ... other config');
        console.log('});');
        console.log('```');
      } else if (this.config.method === 'testdino') {
        console.log('\nAdd to playwright.config.ts:');
        console.log('```typescript');
        console.log("import { TestDinoReporter } from './reporters/testdino-reporter';");
        console.log('');
        console.log('export default defineConfig({');
        console.log('  reporter: [');
        console.log("    ['html'],");
        console.log('    [TestDinoReporter],');
        console.log('  ],');
        console.log('  // ... other config');
        console.log('});');
        console.log('```');
      }
    } catch (error) {
      console.log('\n✗ Could not read playwright.config.ts');
    }
  }

  private async setupGitHubActions(): Promise<void> {
    const setupGHA = await this.prompt('\nSetup GitHub Actions workflow? [Y/n]: ');
    this.config.setupGithubActions = setupGHA.toLowerCase() !== 'n';

    if (!this.config.setupGithubActions) {
      return;
    }

    console.log('\n📝 GitHub Actions Setup:');
    console.log('\n1. The workflow is already created at:');
    console.log('   .github/workflows/test-with-aggregation.yml');

    console.log('\n2. Configure GitHub Secrets (if using TestDino):');
    console.log('   • Go to: Settings → Secrets and variables → Actions');
    console.log('   • Add: TESTDINO_API_KEY');
    console.log('   • Add: TESTDINO_PROJECT_ID');

    console.log('\n3. Push to GitHub to trigger workflow:');
    console.log('   git add .');
    console.log('   git commit -m "feat: add test results aggregation"');
    console.log('   git push');

    console.log('\n✓ GitHub Actions workflow ready!');
  }

  private async showNextSteps(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Setup Complete!');
    console.log('='.repeat(60) + '\n');

    console.log('📋 Next Steps:\n');

    if (this.config.method === 'database') {
      if (this.config.useDocker) {
        console.log('1. Verify services are running:');
        console.log('   docker-compose ps\n');

        console.log('2. Run your tests:');
        console.log('   npm test\n');

        console.log('3. View Grafana dashboard:');
        console.log('   npm run grafana:open');
        console.log('   Login: admin/admin\n');

        console.log('4. Query database:');
        console.log('   docker-compose exec postgres psql -U postgres -d playwright_results');
        console.log('   \\dt  -- list tables');
        console.log('   SELECT * FROM test_runs ORDER BY started_at DESC LIMIT 5;\n');
      } else {
        console.log('1. Complete manual setup steps above\n');
        console.log('2. Run your tests:');
        console.log('   npm test\n');
        console.log('3. Access Grafana at http://localhost:3000\n');
      }
    } else if (this.config.method === 'testdino') {
      console.log('1. Run your tests:');
      console.log('   npm test\n');

      console.log('2. View results at TestDino:');
      console.log(`   https://testdino.com/projects/${this.config.testdinoProjectId}\n`);

      console.log('3. If upload fails, manually upload:');
      console.log('   npm run testdino:upload\n');
    } else if (this.config.method === 'json') {
      console.log('1. Run your tests:');
      console.log('   npm test\n');

      console.log('2. View JSON results:');
      console.log(`   cat ${this.config.jsonOutputPath}\n`);

      console.log('3. Optional: Ingest to database:');
      console.log(`   npm run ingest ${this.config.jsonOutputPath}\n`);
    }

    console.log('📚 Documentation:');
    console.log('   • Full Guide: docs/TEST_RESULTS_AGGREGATION.md');
    console.log('   • Quick Start: docs/AGGREGATION_QUICKSTART.md');
    console.log('   • Summary: AGGREGATION_SUMMARY.md\n');

    console.log('💡 Tips:');
    console.log('   • Use multiple methods simultaneously for redundancy');
    console.log('   • Set up alerts in Grafana for test failures');
    console.log('   • Review flaky tests regularly: SELECT * FROM most_flaky_tests;');
    console.log('   • Monitor performance trends for regressions\n');
  }

  async run(): Promise<void> {
    try {
      // Select aggregation method
      this.config.method = await this.selectAggregationMethod();

      if (this.config.method === 'none') {
        console.log('\nAggregation disabled. You can run this setup again anytime.');
        this.rl.close();
        return;
      }

      // Method-specific setup
      if (this.config.method === 'database') {
        await this.setupDatabase();
      } else if (this.config.method === 'testdino') {
        await this.setupTestDino();
      } else if (this.config.method === 'json') {
        await this.setupJSON();
      }

      // Update configuration files
      await this.updateEnvFile();
      await this.updatePlaywrightConfig();

      // GitHub Actions setup
      await this.setupGitHubActions();

      // Show next steps
      await this.showNextSteps();

    } catch (error: any) {
      console.error('\n✗ Setup failed:', error.message);
      console.log('\nFor help, see: docs/AGGREGATION_QUICKSTART.md');
    } finally {
      this.rl.close();
    }
  }
}

// CLI entry point
if (require.main === module) {
  const agent = new AggregationAgent();
  agent.run().catch(console.error);
}
