# CI/CD Pipeline Templates - Quick Start

## 🚀 Getting Started

The CI/CD Pipeline Manager provides production-ready pipeline templates with automated testing before deployment.

### Access the Pipeline Center

1. Launch your LUXE IDE application
2. Navigate to the **CI/CD PIPELINES** tab
3. Browse available pipeline templates

## 📋 Quick Actions

### Run Your First Pipeline

1. **Select a Template**
   - Click on "React Frontend - Standard" template
   - Review the stages (Build, Test, Lint, Security, Deploy)

2. **Configure Execution**
   - Branch: `main` (or your target branch)
   - Commit: Enter recent commit SHA
   - Message: Brief description
   - Author: Your name/username

3. **Execute**
   - Click "Run Pipeline"
   - Watch real-time execution
   - Monitor test results and logs

### Export Pipeline Configuration

1. Select your template
2. Choose export format:
   - **GitHub Actions** (.yml)
   - **GitLab CI** (.gitlab-ci.yml)
   - **Jenkins** (Jenkinsfile)
3. Click "Export"
4. Add file to your repository

## 🎯 Available Templates

### 1. React Frontend - Standard
**Best for:** Production deployments with full testing

**Stages:**
- ✅ Install dependencies with audit
- ✅ Lint and type checking
- ✅ Unit tests with coverage
- ✅ Build and optimization
- ✅ Security scanning
- ✅ Production deployment
- ✅ Deployment verification

**Duration:** ~5-8 minutes
**Approval Required:** Yes

### 2. React Frontend - Quick Deploy
**Best for:** Rapid iteration and staging environments

**Stages:**
- ✅ Quick install & build
- ✅ Essential tests
- ✅ Deploy

**Duration:** ~2-3 minutes
**Approval Required:** No

### 3. Full-Stack - Comprehensive
**Best for:** Applications with frontend and backend

**Stages:**
- ✅ Install all dependencies
- ✅ Lint frontend & backend
- ✅ Unit tests (frontend)
- ✅ Unit tests (backend)
- ✅ Integration tests
- ✅ Build frontend & backend
- ✅ Security audit
- ✅ Deploy services
- ✅ E2E tests
- ✅ Verify deployment

**Duration:** ~10-15 minutes
**Approval Required:** Yes

### 4. Security-Focused Pipeline
**Best for:** High-security applications

**Stages:**
- ✅ Dependency audit
- ✅ Code quality checks
- ✅ SAST scanning
- ✅ Unit tests
- ✅ Build & artifact scan
- ✅ Container security
- ✅ Secure deployment
- ✅ Post-deploy verification

**Duration:** ~8-12 minutes
**Approval Required:** Yes

### 5. Preview Deployment
**Best for:** Pull requests and feature branches

**Stages:**
- ✅ Install
- ✅ Build preview
- ✅ Basic tests
- ✅ Deploy preview

**Duration:** ~3-4 minutes
**Approval Required:** No

## 📊 Understanding Pipeline Results

### Stage Status Indicators

- 🟢 **Success**: Stage completed without errors
- 🔴 **Failed**: Stage encountered errors
- 🟡 **Running**: Stage currently executing
- ⚪ **Idle**: Stage pending execution
- ⚫ **Skipped**: Stage was skipped

### Test Results

Each test stage shows:
- **Passed**: Number of successful tests
- **Failed**: Number of failed tests
- **Skipped**: Number of skipped tests
- **Coverage**: Code coverage percentage
- **Duration**: Time taken to run tests

### Pipeline Metrics

Monitor these key metrics:
- **Success Rate**: Percentage of successful runs
- **Avg Duration**: Average pipeline execution time
- **Test Coverage**: Average code coverage
- **Total Runs**: Total pipeline executions

## 🔧 Common Commands

### Testing Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run in watch mode
npm test -- --watch
```

### Build Commands

```bash
# Standard build
npm run build

# Production build
npm run build:production

# Build with analysis
npm run build:analyze
```

### Lint Commands

```bash
# Lint JavaScript/TypeScript
npm run lint

# Type check
npm run type-check
tsc --noEmit

# Fix auto-fixable issues
npm run lint:fix
```

### Security Commands

```bash
# Audit dependencies
npm audit

# Audit with threshold
npm audit --audit-level=moderate
npm audit --audit-level=high

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Deploy Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Deploy preview
npm run deploy:preview
```

## 🎨 Integration Examples

### With GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
```

### With GitLab CI

Create `.gitlab-ci.yml` using the export feature, then customize as needed.

### With Jenkins

Create a `Jenkinsfile` using the export feature for your project.

## 💡 Best Practices

### 1. Test Strategy
- Write tests before running pipelines
- Aim for 80%+ coverage on critical code
- Use test pyramid: many unit tests, some integration, few E2E

### 2. Fast Feedback
- Keep pipeline duration under 10 minutes
- Fail fast on critical issues
- Run quick tests first

### 3. Security First
- Always run security scans
- Keep dependencies updated
- Never commit secrets

### 4. Branch Strategy
- Use preview deployments for PRs
- Auto-deploy staging on develop
- Manual approval for production

### 5. Monitoring
- Check pipeline metrics regularly
- Address failing tests immediately
- Optimize slow stages

## 🔍 Troubleshooting

### Pipeline Won't Start
- ✅ Verify template is selected
- ✅ Check all required fields are filled
- ✅ Ensure no other pipeline is running

### Tests Failing
- ✅ Run tests locally first
- ✅ Check test logs in pipeline
- ✅ Verify environment variables
- ✅ Check for timing issues

### Build Errors
- ✅ Verify package.json scripts
- ✅ Check TypeScript configuration
- ✅ Ensure all dependencies installed
- ✅ Look for environment-specific issues

### Deployment Failed
- ✅ Verify deployment credentials
- ✅ Check target environment status
- ✅ Review deployment logs
- ✅ Verify build artifacts exist

## 📚 Learn More

- [Complete CI/CD Guide](./CICD_PIPELINE_GUIDE.md)
- [Example Configurations](./EXAMPLE_github-actions.yml)
- [Git Integration](./GIT_INTEGRATION_GUIDE.md)
- [Publishing System](./PUBLISH_UNLOCKED.md)

## 🎯 Next Steps

1. ✅ Run your first pipeline with a template
2. ✅ Export configuration for your CI/CD platform
3. ✅ Integrate with Git webhooks for auto-triggering
4. ✅ Set up deployment approvals
5. ✅ Monitor pipeline metrics and optimize

---

**Need Help?** Check the logs in the Current Execution tab for detailed information about each stage.
