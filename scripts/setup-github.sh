#!/bin/bash

# GitHub Repository Setup Script
# Automates the creation and connection of GitHub repository

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "╔══════════════════════════════════════════════╗"
echo "║  GitHub Repository Setup                     ║"
echo "║  Playwright MCP Claude                       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}✗ GitHub CLI not found${NC}"
    echo ""
    echo "Install GitHub CLI:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   sudo apt install gh  (or: sudo dnf install gh)"
    echo "  Windows: winget install --id GitHub.cli"
    echo ""
    echo "Or create repository manually at: https://github.com/new"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI found${NC}"

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠ Not authenticated with GitHub${NC}"
    echo ""
    echo "Starting authentication..."
    gh auth login
    echo ""
fi

echo -e "${GREEN}✓ Authenticated with GitHub${NC}"
echo ""

# Get current username
GITHUB_USER=$(gh api user -q .login)
echo -e "${BLUE}GitHub user: $GITHUB_USER${NC}"
echo ""

# Repository configuration
read -p "Repository name (default: playwright-mcp-claude): " REPO_NAME
REPO_NAME=${REPO_NAME:-playwright-mcp-claude}

read -p "Make repository public? (Y/n): " IS_PUBLIC
IS_PUBLIC=${IS_PUBLIC:-Y}

if [[ $IS_PUBLIC =~ ^[Yy]$ ]]; then
    VISIBILITY="--public"
    VISIBILITY_TEXT="public"
else
    VISIBILITY="--private"
    VISIBILITY_TEXT="private"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Repository Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Name:       $REPO_NAME"
echo "Owner:      $GITHUB_USER"
echo "Visibility: $VISIBILITY_TEXT"
echo "URL:        https://github.com/$GITHUB_USER/$REPO_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Proceed with creation? (Y/n): " PROCEED
PROCEED=${PROCEED:-Y}

if [[ ! $PROCEED =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Creating repository..."

# Check if repository already exists
if gh repo view "$GITHUB_USER/$REPO_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠ Repository already exists${NC}"
    echo ""
    read -p "Use existing repository? (Y/n): " USE_EXISTING
    USE_EXISTING=${USE_EXISTING:-Y}

    if [[ ! $USE_EXISTING =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi

    # Add remote if not exists
    if ! git remote get-url origin &> /dev/null; then
        echo "Adding remote 'origin'..."
        git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
        echo -e "${GREEN}✓ Remote added${NC}"
    else
        echo -e "${GREEN}✓ Remote already exists${NC}"
    fi
else
    # Create repository
    gh repo create "$REPO_NAME" \
        $VISIBILITY \
        --source=. \
        --remote=origin \
        --description="AI-powered test generation using Claude and Playwright MCP Server"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Repository created${NC}"
    else
        echo -e "${RED}✗ Failed to create repository${NC}"
        exit 1
    fi
fi

echo ""

# Check git status
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Initializing git..."
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
fi

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "Uncommitted changes found."
    echo ""

    read -p "Commit all changes? (Y/n): " DO_COMMIT
    DO_COMMIT=${DO_COMMIT:-Y}

    if [[ $DO_COMMIT =~ ^[Yy]$ ]]; then
        git add .

        read -p "Commit message (default: 'Initial commit: Playwright MCP Claude test framework'): " COMMIT_MSG
        COMMIT_MSG=${COMMIT_MSG:-"Initial commit: Playwright MCP Claude test framework"}

        git commit -m "$COMMIT_MSG"
        echo -e "${GREEN}✓ Changes committed${NC}"
    fi
fi

echo ""

# Push to GitHub
read -p "Push to GitHub? (Y/n): " DO_PUSH
DO_PUSH=${DO_PUSH:-Y}

if [[ $DO_PUSH =~ ^[Yy]$ ]]; then
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)

    if [ -z "$CURRENT_BRANCH" ]; then
        # No branch yet, create main
        git branch -M main
        CURRENT_BRANCH="main"
    fi

    echo "Pushing to origin/$CURRENT_BRANCH..."

    # Try to push
    if git push -u origin "$CURRENT_BRANCH" 2>&1; then
        echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
    else
        echo -e "${YELLOW}⚠ Push failed, trying with --force-with-lease${NC}"
        read -p "Force push? (y/N): " FORCE_PUSH
        if [[ $FORCE_PUSH =~ ^[Yy]$ ]]; then
            git push -u origin "$CURRENT_BRANCH" --force-with-lease
            echo -e "${GREEN}✓ Code force pushed to GitHub${NC}"
        else
            echo -e "${RED}✗ Push cancelled${NC}"
        fi
    fi
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Setup Complete!                             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Repository created successfully!${NC}"
echo ""
echo "Repository URL:"
echo "  https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "Next steps:"
echo "  1. View repository:    gh repo view --web"
echo "  2. Enable Actions:     Go to Actions tab on GitHub"
echo "  3. Add badges:         Update README.md with status badges"
echo "  4. Create PR:          gh pr create --title 'Test' --body 'Testing CI'"
echo "  5. Set protection:     Settings → Branches → Add rule for main"
echo ""
echo "Quick commands:"
echo "  View repo:             gh repo view --web"
echo "  Clone repo:            gh repo clone $GITHUB_USER/$REPO_NAME"
echo "  Create PR:             gh pr create"
echo "  View runs:             gh run list"
echo ""

# Offer to open in browser
read -p "Open repository in browser? (Y/n): " OPEN_BROWSER
OPEN_BROWSER=${OPEN_BROWSER:-Y}

if [[ $OPEN_BROWSER =~ ^[Yy]$ ]]; then
    gh repo view --web
fi

echo ""
echo -e "${BLUE}Setup completed successfully!${NC}"
