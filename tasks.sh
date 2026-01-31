#!/usr/bin/env bash

# Unified task script for vscode-ege extension
# Supports: build, publish, and related operations

set -e

cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
TASK=""
DRY_RUN=false
AUTO_YES=false
PRE_RELEASE=false
FORCE_MODE=false
SKIP_INSTALL=false

show_help() {
    echo "Usage: $0 <TASK> [OPTIONS]"
    echo ""
    echo "Tasks:"
    echo "  -b, --build        Build the extension (create .vsix file)"
    echo "  -p, --publish      Build and publish to VS Code Marketplace"
    echo ""
    echo "Options:"
    echo "  -n, --dry-run      Dry run mode, build but don't publish"
    echo "  -y, --yes          Skip all prompts and proceed automatically"
    echo "  --pre-release      Publish as pre-release version"
    echo "  -f, --force        Force mode, prompt to ignore validation errors"
    echo "  --skip-install     Skip npm install step"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -b              # Build only"
    echo "  $0 -p              # Interactive publish"
    echo "  $0 -p -n           # Dry run publish (build only)"
    echo "  $0 -p -y           # Auto-confirm publish"
    echo "  $0 -p --pre-release # Publish as pre-release"
    echo ""
}

while [[ $# -gt 0 ]]; do
    case $1 in
    -b | --build)
        TASK="build"
        shift
        ;;
    -p | --publish)
        TASK="publish"
        shift
        ;;
    -n | --dry-run)
        DRY_RUN=true
        shift
        ;;
    -y | --yes)
        AUTO_YES=true
        shift
        ;;
    --pre-release)
        PRE_RELEASE=true
        shift
        ;;
    -f | --force)
        FORCE_MODE=true
        shift
        ;;
    --skip-install)
        SKIP_INSTALL=true
        shift
        ;;
    -h | --help)
        show_help
        exit 0
        ;;
    *)
        echo -e "${RED}Error: Unknown option $1${NC}"
        echo "Use -h or --help for usage information"
        exit 1
        ;;
    esac
done

# Helper functions
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

ask_yes_no() {
    if [ "$AUTO_YES" = true ]; then
        return 0
    fi

    local prompt="$1"
    while true; do
        read -p "$prompt (y/n): " yn
        case $yn in
        [Yy]*) return 0 ;;
        [Nn]*) return 1 ;;
        *) echo "Please answer yes or no." ;;
        esac
    done
}

# Install a utility using system package manager
install_util() {
    local package="$1"
    if command -v brew &>/dev/null; then
        brew install "$package"
    elif command -v apt &>/dev/null; then
        sudo apt install -y "$package"
    elif command -v yum &>/dev/null; then
        sudo yum install -y "$package"
    elif command -v winget &>/dev/null; then
        winget install "$package"
    else
        error "No supported package manager found"
        return 1
    fi
}

# Get version from package.json
get_version() {
    grep -o '"version": *"[^"]*"' package.json | sed 's/"version": *"\(.*\)"/\1/'
}

# Get default branch name
get_default_branch() {
    git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "master"
}

# Check and install dependencies
check_dependencies() {
    info "Checking dependencies..."

    # Check node
    if ! command -v node &>/dev/null; then
        warning "node is not installed. Attempting to install..."
        if command -v winget &>/dev/null; then
            winget install OpenJS.NodeJS.LTS
            echo "Node.js installed. Please restart your terminal and run this script again."
            exit 0
        else
            install_util nodejs || install_util node
        fi
    fi

    if ! command -v node &>/dev/null; then
        error "Failed to install Node.js. Please install it manually."
        exit 1
    fi
    success "node: $(node --version)"

    # Check npm
    if ! command -v npm &>/dev/null; then
        error "npm is not found. It should come with Node.js."
        exit 1
    fi
    success "npm: $(npm --version)"

    # Check vsce
    if ! command -v vsce &>/dev/null; then
        warning "vsce is not installed. Installing..."
        npm install -g @vscode/vsce
    fi

    if ! command -v vsce &>/dev/null; then
        error "Failed to install vsce. Please run: npm install -g @vscode/vsce"
        exit 1
    fi
    success "vsce: $(vsce --version)"

    # Check git (required for publish)
    if [ "$TASK" = "publish" ]; then
        if ! command -v git &>/dev/null; then
            error "git is not installed. Please install git first."
            exit 1
        fi
        success "git: $(git --version | cut -d' ' -f3)"
    fi
}

# Build the extension
do_build() {
    # Install dependencies
    if [ "$SKIP_INSTALL" = false ]; then
        info "Installing dependencies..."
        npm install
        success "Dependencies installed"
    else
        info "Skipping npm install (--skip-install)"
    fi

    # Clean previous builds
    info "Cleaning previous builds..."
    rm -f *.vsix
    rm -rf dist

    # Build and package
    info "Building and packaging extension..."
    vsce package
    success "Extension packaged"

    # Find the generated .vsix file
    VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)
    if [ -z "$VSIX_FILE" ]; then
        error "No .vsix file found. Build may have failed."
        exit 1
    fi

    success "Created: ${VSIX_FILE}"
    echo "$VSIX_FILE"
}

# Publish the extension
do_publish() {
    local SKIP_TAG=false

    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  EGE VS Code Extension - Publish${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""

    if [ "$DRY_RUN" = true ]; then
        warning "Running in DRY-RUN mode - no actual publish will occur"
        echo ""
    fi

    # Check for uncommitted changes
    info "Checking for uncommitted changes..."
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        MODIFIED_FILES=$(git diff-index --name-only HEAD --)

        # Check if only lock files are modified
        FILTERED_FILES=$(echo "$MODIFIED_FILES" | grep -v "package-lock.json" | grep -v "pnpm-lock.yaml" || true)

        if [ -z "$FILTERED_FILES" ]; then
            warning "Only lock files have uncommitted changes"
            if ! ask_yes_no "Continue publishing?"; then
                error "Please commit or stash your changes before publishing"
                exit 1
            fi
        else
            error "There are uncommitted changes:"
            echo ""
            echo "$MODIFIED_FILES" | sed 's/^/  - /'
            echo ""

            if [ "$FORCE_MODE" = true ]; then
                if ! ask_yes_no "$(echo -e "${YELLOW}[FORCE]${NC}") Ignore uncommitted changes?"; then
                    exit 1
                fi
                warning "Continuing with uncommitted changes"
            else
                error "Please commit or stash your changes before publishing"
                exit 1
            fi
        fi
    else
        success "Working directory is clean"
    fi

    # Get version and prepare tag
    VERSION=$(get_version)
    if [ -z "$VERSION" ]; then
        error "Failed to get version from package.json"
        exit 1
    fi

    # Tag format: v1.0.3 or v1.0.3-pre (matches release.yml expectations)
    if [ "$PRE_RELEASE" = true ]; then
        TAG_NAME="v${VERSION}-pre"
        RELEASE_TYPE="Pre-release"
    else
        TAG_NAME="v${VERSION}"
        RELEASE_TYPE="Stable"
    fi

    info "Version: ${VERSION}"
    info "Tag: ${TAG_NAME}"
    info "Release type: ${RELEASE_TYPE}"

    # Check if tag already exists
    if [ "$DRY_RUN" = false ]; then
        info "Checking if tag ${TAG_NAME} already exists..."

        if git ls-remote --tags origin 2>/dev/null | grep -q "refs/tags/${TAG_NAME}$"; then
            warning "Tag ${TAG_NAME} already exists on remote"

            if ask_yes_no "Skip tag creation and continue?"; then
                SKIP_TAG=true
            elif [ "$FORCE_MODE" = true ]; then
                if ask_yes_no "$(echo -e "${YELLOW}[FORCE]${NC}") Delete remote tag and recreate?"; then
                    git push origin ":refs/tags/${TAG_NAME}" || true
                    git tag -d "${TAG_NAME}" 2>/dev/null || true
                    success "Remote tag deleted"
                else
                    exit 1
                fi
            else
                error "Please update the version in package.json"
                error "Or use -f/--force to delete the existing tag"
                exit 1
            fi
        else
            success "Tag ${TAG_NAME} does not exist"
        fi
    fi

    # Check branch status
    DEFAULT_BRANCH=$(get_default_branch)
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || git rev-parse --abbrev-ref HEAD)

    info "Default branch: ${DEFAULT_BRANCH}"
    info "Current branch: ${CURRENT_BRANCH}"

    if [ "$CURRENT_BRANCH" != "$DEFAULT_BRANCH" ]; then
        if [ "$PRE_RELEASE" = true ]; then
            warning "Not on default branch (${DEFAULT_BRANCH})"
            if ! ask_yes_no "Continue pre-release from ${CURRENT_BRANCH}?"; then
                exit 0
            fi
        elif [ "$FORCE_MODE" = true ]; then
            warning "Not on default branch (${DEFAULT_BRANCH})"
            if ! ask_yes_no "$(echo -e "${YELLOW}[FORCE]${NC}") Continue stable release from ${CURRENT_BRANCH}?"; then
                exit 1
            fi
        else
            error "Not on default branch (${DEFAULT_BRANCH})"
            error "Switch to ${DEFAULT_BRANCH} or use --pre-release/-f flag"
            exit 1
        fi
    else
        success "On default branch"
    fi

    # Check sync with remote
    info "Checking sync with remote..."
    git fetch origin "${CURRENT_BRANCH}" 2>/dev/null || true

    LOCAL=$(git rev-parse @ 2>/dev/null || echo "unknown")
    REMOTE=$(git rev-parse "@{u}" 2>/dev/null || echo "unknown")

    if [ "$LOCAL" != "unknown" ] && [ "$REMOTE" != "unknown" ]; then
        if [ "$LOCAL" = "$REMOTE" ]; then
            success "Local branch is up to date"
        else
            BASE=$(git merge-base @ "@{u}" 2>/dev/null || echo "unknown")
            if [ "$LOCAL" = "$BASE" ]; then
                warning "Local branch is behind remote"
                if [ "$FORCE_MODE" != true ]; then
                    error "Please pull first: git pull"
                    exit 1
                fi
                if ! ask_yes_no "$(echo -e "${YELLOW}[FORCE]${NC}") Continue with outdated branch?"; then
                    exit 1
                fi
            elif [ "$REMOTE" = "$BASE" ]; then
                warning "Local has unpushed commits"
                if [ "$PRE_RELEASE" != true ] && [ "$FORCE_MODE" != true ]; then
                    error "Please push first: git push"
                    exit 1
                fi
            else
                warning "Branches have diverged"
                if [ "$FORCE_MODE" != true ]; then
                    error "Please resolve divergence first"
                    exit 1
                fi
            fi
        fi
    fi

    # Show summary
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Publish Summary${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  Package:       ege"
    echo "  Version:       ${VERSION}"
    echo "  Git tag:       ${TAG_NAME}"
    echo "  Release type:  ${RELEASE_TYPE}"
    echo "  Dry run:       $([ "$DRY_RUN" = true ] && echo "Yes" || echo "No")"
    echo ""

    if ! ask_yes_no "Proceed with publishing?"; then
        info "Cancelled"
        exit 0
    fi

    # Build
    info "Building extension..."
    VSIX_FILE=$(do_build)
    VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)

    if [ -z "$VSIX_FILE" ]; then
        error "Build failed - no .vsix file found"
        exit 1
    fi

    success "Built: ${VSIX_FILE}"

    # Publish to marketplace
    if [ "$DRY_RUN" = false ]; then
        info "Publishing to VS Code Marketplace..."

        if [ "$PRE_RELEASE" = true ]; then
            vsce publish --pre-release --packagePath "$VSIX_FILE"
        else
            vsce publish --packagePath "$VSIX_FILE"
        fi

        success "Published to VS Code Marketplace!"
    else
        info "[DRY-RUN] Would publish: vsce publish $([ "$PRE_RELEASE" = true ] && echo "--pre-release ")--packagePath ${VSIX_FILE}"
    fi

    # Create and push tag
    if [ "$DRY_RUN" = false ]; then
        if [ "$SKIP_TAG" = true ]; then
            info "Skipping tag creation (already exists)"
        else
            info "Creating tag ${TAG_NAME}..."
            git tag -a "${TAG_NAME}" -m "Release ege v${VERSION}$([ "$PRE_RELEASE" = true ] && echo " (pre-release)")"
            success "Tag created: ${TAG_NAME}"

            if ask_yes_no "Push tag to remote?"; then
                git push origin "${TAG_NAME}"
                success "Tag pushed to remote"
            else
                warning "Tag not pushed. Run: git push origin ${TAG_NAME}"
            fi
        fi
    else
        info "[DRY-RUN] Would create and push tag: ${TAG_NAME}"
    fi

    # Final summary
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    if [ "$DRY_RUN" = false ]; then
        echo -e "${GREEN}  Publish Completed!${NC}"
    else
        echo -e "${GREEN}  Dry Run Completed!${NC}"
    fi
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "  Version: ${VERSION}"
    echo "  Tag:     ${TAG_NAME}"
    echo "  VSIX:    ${VSIX_FILE}"
    echo ""

    if [ "$DRY_RUN" = false ]; then
        info "View: https://marketplace.visualstudio.com/items?itemName=wysaid.ege"
    fi
}

# Main entry point
main() {
    if [ -z "$TASK" ]; then
        echo -e "${RED}Error: No task specified${NC}"
        echo ""
        show_help
        exit 1
    fi

    check_dependencies

    case "$TASK" in
    build)
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}  EGE VS Code Extension - Build${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
        echo ""
        do_build
        ;;
    publish)
        do_publish
        ;;
    *)
        error "Unknown task: $TASK"
        exit 1
        ;;
    esac
}

main
