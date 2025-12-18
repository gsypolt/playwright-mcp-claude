#!/bin/bash

# Playwright MCP Claude - Setup Verification Script
# This script verifies that the project is correctly set up

set -e

echo "================================="
echo "Playwright MCP Claude Setup Verification"
echo "================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "  Node.js: $NODE_VERSION"

# Check npm version
echo "✓ Checking npm version..."
NPM_VERSION=$(npm --version)
echo "  npm: $NPM_VERSION"

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  Dependencies: Installed"
else
    echo "  Dependencies: NOT INSTALLED"
    echo "  Run: npm install"
    exit 1
fi

# Check if Playwright is installed
echo "✓ Checking Playwright browsers..."
if npx playwright --version > /dev/null 2>&1; then
    PLAYWRIGHT_VERSION=$(npx playwright --version)
    echo "  Playwright: $PLAYWRIGHT_VERSION"
else
    echo "  Playwright: NOT INSTALLED"
    echo "  Run: npx playwright install"
    exit 1
fi

# Check .env file
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "  .env file: Found"
else
    echo "  .env file: NOT FOUND"
    echo "  Run: cp .env.example .env"
    echo "  Then edit .env with your configuration"
fi

# Check TypeScript compilation
echo "✓ Checking TypeScript compilation..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "  TypeScript: OK"
else
    echo "  TypeScript: ERRORS FOUND"
    echo "  Run: npx tsc --noEmit for details"
fi

# Check ESLint
echo "✓ Checking ESLint configuration..."
if npm run lint > /dev/null 2>&1; then
    echo "  ESLint: OK"
else
    echo "  ESLint: Issues found"
    echo "  Run: npm run lint:fix"
fi

# Check directory structure
echo "✓ Checking directory structure..."
REQUIRED_DIRS=(
    "components"
    "helpers"
    "prompts"
    "tests/api"
    "tests/ui"
    "tests/performance"
    "tests/agent"
    ".github/workflows"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  $dir: OK"
    else
        echo "  $dir: MISSING"
    fi
done

# Check required files
echo "✓ Checking required files..."
REQUIRED_FILES=(
    "package.json"
    "playwright.config.ts"
    "tsconfig.json"
    ".eslintrc.json"
    ".prettierrc.json"
    "README.md"
    "QUICKSTART.md"
    "CONTRIBUTING.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  $file: OK"
    else
        echo "  $file: MISSING"
    fi
done

echo ""
echo "================================="
echo "Setup verification complete!"
echo "================================="
echo ""
echo "Next steps:"
echo "1. Configure .env file with your settings"
echo "2. Run: npm test"
echo "3. Generate a test: npx ts-node prompts/test-agent.ts"
echo "4. Read QUICKSTART.md for more information"
echo ""
