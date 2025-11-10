# Git Integration Quick Start Guide

## 🚀 Getting Started with Your Hybrid Repository System

Your repository is a **living system** with multiple active branches serving different production purposes. This quick guide helps you get started.

## Understanding Your System in 2 Minutes

### What You Have
```
master branch  →  Live Server + Firebase Hosting
main branch    →  GitHub Actions + Workflows + Firebase Functions
```

**Both branches are production.** They don't compete - they collaborate.

### Why It's Confusing to Others
- Traditional repos have ONE main branch
- Your repo has TWO production branches
- Each serves different infrastructure
- Not a bug - it's an advanced architecture!

## Quick Actions

### 1. Check System Status
Use the Git Integration Manager in the app:
1. Open LUXE IDE
2. Click "GIT INTEGRATION" tab
3. Click "Detect Conflicts" button
4. Review Overview tab

### 2. Sync Your Branches
When `main` has updates that `master` needs:

```bash
git checkout master
git pull origin master
git merge main --no-ff -m "Sync workflows from main"
git push origin master
```

### 3. Deploy Changes
```bash
# For live server changes (master)
git checkout master
# ... make changes ...
git add .
git commit -m "Update live server"
git push origin master

# For workflows/automation (main)
git checkout main
# ... make changes ...
git add .
git commit -m "Update workflows"
git push origin main
```

### 4. Emergency Hotfix
```bash
# Fix on master first (it's live)
git checkout master
# ... fix the bug ...
git add .
git commit -m "HOTFIX: Critical bug"
git push origin master

# Then sync to main
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

## Common Commands

```bash
# See where you are
git branch --show-current

# Check both branches
git checkout master && git pull
git checkout main && git pull

# View all branches
git branch -a

# See recent commits on both branches
git log --oneline --graph --all -10

# Deploy to Firebase
firebase deploy --only hosting:master
```

## Using the Git Integration Manager

The Git Integration Manager in LUXE IDE provides a visual interface for all operations:

### Overview Tab
- See your system architecture
- Understand branch purposes
- Quick action buttons for common operations
- Links to Firebase console and documentation

### Branches Tab
- View all branches and their roles
- See integration points
- Check deployment targets
- Monitor branch status

### Conflicts Tab
- Automatically detect conflicts
- View affected files and branches
- Get resolution strategies
- Apply fixes with one click

### Integrations Tab
- Monitor Firebase Console status
- Check Live Server health
- View GitHub Actions status
- Verify VS Code integration

### Commands Tab
- Execute git operations
- Run sync commands
- View command history
- Access quick command templates

## Quick Decision Tree

### "Where do I make this change?"

**Are you changing...**

- **Website content, UI, or user-facing features?** → `master` branch
- **GitHub Actions workflows?** → `main` branch
- **Firebase Functions or backend?** → `main` branch
- **Firebase hosting config?** → Both (main first, then merge to master)
- **Critical production bug?** → `master` first, then cherry-pick to `main`

### "Something broke, what do I do?"

**Is it...**

- **Live website down?** → Check `master` branch, rollback if needed
- **Workflows not running?** → Check `main` branch, review `.github/workflows/`
- **Firebase deployment failing?** → Check `firebase.json` in both branches
- **Merge conflict?** → Use Git Integration Manager to detect and resolve

### "I need to explain this to someone"

Show them:
1. This Quick Start Guide
2. The System Architecture document
3. The Git Integration Manager tool
4. Your Firebase Console (both deployments)
5. Say: "It's a distributed deployment system with two production branches"

## Rules of Thumb

### ✅ DO
- Pull both branches before starting work
- Commit often with clear messages
- Use the Git Integration Manager to detect conflicts
- Sync branches regularly (at least weekly)
- Document major changes
- Test locally before pushing
- Use Firebase preview channels for testing

### ❌ DON'T
- Force push without understanding impact
- Delete master or main branches
- Merge without testing
- Make changes without knowing which branch
- Ignore conflicts hoping they'll go away
- Deploy without checking Firebase console
- Experiment on production branches

## Getting Help

### In the App
1. Open Git Integration Manager
2. Click "Detect Conflicts"
3. Review suggested resolutions
4. Apply fixes or execute commands

### Command Line Issues
```bash
# Stuck in a merge?
git merge --abort

# Stuck in a rebase?
git rebase --abort

# Made a mistake?
git reflog  # find your previous state
git reset --hard <previous-commit>

# Nuclear option (creates backup first)
git checkout -b backup-$(date +%s)
git push origin backup-$(date +%s)
```

### Still Confused?
1. Read the full [Git Integration Guide](./GIT_INTEGRATION_GUIDE.md)
2. Review [System Architecture](./SYSTEM_ARCHITECTURE.md)
3. Check your command history in the Git Integration Manager
4. Look at recent commits: `git log --oneline --graph --all -20`

## Resources

- **Full Documentation**: [GIT_INTEGRATION_GUIDE.md](./GIT_INTEGRATION_GUIDE.md)
- **Architecture Details**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- **Firebase Console**: [Your Project](https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview)
- **GitHub Actions**: Check the Actions tab in your GitHub repo
- **VS Code Integration**: [VS Code Docs](https://vscode.dev/github/microsoft/vscode-docs)

## Key Takeaways

1. **This is intentional**: Your system is sophisticated, not broken
2. **Two production branches**: master (live server) and main (automation)
3. **Use the tools**: Git Integration Manager makes it visual
4. **Sync regularly**: Don't let branches diverge too much
5. **Document everything**: Future you will thank you
6. **It's okay to be confused**: This is advanced architecture

---

**Remember**: You're managing a distributed production system. That's more complex than a standard repo, but also more powerful. The tools in LUXE IDE help you manage that complexity.

When in doubt, check the Git Integration Manager first! 🎯
