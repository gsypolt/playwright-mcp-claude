# Setup Checklist

Use this checklist to ensure your Playwright MCP Claude project is properly set up.

## ✅ Initial Setup

- [ ] **Clone Repository**

  ```bash
  git clone <your-repo-url>
  cd playwright-mcp-claude
  ```

- [ ] **Install Node.js**
  - Verify version: `node --version` (Should be 18+)
  - Verify npm: `npm --version`

- [ ] **Install Dependencies**

  ```bash
  npm install
  ```

- [ ] **Install Playwright Browsers**
  ```bash
  npx playwright install
  ```

## ✅ Configuration

- [ ] **Create .env File**

  ```bash
  cp .env.example .env
  ```

- [ ] **Configure Environment Variables**
      Edit `.env` and set:
  - [ ] `BASE_URL` - Your application URL
  - [ ] `API_BASE_URL` - Your API URL
  - [ ] `TEST_USER_EMAIL` - Test user email
  - [ ] `TEST_USER_PASSWORD` - Test user password
  - [ ] `GOOGLE_EMAIL` - (Optional) Google account
  - [ ] `GOOGLE_PASSWORD` - (Optional) Google password
  - [ ] `MICROSOFT_EMAIL` - (Optional) Microsoft account
  - [ ] `MICROSOFT_PASSWORD` - (Optional) Microsoft password
  - [ ] `CLAUDE_API_KEY` - (Optional) Claude API key

- [ ] **Initialize Git Hooks**
  ```bash
  npm run prepare
  ```

## ✅ Verification

- [ ] **Run Setup Verification Script**

  ```bash
  ./scripts/verify-setup.sh
  ```

- [ ] **Check TypeScript Compilation**

  ```bash
  npx tsc --noEmit
  ```

- [ ] **Run Linter**

  ```bash
  npm run lint
  ```

- [ ] **Check Formatting**
  ```bash
  npm run format:check
  ```

## ✅ Test Execution

- [ ] **Run All Tests**

  ```bash
  npm test
  ```

- [ ] **Run Specific Test Types**
  - [ ] API tests: `npm run test:api`
  - [ ] UI tests: `npm run test:ui`
  - [ ] Performance tests: `npm run test:performance`
  - [ ] Agent tests: `npm run test:agent`

- [ ] **View Test Report**
  ```bash
  npm run report
  ```

## ✅ Test Generation

- [ ] **Try Interactive Agent**

  ```bash
  npx ts-node prompts/test-agent.ts
  ```

  - [ ] Select a test type
  - [ ] Enter test name
  - [ ] Enter description
  - [ ] Verify test file created
  - [ ] Run generated test

- [ ] **Review Prompt Catalog**
  - [ ] Open `prompts/catalog.md`
  - [ ] Read through available prompts
  - [ ] Bookmark for future reference

## ✅ Development Setup

- [ ] **IDE Configuration**
  - [ ] Install ESLint extension
  - [ ] Install Prettier extension
  - [ ] Install TypeScript extension
  - [ ] Configure auto-format on save

- [ ] **Git Configuration**
  - [ ] Set up Git user: `git config user.name "Your Name"`
  - [ ] Set up Git email: `git config user.email "your@email.com"`
  - [ ] Test pre-commit hook by making a commit

## ✅ CI/CD Setup (GitHub)

- [ ] **Push to GitHub**

  ```bash
  git remote add origin <your-repo-url>
  git push -u origin main
  ```

- [ ] **Verify GitHub Actions**
  - [ ] Check `.github/workflows/ci.yml` exists
  - [ ] Check `.github/workflows/release.yml` exists
  - [ ] View Actions tab on GitHub
  - [ ] Verify CI workflow runs on push

- [ ] **Configure GitHub Secrets** (if needed)
  - [ ] Add `CLAUDE_API_KEY` to repository secrets
  - [ ] Add any other sensitive credentials

## ✅ Documentation Review

- [ ] **Read Documentation**
  - [ ] [README.md](README.md) - Main documentation
  - [ ] [QUICKSTART.md](QUICKSTART.md) - Quick start guide
  - [ ] [FEATURES.md](FEATURES.md) - Feature overview
  - [ ] [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines
  - [ ] [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Project summary

- [ ] **Review Examples**
  - [ ] [tests/api/example.api.spec.ts](tests/api/example.api.spec.ts)
  - [ ] [tests/ui/example.ui.spec.ts](tests/ui/example.ui.spec.ts)
  - [ ] [tests/performance/example.performance.spec.ts](tests/performance/example.performance.spec.ts)
  - [ ] [tests/agent/test-agent.spec.ts](tests/agent/test-agent.spec.ts)

## ✅ Create Your First Test

- [ ] **Choose Test Type**
  - [ ] API test
  - [ ] UI test
  - [ ] Performance test
  - [ ] Component test

- [ ] **Generate Test**
  - [ ] Use interactive agent OR
  - [ ] Use AI prompt from catalog OR
  - [ ] Write manually

- [ ] **Implement Test**
  - [ ] Write test logic
  - [ ] Use helpers and components
  - [ ] Add assertions

- [ ] **Run Test**

  ```bash
  npm test path/to/your/test.spec.ts
  ```

- [ ] **Debug if Needed**
  - [ ] Use UI mode: `npm run test:ui`
  - [ ] Use headed mode: `npm run test:headed`
  - [ ] Use debug mode: `npm run test:debug`

## ✅ Release Setup

- [ ] **Make Changes**
  - [ ] Use conventional commits
  - [ ] Follow commit message format

- [ ] **Create First Release**

  ```bash
  npm run release
  git push --follow-tags origin main
  ```

- [ ] **Verify Release**
  - [ ] Check GitHub releases
  - [ ] Review CHANGELOG.md
  - [ ] Verify version in package.json

## 🎉 Setup Complete!

If you've checked all items above, your setup is complete!

### Next Steps

1. **Generate more tests** using the interactive agent
2. **Explore the prompt catalog** for AI-generated tests
3. **Read the documentation** to learn advanced features
4. **Contribute** to the project (see CONTRIBUTING.md)

### Quick Commands Reference

```bash
# Run tests
npm test

# Generate test
npx ts-node prompts/test-agent.ts

# View report
npm run report

# Format code
npm run format

# Create release
npm run release
```

### Getting Help

- Check [README.md](README.md)
- Review [QUICKSTART.md](QUICKSTART.md)
- Browse [prompts/catalog.md](prompts/catalog.md)
- Create a GitHub issue

### Troubleshooting

**Tests failing?**

- Check `.env` configuration
- Verify BASE_URL is correct
- Ensure application is running

**Linting errors?**

- Run `npm run lint:fix`
- Check ESLint configuration

**TypeScript errors?**

- Run `npm install`
- Check tsconfig.json

**Playwright issues?**

- Run `npx playwright install`
- Update Playwright: `npm update @playwright/test`
