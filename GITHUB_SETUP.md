# GitHub Repository Setup Guide

This guide will help you create a GitHub repository and connect your local project to it.

## Prerequisites

- GitHub account
- Git installed locally
- GitHub CLI (`gh`) installed (optional but recommended)

## Method 1: Using GitHub CLI (Recommended)

### Install GitHub CLI

**macOS:**

```bash
brew install gh
```

**Linux:**

```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora/RHEL
sudo dnf install gh
```

**Windows:**

```bash
winget install --id GitHub.cli
```

### Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts:

1. Choose "GitHub.com"
2. Choose "HTTPS" or "SSH" (HTTPS is easier)
3. Choose "Login with a web browser"
4. Copy the one-time code
5. Press Enter to open browser
6. Paste code and authorize

### Create Repository

```bash
# Navigate to project directory
cd /Users/gsypolt/github/claude-projects/playwright-mcp-claude

# Create repository on GitHub
gh repo create playwright-mcp-claude \
  --public \
  --source=. \
  --remote=origin \
  --description="AI-powered test generation using Claude and Playwright MCP Server"

# Push code
git add .
git commit -m "Initial commit: Playwright MCP Claude test framework"
git push -u origin main
```

**Options:**

- `--public` - Make repository public (use `--private` for private)
- `--source=.` - Use current directory as source
- `--remote=origin` - Set remote name to 'origin'
- `--description` - Repository description

### Verify Setup

```bash
# Check remote
git remote -v

# View repository in browser
gh repo view --web
```

## Method 2: Using GitHub Web UI + Git CLI

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Fill in details:
   - **Repository name**: `playwright-mcp-claude`
   - **Description**: `AI-powered test generation using Claude and Playwright MCP Server`
   - **Visibility**: Public or Private
   - **Do NOT initialize** with README, .gitignore, or license (already exists locally)
3. Click "Create repository"

### Step 2: Initialize Git (if not already done)

```bash
cd /Users/gsypolt/github/claude-projects/playwright-mcp-claude

# Initialize git (if needed)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Playwright MCP Claude test framework"
```

### Step 3: Connect to Remote

GitHub will show you commands after creating the repo. Use these:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/playwright-mcp-claude.git

# Or use SSH (if you have SSH keys set up)
git remote add origin git@github.com:YOUR_USERNAME/playwright-mcp-claude.git

# Rename branch to main (if needed)
git branch -M main

# Push code
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Verify

```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/playwright-mcp-claude.git (fetch)
# origin  https://github.com/YOUR_USERNAME/playwright-mcp-claude.git (push)
```

## Quick Setup Script

Save this as `setup-github.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 GitHub Repository Setup"
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓ GitHub CLI found${NC}"

    # Check if authenticated
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✓ Already authenticated${NC}"
    else
        echo -e "${YELLOW}⚠ Not authenticated, starting auth...${NC}"
        gh auth login
    fi

    # Create repository
    echo ""
    read -p "Repository name (default: playwright-mcp-claude): " REPO_NAME
    REPO_NAME=${REPO_NAME:-playwright-mcp-claude}

    read -p "Make repository public? (Y/n): " IS_PUBLIC
    IS_PUBLIC=${IS_PUBLIC:-Y}

    if [[ $IS_PUBLIC =~ ^[Yy]$ ]]; then
        VISIBILITY="--public"
    else
        VISIBILITY="--private"
    fi

    echo ""
    echo "Creating repository: $REPO_NAME"

    gh repo create "$REPO_NAME" \
        $VISIBILITY \
        --source=. \
        --remote=origin \
        --description="AI-powered test generation using Claude and Playwright MCP Server"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Repository created${NC}"

        # Commit and push
        read -p "Push code to GitHub? (Y/n): " DO_PUSH
        DO_PUSH=${DO_PUSH:-Y}

        if [[ $DO_PUSH =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Initial commit: Playwright MCP Claude test framework" || echo "No changes to commit"
            git push -u origin main

            echo -e "${GREEN}✓ Code pushed to GitHub${NC}"
            echo ""
            echo "View your repository:"
            gh repo view --web
        fi
    else
        echo "Failed to create repository"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ GitHub CLI not found${NC}"
    echo "Install with: brew install gh"
    echo "Or create repository manually at: https://github.com/new"
fi
```

Make it executable and run:

```bash
chmod +x setup-github.sh
./setup-github.sh
```

## After Repository Creation

### Add Status Badges to README

Update `README.md` with badges:

```markdown
# Playwright MCP Claude - AI-Powered Test Framework

![CI](https://github.com/YOUR_USERNAME/playwright-mcp-claude/actions/workflows/ci.yml/badge.svg)
![Test Agents](https://github.com/YOUR_USERNAME/playwright-mcp-claude/actions/workflows/test-agents.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

...rest of README...
```

### Enable GitHub Actions

GitHub Actions should be enabled by default. Verify:

1. Go to repository on GitHub
2. Click "Actions" tab
3. If prompted, click "I understand my workflows, go ahead and enable them"

### Set Up Branch Protection (Optional)

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date
   - Select: `lint`, `test`, `test-agents`
   - ✅ Require pull request reviews (optional)

### First Pull Request

Test the CI/CD workflow:

```bash
# Create feature branch
git checkout -b test-ci-workflow

# Make a small change
echo "# Testing CI" >> CI_SETUP_SUMMARY.md

# Commit and push
git add .
git commit -m "test: verify CI workflow"
git push -u origin test-ci-workflow

# Create PR using GitHub CLI
gh pr create \
  --title "Test CI Workflow" \
  --body "Testing automated CI/CD workflows"

# Or create PR on GitHub web
gh pr view --web
```

## Troubleshooting

### Authentication Issues

```bash
# Re-authenticate
gh auth logout
gh auth login

# Or set up SSH keys
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings → SSH and GPG keys
```

### Remote Already Exists

```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/playwright-mcp-claude.git
```

### Push Rejected

```bash
# If repository already has commits
git pull origin main --allow-unrelated-histories
git push -u origin main

# Or force push (⚠️ dangerous - only if you're sure)
git push -u origin main --force
```

### Large Files

If you have large files:

```bash
# Check file sizes
find . -type f -size +50M

# Add to .gitignore
echo "large-file.mp4" >> .gitignore

# Remove from git
git rm --cached large-file.mp4
```

## Useful Commands

```bash
# View repository
gh repo view --web

# Clone repository
gh repo clone YOUR_USERNAME/playwright-mcp-claude

# Create PR
gh pr create --title "Feature" --body "Description"

# View PRs
gh pr list

# Check CI status
gh run list

# View workflow logs
gh run view

# Repository info
gh repo view

# Enable/disable features
gh repo edit --enable-issues
gh repo edit --enable-wiki
```

## Next Steps

After creating repository:

1. ✅ Push code to GitHub
2. ✅ Enable GitHub Actions
3. ✅ Add status badges to README
4. ✅ Set up branch protection (optional)
5. ✅ Create first PR to test CI/CD
6. ✅ Invite collaborators (if needed)

## Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Git Documentation](https://git-scm.com/doc)
