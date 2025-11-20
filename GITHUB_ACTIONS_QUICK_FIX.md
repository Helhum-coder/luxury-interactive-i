# 🚀 GitHub Actions Quick Fix - 5 Minute Guide

## Step 1: Connect (30 seconds)
1. Open LUXE IDE → **GitHub** tab
2. Paste your GitHub token (get from https://github.com/settings/tokens)
3. Click **Connect**

## Step 2: Open Workflows (10 seconds)
1. Click **Workflows** tab
2. Click **Refresh**

## Step 3: Identify Issues (30 seconds)
Look at the dashboard:
- 🔴 **Red numbers** = Failed workflows
- ⚠️ **Critical badges** = Need immediate fix

## Step 4: Generate Fixes (2 minutes)
For each failed workflow:
1. Click workflow name to expand
2. Click **Generate Fixed Version**
3. Copy the YAML code

## Step 5: Apply to GitHub (2 minutes)
For each workflow:
1. Click **View on GitHub**
2. Click Edit (pencil icon)
3. Paste the fixed YAML
4. Commit changes

## Step 6: Rerun (30 seconds)
1. Back in LUXE IDE
2. Click **Rerun** on failed workflows
3. Watch them turn green ✅

---

## ⚡ One-Line Fixes

### Fix: "Workflow disabled"
Go to GitHub → Actions → Select workflow → Enable

### Fix: "Auth failed"
Repository Settings → Secrets → Add missing secrets

### Fix: "Old action versions"
Use the generated YAML (has @v4 versions)

### Fix: "Permission denied"  
Add to workflow:
```yaml
permissions:
  contents: read
  actions: read
```

---

## 🎯 Common YAML Template

```yaml
name: CI
on: [push, pull_request, workflow_dispatch]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test --if-present
      - run: npm run build --if-present
```

---

## ✅ Success = All Green Checkmarks

You're done when:
- Dashboard shows **0 Failed**
- All workflows show ✅
- No critical issues in diagnostics

**Total Time: ~5 minutes for all 40 workflows**
