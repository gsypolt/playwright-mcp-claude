# Quick Start Guide

Get up and running with Playwright MCP Claude in 5 minutes.

## 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd playwright-mcp-claude

# Install dependencies (first time)
npm install

# Install Playwright browsers
npx playwright install

# Set up environment variables
cp .env.example .env
```

Edit `.env` with your configuration.

## 2. Run Your First Test

### Option A: Use the Interactive Agent

```bash
npx ts-node prompts/test-agent.ts
```

Follow the prompts:

1. Select test type (API, UI, Performance, etc.)
2. Enter test name
3. Enter test description
4. The agent generates your test file

### Option B: Run Example Tests

```bash
# Run all tests
npm test

# Run specific test type
npm run test:api
npm run test:ui
npm run test:performance
```

## 3. Create Your First Test Manually

Create [tests/ui/my-test.ui.spec.ts](tests/ui/my-test.ui.spec.ts):

```typescript
import { test, expect } from '@playwright/test';
import { BasePage } from '@/components/base-page';

test('my first test', async ({ page }) => {
  const basePage = new BasePage(page);

  await basePage.goto('https://example.com');
  await basePage.waitForReady();

  const title = await basePage.getTitle();
  expect(title).toContain('Example');
});
```

Run it:

```bash
npm test tests/ui/my-test.ui.spec.ts
```

## 4. Use AI to Generate Tests

### Step 1: Choose a Prompt

Open [prompts/catalog.md](prompts/catalog.md) and choose a prompt template.

### Step 2: Customize the Prompt

Replace placeholders with your specific values:

```
Create a Playwright UI test for user login flow:

Login Page URL: https://myapp.com/login
Elements:
- Email field: input[name="email"]
- Password field: input[name="password"]
- Submit button: button[type="submit"]

The test should:
- Navigate to login page
- Fill in credentials
- Submit form
- Verify successful login
```

### Step 3: Generate Test with Claude

Use Claude AI (via MCP or API) to generate the test based on your prompt.

### Step 4: Save and Run

Save the generated test and run it:

```bash
npm test
```

## 5. Common Testing Patterns

### API Testing

```typescript
import { ApiHelper } from '@/helpers/api';

const apiHelper = new ApiHelper(request);
const response = await apiHelper.get('/users');
expect(response.status).toBe(200);
```

### Login Testing

```typescript
import { genericLogin } from '@/helpers/auth';

await genericLogin(page, {
  email: 'user@example.com',
  password: 'password',
});
```

### Form Testing

```typescript
import { FormComponent } from '@/components/form-component';

const form = new FormComponent(page, '#myform');
await form.fillByLabel('Email', 'test@example.com');
await form.submit();
```

### Performance Testing

```typescript
import { measurePageLoad } from '@/helpers/performance';

const metrics = await measurePageLoad(page);
expect(metrics.loadTime).toBeLessThan(3000);
```

## 6. View Test Results

### HTML Report

```bash
npm run report
```

Opens an interactive HTML report in your browser.

### Watch Tests in UI Mode

```bash
npm run test:ui
```

Opens Playwright's UI mode for interactive debugging.

## 7. Next Steps

- Read the full [README.md](README.md)
- Explore [prompts/catalog.md](prompts/catalog.md) for more examples
- Check out example tests in [tests/](tests/)
- Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Common Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/ui/my-test.ui.spec.ts

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# Run tests in UI mode
npm run test:ui

# Run linter
npm run lint

# Format code
npm run format

# Generate test with agent
npx ts-node prompts/test-agent.ts
```

## Troubleshooting

### Tests failing with "baseURL is not set"

Update `.env` file:

```env
BASE_URL=http://localhost:3000
```

### Authentication tests failing

Update credentials in `.env`:

```env
TEST_USER_EMAIL=your-email
TEST_USER_PASSWORD=your-password
```

### Playwright browsers not installed

```bash
npx playwright install
```

### TypeScript errors

```bash
npm install
```

## Need Help?

- Check the [README.md](README.md)
- Review [prompts/catalog.md](prompts/catalog.md)
- Look at example tests in [tests/](tests/)
- Create an issue on GitHub
