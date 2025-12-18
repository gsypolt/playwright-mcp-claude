# Contributing to Playwright MCP Claude

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`

## Development Workflow

### Before You Start

- Check existing issues and pull requests
- Create an issue to discuss major changes
- Follow the project's code style and conventions

### Making Changes

1. Write clear, concise code
2. Follow TypeScript best practices
3. Add tests for new features
4. Update documentation as needed
5. Run linter: `npm run lint:fix`
6. Run tests: `npm test`

### Commit Guidelines

Use conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
chore: update dependencies
refactor: refactor code
perf: improve performance
style: format code
```

Examples:

```
feat: add Google OAuth helper
fix: resolve authentication timeout
docs: update README with examples
test: add API test suite
```

### Testing

- Write tests for all new features
- Ensure all tests pass: `npm test`
- Test across multiple browsers if applicable
- Add tests to appropriate directory:
  - `tests/api/` - API tests
  - `tests/ui/` - UI tests
  - `tests/performance/` - Performance tests
  - `tests/storybook/` - Storybook tests
  - `tests/components/` - Component tests

### Code Style

- Use TypeScript
- Follow ESLint rules
- Format with Prettier
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### Pull Request Process

1. Update README.md with details of changes
2. Update CHANGELOG.md following keep-a-changelog format
3. Ensure all tests pass
4. Ensure linter passes
5. Request review from maintainers
6. Address review feedback
7. Squash commits if needed

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Linter passing

## Checklist

- [ ] Code follows project style
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Conventional commits used
```

## Project Structure

```
playwright-mcp-claude/
├── components/         # Reusable page components
├── helpers/           # Helper functions
├── prompts/           # AI prompts and test agent
├── tests/             # Test files
│   ├── api/          # API tests
│   ├── ui/           # UI tests
│   ├── performance/  # Performance tests
│   ├── storybook/    # Storybook tests
│   └── components/   # Component tests
└── config/           # Configuration files
```

## Adding New Features

### Adding a New Helper

1. Create file in `helpers/` directory
2. Export functions with JSDoc comments
3. Add tests in appropriate test directory
4. Update README.md
5. Add examples to prompt catalog if applicable

### Adding a New Component

1. Create file in `components/` directory
2. Extend or use existing base classes
3. Add TypeScript types
4. Add tests
5. Update README.md with usage examples

### Adding a New Test Type

1. Add template to `prompts/test-agent.ts`
2. Create example test in appropriate directory
3. Add prompt to `prompts/catalog.md`
4. Update README.md
5. Add npm script to package.json if needed

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to all public functions
- Update prompt catalog with new examples
- Keep CHANGELOG.md up to date

## Questions?

- Create an issue for questions
- Tag maintainers for urgent issues
- Check existing documentation first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
