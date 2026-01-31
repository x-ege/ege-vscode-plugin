# Release Workflow Documentation

This document describes the automated release workflow for the EGE VSCode Plugin.

## Overview

The release workflow can be triggered in two ways:

1. **Tag Push (Production)**: Push a git tag to create an actual release
2. **Master Branch Push (Dry-Run)**: Push to master branch to test the workflow without publishing

### Trigger Types

#### Tag Push
When you push a tag, the workflow behaves based on the tag format:
- Builds, validates, and may publish to marketplace
- Creates GitHub releases for valid release tags
- This is the **production mode**

#### Master Branch Push (Dry-Run)
When you push to the master branch:
- Uses version from `package.json` as the simulated tag
- Builds and tests the extension
- Validates tag format and checks marketplace for version conflicts
- **Does NOT** publish to marketplace
- **Does NOT** create GitHub releases
- Uploads VSIX as a workflow artifact (retained for 30 days)
- Useful for testing the release process before creating a tag

The behavior depends on the tag format (or simulated tag in dry-run):

### Tag Formats

#### 1. Stable Release Tags
**Pattern:** `X.Y.Z` (e.g., `1.0.3`, `2.1.0`)
- **Regex:** `/^[0-9]+\.[0-9]+\.[0-9]+$/`
- **Behavior:**
  - Builds and tests the extension
  - Validates tag version matches `package.json` version
  - Publishes to VS Code Marketplace as a **stable release**
  - Creates a GitHub release (not marked as pre-release)
  - Attaches VSIX file to GitHub release

#### 2. Pre-Release Tags
**Pattern:** `X.Y.Z-suffix` (e.g., `1.0.3-alpha`, `1.0.3-beta`, `1.0.3-rc.1`)
- **Regex:** `/^[0-9]+\.[0-9]+\.[0-9]+-.+$/`
- **Supported suffixes:** `-alpha`, `-beta`, `-rc`, `-rc.1`, etc.
- **Behavior:**
  - Builds and tests the extension
  - Validates tag version (numeric part) matches `package.json` version
  - Publishes to VS Code Marketplace as a **pre-release**
  - Creates a GitHub release (marked as pre-release)
  - Attaches VSIX file to GitHub release

**Important:** The VS Code Marketplace doesn't support version suffixes in the actual extension version. The pre-release suffix is only used in the git tag name. The actual version in `package.json` should be the numeric version only (e.g., `1.0.3`).

#### 3. Non-Release Tags
**Examples:** `v1.0.3`, `latest`, `dev`, `test`
- **Behavior:**
  - Builds and tests the extension
  - **Does NOT publish** to marketplace
  - **Does NOT create** GitHub release
  - Useful for testing the build process

## Version Consistency Check

For all release tags (both stable and pre-release), the workflow validates that:
- The numeric version in the tag matches the version in `package.json`
- If they don't match, the workflow fails with an error

**Example:**
- Tag: `1.0.3` → Must match `package.json` version `1.0.3` ✓
- Tag: `1.0.3-alpha` → Must match `package.json` version `1.0.3` ✓
- Tag: `1.0.4` → If `package.json` has `1.0.3`, workflow fails ✗

## Marketplace Version Check

Before publishing, the workflow checks if the version already exists in the VS Code Marketplace:

- **Version exists**: Skips marketplace publish, shows a warning, but continues with GitHub release creation
- **Version doesn't exist**: Proceeds with marketplace publishing
- **Dry-run mode**: If version exists, warns that creating a tag will skip marketplace publish

This prevents errors when accidentally pushing the same version tag twice.

## How to Create a Release

### Stable Release

1. Update the version in `package.json`:
   ```bash
   # Edit package.json and set "version": "1.0.4"
   ```

2. Commit the version change:
   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.4"
   git push
   ```

3. Create and push a tag:
   ```bash
   git tag 1.0.4
   git push origin 1.0.4
   ```

### Pre-Release

1. Update the version in `package.json` to the base version:
   ```bash
   # Edit package.json and set "version": "1.0.4"
   ```

2. Commit the version change:
   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.4"
   git push
   ```

3. Create and push a pre-release tag:
   ```bash
   git tag 1.0.4-beta
   git push origin 1.0.4-beta
   ```

## Required Secrets

The workflow requires the following GitHub secret:
- `MS_STORE_TOKEN`: Personal Access Token for publishing to VS Code Marketplace

## Workflow Steps

1. **Determine Trigger Type** - Identifies if triggered by tag push or master branch push (dry-run)
2. **Validate Tag Format** - Determines if it's stable, pre-release, or non-release pattern
3. **Extract Version** - Extracts numeric version from tag (for release tags only)
4. **Check Version Consistency** - Validates tag version matches package.json (only for actual tags)
5. **Setup Node.js** - Installs Node.js 22.x environment
6. **Install Dependencies** - Runs `npm install`
7. **Build** - Compiles TypeScript to JavaScript with `npx tsc`
8. **Install VSCE** - Installs VS Code Extension packaging tool
9. **Build VSIX** - Creates the extension package
10. **Check Marketplace** - Queries VS Code Marketplace API to check if version already exists
11. **Warn on Duplicate (Dry-run)** - In dry-run mode, warns if version already exists
12. **Publish to Marketplace** - Publishes if version doesn't exist and not in dry-run mode
    - Uses `--pre-release` flag for pre-release tags
    - Skipped if version already exists
    - Continues on error to allow GitHub release creation
13. **Upload Artifact (Dry-run)** - Uploads VSIX as artifact with 30-day retention (dry-run only)
14. **Create GitHub Release** - Creates release with VSIX attachment (actual tag push only)
    - Marked as pre-release for pre-release tags
    - Generates release notes automatically

## Troubleshooting

### Workflow fails with "Version mismatch"
- Ensure the tag version matches the version in `package.json`
- For pre-release tags, only the numeric part needs to match
- Note: This check only runs for actual tag pushes, not dry-run mode

### Marketplace publish is skipped
- The workflow detected that the version already exists in the marketplace
- This is a safety feature to prevent duplicate publishes
- The workflow continues and creates a GitHub release anyway
- To publish a new version, increment the version number in `package.json`

### Marketplace publish fails
- Check that `MS_STORE_TOKEN` secret is correctly configured
- Verify the token has appropriate permissions
- The workflow uses `continue-on-error`, so GitHub release will still be created
- Check the workflow logs for detailed error messages

### Build or test fails
- The workflow runs for all tags and master branch pushes
- Fix build or test issues before creating release tags
- Use dry-run mode (push to master) to test before tagging

### Testing the release process
- Push to master branch to trigger dry-run mode
- Review the workflow output for warnings about existing versions
- Check the uploaded artifact to verify VSIX package
- Only create a tag when ready for actual release

## Examples

### Valid Stable Release Tags
- `1.0.3`
- `2.0.0`
- `10.20.30`

### Valid Pre-Release Tags
- `1.0.3-alpha`
- `1.0.3-beta`
- `1.0.3-rc`
- `1.0.3-rc.1`
- `2.0.0-beta.2`

### Non-Release Tags (Build & Test Only)
- `v1.0.3` (has 'v' prefix)
- `latest`
- `dev`
- `test`
- `1.0` (incomplete version)
