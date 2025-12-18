# Test Results Aggregation - Quick Start

Get started with test results aggregation in 5 minutes.

## 🚀 Interactive Setup (Recommended)

Run the setup agent for guided configuration:

```bash
npm run setup:aggregation
```

The agent will:
- Ask which method you prefer (Database, TestDino, or JSON)
- Guide you through configuration
- Update your .env file automatically
- Provide next steps

---

## Choose Your Method (Manual Setup)

### Option 1: Database + Grafana (Recommended for Long-term Insights)

**Start in 2 commands:**

```bash
# 1. Start database and Grafana
npm run db:start

# 2. Configure environment
cp .env.example .env
```

Edit `.env`:
```env
AGGREGATION_METHOD=database
```

**Run tests:**
```bash
npm test
```

**View dashboard:**
```bash
npm run grafana:open
```

Login: admin/admin

---

### Option 2: TestDino (Easiest, Zero Infrastructure)

**Setup:**

1. Sign up at https://testdino.com
2. Get your API key and Project ID
3. Configure environment:

```env
AGGREGATION_METHOD=testdino
TESTDINO_API_KEY=your-api-key
TESTDINO_PROJECT_ID=your-project-id
```

**Run tests:**
```bash
npm test
```

Results automatically upload to TestDino.

---

### Option 3: JSON Export (Flexible, CI/CD Friendly)

**No configuration needed!**

Just run:
```bash
npm test
```

Results are saved to `test-results/results.json`

**Ingest into database later:**
```bash
npm run ingest test-results/results.json
```

---

## Docker Quick Start

### Full Stack (Database + Grafana)

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Services:
- PostgreSQL: localhost:5432
- Grafana: http://localhost:3000
- PgAdmin: http://localhost:5050 (with `--profile tools`)

### Stop Services

```bash
docker-compose down
```

### Reset Everything

```bash
npm run db:reset
```

---

## Verify Setup

### Database

```bash
# Check connection
docker-compose exec postgres psql -U postgres -d playwright_results -c "SELECT version();"

# View tables
docker-compose exec postgres psql -U postgres -d playwright_results -c "\dt"

# Query recent runs
docker-compose exec postgres psql -U postgres -d playwright_results -c \
  "SELECT run_id, status, total_tests, passed_tests, failed_tests FROM test_runs ORDER BY started_at DESC LIMIT 5;"
```

### Grafana

1. Open http://localhost:3000
2. Login (admin/admin)
3. Go to Dashboards
4. Open "Playwright Test Results"

---

## Common Workflows

### Local Development

```bash
# Start services
npm run db:start

# Run tests with database reporting
AGGREGATION_METHOD=database npm test

# View results in Grafana
npm run grafana:open
```

### CI/CD

```bash
# Run tests with JSON export
npm test

# Ingest results
npm run ingest test-results/results.json
```

### Hybrid Approach

Use multiple methods simultaneously:

```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['json', { outputFile: 'test-results/results.json' }],
  [DatabaseReporter],
  [TestDinoReporter],
]
```

---

## NPM Scripts Reference

```bash
# Database
npm run db:start        # Start PostgreSQL + Grafana
npm run db:stop         # Stop services
npm run db:reset        # Reset database (deletes all data)
npm run db:setup        # Initialize database schema

# Grafana
npm run grafana:start   # Start Grafana only
npm run grafana:open    # Open Grafana in browser

# Data Ingestion
npm run ingest <json-file>        # Ingest JSON results to database
npm run testdino:upload           # Upload to TestDino manually
```

---

## Troubleshooting

### Database connection failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# View logs
docker-compose logs postgres
```

### Grafana not showing data

```bash
# Check data source configuration
# Go to Configuration > Data Sources > Playwright Results DB

# Test connection
# Click "Test" button in data source settings

# Verify database has data
docker-compose exec postgres psql -U postgres -d playwright_results -c \
  "SELECT COUNT(*) FROM test_runs;"
```

### TestDino upload failed

```bash
# Check API key
echo $TESTDINO_API_KEY

# Manual upload
npm run testdino:upload

# Check results file exists
ls -la test-results/testdino-results.json
```

---

## Next Steps

- [Full Documentation](./TEST_RESULTS_AGGREGATION.md)
- [Grafana Dashboard Customization](../grafana/dashboards/)
- [Database Schema Details](../database/schema.sql)
- [GitHub Actions Integration](../.github/workflows/test-with-aggregation.yml)

---

## Examples

### Query Flaky Tests

```sql
SELECT
  tc.title,
  tc.file_path,
  ft.flake_rate,
  ft.occurrences,
  ft.last_detected
FROM flaky_tests ft
JOIN test_cases tc ON ft.test_case_id = tc.id
WHERE ft.flake_rate > 10
ORDER BY ft.flake_rate DESC;
```

### Query Pass Rate Trend

```sql
SELECT * FROM test_pass_rate_daily
WHERE test_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY test_date DESC;
```

### Query Slowest Tests

```sql
SELECT * FROM slowest_tests LIMIT 10;
```

### Custom Metrics

```sql
SELECT
  tm.metric_name,
  AVG(tm.metric_value) as avg_value,
  MIN(tm.metric_value) as min_value,
  MAX(tm.metric_value) as max_value
FROM test_metrics tm
JOIN test_results tr ON tm.test_result_id = tr.id
WHERE tr.started_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY tm.metric_name;
```
