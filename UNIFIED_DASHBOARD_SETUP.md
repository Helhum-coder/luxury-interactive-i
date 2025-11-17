# Unified Dashboard - Quick Setup Guide

## What is this?

The **Unified Dashboard** shows your **GitHub Pull Requests** and **Linear Issues** in one beautiful view. No more switching between tabs!

## Setup (5 minutes)

### Step 1: Get Your GitHub Token

1. Go to https://github.com/settings/tokens/new
2. Give it a name like "LUXE IDE Dashboard"
3. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
4. Click "Generate token"
5. **Copy the token** (starts with `ghp_`)

### Step 2: Get Your Linear API Key

1. Go to https://linear.app/settings/api
2. Click "Create key"
3. Give it a name like "LUXE IDE Dashboard"
4. Click "Create"
5. **Copy the API key** (starts with `lin_api_`)

### Step 3: Configure the Dashboard

1. Open the app and click the **"UNIFIED DASHBOARD"** tab
2. You'll see a setup screen
3. Paste your **GitHub token** in the first field
4. Paste your **Linear API key** in the second field
5. Click **"Connect Services"**

### Step 4: Select Your Repository (GitHub)

In the **"GIT INTEGRATION"** tab or when prompted:
1. Enter your repository in format: `username/repo-name`
   - Example: `Helhum-coder/my-project`

### Step 5: (Optional) Select Your Linear Team

If you have multiple teams in Linear, you can filter by team ID or just leave it blank to see all issues.

## Features

### What You'll See

- **📊 Stats Dashboard**: Quick overview of open PRs, merged PRs, in-progress issues, and completed issues
- **🔍 Search**: Filter PRs and issues by title
- **🎯 Filters**: View all items, just PRs, or just issues
- **📅 Status Filters**: Filter by open, in-progress, or closed
- **🔗 Direct Links**: Click any PR or issue to open it on GitHub/Linear
- **⚡ Real-time**: Click refresh to get the latest data

### Understanding the Display

**Pull Requests show:**
- PR number (e.g., #123)
- Status (OPEN, MERGED, CLOSED)
- Author
- Branch info (source → target)
- Labels
- Created date

**Linear Issues show:**
- Issue identifier (e.g., ENG-42)
- Status (TODO, IN PROGRESS, DONE, etc.)
- Priority (P0, P1, P2, P3, P4)
- Assignee
- Description preview
- Created date

## Troubleshooting

### "Failed to fetch pull requests"
- ✅ Check your GitHub token is valid
- ✅ Make sure the token has `repo` and `read:user` scopes
- ✅ Verify the repository name is correct (`owner/repo`)
- ✅ Ensure you have access to the repository

### "Failed to fetch Linear issues"
- ✅ Check your Linear API key is valid
- ✅ Make sure you have access to Linear
- ✅ Try leaving the team filter empty

### "No items found"
- ✅ Check you've selected a repository in the Git Integration tab
- ✅ Make sure the repository has pull requests
- ✅ Try clicking the refresh button
- ✅ Clear any active filters

### Tokens not saving
- ✅ Make sure you clicked "Connect Services" after pasting tokens
- ✅ Tokens are saved in browser storage (they persist between sessions)

## Privacy & Security

- ✅ Your tokens are stored **locally in your browser only**
- ✅ Tokens are **never sent to any third-party servers**
- ✅ All API calls go directly to GitHub and Linear from your browser
- ✅ You can clear tokens anytime by resetting the app

## Tips

1. **Bookmark your workflow**: Keep the Unified Dashboard tab open to monitor your work
2. **Use filters**: Click status filters to focus on what matters
3. **Search quickly**: Use the search box to find specific PRs or issues
4. **Refresh regularly**: Click the refresh button to see new updates
5. **Open in new tabs**: Cmd/Ctrl + Click on items to open them without losing your place

## Need Help?

If something isn't working:
1. Check this guide first
2. Try refreshing the page
3. Click "RESET ALL" button in the header to clear all data and start fresh
4. Check browser console for error messages (F12 → Console tab)
