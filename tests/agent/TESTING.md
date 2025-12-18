# Agent Testing Guide

This guide explains how to test the interactive agents to ensure they're working as expected.

## Automated Tests

### Integration Tests

Run the comprehensive integration test suite:

```bash
npx playwright test tests/agent/agent-integration.spec.ts --project=chromium
```

**Tests Included:**
- ✅ Test agent starts and displays menu
- ✅ Test agent generates API test with valid input
- ✅ Aggregation agent starts and displays menu
- ✅ Test agent templates are valid TypeScript
- ✅ Test agent file exists and is valid
- ✅ Aggregation agent file exists and is valid
- ✅ All test template directories exist

### Unit Tests

Run the unit tests for test generation:

```bash
npx playwright test tests/agent/test-agent.spec.ts --project=chromium
```

**Note:** These tests validate template generation logic.

## Manual Testing

### Test Agent Manual Verification

1. **Start the test agent:**
   ```bash
   npx ts-node prompts/test-agent.ts
   ```

2. **Expected Output:**
   ```
   =================================
     Playwright Test Generator
     Powered by Claude + MCP
   =================================

   Select Test Type:
   1. API Test - Test REST/GraphQL endpoints
   2. UI Test - Test user interface and interactions
   3. Performance Test - Measure page load and performance metrics
   4. Storybook Test - Test Storybook components
   5. Web Component Test - Test individual web components

   Enter choice (1-5):
   ```

3. **Test Each Type:**

   **API Test:**
   - Enter: `1`
   - Test name: `manual-api-test`
   - Description: `Manual test for API endpoints`
   - Verify file created: `tests/api/manual-api-test.api.spec.ts`
   - Check content includes `ApiHelper`

   **UI Test:**
   - Enter: `2`
   - Test name: `manual-ui-test`
   - Description: `Manual test for UI interactions`
   - Verify file created: `tests/ui/manual-ui-test.ui.spec.ts`
   - Check content includes `BasePage`

   **Performance Test:**
   - Enter: `3`
   - Test name: `manual-performance-test`
   - Description: `Manual test for performance metrics`
   - Verify file created: `tests/performance/manual-performance-test.performance.spec.ts`
   - Check content includes `measurePageLoad`

   **Storybook Test:**
   - Enter: `4`
   - Test name: `manual-storybook-test`
   - Description: `Manual test for Storybook components`
   - Verify file created: `tests/storybook/manual-storybook-test.storybook.spec.ts`
   - Check content includes `storybook-preview-iframe`

   **Component Test:**
   - Enter: `5`
   - Test name: `manual-component-test`
   - Description: `Manual test for web components`
   - Verify file created: `tests/components/manual-component-test.component.spec.ts`
   - Check content includes `data-testid`

### Aggregation Agent Manual Verification

1. **Start the aggregation agent:**
   ```bash
   npm run setup:aggregation
   ```

2. **Expected Output:**
   ```
   📊 Test Results Aggregation Setup

   Choose your aggregation method:

   1. 🗄️  Self-Managed (Database + Grafana)
      • Full control and unlimited history
      • Custom Grafana dashboards
      • Advanced SQL queries
      • Setup time: 10-30 minutes

   2. 🚀 TestDino Platform
      • Zero infrastructure (managed service)
      • AI-powered failure analysis
      • Team collaboration features
      • Setup time: 5 minutes

   3. 📄 JSON Export (CI/CD)
      • Maximum flexibility
      • No runtime dependencies
      • Easy CI/CD integration
      • Setup time: 2 minutes

   4. ❌ None (Disable aggregation)

   Enter choice (1-4):
   ```

3. **Test Each Method:**

   **Database + Grafana:**
   - Enter: `1`
   - Database choice: `1` (PostgreSQL) or `2` (MySQL)
   - Docker choice: `Y` or `n`
   - Verify `.env` file is updated with `AGGREGATION_METHOD=database`
   - Verify instructions are provided

   **TestDino:**
   - Enter: `2`
   - API Key: `test-key` (for testing, won't actually upload)
   - Project ID: `test-project`
   - Verify `.env` file is updated with `AGGREGATION_METHOD=testdino`

   **JSON Export:**
   - Enter: `3`
   - Verify `.env` file is updated with `AGGREGATION_METHOD=json`
   - Verify next steps are displayed

   **None:**
   - Enter: `4`
   - Verify `.env` file is updated with `AGGREGATION_METHOD=none`

## Verification Checklist

After running tests, verify:

- [ ] Test agent creates files in correct directories
- [ ] Generated tests have valid TypeScript syntax
- [ ] Generated tests include appropriate imports
- [ ] Test names and descriptions are correctly inserted
- [ ] Aggregation agent updates `.env` file correctly
- [ ] Both agents display clear next steps
- [ ] Both agents handle invalid input gracefully
- [ ] Both agents can be interrupted with Ctrl+C

## Common Issues

### Issue: "Unknown file extension .ts"
**Solution:** Run `npm install ts-node --save-dev` and ensure tsconfig.json has CommonJS module setting.

### Issue: Agent doesn't start
**Solution:**
- Verify TypeScript is installed: `npm list typescript`
- Verify ts-node is installed: `npm list ts-node`
- Check for syntax errors: `npx tsc --noEmit`

### Issue: Generated tests have syntax errors
**Solution:** Check that templates in `prompts/test-agent.ts` are valid TypeScript.

### Issue: .env file not updated
**Solution:** Verify `.env` file exists and has write permissions.

## Clean Up Generated Tests

After manual testing, remove test files:

```bash
rm -f tests/api/manual-*.spec.ts
rm -f tests/ui/manual-*.spec.ts
rm -f tests/performance/manual-*.spec.ts
rm -f tests/storybook/manual-*.spec.ts
rm -f tests/components/manual-*.spec.ts
```

Or use the cleanup script:

```bash
find tests -name "manual-*.spec.ts" -delete
```

## Automated Test Results

Last test run results:

```bash
npx playwright test tests/agent/agent-integration.spec.ts --reporter=line --project=chromium
```

Expected output:
```
  7 passed (11.8s)
```

All integration tests should pass, verifying:
- ✅ Agents start correctly
- ✅ Menus display properly
- ✅ File generation works
- ✅ Templates are valid
- ✅ Required directories exist
