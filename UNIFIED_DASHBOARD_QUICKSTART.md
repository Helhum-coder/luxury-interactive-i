# Unified Dashboard - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### 1️⃣ Get Your GitHub Token (1 minute)

```bash
# Go to: https://github.com/settings/tokens
# Click: "Generate new token (classic)"
# Select scopes: repo, read:user
# Copy the token: ghp_xxxxxxxxxxxx
```

### 2️⃣ Get Your Linear API Key (1 minute)

```bash
# Go to: https://linear.app/settings/api
# Click: "Create new API key"
# Copy the key: lin_api_xxxxxxxxxxxx
```

### 3️⃣ Connect to LUXE IDE (1 minute)

1. Open LUXE IDE
2. Click **UNIFIED DASHBOARD** tab
3. Paste both tokens
4. Click **Connect Services**
5. Done! 🎉

## 📋 What You'll See

### Dashboard Overview

```
┌─────────────────────────────────────────────────────┐
│  🎯 UNIFIED DASHBOARD                        🔄     │
├─────────────────────────────────────────────────────┤
│  Open PRs: 5  │  Merged: 12  │  In Progress: 8  │   │
├─────────────────────────────────────────────────────┤
│  [All Items]  [Pull Requests]  [Linear Issues]     │
├─────────────────────────────────────────────────────┤
│  🔍 Search...    [All] [Open] [In Progress] [Done] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📌 [PR #123] Fix authentication bug               │
│     open • user123 • Dec 15, 2024                  │
│                                                     │
│  ✅ [LIN-45] Implement new dashboard feature       │
│     In Progress • P1 • Jane Doe • Dec 14, 2024    │
│                                                     │
│  📌 [PR #122] Update dependencies                  │
│     merged • bot • Dec 13, 2024                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🎯 Common Tasks

### View All Items
- Click **All Items** tab
- See PRs and issues mixed together
- Most recent updates shown first

### Filter by Status
```
[All] - Everything
[Open] - Active work items
[In Progress] - Currently being worked on
[Closed] - Completed items
```

### Search Items
```
Type in search box:
"authentication" → Shows all items with "authentication" in title
"bug" → Shows all bug-related items
"feature" → Shows all feature items
```

### Open in GitHub/Linear
- Click any item title
- Opens in new tab
- Direct link to full details

## 💡 Pro Tips

### 1. Smart Filtering
```
Want to see what you're working on?
→ [In Progress] filter
```

### 2. Quick Overview
```
Check the stats at the top for instant metrics
→ Open PRs, Merged count, Progress status
```

### 3. Priority Focus
```
Linear issues show priority badges
→ P0/P1 = High priority (red/yellow)
→ P2-P4 = Normal priority
```

### 4. Regular Refresh
```
Click the refresh button (⟳) to get latest data
→ Syncs both GitHub and Linear
→ Updates in seconds
```

## 🔐 Security Checklist

- ✅ Tokens are stored securely
- ✅ Never committed to git
- ✅ Only you can access them
- ✅ Rotate every 90 days
- ✅ Revoke if compromised

## ⚡ Quick Actions

| Action | How To |
|--------|--------|
| Refresh data | Click ⟳ button |
| Search items | Type in search box |
| Filter by status | Click status buttons |
| View PR details | Click PR title |
| View issue details | Click issue title |
| Switch views | Click tab buttons |

## 🎨 Understanding Colors

### Pull Requests
- 🟢 **Green** - Open and ready
- 🟣 **Purple** - Merged successfully
- ⚪ **Gray** - Closed

### Linear Issues
- 🟡 **Yellow** - Todo/Backlog
- 🔵 **Blue** - In Progress
- 🟢 **Green** - Completed

## 📊 Reading the Stats

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  Open PRs: 5 │ Merged: 12  │ In Progress:8│ Completed: 23│
└──────────────┴──────────────┴──────────────┴──────────────┘
    ↓              ↓               ↓               ↓
  Active       Successfully    Working on    Finished
  reviews       merged PRs      issues        issues
```

## 🐛 Quick Fixes

### Issue: "Failed to fetch"
```bash
✓ Check token validity
✓ Verify repository access
✓ Regenerate token if needed
```

### Issue: "No items found"
```bash
✓ Clear all filters
✓ Try [All] status
✓ Clear search box
```

### Issue: Slow loading
```bash
✓ Check internet connection
✓ Try smaller repository
✓ Reduce team scope
```

## 🎓 Next Steps

Once you're comfortable:

1. **Explore Filters** - Try different status combinations
2. **Check Details** - Click items to see full context
3. **Set Routine** - Check dashboard daily for updates
4. **Team Sync** - Share insights with your team

## 📚 Learn More

- Full guide: [UNIFIED_DASHBOARD_GUIDE.md](./UNIFIED_DASHBOARD_GUIDE.md)
- GitHub API: [GIT_INTEGRATION_GUIDE.md](./GIT_INTEGRATION_GUIDE.md)
- API Setup: [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

## 🆘 Need Help?

1. Check the console for errors
2. Read the full guide
3. Verify API tokens
4. Check service status:
   - https://www.githubstatus.com/
   - https://status.linear.app/

---

**Ready to start?** Just get those two tokens and you're good to go! 🚀
