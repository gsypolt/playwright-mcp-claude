# Playwright MCP Claude - AI-Powered Test Framework

An advanced test automation framework that combines Playwright, Claude AI, and the Model Context Protocol (MCP) to generate intelligent API, UI, performance, and component tests.

## Features

- **AI-Powered Test Generation**: Use Claude AI to generate test cases from natural language prompts
- **Multiple Test Types**: Support for API, UI, Performance, Storybook, and Component tests
- **Test Results Aggregation**: Store and visualize test results with Database + Grafana, TestDino, or JSON export
- **Historical Insights**: Track trends, flakiness, and performance over time
- **Authentication Helpers**: Pre-built helpers for Google OAuth, Microsoft OAuth, and generic login flows
- **Reusable Components**: Page objects, form handlers, table interactions, and modal components
- **Interactive Test Agent**: CLI tool for guided test creation
- **Prompt Catalog**: Comprehensive collection of AI prompts for different testing scenarios
- **CI/CD Integration**: GitHub Actions workflows for automated testing and releases
- **Code Quality**: ESLint, Prettier, and pre-commit hooks for code consistency
- **Automated Versioning**: Semantic versioning with conventional commits

## 📋 [Command Reference Cheat Sheet →](docs/COMMANDS.md)

Quick reference for all commands - [View Full Cheat Sheet](docs/COMMANDS.md)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Test Types](#test-types)
- [Test Results Aggregation](#test-results-aggregation)
- [Authentication Helpers](#authentication-helpers)
- [Reusable Components](#reusable-components)
- [Interactive Test Agent](#interactive-test-agent)
- [Prompt Catalog](#prompt-catalog)
- [Running Tests](#running-tests)
- [CI/CD](#cicd)
- [Release Management](#release-management)
- [Contributing](#contributing)

## Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd playwright-mcp-claude
```

2. Install dependencies:

```bash
npm install
```

> **Note**: This generates `package-lock.json` which should be committed to the repository. Future installs can use `npm ci` for faster, more reliable installations.

3. Install Playwright browsers:

```bash
npx playwright install
```

4. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Application URLs
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api

# Google OAuth Credentials
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-password

# Microsoft OAuth Credentials
MICROSOFT_EMAIL=your-email@outlook.com
MICROSOFT_PASSWORD=your-password

# Claude API (optional, for AI-powered features)
CLAUDE_API_KEY=your-claude-api-key
```

5. Initialize git hooks:

```bash
npm run prepare
```

## Quick Start

### Generate a Test Using the Interactive Agent

```bash
npx ts-node prompts/test-agent.ts
```

Follow the prompts to select test type and generate your first test.

### Create a Test Manually

Create a new test file in the appropriate directory:

**API Test** ([tests/api/example.api.spec.ts](tests/api/example.api.spec.ts)):

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '@/helpers/api';

test.describe('API Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test('should fetch users', async () => {
    const response = await apiHelper.get('/users');
    expect(response.status).toBe(200);
  });
});
```

**UI Test** ([tests/ui/login.ui.spec.ts](tests/ui/login.ui.spec.ts)):

```typescript
import { test, expect } from '@playwright/test';
import { genericLogin } from '@/helpers/auth';

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await genericLogin(page, {
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  });
  await expect(page).toHaveURL('/dashboard');
});
```

## Configuration

### Playwright Configuration

Edit [playwright.config.ts](playwright.config.ts) to customize:

- Test directory
- Browsers to test
- Base URL
- Timeouts
- Screenshots and videos
- Parallel execution

### TypeScript Configuration

The project uses TypeScript with path aliases configured in [tsconfig.json](tsconfig.json):

- `@/*` - Root directory
- `@helpers/*` - Helper functions
- `@components/*` - Reusable components
- `@config/*` - Configuration files

## Test Types

### 1. API Tests

Test REST and GraphQL APIs using the ApiHelper class.

**Location**: `tests/api/`

**Example**:

```typescript
import { ApiHelper } from '@/helpers/api';

const response = await apiHelper.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

apiHelper.assertStatus(response, 201);
apiHelper.assertHasProperties(response, ['id', 'name', 'email']);
```

### 2. UI Tests

End-to-end tests for user interfaces using page objects.

**Location**: `tests/ui/`

**Example**:

```typescript
import { BasePage } from '@/components/base-page';

const page = new BasePage(playwrightPage);
await page.goto('/products');
await page.getByTestId('product-1').click();
```

### 3. Performance Tests

Measure page load times, Web Vitals, and API response times.

**Location**: `tests/performance/`

**Example**:

```typescript
import { measurePageLoad } from '@/helpers/performance';

const metrics = await measurePageLoad(page);
expect(metrics.loadTime).toBeLessThan(3000);
expect(metrics.firstContentfulPaint).toBeLessThan(1000);
```

### 4. Storybook Tests

Test components in Storybook isolation.

**Location**: `tests/storybook/`

**Example**:

```typescript
await page.goto('http://localhost:6006/?path=/story/button--primary');
const iframe = page.frameLocator('#storybook-preview-iframe');
await expect(iframe.locator('button')).toBeVisible();
```

### 5. Component Tests

Test individual web components.

**Location**: `tests/components/`

## Test Results Aggregation

Track, analyze, and visualize your test results over time with multiple aggregation methods.

### 🚀 Interactive Setup (Recommended)

Run the setup agent for guided configuration:

```bash
npm run setup:aggregation
```

The agent will help you:

- Choose between Database, TestDino, or JSON export
- Configure your environment automatically
- Set up Docker (if using Database + Grafana)
- Update playwright.config.ts
- Configure GitHub Actions

### Quick Start (Manual)

#### Method 1: Database + Grafana (Full Control)

```bash
# Start PostgreSQL and Grafana
npm run db:start

# Configure environment
AGGREGATION_METHOD=database npm test

# View dashboards
npm run grafana:open
```

Features:

- ✅ Unlimited historical data
- ✅ Custom Grafana dashboards
- ✅ Advanced SQL queries
- ✅ Flakiness detection
- ✅ Performance trend analysis

#### Method 2: TestDino (Zero Infrastructure)

```bash
# Configure in .env
AGGREGATION_METHOD=testdino
TESTDINO_API_KEY=your-key
TESTDINO_PROJECT_ID=your-project

# Run tests
npm test
```

Features:

- ✅ AI-powered failure analysis
- ✅ Managed service (no infrastructure)
- ✅ Team collaboration
- ✅ Automatic flakiness detection

#### Method 3: JSON Export (Flexible)

```bash
# Tests automatically export to JSON
npm test

# Manually ingest to database
npm run ingest test-results/results.json
```

Features:

- ✅ Maximum flexibility
- ✅ CI/CD friendly
- ✅ No real-time dependency
- ✅ Easy integration

### Grafana Dashboard

The included Grafana dashboard provides:

- **Pass/Fail Rate Trends**: Track test stability over time
- **Flakiness Heatmap**: Identify unreliable tests
- **Performance Metrics**: Monitor test execution speed
- **Test Duration Trends**: Find slow tests
- **Browser Comparison**: Compare results across browsers
- **Failure Analysis**: Drill down into failed tests

### Database Schema

Automatically tracks:

- Test runs with CI/CD metadata
- Individual test results
- Test attachments (screenshots, videos)
- Performance metrics
- Flaky test detection

### Example Queries

**Find flaky tests:**

```sql
SELECT * FROM most_flaky_tests LIMIT 10;
```

**Get pass rate trend:**

```sql
SELECT * FROM test_pass_rate_daily
WHERE test_date >= CURRENT_DATE - INTERVAL '30 days';
```

**Find slowest tests:**

```sql
SELECT * FROM slowest_tests LIMIT 10;
```

### Documentation

- [Full Aggregation Guide](docs/TEST_RESULTS_AGGREGATION.md)
- [Quick Start Guide](docs/AGGREGATION_QUICKSTART.md)
- [Database Schema](database/schema.sql)
- [Grafana Dashboards](grafana/dashboards/)

## Authentication Helpers

### Generic Login

```typescript
import { genericLogin } from '@/helpers/auth';

await genericLogin(page, {
  email: 'user@example.com',
  password: 'password123',
});
```

### Google OAuth

```typescript
import { loginWithGoogle } from '@/helpers/auth';

await loginWithGoogle(
  page,
  {
    email: process.env.GOOGLE_EMAIL!,
    password: process.env.GOOGLE_PASSWORD!,
  },
  'button:has-text("Sign in with Google")'
);
```

### Microsoft OAuth

```typescript
import { loginWithMicrosoft } from '@/helpers/auth';

await loginWithMicrosoft(
  page,
  {
    email: process.env.MICROSOFT_EMAIL!,
    password: process.env.MICROSOFT_PASSWORD!,
  },
  'button:has-text("Sign in with Microsoft")'
);
```

### Check Authentication Status

```typescript
import { isAuthenticated } from '@/helpers/auth';

const authenticated = await isAuthenticated(page);
expect(authenticated).toBe(true);
```

## Reusable Components

### BasePage

Common page object functionality.

```typescript
import { BasePage } from '@/components/base-page';

const page = new BasePage(playwrightPage);
await page.goto('/dashboard');
await page.waitForReady();
const title = await page.getTitle();
```

### FormComponent

Handle form interactions.

```typescript
import { FormComponent } from '@/components/form-component';

const form = new FormComponent(page, '#login-form');
await form.fillByLabel('Email', 'user@example.com');
await form.fillByLabel('Password', 'password');
await form.submit();
```

### TableComponent

Interact with data tables.

```typescript
import { TableComponent } from '@/components/table-component';

const table = new TableComponent(page, '#users-table');
const rowCount = await table.getRowCount();
await table.sortByColumn(0);
const data = await table.getAllData();
```

### ModalComponent

Handle modals and dialogs.

```typescript
import { ModalComponent } from '@/components/modal-component';

const modal = new ModalComponent(page);
await modal.waitForVisible();
const title = await modal.getTitle();
await modal.clickPrimary();
```

## Interactive Test Agent

Run the interactive test agent to generate tests:

```bash
npx ts-node prompts/test-agent.ts
```

The agent will:

1. Prompt you to select a test type
2. Ask for test name and description
3. Generate a test template
4. Save the test to the appropriate directory

## Prompt Catalog

The [prompts/catalog.md](prompts/catalog.md) file contains AI prompts for generating various test types:

- API endpoint tests
- GraphQL tests
- Login flow tests
- Form validation tests
- E2E user flows
- Performance tests
- Visual regression tests
- And more...

**Usage**: Copy a prompt, replace placeholders with your values, and use it with Claude AI.

## Running Tests

### Run all tests

```bash
npm test
```

### Run specific test types

```bash
npm run test:api          # API tests only
npm run test:ui           # UI tests only
npm run test:performance  # Performance tests only
npm run test:storybook    # Storybook tests only
npm run test:component    # Component tests only
npm run test:agent        # Test agent tests
```

### Run tests in UI mode

```bash
npm run test:ui
```

### Run tests in headed mode

```bash
npm run test:headed
```

### Debug tests

```bash
npm run test:debug
```

### View test report

```bash
npm run report
```

## CI/CD

### GitHub Actions Workflows

#### CI Workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml))

Runs on every push and pull request:

- Lints code with ESLint
- Checks formatting with Prettier
- Runs tests across multiple browsers
- **Runs agent integration tests** (`npm run test:agents`)
- Uploads test results and reports

#### Test Agents Workflow ([.github/workflows/test-agents.yml](.github/workflows/test-agents.yml))

Runs on PR when agent files change:

- Runs comprehensive agent test suite
- Verifies agents start correctly
- TypeScript type checking
- Posts results as PR comments
- See [Workflow Documentation](.github/workflows/README.md) for details

#### Release Workflow ([.github/workflows/release.yml](.github/workflows/release.yml))

Runs on pushes to main branch:

- Runs full test suite
- Generates version number and changelog
- Creates git tag
- Publishes GitHub release
- Uploads release artifacts

## Release Management

### Conventional Commits

Use conventional commit messages:

```bash
feat: add new login helper
fix: resolve authentication timeout issue
docs: update README with examples
test: add performance test suite
chore: update dependencies
```

### Create a Release

```bash
# Patch release (1.0.0 -> 1.0.1)
npm run release:patch

# Minor release (1.0.0 -> 1.1.0)
npm run release:minor

# Major release (1.0.0 -> 2.0.0)
npm run release:major

# Auto-detect based on commits
npm run release
```

### Push Release

```bash
git push --follow-tags origin main
```

The GitHub Actions release workflow will automatically create a GitHub release.

## Code Quality

### Linting

```bash
npm run lint          # Check for issues
npm run lint:fix      # Fix issues automatically
```

### Formatting

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

### Pre-commit Hooks

Husky runs lint-staged before each commit to ensure code quality:

- Lints TypeScript and JavaScript files
- Formats code with Prettier
- Prevents commits with errors

## Project Structure

```
playwright-mcp-claude/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI workflow
│       └── release.yml         # Release workflow
├── components/
│   ├── base-page.ts            # Base page object
│   ├── form-component.ts       # Form handler
│   ├── table-component.ts      # Table handler
│   └── modal-component.ts      # Modal handler
├── config/                      # Configuration files
├── helpers/
│   ├── auth.ts                 # Authentication helpers
│   ├── api.ts                  # API testing helpers
│   └── performance.ts          # Performance testing helpers
├── prompts/
│   ├── test-agent.ts           # Interactive test generator
│   └── catalog.md              # AI prompt catalog
├── tests/
│   ├── api/                    # API tests
│   ├── ui/                     # UI tests
│   ├── performance/            # Performance tests
│   ├── storybook/              # Storybook tests
│   ├── components/             # Component tests
│   └── agent/                  # Test agent tests
├── .env.example                # Environment variables template
├── .eslintrc.json              # ESLint configuration
├── .prettierrc.json            # Prettier configuration
├── .versionrc.json             # Version configuration
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies
└── README.md                   # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint:fix`
6. Commit using conventional commits: `git commit -m "feat: add feature"`
7. Push to your fork: `git push origin feature/my-feature`
8. Create a Pull Request

## License

MIT

## Support

For issues and questions:

- Create an issue on GitHub
- Check the [Prompt Catalog](prompts/catalog.md) for examples
- Review existing tests in the `tests/` directory

## Acknowledgments

- [Playwright](https://playwright.dev/) - Testing framework
- [Claude AI](https://www.anthropic.com/) - AI-powered test generation
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP integration
