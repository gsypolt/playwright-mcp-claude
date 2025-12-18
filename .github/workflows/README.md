# GitHub Actions Workflows

This directory contains automated workflows for continuous integration and deployment.

## Workflows

### 1. CI Workflow ([ci.yml](ci.yml))

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **lint**: Code quality checks
   - ESLint
   - Prettier formatting check

2. **test**: Cross-browser testing
   - Matrix strategy: chromium, firefox, webkit
   - Runs all Playwright tests
   - Uploads test results and reports

3. **test-agents**: Agent integration tests
   - Runs comprehensive agent test suite
   - Validates test-agent and aggregation-agent
   - Uploads test results

**Commands:**
```bash
# What runs in CI
npm ci                           # Install dependencies
npm run lint                     # Lint check
npm run format:check             # Format check
npm test -- --project=chromium   # Run tests
npm run test:agents              # Run agent tests
```

### 2. Test Agents Workflow ([test-agents.yml](test-agents.yml))

**Triggers:**
- Pull requests to `main` or `develop` (when agent files change)
- Push to `main` or `develop` (when agent files change)
- Manual trigger via workflow_dispatch

**Path Filters:**
Only runs when these paths change:
- `prompts/**`
- `tests/agent/**`
- `scripts/test-agents.sh`
- `.github/workflows/test-agents.yml`

**Jobs:**

1. **agent-tests**: Full integration test suite
   - Runs `npm run test:agents`
   - Uploads test results and reports
   - Posts PR comment with results

2. **verify-agents-executable**: Agent startup verification
   - Verifies test-agent starts correctly
   - Verifies aggregation-agent starts correctly
   - Checks menu displays properly

3. **type-check**: TypeScript validation
   - Runs `npx tsc --noEmit`
   - Ensures no type errors

4. **summary**: Test summary
   - Aggregates all job results
   - Creates GitHub step summary
   - Fails if any job fails

**PR Comments:**

The workflow automatically posts comments on pull requests:

✅ **Success:**
```
## ✅ Agent Tests Passed

All agent integration tests completed successfully!

- ✅ Test agent working correctly
- ✅ Aggregation agent working correctly
- ✅ All file validations passed
- ✅ All directory checks passed
```

❌ **Failure:**
```
## ❌ Agent Tests Failed

Some agent tests did not pass. Please review the failures and fix them.
```

### 3. Release Workflow ([release.yml](release.yml))

**Triggers:**
- Push to `main` branch

**Jobs:**
- Runs full test suite
- Generates version and changelog
- Creates git tag
- Publishes GitHub release

### 4. Test with Aggregation Workflow ([test-with-aggregation.yml](test-with-aggregation.yml))

**Purpose:** Test results aggregation methods

**Jobs:**
- test-with-database
- test-with-json
- test-with-testdino
- analyze-results

## Manual Triggers

Some workflows support manual triggering:

1. Go to **Actions** tab in GitHub
2. Select the workflow
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

## Artifacts

All workflows upload artifacts for debugging:

| Artifact | Contains | Retention |
|----------|----------|-----------|
| `playwright-report-*` | HTML test reports | 30 days |
| `test-results-*` | Test results JSON | 30 days |
| `agent-test-results` | Agent test output | 30 days |
| `agent-test-report` | Agent test report | 30 days |

**Download artifacts:**
1. Go to workflow run
2. Scroll to **Artifacts** section
3. Click artifact name to download

## Status Badges

Add to README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/playwright-mcp-claude/actions/workflows/ci.yml/badge.svg)
![Test Agents](https://github.com/YOUR_USERNAME/playwright-mcp-claude/actions/workflows/test-agents.yml/badge.svg)
```

## Local Testing

Test what CI runs locally:

```bash
# Lint
npm run lint
npm run format:check

# Tests
npm test
npm run test:agents

# Type check
npx tsc --noEmit

# Install browsers (like CI does)
npx playwright install --with-deps chromium
```

## Debugging Failed Workflows

1. **View logs:**
   - Click on failed job
   - Expand failed step
   - Read error messages

2. **Download artifacts:**
   - Download test results
   - Download test reports
   - Review screenshots/videos

3. **Run locally:**
   - Reproduce same commands
   - Use same Node version (20)
   - Install dependencies with `npm ci`

4. **Common issues:**
   - Missing dependencies: Run `npm ci`
   - Type errors: Run `npx tsc --noEmit`
   - Lint errors: Run `npm run lint:fix`
   - Test failures: Run `npm test`

## Workflow Best Practices

✅ **DO:**
- Keep workflows fast (use caching)
- Use specific action versions
- Upload artifacts for debugging
- Add descriptive job names
- Use matrix for parallel testing

❌ **DON'T:**
- Use `actions/checkout@latest` (use `@v4`)
- Skip tests to make PR green
- Ignore failing workflows
- Commit without local testing
- Remove artifact uploads

## Secrets and Environment Variables

Required secrets (none currently):
- None required for agent tests
- Add in Settings → Secrets → Actions if needed

Environment variables:
- `CI=true` - Set automatically by GitHub Actions
- `NODE_ENV=test` - Set in workflows

## Performance

Current CI times (approximate):
- **lint**: ~30 seconds
- **test** (per browser): ~2-3 minutes
- **test-agents**: ~15 seconds
- **verify-agents-executable**: ~10 seconds
- **type-check**: ~20 seconds

Total for full CI: ~8-10 minutes (parallel execution)

## Contributing

When adding new workflows:

1. Test locally first
2. Use descriptive names
3. Add comments for complex steps
4. Update this README
5. Test in a PR before merging

## Support

For workflow issues:
- Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- Review workflow logs
- Check [Playwright CI documentation](https://playwright.dev/docs/ci)
