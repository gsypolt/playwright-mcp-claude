# Test Results Aggregation Guide

This guide explains how to aggregate and visualize your Playwright test results using different methods.

## Table of Contents

1. [Overview](#overview)
2. [Method 1: Self-Managed (Database + Grafana)](#method-1-self-managed-database--grafana)
3. [Method 2: TestDino Platform](#method-2-testdino-platform)
4. [Method 3: CI/CD Native (JSON Export)](#method-3-cicd-native-json-export)
5. [Comparison](#comparison)
6. [Migration Guide](#migration-guide)

---

## Overview

Choose the aggregation method that best fits your needs:

| Method                 | Best For                                         | Setup Complexity | Features                                        |
| ---------------------- | ------------------------------------------------ | ---------------- | ----------------------------------------------- |
| **Database + Grafana** | Long-term historical insights, custom dashboards | Medium           | Full control, unlimited history, custom queries |
| **TestDino**           | Batteries-included experience, AI insights       | Low              | AI-powered analysis, managed service            |
| **JSON Export**        | CI/CD integration, minimal infrastructure        | Low              | Simple, portable, works anywhere                |

---

## Method 1: Self-Managed (Database + Grafana)

### Overview

Store test results in PostgreSQL/MySQL and visualize with Grafana. This gives you complete control and unlimited historical data.

### Architecture

```
Playwright Tests
      ↓
Database Reporter
      ↓
PostgreSQL/MySQL
      ↓
   Grafana
```

### Quick Start with Docker

1. **Start the stack**:

```bash
docker-compose up -d
```

This starts:

- PostgreSQL (port 5432)
- Grafana (port 3000)
- PgAdmin (port 5050, optional)

2. **Configure environment variables**:

```env
# .env
AGGREGATION_METHOD=database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_results
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

3. **Update Playwright config**:

```typescript
// playwright.config.ts
import { DatabaseReporter } from './reporters/database-reporter';

export default defineConfig({
  reporter: [['html'], [DatabaseReporter]],
  // ... other config
});
```

4. **Run tests**:

```bash
npm test
```

5. **View Grafana dashboard**:

Open http://localhost:3000

- Username: `admin`
- Password: `admin` (or your configured password)

The dashboard is pre-configured with:

- Pass/Fail rate trends
- Test duration trends
- Flakiness detection
- Slowest tests
- Performance metrics
- And more...

### Manual Setup (Without Docker)

#### 1. Install PostgreSQL

**macOS**:

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu**:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Create Database

```bash
createdb playwright_results
psql playwright_results < database/schema.sql
```

#### 3. Install Dependencies

```bash
npm install pg mysql2 --save-dev
```

#### 4. Install Grafana

**macOS**:

```bash
brew install grafana
brew services start grafana
```

**Ubuntu**:

```bash
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana
sudo systemctl start grafana-server
```

#### 5. Configure Grafana

1. Open http://localhost:3000
2. Login (admin/admin)
3. Add PostgreSQL data source:
   - Go to Configuration > Data Sources
   - Add PostgreSQL
   - Configure connection details
4. Import dashboard from `grafana/dashboards/test-results-dashboard.json`

### Database Schema

The schema includes:

- **test_runs**: Test suite executions
- **test_cases**: Unique test definitions
- **test_results**: Individual test results
- **test_attachments**: Screenshots, videos, etc.
- **test_metrics**: Performance metrics
- **flaky_tests**: Automatic flakiness detection

### Custom Queries

**Find most flaky tests**:

```sql
SELECT * FROM most_flaky_tests LIMIT 10;
```

**Get pass rate by day**:

```sql
SELECT * FROM test_pass_rate_daily ORDER BY test_date DESC;
```

**Find slowest tests**:

```sql
SELECT * FROM slowest_tests LIMIT 10;
```

**Performance trends**:

```sql
SELECT
  DATE(tr.started_at) as date,
  tm.metric_name,
  AVG(tm.metric_value) as avg_value
FROM test_metrics tm
JOIN test_results tr ON tm.test_result_id = tr.id
WHERE tr.started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(tr.started_at), tm.metric_name;
```

---

## Method 2: TestDino Platform

### Overview

TestDino is a managed platform that provides AI-powered test insights with zero infrastructure.

### Features

- ✅ AI-powered failure analysis
- ✅ Automatic flakiness detection
- ✅ Historical trends
- ✅ Team collaboration
- ✅ Easy CLI integration

### Setup

1. **Sign up at TestDino**:

Visit https://testdino.com and create an account.

2. **Get API credentials**:

- Project ID
- API Key

3. **Configure environment**:

```env
# .env
AGGREGATION_METHOD=testdino
TESTDINO_API_KEY=your-api-key
TESTDINO_PROJECT_ID=your-project-id
```

4. **Update Playwright config**:

```typescript
// playwright.config.ts
import { TestDinoReporter } from './reporters/testdino-reporter';

export default defineConfig({
  reporter: [['html'], [TestDinoReporter]],
  // ... other config
});
```

5. **Run tests**:

```bash
npm test
```

Results are automatically uploaded to TestDino after each run.

### Manual Upload

If automatic upload fails, you can manually upload:

```bash
npx tdpw upload test-results/testdino-results.json
```

### CLI Commands

```bash
# Upload results
npx tdpw upload <path-to-results>

# View results
npx tdpw view <run-id>

# List recent runs
npx tdpw list

# Get insights
npx tdpw insights
```

---

## Method 3: CI/CD Native (JSON Export)

### Overview

Export test results to JSON and ingest into your database using a separate script. Great for CI/CD pipelines.

### Setup

1. **Configure Playwright for JSON export**:

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  // ... other config
});
```

2. **Run tests**:

```bash
npm test
```

3. **Ingest results into database**:

```bash
npx ts-node scripts/ingest-results.ts test-results/results.json
```

### CI/CD Integration

#### GitHub Actions

```yaml
# .github/workflows/test-and-aggregate.yml
name: Test and Aggregate Results

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: playwright_results
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          CI: true

      - name: Ingest results
        run: npx ts-node scripts/ingest-results.ts test-results/results.json
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: playwright_results
          DB_USER: postgres
          DB_PASSWORD: postgres

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

#### GitLab CI

```yaml
# .gitlab-ci.yml
test:
  image: node:20
  services:
    - postgres:16
  variables:
    POSTGRES_DB: playwright_results
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DB_HOST: postgres
    DB_PORT: 5432
  script:
    - npm ci
    - npm test
    - npx ts-node scripts/ingest-results.ts test-results/results.json
  artifacts:
    when: always
    paths:
      - test-results/
```

---

## Comparison

### When to Use Each Method

#### Use Database + Grafana if:

- ✅ You need complete control over data
- ✅ You want custom dashboards
- ✅ You have infrastructure to manage
- ✅ You need unlimited data retention
- ✅ You want to correlate with other metrics

#### Use TestDino if:

- ✅ You want zero infrastructure
- ✅ You need AI-powered insights
- ✅ You want quick setup
- ✅ You prefer managed services
- ✅ You need team collaboration features

#### Use JSON Export if:

- ✅ You want maximum flexibility
- ✅ You already have a data pipeline
- ✅ You need custom processing
- ✅ You want minimal dependencies
- ✅ You're integrating with existing tools

### Feature Comparison

| Feature             | Database + Grafana | TestDino   | JSON Export    |
| ------------------- | ------------------ | ---------- | -------------- |
| Setup Time          | 30-60 min          | 5 min      | 10 min         |
| Infrastructure      | Self-managed       | Managed    | Self-managed   |
| Cost                | Free (self-hosted) | Paid       | Free           |
| AI Insights         | No                 | Yes        | No             |
| Custom Dashboards   | Unlimited          | Limited    | Depends        |
| Data Retention      | Unlimited          | Plan-based | Unlimited      |
| Historical Analysis | Yes                | Yes        | Yes            |
| Flakiness Detection | Automatic          | AI-powered | Manual queries |
| Team Features       | Limited            | Yes        | No             |

---

## Migration Guide

### From JSON to Database

1. Export existing JSON reports
2. Set up database using docker-compose
3. Run ingestion script for historical data:

```bash
for file in test-results/*.json; do
  npx ts-node scripts/ingest-results.ts "$file"
done
```

### From Database to TestDino

1. Sign up for TestDino
2. Configure credentials
3. Switch reporter in playwright.config.ts
4. Historical data can be bulk-uploaded via API

### Hybrid Approach

You can use multiple methods simultaneously:

```typescript
// playwright.config.ts
import { DatabaseReporter } from './reporters/database-reporter';
import { TestDinoReporter } from './reporters/testdino-reporter';

export default defineConfig({
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    [DatabaseReporter],
    [TestDinoReporter],
  ],
});
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d playwright_results

# Check if database is running
docker-compose ps

# View logs
docker-compose logs postgres
```

### Grafana Issues

```bash
# Reset admin password
docker-compose exec grafana grafana-cli admin reset-admin-password admin

# View logs
docker-compose logs grafana

# Restart Grafana
docker-compose restart grafana
```

### TestDino Upload Failures

```bash
# Check API key
echo $TESTDINO_API_KEY

# Manual upload
npx tdpw upload test-results/testdino-results.json --verbose

# Test API connection
curl -H "Authorization: Bearer $TESTDINO_API_KEY" \
     https://api.testdino.com/v1/health
```

---

## Best Practices

1. **Use environment-specific configurations**:

   ```env
   AGGREGATION_METHOD=database  # dev
   AGGREGATION_METHOD=testdino  # production
   ```

2. **Implement data retention policies**:

   ```sql
   -- Delete old test results (keep last 90 days)
   DELETE FROM test_results
   WHERE started_at < CURRENT_DATE - INTERVAL '90 days';
   ```

3. **Monitor database size**:

   ```sql
   SELECT pg_size_pretty(pg_database_size('playwright_results'));
   ```

4. **Set up alerts in Grafana**:
   - Alert when pass rate drops below 90%
   - Alert when flaky tests exceed threshold
   - Alert when test duration increases significantly

5. **Regular backups**:
   ```bash
   # Backup PostgreSQL
   docker-compose exec postgres pg_dump -U postgres playwright_results > backup.sql
   ```

---

## Next Steps

- [View Grafana Dashboard Examples](../grafana/dashboards/)
- [Database Schema Documentation](../database/schema.sql)
- [Custom Reporter Development](./CUSTOM_REPORTERS.md)
- [CI/CD Integration Examples](../.github/workflows/)
