# Command Reference - Cheat Sheet

Quick reference for all commands in the Playwright MCP Claude project.

## 🚀 Quick Start

```bash
# First time setup
npm install                     # Install dependencies (generates package-lock.json)
npx playwright install          # Install browsers
cp .env.example .env           # Create environment file
npm run setup:aggregation      # Configure test aggregation (interactive)

# Run tests
npm test                       # Run all tests
npm run grafana:open          # View results (if using Grafana)
```

---

## 🤖 Interactive Agents

### Test Generation Agent

```bash
npx ts-node prompts/test-agent.ts
```

- Generates API, UI, Performance, Storybook, or Component tests
- Interactive CLI prompts for test details
- Auto-creates test files in appropriate directory

### Aggregation Setup Agent

```bash
npm run setup:aggregation
```

- Configure Database, TestDino, or JSON aggregation
- Automatic `.env` configuration
- Docker setup assistance
- Playwright config guidance

### GitHub Setup Agent

```bash
npm run setup:github
```

- Creates GitHub repository
- Configures remote connection
- Authenticates with GitHub
- Pushes code automatically

---

## 🧪 Testing Commands

### Run Tests

```bash
npm test                       # Run all tests
npm run test:ui               # Run tests in UI mode (interactive)
npm run test:headed           # Run with visible browser
npm run test:debug            # Debug mode with step-through
```

### Test by Type

```bash
npm run test:api              # API tests only
npm run test:ui               # UI tests only
npm run test:performance      # Performance tests only
npm run test:storybook        # Storybook tests only
npm run test:component        # Component tests only
npm run test:agent            # Test agent tests
npm run test:agents           # Comprehensive agent test suite
```

### Test Reports

```bash
npm run report                # Open HTML test report
```

---

## 📊 Aggregation Services

### Start/Stop Services

```bash
npm run db:start              # Start PostgreSQL + Grafana
npm run db:stop               # Stop all services
npm run db:reset              # Reset database (⚠️ deletes data!)
```

### Grafana

```bash
npm run grafana:start         # Start Grafana only
npm run grafana:open          # Open Grafana in browser (http://localhost:3000)
                              # Login: admin/admin
```

### Database Management

```bash
npm run db:setup              # Initialize database schema
docker-compose up -d postgres # Start PostgreSQL only
```

### Data Ingestion

```bash
npm run ingest <file>         # Ingest JSON results to database
# Example:
npm run ingest test-results/results.json
```

### TestDino

```bash
npm run testdino:upload       # Upload results to TestDino manually
```

---

## 🐳 Docker Commands

### Service Management

```bash
docker-compose up -d          # Start all services (PostgreSQL + Grafana)
docker-compose down           # Stop all services
docker-compose down -v        # Stop and remove volumes (⚠️ deletes data!)
docker-compose ps             # Check running services
docker-compose logs -f        # View all service logs
```

### Individual Services

```bash
docker-compose up -d postgres # Start PostgreSQL only
docker-compose up -d grafana  # Start Grafana only
docker-compose logs -f postgres # View PostgreSQL logs
docker-compose logs -f grafana  # View Grafana logs
```

### Database Access

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d playwright_results

# Common psql commands:
\dt                           # List all tables
\d table_name                 # Describe table schema
\q                            # Quit psql
```

### Service URLs

- **Grafana**: http://localhost:3000 (admin/admin)
- **PostgreSQL**: localhost:5432
- **PgAdmin** (optional): http://localhost:5050

---

## 🔍 Database Queries

### Quick Queries

```bash
# Inside PostgreSQL (docker-compose exec postgres psql -U postgres -d playwright_results)

# View recent test runs
SELECT run_id, status, total_tests, passed_tests, failed_tests
FROM test_runs
ORDER BY started_at DESC
LIMIT 5;

# Find flaky tests
SELECT * FROM most_flaky_tests LIMIT 10;

# Get pass rate trend
SELECT * FROM test_pass_rate_daily
WHERE test_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY test_date DESC;

# Find slowest tests
SELECT * FROM slowest_tests LIMIT 10;

# View test execution trends
SELECT * FROM test_trends_30d;
```

---

## 🎨 Code Quality

### Linting

```bash
npm run lint                  # Check for linting issues
npm run lint:fix              # Auto-fix linting issues
```

### Formatting

```bash
npm run format                # Format all files
npm run format:check          # Check formatting without changes
```

### Pre-commit

```bash
npm run prepare               # Setup Husky git hooks
```

_Pre-commit hooks automatically run on `git commit`_

---

## 📦 Release Management

### Create Release

```bash
npm run release               # Auto-detect version bump
npm run release:patch         # Patch: 1.0.0 → 1.0.1
npm run release:minor         # Minor: 1.0.0 → 1.1.0
npm run release:major         # Major: 1.0.0 → 2.0.0
```

### Publish Release

```bash
git push --follow-tags origin main
```

_GitHub Actions will automatically create a release_

---

## 🔧 Development

### Dependencies

```bash
npm install                   # Install dependencies (first time or after pulling changes)
npm ci                        # Clean install (CI/CD, requires package-lock.json)
npm update                    # Update dependencies
npx playwright install        # Install/update browsers
```

### TypeScript

```bash
npx tsc --noEmit             # Type check without compilation
```

---

## 📚 Common Workflows

### First Time Setup

```bash
git clone <repo-url>
cd playwright-mcp-claude
npm install                  # Generates package-lock.json
npx playwright install
cp .env.example .env
# Edit .env with your settings
npm run setup:aggregation     # Configure aggregation
npm run db:start             # Start services
npm test                     # Run tests
npm run grafana:open         # View results
```

### Daily Development

```bash
npm run db:start             # Start services (if not running)
npx ts-node prompts/test-agent.ts  # Generate new test
npm test                     # Run tests
npm run report               # View HTML report
npm run grafana:open         # View Grafana dashboard
npm run db:stop              # Stop services when done
```

### Generate and Run Test

```bash
npx ts-node prompts/test-agent.ts  # Generate test
npm test tests/ui/my-test.ui.spec.ts  # Run specific test
npm run test:ui              # Or run in UI mode
```

### Debug Failing Test

```bash
npm run test:debug           # Debug mode
npm run test:headed          # Run with visible browser
```

### CI/CD Workflow

```bash
npm run lint                 # Lint code
npm test                     # Run all tests
npm run ingest test-results/results.json  # Ingest results
```

### Release Workflow

```bash
git add .
git commit -m "feat: add new feature"  # Conventional commit
npm run release              # Generate version & changelog
git push --follow-tags origin main     # Trigger GitHub release
```

---

## 🆘 Troubleshooting

### Reset Everything

```bash
npm run db:reset             # Reset database
rm -rf node_modules package-lock.json
npm install                  # Reinstall dependencies
npx playwright install       # Reinstall browsers
```

### Check Service Status

```bash
docker-compose ps            # View running services
docker-compose logs -f       # View service logs
```

### Verify Database Connection

```bash
docker-compose exec postgres psql -U postgres -d playwright_results -c "SELECT version();"
```

### View Grafana Logs

```bash
docker-compose logs -f grafana
```

### Fix Linting Issues

```bash
npm run lint:fix
npm run format
```

---

## 🔗 Quick Links

| Resource          | Command                                                               |
| ----------------- | --------------------------------------------------------------------- |
| Grafana Dashboard | `npm run grafana:open`                                                |
| HTML Test Report  | `npm run report`                                                      |
| PostgreSQL CLI    | `docker-compose exec postgres psql -U postgres -d playwright_results` |
| Service Status    | `docker-compose ps`                                                   |
| Service Logs      | `docker-compose logs -f`                                              |

---

## 📋 Environment Variables

### Required for Testing

```env
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
```

### For Aggregation (Database)

```env
AGGREGATION_METHOD=database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_results
DB_USER=postgres
DB_PASSWORD=postgres
```

### For Aggregation (TestDino)

```env
AGGREGATION_METHOD=testdino
TESTDINO_API_KEY=your-api-key
TESTDINO_PROJECT_ID=your-project-id
```

### For Aggregation (JSON)

```env
AGGREGATION_METHOD=json
JSON_OUTPUT_PATH=./test-results/aggregated-results.json
```

---

## 💡 Pro Tips

1. **Use UI Mode for Development**: `npm run test:ui` provides the best debugging experience
2. **Run Aggregation Agent First**: `npm run setup:aggregation` configures everything automatically
3. **Keep Services Running**: Leave `npm run db:start` running during development
4. **Use Conventional Commits**: Enables automatic changelog generation
5. **Check Grafana Regularly**: Monitor test trends and catch flaky tests early
6. **Use Pre-commit Hooks**: Automatically enforces code quality
7. **Review Flaky Tests**: `SELECT * FROM most_flaky_tests;` in PostgreSQL
8. **Monitor Performance**: `SELECT * FROM slowest_tests;` to find bottlenecks

---

## 📖 Documentation

- [README.md](README.md) - Main documentation
- [QUICKSTART.md](docs/QUICKSTART.md) - 5-minute quick start
- [TEST_RESULTS_AGGREGATION.md](docs/TEST_RESULTS_AGGREGATION.md) - Full aggregation guide
- [AGGREGATION_QUICKSTART.md](docs/AGGREGATION_QUICKSTART.md) - Aggregation quick start
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Contribution guidelines
- [prompts/catalog.md](prompts/catalog.md) - AI prompt examples

---

## 🎯 Most Used Commands

```bash
npm test                     # Run tests
npm run setup:aggregation    # Setup aggregation
npm run db:start            # Start services
npm run grafana:open        # View dashboard
npx ts-node prompts/test-agent.ts  # Generate test
npm run test:ui             # Debug tests
npm run db:stop             # Stop services
```

---

_Last updated: 2025-01-17_
