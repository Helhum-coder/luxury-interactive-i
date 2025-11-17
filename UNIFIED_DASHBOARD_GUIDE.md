# Unified Dashboard - GitHub PRs & Linear Issues

## Overview

The Unified Dashboard brings together your GitHub Pull Requests and Linear Issues in one beautiful, interactive interface. View, filter, and manage both systems seamlessly within LUXE IDE.

## Features

### 🎯 Core Functionality
- **Unified View**: See GitHub PRs and Linear issues in a single, organized dashboard
- **Real-time Sync**: Refresh data from both platforms with a single click
- **Smart Filtering**: Filter by status (open, in-progress, closed) and search across all items
- **Beautiful Stats**: Overview cards showing key metrics at a glance
- **Direct Links**: Click any item to open it in GitHub or Linear

### 📊 Dashboard Sections

1. **All Items** - Combined view of PRs and issues sorted by update time
2. **Pull Requests** - GitHub PRs only with full details
3. **Linear Issues** - Linear issues with priority and status

### 🎨 Visual Indicators

- **Status Colors**: Color-coded states for quick recognition
- **Priority Badges**: Clear priority levels (P0-P4) for Linear issues
- **Labels & Tags**: GitHub labels and Linear metadata displayed inline
- **Activity Indicators**: Timestamps showing when items were created/updated

## Setup Instructions

### Step 1: Generate GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "LUXE IDE Access"
4. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

**Example token format**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Get Linear API Key

1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a name like "LUXE IDE Integration"
4. Copy the generated key

**Example key format**: `lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Configure LUXE IDE

1. Open LUXE IDE
2. Navigate to the **UNIFIED DASHBOARD** tab
3. Enter your GitHub token in the first field
4. Enter your Linear API key in the second field
5. Click **Connect Services**

### Step 4: Select Repository and Team (Optional)

The dashboard will automatically fetch:
- All accessible GitHub repositories
- All accessible Linear teams

You can filter by specific repos/teams using the provided selectors.

## Usage Guide

### Viewing Items

**All Items View**
- Shows combined PRs and issues
- Sorted by most recently updated
- Mixed display with clear type indicators

**Pull Requests View**
- Shows only GitHub PRs
- Displays branch names, labels, assignees
- Color-coded by state (open/merged/closed)

**Linear Issues View**
- Shows only Linear issues
- Displays priority, assignee, state
- Organized by Linear workflow states

### Filtering

**Status Filters**:
- **All**: Show everything
- **Open**: Open PRs and backlog/unstarted issues
- **In Progress**: Active items being worked on
- **Closed**: Merged/closed PRs and completed issues

**Search**: Type in the search box to filter by title across all items

### Understanding Status Colors

**Pull Requests**:
- 🟢 Green (Open) - Active PR awaiting review
- 🟣 Purple (Merged) - Successfully merged
- ⚪ Gray (Closed) - Closed without merging

**Linear Issues**:
- 🟡 Yellow (Backlog/Todo) - Not yet started
- 🔵 Blue (In Progress) - Currently being worked on
- 🟢 Green (Done/Completed) - Finished

### Priority Levels (Linear)

- **P0** - Critical (Red border)
- **P1** - High (Orange/Yellow border)
- **P2** - Medium (Default)
- **P3** - Low (Default)
- **P4** - Backlog (Default)

## Statistics Overview

The dashboard header shows:

1. **Open PRs** - Number of active pull requests
2. **Merged PRs** - Successfully merged PRs count
3. **In Progress** - Linear issues currently being worked on
4. **Completed** - Finished Linear issues

## Refreshing Data

Click the refresh button (⟳) in the top-right to fetch the latest data from both GitHub and Linear.

The dashboard automatically refreshes when:
- You first connect your accounts
- You change the selected repository or team
- You manually click refresh

## Security Notes

### Token Storage
- Tokens are stored securely in the Spark KV store
- They persist across sessions
- Only accessible within your LUXE IDE instance

### Best Practices
1. **Never share** your API tokens
2. **Rotate tokens** periodically (every 90 days recommended)
3. **Use minimal scopes** - only grant necessary permissions
4. **Revoke unused tokens** from GitHub/Linear settings

## Troubleshooting

### "Failed to fetch pull requests"
- **Check**: Is your GitHub token valid?
- **Check**: Does the selected repository exist?
- **Solution**: Regenerate token with correct scopes

### "Failed to fetch Linear issues"
- **Check**: Is your Linear API key valid?
- **Check**: Do you have access to the selected team?
- **Solution**: Generate a new API key from Linear settings

### "No items found"
- **Check**: Are your filters too restrictive?
- **Check**: Does the repository/team have PRs/issues?
- **Solution**: Try "All" status filter and clear search

### Token Not Saving
- **Check**: Did you click "Connect Services" button?
- **Check**: Are both fields filled in?
- **Solution**: Re-enter both tokens and click save again

## API Rate Limits

### GitHub
- **5,000 requests/hour** with authentication
- The dashboard uses ~2-3 requests per refresh
- Rate limit resets hourly

### Linear
- **1,000 requests/hour** per API key
- The dashboard uses ~1-2 requests per refresh
- Consider caching for high-frequency usage

## Integration Workflows

### Linking PRs to Issues

While the dashboard displays items separately, you can create workflows:

1. **PR Naming**: Use Linear issue IDs in PR titles (e.g., `[LIN-123] Fix bug`)
2. **Cross-referencing**: Add GitHub PR links to Linear issue descriptions
3. **Status Sync**: Manually update Linear issues when PRs are merged

### Team Collaboration

- Share specific filters with your team
- Use consistent labeling across GitHub and Linear
- Coordinate PR reviews with Linear issue assignments

## Advanced Features

### Batch Operations (Coming Soon)
- Bulk status updates
- Mass labeling
- Batch PR reviews

### Analytics (Coming Soon)
- Velocity tracking
- Time-to-merge metrics
- Issue completion rates

### Webhooks (Coming Soon)
- Real-time updates without refresh
- Automatic status synchronization
- Slack/Discord notifications

## Keyboard Shortcuts (Coming Soon)

- `R` - Refresh data
- `F` - Focus search
- `1-3` - Switch between tabs
- `Esc` - Clear search

## Support

For issues or feature requests:
1. Check the console for error messages
2. Verify your API tokens are valid
3. Check GitHub/Linear service status
4. Review the troubleshooting section above

## Related Documentation

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Linear API Documentation](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [GIT_INTEGRATION_GUIDE.md](./GIT_INTEGRATION_GUIDE.md)
- [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Component**: UnifiedDashboard.tsx
