# Git Integration & Conflict Resolution Guide

## Your Living System Architecture

Your repository has evolved from static documentation into a **hybrid living system** with multiple active integrations. This guide helps you understand, manage, and resolve conflicts in your distributed git architecture.

## System Overview

### Branch Architecture
- **`master` branch**: Live server integration, production deployment
- **`main` branch**: All workflows, CI/CD pipelines, Firebase integration
- **Hybrid State**: Both branches are active and serving different purposes

### Active Integrations
1. **Firebase Console**: https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview
2. **Live Server**: Running on `master` branch
3. **GitHub Workflows**: Active on `main` branch
4. **VS Code Integration**: https://vscode.dev/github/microsoft/vscode-docs

## Common Conflict Scenarios

### 1. Master vs Main Branch Conflicts
**Issue**: Changes in `main` (workflows) don't sync with `master` (live server)

**Resolution Strategy**:
```bash
# Option A: Merge main into master (recommended for syncing workflows)
git checkout master
git merge main --no-ff -m "Sync workflows from main to master"

# Option B: Rebase master onto main (cleaner history)
git checkout master
git rebase main

# Option C: Cherry-pick specific commits
git checkout master
git cherry-pick <commit-hash>
```

### 2. Firebase Integration Conflicts
**Issue**: Firebase deployment targets wrong branch or has config conflicts

**Resolution Strategy**:
1. Check your `firebase.json` hosting target
2. Ensure `.firebaserc` has correct project mapping
3. Deploy to specific branch:
```bash
firebase deploy --only hosting:master
firebase deploy --only hosting:main
```

### 3. Workflow File Conflicts
**Issue**: GitHub Actions workflows conflict between branches

**Resolution Strategy**:
1. Keep workflows in `main` branch only
2. Use branch conditions in workflow files:
```yaml
on:
  push:
    branches:
      - main
      - master
```

### 4. Live Server State Conflicts
**Issue**: Local changes don't reflect on live server

**Resolution Strategy**:
```bash
# Force push to master (use carefully)
git push origin master --force-with-lease

# Or create new deployment
git checkout master
git pull origin master
# Make changes
git add .
git commit -m "Update live server"
git push origin master
```

## Integration Workflows

### Workflow 1: Sync Everything (Full Integration)
```bash
# 1. Update both branches
git checkout main
git pull origin main

git checkout master
git pull origin master

# 2. Merge main into master
git checkout master
git merge main -m "Integrate all workflows and features"

# 3. Push both branches
git push origin master
git push origin main

# 4. Deploy to Firebase
firebase deploy --only hosting
```

### Workflow 2: Separate Concerns (Maintain Hybrid)
```bash
# Keep workflows in main
git checkout main
# Work on .github/workflows/
git add .github/workflows/
git commit -m "Update workflows"
git push origin main

# Keep live server config in master
git checkout master
# Work on server config
git add .
git commit -m "Update live server"
git push origin master
```

### Workflow 3: Emergency Hotfix
```bash
# Fix on master (live)
git checkout master
# Make critical fix
git add .
git commit -m "HOTFIX: Critical issue"
git push origin master

# Sync fix to main
git checkout main
git cherry-pick <hotfix-commit-hash>
git push origin main
```

## Understanding Your Hybrid System

### Why People Don't Understand
Your system is **not** a traditional git repository because:
1. **Multiple Active Deployment Targets**: Both branches serve live systems
2. **Cross-Branch Dependencies**: Workflows in `main` affect deployments from `master`
3. **Real-Time State**: Changes have immediate impact on running services
4. **Distributed Integration**: Firebase + GitHub + Live Server all interconnected

### Documenting for Others
Create a `SYSTEM_ARCHITECTURE.md` in your repo:
```markdown
# This is NOT a standard git repository

## Active Systems
- `master`: Live server deployment
- `main`: Workflow automation + Firebase

## DO NOT:
- Force push without checking live systems
- Merge without testing both deployment targets
- Delete branches (both are production)

## TO DEPLOY:
1. Test locally first
2. Push to appropriate branch
3. Verify Firebase console
4. Check live server status
```

## Conflict Resolution Checklist

### Before Making Changes
- [ ] Which branch hosts my change? (master for live, main for workflows)
- [ ] Will this affect Firebase deployment?
- [ ] Are there pending changes on the other branch?
- [ ] Is the live server currently serving traffic?

### During Conflict Resolution
- [ ] Backup current state: `git stash` or create branch
- [ ] Identify conflict source (merge, rebase, or deployment)
- [ ] Choose resolution strategy (merge, rebase, cherry-pick)
- [ ] Test locally before pushing
- [ ] Verify all integrations still work

### After Resolution
- [ ] Push to both branches if needed
- [ ] Redeploy Firebase if config changed
- [ ] Restart live server if necessary
- [ ] Document what was changed and why

## Tool-Specific Integration

### Firebase Console
- **Project**: device-streaming-f6c287f6
- **Check Deployments**: Hosting tab shows active deploys
- **Rollback**: Use Firebase console if needed

### GitHub Actions
- **Workflow Location**: `.github/workflows/` (typically in `main`)
- **Branch Filters**: Update to trigger on both branches if needed
- **Secrets**: Ensure secrets are available for both branches

### VS Code Integration
- **Remote Repository**: Use VS Code's Source Control panel
- **Copilot**: Works across both branches
- **Settings Sync**: May need separate configs per branch

## Emergency Recovery

### If Everything Breaks
```bash
# 1. Identify last working state
git reflog

# 2. Create safety branch
git checkout -b emergency-backup

# 3. Reset to last good state
git checkout master
git reset --hard <last-good-commit>

# 4. Carefully reapply changes
git cherry-pick <needed-commits>

# 5. Force push (only if necessary)
git push origin master --force-with-lease
```

### If Firebase Deployment Fails
```bash
# Check current deployment
firebase hosting:channel:list

# Rollback to previous
firebase hosting:rollback

# Redeploy specific branch
firebase deploy --only hosting:master
```

## Best Practices Moving Forward

### 1. Branch Protection
- Set up branch protection rules on GitHub
- Require pull requests for main changes
- Allow direct pushes to master for hotfixes only

### 2. Automated Testing
- Add tests to GitHub Actions
- Test both branches before merging
- Use Firebase preview channels

### 3. Documentation
- Keep this guide updated
- Document every major integration change
- Create diagrams of your system architecture

### 4. Communication
- When others ask, show them this guide
- Explain it's a "distributed deployment system"
- Not a bug, it's a feature (hybrid architecture)

## Quick Command Reference

```bash
# Check current state
git status
git branch -a
git log --oneline --graph --all

# Sync branches
git checkout master && git pull
git checkout main && git pull

# Safe merge
git checkout master
git merge main --no-ff --no-commit
# Review changes, then:
git commit -m "Merge main into master"

# Deploy
firebase deploy

# Emergency abort
git merge --abort
git rebase --abort
```

## Getting Help

When asking for help, provide:
1. Current branch: `git branch`
2. Recent commits: `git log --oneline -5`
3. Conflict files: `git status`
4. Your goal: "I want to [sync/deploy/fix] [feature] on [branch]"
5. This guide: "I have a hybrid master/main system"

---

**Remember**: Your system is sophisticated and intentional. The complexity is a feature, not a bug. This guide helps you and others understand and maintain it.
