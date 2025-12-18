#!/bin/bash

# Connect to Existing GitHub Repository
# For: https://github.com/gsypolt/playwright-mcp-claude

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════╗"
echo "║  Connect to Existing GitHub Repository       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

REPO_URL="https://github.com/gsypolt/playwright-mcp-claude"

echo -e "${BLUE}Repository: $REPO_URL${NC}"
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
else
    echo -e "${GREEN}✓ Git already initialized${NC}"
fi

# Add remote
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠ Remote 'origin' already exists${NC}"
    CURRENT_URL=$(git remote get-url origin)
    echo "  Current: $CURRENT_URL"
    
    if [ "$CURRENT_URL" != "$REPO_URL.git" ]; then
        read -p "Update remote URL? (Y/n): " UPDATE_REMOTE
        UPDATE_REMOTE=${UPDATE_REMOTE:-Y}
        
        if [[ $UPDATE_REMOTE =~ ^[Yy]$ ]]; then
            git remote set-url origin "$REPO_URL.git"
            echo -e "${GREEN}✓ Remote URL updated${NC}"
        fi
    fi
else
    echo "Adding remote 'origin'..."
    git remote add origin "$REPO_URL.git"
    echo -e "${GREEN}✓ Remote added${NC}"
fi

echo ""

# Check for uncommitted changes
if [[ -n $(git status -s 2>/dev/null) ]] || [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "Preparing to commit..."
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        echo "Creating .gitignore..."
        cat > .gitignore << 'GITIGNORE'
node_modules/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/.env
dist/
*.log
.DS_Store
test-results.json
junit.xml
GITIGNORE
        git add .gitignore
    fi
    
    # Add all files
    echo "Adding files..."
    git add .
    
    # Commit
    read -p "Commit message (default: 'Initial commit: Playwright MCP Claude'): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Initial commit: Playwright MCP Claude"}
    
    git commit -m "$COMMIT_MSG" || echo "No new changes to commit"
    echo -e "${GREEN}✓ Changes committed${NC}"
fi

echo ""

# Set main branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$CURRENT_BRANCH" ] || [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Setting branch to 'main'..."
    git branch -M main
    echo -e "${GREEN}✓ Branch set to main${NC}"
fi

echo ""

# Pull first if remote has commits
echo "Checking remote repository..."
if git ls-remote --exit-code --heads origin main &>/dev/null; then
    echo -e "${YELLOW}⚠ Remote 'main' branch exists${NC}"
    echo ""
    echo "The remote repository may have commits."
    echo ""
    echo "Choose an option:"
    echo "  1) Pull and merge (recommended if remote has important files)"
    echo "  2) Force push (⚠️  OVERWRITES remote - use if remote is empty)"
    echo "  3) Cancel"
    echo ""
    read -p "Enter choice (1-3): " CHOICE
    
    case $CHOICE in
        1)
            echo ""
            echo "Pulling from remote..."
            git pull origin main --allow-unrelated-histories || {
                echo ""
                echo -e "${YELLOW}⚠ Merge conflicts detected${NC}"
                echo ""
                echo "Please resolve conflicts manually:"
                echo "  1. git status                  # See conflicted files"
                echo "  2. Edit conflicted files       # Resolve conflicts"
                echo "  3. git add .                   # Stage resolved files"
                echo "  4. git commit                  # Complete merge"
                echo "  5. git push origin main        # Push to GitHub"
                exit 1
            }
            echo -e "${GREEN}✓ Pulled and merged${NC}"
            
            echo ""
            echo "Pushing to GitHub..."
            git push -u origin main
            echo -e "${GREEN}✓ Code pushed${NC}"
            ;;
        2)
            echo ""
            echo -e "${YELLOW}⚠ WARNING: This will overwrite the remote repository${NC}"
            read -p "Are you sure? Type 'yes' to confirm: " CONFIRM
            
            if [ "$CONFIRM" = "yes" ]; then
                echo "Force pushing to GitHub..."
                git push -u origin main --force
                echo -e "${GREEN}✓ Code force pushed${NC}"
            else
                echo "Cancelled"
                exit 0
            fi
            ;;
        *)
            echo "Cancelled"
            exit 0
            ;;
    esac
else
    # Remote main doesn't exist, safe to push
    echo "Pushing to GitHub..."
    git push -u origin main
    echo -e "${GREEN}✓ Code pushed${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Successfully Connected!                     ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Repository URL:${NC}"
echo "  $REPO_URL"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. View repo:     gh repo view --web"
echo "  2. Enable Actions: Go to Actions tab on GitHub"
echo "  3. Create PR:     gh pr create"
echo ""
echo -e "${BLUE}Setup complete!${NC}"
