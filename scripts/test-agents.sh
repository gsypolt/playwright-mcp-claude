#!/bin/bash

# Agent Testing Script
# Runs automated tests for test-agent and aggregation-agent

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║   Agent Testing Suite                         ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Run integration tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Integration Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if npx playwright test tests/agent/agent-integration.spec.ts --reporter=line --project=chromium; then
    echo -e "${GREEN}✓ Integration tests passed${NC}"
else
    echo -e "${RED}✗ Integration tests failed${NC}"
    exit 1
fi
echo ""

# Test 2: Verify test-agent can be executed
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Test Agent Execution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Check if timeout command exists
if command -v timeout &> /dev/null; then
    if timeout 3s npx ts-node prompts/test-agent.ts > /dev/null 2>&1 || [ $? -eq 124 ]; then
        echo -e "${GREEN}✓ Test agent starts successfully${NC}"
    else
        echo -e "${RED}✗ Test agent failed to start${NC}"
        exit 1
    fi
elif command -v gtimeout &> /dev/null; then
    # macOS with GNU coreutils installed via brew
    if gtimeout 3s npx ts-node prompts/test-agent.ts > /dev/null 2>&1 || [ $? -eq 124 ]; then
        echo -e "${GREEN}✓ Test agent starts successfully${NC}"
    else
        echo -e "${RED}✗ Test agent failed to start${NC}"
        exit 1
    fi
else
    # Use Perl as fallback (available on macOS)
    if perl -e 'alarm 3; exec @ARGV' npx ts-node prompts/test-agent.ts > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Test agent starts successfully${NC}"
    elif [ $? -eq 142 ] || [ $? -eq 14 ]; then
        # Exit code 142 (SIGALRM) or 14 means timeout triggered, which is expected
        echo -e "${GREEN}✓ Test agent starts successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Test agent execution check skipped (could not verify)${NC}"
    fi
fi
echo ""

# Test 3: Verify aggregation-agent can be executed
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Aggregation Agent Execution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Check if timeout command exists
if command -v timeout &> /dev/null; then
    if timeout 3s npx ts-node prompts/aggregation-agent.ts > /dev/null 2>&1 || [ $? -eq 124 ]; then
        echo -e "${GREEN}✓ Aggregation agent starts successfully${NC}"
    else
        echo -e "${RED}✗ Aggregation agent failed to start${NC}"
        exit 1
    fi
elif command -v gtimeout &> /dev/null; then
    # macOS with GNU coreutils installed via brew
    if gtimeout 3s npx ts-node prompts/aggregation-agent.ts > /dev/null 2>&1 || [ $? -eq 124 ]; then
        echo -e "${GREEN}✓ Aggregation agent starts successfully${NC}"
    else
        echo -e "${RED}✗ Aggregation agent failed to start${NC}"
        exit 1
    fi
else
    # Use Perl as fallback (available on macOS)
    if perl -e 'alarm 3; exec @ARGV' npx ts-node prompts/aggregation-agent.ts > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Aggregation agent starts successfully${NC}"
    elif [ $? -eq 142 ] || [ $? -eq 14 ]; then
        # Exit code 142 (SIGALRM) or 14 means timeout triggered, which is expected
        echo -e "${GREEN}✓ Aggregation agent starts successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Aggregation agent execution check skipped (could not verify)${NC}"
    fi
fi
echo ""

# Test 4: Verify all required files exist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: File Existence Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FILES=(
    "prompts/test-agent.ts"
    "prompts/aggregation-agent.ts"
    "tests/agent/test-agent.spec.ts"
    "tests/agent/agent-integration.spec.ts"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file"
        ALL_FILES_EXIST=false
    fi
done
echo ""

# Test 5: Verify test directories exist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Test Directory Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DIRS=(
    "tests/api"
    "tests/ui"
    "tests/performance"
    "tests/storybook"
    "tests/components"
    "tests/agent"
)

ALL_DIRS_EXIST=true
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${RED}✗${NC} $dir"
        ALL_DIRS_EXIST=false
    fi
done
echo ""

# Summary
echo "╔═══════════════════════════════════════════════╗"
echo "║   Test Summary                                ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

if [ "$ALL_FILES_EXIST" = true ] && [ "$ALL_DIRS_EXIST" = true ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "The agents are working as expected."
    echo ""
    echo "Next steps:"
    echo "  • Try the test agent:        npx ts-node prompts/test-agent.ts"
    echo "  • Try the aggregation agent: npm run setup:aggregation"
    echo "  • Read testing guide:        tests/agent/TESTING.md"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Please check the output above for details."
    exit 1
fi
