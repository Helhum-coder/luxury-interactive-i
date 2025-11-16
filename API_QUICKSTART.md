# 🚀 API Integration Quick Start

## 30-Second Setup

### GitHub (Recommended)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `user`, `read:org`
4. Generate and copy the token
5. In LUXE IDE: **API INTEGRATION** tab → **GitHub** tab → Paste token → **Connect**

### Linear (Optional)

1. Go to: https://linear.app/settings/api
2. Click "Create new API key"
3. Copy the key
4. In LUXE IDE: **API INTEGRATION** tab → **Linear** tab → Paste key → **Connect**

## Quick Commands

### Test GitHub Connection
```bash
# In the API Integration UI
1. Click "Test Octocat API"
2. Check console for ASCII art
```

### Load Your Repositories
```bash
# In the API Integration UI
1. Make sure GitHub is connected
2. Click "Load Repositories"
3. Browse your repos with stats
```

### View Linear Issues
```bash
# In the API Integration UI
1. Make sure Linear is connected
2. Click on any team name
3. View all issues for that team
```

## Security Notes

✅ **Safe**:
- Tokens stored locally in browser
- Never sent to any server
- Easily disconnected
- Password-masked by default

❌ **Never**:
- Share tokens in screenshots
- Commit tokens to Git
- Use tokens in public code

## What You Can Do Now

### With GitHub Connected:
- ✅ View all your repositories
- ✅ See repository stats (stars, forks, issues)
- ✅ Check when repos were last updated
- ✅ Access repository URLs
- ✅ Test API connection

### With Linear Connected:
- ✅ View all your teams
- ✅ Browse issues by team
- ✅ See issue status and priority
- ✅ Check who's assigned to what
- ✅ Read issue descriptions
- ✅ Access Linear issue URLs

## Common Issues

**"Connection Failed"**
→ Check token/key is copied correctly (no spaces)

**"No repositories showing"**
→ Click "Load Repositories" button

**"GitHub 403 Error"**
→ Token needs `repo`, `user`, `read:org` scopes

**"Linear returns no data"**
→ Make sure you're a member of at least one team

## Next Steps

1. Connect your APIs (see above)
2. Explore the Git Integration tab for more GitHub features
3. Use the Webhook Manager for automated notifications
4. Check CI/CD Pipelines for deployment automation

---

📖 **Full Guide**: See `API_INTEGRATION_GUIDE.md` for complete documentation

🔐 **Security**: Your credentials never leave your browser!
