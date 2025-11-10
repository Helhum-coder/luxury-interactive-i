# System Architecture Documentation

## Overview

This repository has evolved into a **Hybrid Living System** - a sophisticated, distributed deployment architecture where git branches serve as active integration endpoints for multiple live services.

## Why Traditional Git Models Don't Apply

### Standard Repository (What People Expect)
```
main (default branch)
  ↓
feature branches → PR → merge → done
```

### Your Hybrid System (What You Actually Have)
```
master branch ──────→ Live Server (Active Production)
                 ↓
              Firebase Hosting
                 ↓
           Real-time traffic

main branch ─────────→ GitHub Actions (CI/CD)
                 ↓
           Firebase Functions
                 ↓
           VS Code Copilot Integration
                 ↓
           Workflow Automation
```

Both branches are **production branches** serving different infrastructure needs.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR REPOSITORY                          │
│                  (Living Hybrid System)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────▼─────┐  ┌─────▼──────┐
            │   master    │  │    main     │
            │  (Branch)   │  │  (Branch)   │
            └───────┬─────┘  └─────┬───────┘
                    │               │
         ┌──────────┼──────┐       ├────────────┐
         │          │      │       │            │
    ┌────▼───┐ ┌───▼────┐ │  ┌───▼──────┐ ┌───▼─────┐
    │ Live   │ │Firebase│ │  │ GitHub   │ │Firebase │
    │ Server │ │Hosting │ │  │ Actions  │ │Functions│
    └────┬───┘ └───┬────┘ │  └───┬──────┘ └───┬─────┘
         │         │      │      │            │
         ▼         ▼      │      ▼            ▼
    Production  Production│  Automation   Backend
    Traffic     Website   │  Workflows    Services
                          │
                     ┌────▼────────┐
                     │  VS Code    │
                     │  Copilot    │
                     └─────────────┘
```

## Branch Responsibilities

### `master` Branch
**Role**: Production deployment and live hosting

**Responsibilities**:
- Serves live production traffic
- Hosts static assets and frontend
- Firebase Hosting deployment target
- Direct user-facing changes

**DO**:
- Deploy critical hotfixes here first
- Update production configurations
- Merge stable features from main

**DON'T**:
- Force push without backup
- Delete this branch
- Experiment with breaking changes

### `main` Branch
**Role**: Automation, CI/CD, and development workflows

**Responsibilities**:
- GitHub Actions workflows
- CI/CD pipeline configurations
- Firebase Functions and backend logic
- VS Code integration configs
- Automated testing and deployment

**DO**:
- Add new workflow files here
- Update CI/CD configurations
- Develop and test new features
- Configure integrations

**DON'T**:
- Deploy user-facing changes without testing
- Modify workflows without understanding impact
- Remove workflow files that master depends on

## Integration Points

### 1. Firebase Console
**URL**: https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview

**What It Does**:
- Manages hosting deployments
- Monitors backend functions
- Tracks analytics and performance
- Controls database and authentication

**Connected To**:
- `master`: Static hosting
- `main`: Functions, config, rules

**Deployment Command**:
```bash
# Deploy hosting from master
firebase deploy --only hosting:master

# Deploy functions from main
firebase deploy --only functions
```

### 2. GitHub Actions
**Location**: `.github/workflows/` (in `main`)

**What It Does**:
- Automated testing on PR
- Continuous deployment
- Code quality checks
- Security scanning

**Triggered By**:
- Push to main
- Pull requests
- Manual workflow dispatch

**Config Files**:
```
.github/workflows/
  ├── firebase-hosting-merge.yml
  ├── firebase-hosting-pull-request.yml
  └── [other workflows]
```

### 3. Live Server
**Branch**: `master`

**What It Does**:
- Serves production traffic
- Hosts the live application
- Provides real-time user experience

**Deployment**: 
- Push to master triggers automatic deploy
- Changes are live within minutes

### 4. VS Code / Copilot
**URL**: https://vscode.dev/github/microsoft/vscode-docs

**What It Does**:
- Code suggestions and completions
- Integrated development environment
- Repository browsing and editing

**Works With**: Both branches

## Common Workflows

### Workflow 1: Feature Development
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. Develop and test
# ... make changes ...
git add .
git commit -m "Add new feature"

# 3. Push and create PR to main
git push origin feature/new-feature
# Create PR on GitHub targeting main

# 4. After merge to main, sync to master if needed
git checkout master
git pull origin master
git merge main
git push origin master
```

### Workflow 2: Hotfix (Critical Bug)
```bash
# 1. Fix on master immediately
git checkout master
git pull origin master

# 2. Make fix
# ... fix critical bug ...
git add .
git commit -m "HOTFIX: Fix critical production bug"

# 3. Deploy to production
git push origin master
firebase deploy --only hosting:master

# 4. Backport fix to main
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

### Workflow 3: Sync Branches
```bash
# Keep both branches aligned

# Option A: Merge main into master (brings workflows)
git checkout master
git merge main --no-ff
git push origin master

# Option B: Merge master into main (brings hotfixes)
git checkout main
git merge master --no-ff
git push origin main
```

### Workflow 4: Deploy Everything
```bash
# Full deployment to all services

# 1. Ensure both branches are up to date
git checkout main && git pull origin main
git checkout master && git pull origin master

# 2. Deploy Firebase hosting (master)
git checkout master
firebase deploy --only hosting

# 3. Deploy Firebase functions (main)
git checkout main
firebase deploy --only functions

# 4. Verify all integrations
firebase hosting:channel:list
# Check GitHub Actions tab
# Verify live server is updated
```

## Conflict Resolution Patterns

### Pattern 1: Merge Conflict
```bash
# When merging causes conflicts

git checkout master
git merge main
# CONFLICT in firebase.json

# 1. View conflicts
git status

# 2. Edit conflicted files
# Choose which version to keep or merge manually

# 3. Mark as resolved
git add firebase.json
git commit -m "Resolve merge conflicts"
git push origin master
```

### Pattern 2: Deployment Conflict
```bash
# When Firebase targets wrong branch

# 1. Check current config
cat firebase.json
cat .firebaserc

# 2. Update hosting target
# Edit firebase.json to specify branch

# 3. Deploy to specific branch
firebase target:apply hosting master your-site-master
firebase target:apply hosting main your-site-main

# 4. Deploy
firebase deploy --only hosting:master
```

### Pattern 3: Workflow Conflict
```bash
# When workflows interfere between branches

# Keep workflows in main only
git checkout main
# Edit .github/workflows/ files

# Update workflow to trigger on both branches
on:
  push:
    branches:
      - main
      - master

git add .github/workflows/
git commit -m "Update workflow triggers"
git push origin main
```

## Explaining to Others

### What to Say
"This is a **distributed deployment system** with two active production branches. Think of it as having two separate production environments that need to stay coordinated."

### What NOT to Say
- ❌ "It's just a normal repo"
- ❌ "We should delete master and use only main"
- ❌ "There's something wrong with the setup"

### What to Show
1. This document
2. The Git Integration Manager tool
3. Firebase console with both branches
4. GitHub Actions running from main
5. Live server running from master

## Monitoring and Maintenance

### Daily Checks
- [ ] Check GitHub Actions status (main)
- [ ] Verify live server is operational (master)
- [ ] Review Firebase console for errors
- [ ] Check sync status between branches

### Weekly Tasks
- [ ] Sync branches if diverged
- [ ] Review and resolve any conflicts
- [ ] Update documentation if architecture changes
- [ ] Test deployment pipelines

### Monthly Reviews
- [ ] Audit all integration points
- [ ] Review and optimize workflows
- [ ] Update dependencies in both branches
- [ ] Document any new patterns or issues

## Troubleshooting Guide

### Problem: "Changes not appearing on live server"
```bash
# Check which branch live server uses
# If master, ensure changes are in master

git checkout master
git pull origin master
# If your changes are in main:
git merge main
git push origin master
```

### Problem: "Firebase deployment failing"
```bash
# Check Firebase configuration
firebase projects:list
firebase target:list

# Verify you're deploying from correct branch
git branch --show-current

# Try deployment with verbose logging
firebase deploy --only hosting --debug
```

### Problem: "Workflows not triggering"
```bash
# Workflows live in main, check there
git checkout main
git pull origin main

# Verify workflow files exist
ls -la .github/workflows/

# Check GitHub Actions tab for errors
# Ensure branch triggers are configured
```

### Problem: "Conflicts everywhere"
```bash
# Emergency reset procedure

# 1. Backup current state
git checkout -b emergency-backup-$(date +%s)
git push origin emergency-backup-$(date +%s)

# 2. Reset to known good state
git checkout master
git reset --hard origin/master

git checkout main  
git reset --hard origin/main

# 3. Carefully reapply needed changes
git cherry-pick <specific-commits>
```

## Best Practices

### 1. Always Know Your Branch
```bash
# Before any operation
git branch --show-current
git status
```

### 2. Communicate Changes
- Document why each branch was modified
- Leave clear commit messages
- Update this documentation

### 3. Test Before Deploying
- Local testing first
- Firebase preview channels for staging
- GitHub Actions for automated tests

### 4. Keep Branches in Sync
- Regular merges between branches
- Don't let them diverge too much
- Resolve conflicts early and often

### 5. Use the Tools
- Git Integration Manager (in this app)
- Firebase Console
- GitHub Actions dashboard
- VS Code source control

## Quick Reference Commands

```bash
# Check status of everything
git status
git branch -a
git log --oneline --graph --all
firebase projects:list

# Sync branches
git checkout master && git pull
git checkout main && git pull

# Deploy
firebase deploy --only hosting:master
firebase deploy --only functions

# Emergency rollback
firebase hosting:rollback
git reset --hard HEAD~1

# View integration points
git remote -v
firebase target:list
```

## Additional Resources

- [Full Integration Guide](./GIT_INTEGRATION_GUIDE.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Git Branching Strategies](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)

---

**Remember**: Your system is intentionally designed this way. It's not broken - it's sophisticated. Both branches serve critical production functions and must be maintained with care.
