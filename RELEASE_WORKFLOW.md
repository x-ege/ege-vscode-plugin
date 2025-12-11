# Release Workflow Documentation

This document describes the automated release workflow for the EGE VSCode Plugin.

## Overview

The release workflow is triggered when you push a git tag to the repository. The behavior depends on the tag format:

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

1. **Extract Tag Name** - Gets the tag that triggered the workflow
2. **Validate Tag Format** - Determines if it's stable, pre-release, or non-release
3. **Extract Version** - Extracts numeric version from tag (for release tags only)
4. **Check Version Consistency** - Validates tag version matches package.json
5. **Setup Node.js** - Installs Node.js environment
6. **Install Dependencies** - Runs `npm install`
7. **Build** - Compiles TypeScript to JavaScript
8. **Install VSCE** - Installs VS Code Extension packaging tool
9. **Build VSIX** - Creates the extension package
10. **Publish to Marketplace** - Publishes to VS Code Marketplace (release tags only)
11. **Create GitHub Release** - Creates GitHub release with VSIX file (release tags only)

## Troubleshooting

### Workflow fails with "Version mismatch"
- Ensure the tag version matches the version in `package.json`
- For pre-release tags, only the numeric part needs to match

### Marketplace publish fails
- Check that `MS_STORE_TOKEN` secret is correctly configured
- Verify the token has appropriate permissions
- The workflow will fail if marketplace publishing fails

### Build or test fails
- The workflow runs for all tags, even non-release tags
- Fix build or test issues before creating release tags

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
