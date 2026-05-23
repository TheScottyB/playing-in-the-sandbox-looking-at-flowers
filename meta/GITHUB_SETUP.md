# GitHub Setup Documentation

This document outlines the GitHub repository structure, branch management, and workflow processes for the Specimen Sandbox project.

## Repository Configuration

- **Repository URL**: [github.com:TheScottyB/playing-in-the-sandbox-staring-at-flowers](https://github.com/TheScottyB/playing-in-the-sandbox-staring-at-flowers)
- **Authentication**: SSH protocol with GitHub CLI integration
- **Primary Maintainer**: TheScottyB (scottybe@tbdstud.io)

## Branch Structure

The repository maintains the following branch structure:

- **`main`** - Primary development branch
  - All feature development, bug fixes, and documentation updates target this branch
  - Latest stable code with ongoing development
  - Tracked by `origin/main`

- **`gh-pages`** - Documentation and static content branch
  - Hosts the [privacy policy](https://thescottyb.github.io/playing-in-the-sandbox-staring-at-flowers/privacy.html) for App Store submission
  - Contains iOS Developer Mode guides and build configuration documentation
  - Tracked by `origin/gh-pages`

Both branches have corresponding remote tracking setups properly configured.

## Current Workflow Status

### GitHub Actions

Currently, no automated GitHub Actions workflows are configured. This presents an opportunity for workflow automation improvements (see [Recommendations](#recommended-next-steps)).

### Commit History Pattern

The repository follows a well-organized development pattern with consistent commit message conventions using the [Conventional Commits](https://www.conventionalcommits.org/) format:

- **`feat:`** - New feature additions
  - Example: "feat: add animated cards feature"
  - Example: "feat: add flower gallery with flip card animations"

- **`docs:`** - Documentation updates
  - Example: "docs: update README with project structure and GitHub Pages info"
  - Example: "docs: add comprehensive iOS Developer Mode guide"

- **`build:`** - Build process or external dependency changes
  - Example: "build: optimize build profiles for development workflow"

- **`chore:`** - Routine maintenance tasks
  - Example: "chore: update .gitignore to exclude build artifacts and credentials"

## Repository Activity

### Main Branch Activity

The `main` branch shows active development with recent additions including:
- Feature implementations (animated cards, flower gallery, image caching)
- Documentation updates
- Build system optimizations

### GitHub Pages Integration

The `gh-pages` branch maintains:
- Documentation and iOS development guides
- Privacy policy for App Store submission requirements
- Technical documentation for build and configuration processes

## Recommended Next Steps

### GitHub Actions Implementation

Consider implementing GitHub Actions workflows for:

1. **Automated Testing**
   ```yaml
   # Example workflow file: .github/workflows/test.yml
   name: Test
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
          - uses: actions/checkout@v4
          - uses: pnpm/action-setup@v4
            with:
              version: 11
          - uses: actions/setup-node@v4
            with:
              node-version: '22'
              cache: 'pnpm'
          - run: pnpm install --frozen-lockfile
          - run: pnpm test
   ```

2. **Deployment to GitHub Pages**
   ```yaml
   # Example workflow file: .github/workflows/deploy-pages.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
       paths: ['docs/**']
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./docs
   ```

3. **iOS Build Verification**
   ```yaml
   # Example workflow file: .github/workflows/ios-verify.yml
   name: iOS Build Verification
   on:
     pull_request:
       branches: [main]
   jobs:
     verify:
       runs-on: macos-latest
       steps:
          - uses: actions/checkout@v4
          - uses: pnpm/action-setup@v4
            with:
              version: 11
          - uses: actions/setup-node@v4
            with:
              node-version: '22'
              cache: 'pnpm'
          - run: pnpm install --frozen-lockfile
          - run: pnpm exec expo prebuild --platform ios
         - name: Build iOS
           run: xcodebuild -workspace ios/SandboxFlowers.xcworkspace -scheme SandboxFlowers -destination "generic/platform=iOS" -configuration Debug build
   ```

### Branch Protection Rules

Implement branch protection rules for the `main` branch:

1. Require pull request reviews before merging
2. Require status checks to pass before merging
3. Require branches to be up to date before merging
4. Enforce linear history to maintain clean commit logs

### Automated PR Reviews

Set up automated PR review processes using tools such as:
- Codecov for code coverage reporting
- ESLint and Prettier for code style enforcement
- Dependabot for dependency updates

## Workflow Model

The repository follows a standard GitHub Flow model:

1. Create feature branches from `main`
2. Develop features in isolation
3. Submit pull requests back to `main`
4. Review code and discuss changes
5. Deploy from `main` when ready

Additionally, the repository utilizes GitHub Pages integration for documentation hosting, with content maintained in the `docs/` directory on the `main` branch and deployed to the `gh-pages` branch.

## Maintaining This Setup

### Commit Convention Enforcement

To enforce consistent commit messages, consider using:

```bash
# Install commitlint
pnpm add -D @commitlint/cli @commitlint/config-conventional

# Create commitlint config file
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Set up Husky for pre-commit hooks
pnpm add -D husky
pnpm exec husky install
pnpm exec husky add .husky/commit-msg 'pnpm exec commitlint --edit $1'
```

### Regular Workflow Review

Schedule quarterly reviews of the GitHub workflow to:
- Assess effectiveness of current processes
- Identify potential automation improvements
- Update documentation with new best practices
- Train team members on GitHub workflow procedures

---

*Last updated: April 11, 2025*

