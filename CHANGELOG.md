# Changelog

All notable changes to this project will be documented in this file.

### [1.0.3](https://github.com/gsypolt/playwright-mcp-claude/compare/v1.0.2...v1.0.3) (2025-12-19)


### Bug Fixes

* convert database schema from MySQL to PostgreSQL syntax ([ced3028](https://github.com/gsypolt/playwright-mcp-claude/commit/ced3028c29e4cde27216be3bb4964a248028c3d7))
* resolve PR comment permission errors in test aggregation workflow ([6954405](https://github.com/gsypolt/playwright-mcp-claude/commit/6954405f3479ff7deeea4be7ba5c05cd3f05c374))

### [1.0.2](https://github.com/gsypolt/playwright-mcp-claude/compare/v1.0.1...v1.0.2) (2025-12-19)


### Bug Fixes

* replace deprecated create-release action with modern alternative ([3255d4e](https://github.com/gsypolt/playwright-mcp-claude/commit/3255d4e4c67166364f67168467196b06203083c6))

### 1.0.1 (2025-12-19)


### Bug Fixes

* add missing test directories and improve CI error reporting ([5a6efa7](https://github.com/gsypolt/playwright-mcp-claude/commit/5a6efa7eb856c8d91d10b71f5d55c6b136a73300))
* improve test error messages and add GitHub Actions permissions ([b1f9570](https://github.com/gsypolt/playwright-mcp-claude/commit/b1f9570495b967494f6b15c0d4b3cd000ef39213))
* resolve ESLint errors from CI workflow ([d1d1ffb](https://github.com/gsypolt/playwright-mcp-claude/commit/d1d1ffb94d5bc5ffac0652f7fe2ecd8f033e2ae4))
* resolve test failures and improve cross-platform compatibility ([ad4a03c](https://github.com/gsypolt/playwright-mcp-claude/commit/ad4a03ceebecc6cb79ff1126753277187372e877))


### Tests

* skip flaky aggregation-agent test in parallel runs ([bb1851f](https://github.com/gsypolt/playwright-mcp-claude/commit/bb1851f78b387cc427c6f3277ce5fe78bd2dcdc2))

## [1.0.0] - 2025-01-01

### Features

- Initial release of Playwright MCP Claude test framework
- AI-powered test generation using Claude and Playwright MCP Server
- Support for API, UI, Performance, Storybook, and Component tests
- Login helpers for Google, Microsoft, and generic authentication
- Reusable components: BasePage, FormComponent, TableComponent, ModalComponent
- Interactive test agent for test type selection
- Comprehensive prompt catalog
- GitHub Actions workflow for CI/CD
- ESLint and Prettier configuration
- Pre-commit hooks with Husky
- Automated release versioning
