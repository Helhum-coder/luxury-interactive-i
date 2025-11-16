# API Integration Guide

## Overview

The LUXE IDE now includes a powerful API Integration Center that securely connects with GitHub and Linear, allowing you to manage your development workflow directly from the IDE.

## 🔐 Security First

**IMPORTANT**: This integration is designed with security as the top priority:

- **No Hardcoded Tokens**: API keys and tokens are NEVER stored in the code
- **Local Storage Only**: Credentials are stored locally in your browser using the secure KV store
- **No Server Transmission**: Your credentials never leave your browser
- **Token Masking**: Tokens are displayed as password fields by default
- **Easy Disconnect**: One-click disconnection clears all stored credentials

## 🚀 Getting Started

### GitHub Integration

#### Step 1: Create a Personal Access Token

1. Visit: [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "LUXE IDE Integration")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `user` (Read user profile data)
   - `read:org` (Read organization data)
5. Set expiration (recommend: 90 days for security)
6. Click "Generate token"
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)

#### Step 2: Connect to LUXE IDE

1. Navigate to the **API INTEGRATION** tab
2. Select the **GitHub** tab
3. Paste your Personal Access Token
4. Click **Connect**
5. You'll see a success message with your GitHub profile

#### Step 3: Use GitHub Features

- **Load Repositories**: View all your repositories with stats
- **Test Octocat API**: Verify API connection with the classic Octocat test
- **View Profile**: See your GitHub profile info, repos, followers

### Linear Integration

#### Step 1: Create an API Key

1. Visit: [https://linear.app/settings/api](https://linear.app/settings/api)
2. Click "Create new API key"
3. Give it a descriptive name (e.g., "LUXE IDE Integration")
4. Copy the generated API key
5. **IMPORTANT**: Store it securely (you won't see it again!)

#### Step 2: Connect to LUXE IDE

1. Navigate to the **API INTEGRATION** tab
2. Select the **Linear** tab
3. Paste your Linear API Key
4. Click **Connect**
5. You'll see a success message with your Linear profile

#### Step 3: Use Linear Features

- **View Teams**: See all your Linear teams
- **Load Issues**: Click on a team to load its issues
- **View Issue Details**: See issue status, priority, assignee, and description

## 🔧 API Capabilities

### GitHub API Features

The integration uses the latest GitHub REST API (v2022-11-28) and supports:

- **User Information**: Get authenticated user details
- **Repository Listing**: View all your repositories with metadata
- **Repository Details**: Get specific repo information
- **Octocat Test**: Classic ASCII art endpoint for testing
- **Future Extensions**: Ready for webhooks, commits, branches, PRs, and more

#### API Endpoints Used

```bash
# Test Connection & Get User
GET https://api.github.com/user

# Get Octocat (Test Endpoint)
GET https://api.github.com/octocat

# List User Repositories
GET https://api.github.com/user/repos?sort=updated&per_page=100

# Get Specific Repository
GET https://api.github.com/repos/{owner}/{repo}
```

### Linear API Features

The integration uses the Linear GraphQL API and supports:

- **Viewer Information**: Get authenticated user details
- **Team Listing**: View all accessible teams
- **Issue Queries**: Fetch issues by team with filters
- **Project Listing**: View projects and their progress
- **Issue Creation**: Create new issues programmatically
- **Issue Updates**: Modify existing issues
- **Issue Search**: Search across all issues

#### GraphQL Queries

```graphql
# Get Current User
query {
  viewer {
    id
    name
    email
  }
}

# Get Teams
query {
  teams {
    nodes {
      id
      name
      key
    }
  }
}

# Get Issues
query($teamId: String, $first: Int) {
  issues(
    filter: { team: { id: { eq: $teamId } } }
    first: $first
    orderBy: updatedAt
  ) {
    nodes {
      id
      identifier
      title
      description
      priority
      state {
        name
        type
      }
      assignee {
        name
        email
      }
      url
    }
  }
}
```

## 🔄 Workflow Examples

### Example 1: Monitor Repository Activity

```typescript
// Connect to GitHub
const repos = await apiManager.getGitHubRepositories()

// Find your active projects
const activeRepos = repos.filter(repo => 
  repo.open_issues_count > 0 || 
  new Date(repo.pushed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
)

// Display in dashboard
console.log(`You have ${activeRepos.length} active repositories`)
```

### Example 2: Sync Linear Issues with Git Branches

```typescript
// Get Linear issues for your team
const client = createLinearClient(apiKey)
const issues = await client.getIssues(teamId)

// Filter by status
const inProgress = issues.filter(issue => issue.state.type === 'started')

// Create branch names from issue identifiers
inProgress.forEach(issue => {
  console.log(`Branch: ${issue.identifier}-${issue.title.toLowerCase().replace(/\s+/g, '-')}`)
})
```

### Example 3: Create Issue from Deployment

```typescript
// After a deployment, create a Linear issue for tracking
const client = createLinearClient(apiKey)

await client.createIssue(
  teamId,
  'Verify Production Deployment v1.2.0',
  'Check all features are working correctly in production',
  1 // High priority
)
```

## 🛡️ Security Best Practices

### Token Management

1. **Rotate Regularly**: Change tokens every 90 days
2. **Use Minimal Scopes**: Only grant necessary permissions
3. **Monitor Usage**: Check GitHub Settings → Applications for active tokens
4. **Revoke Immediately**: If compromised, revoke the token immediately

### What NOT to Do

❌ **NEVER** commit tokens to Git repositories
❌ **NEVER** share tokens via email, chat, or screenshots
❌ **NEVER** use tokens with broader scopes than needed
❌ **NEVER** store tokens in plain text files
❌ **NEVER** reuse tokens across multiple applications

### What TO Do

✅ **DO** use fine-grained personal access tokens when possible
✅ **DO** set expiration dates on all tokens
✅ **DO** use different tokens for different applications
✅ **DO** store tokens in secure password managers
✅ **DO** review and revoke unused tokens regularly

## 🔧 Troubleshooting

### GitHub Connection Issues

**Problem**: "Failed to connect to GitHub"

**Solutions**:
1. Verify token is copied correctly (no extra spaces)
2. Check token has required scopes (repo, user, read:org)
3. Ensure token hasn't expired
4. Try generating a new token

**Problem**: "GitHub API error: 403 Forbidden"

**Solutions**:
1. Token may lack necessary permissions
2. Rate limit may be exceeded (5000 requests/hour for authenticated)
3. Token may be revoked - generate new one

### Linear Connection Issues

**Problem**: "Failed to connect to Linear"

**Solutions**:
1. Verify API key is copied correctly
2. Check you have access to Linear workspace
3. Ensure API key hasn't been revoked
4. Try generating a new API key

**Problem**: "No teams showing"

**Solutions**:
1. Verify you're member of at least one team
2. Check Linear workspace permissions
3. Refresh connection by disconnecting and reconnecting

## 🚀 Advanced Usage

### Extending the Integration

The API manager is designed to be extensible. Here's how to add new features:

```typescript
// In api-manager.ts, add new methods
async getGitHubPullRequests(owner: string, repo: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
  return response.json()
}
```

### Custom Integrations

The architecture supports adding more API integrations:

1. Create new API client (e.g., `src/lib/gitlab-api.ts`)
2. Add credentials to `api-manager.ts`
3. Create UI component in `components/`
4. Add tab to `APIIntegrationManager.tsx`

## 📊 API Rate Limits

### GitHub

- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour
- **GraphQL**: 5,000 points/hour

### Linear

- **Standard**: Rate limits vary by plan
- **Enterprise**: Higher limits available
- **GraphQL Complexity**: Points-based system

## 🔗 Related Features

- **Git Integration Manager**: Works with GitHub API for repository data
- **Version Detector**: Can pull version info from package.json via API
- **Webhook Manager**: Can trigger on GitHub/Linear events
- **CI/CD Pipelines**: Can integrate with GitHub Actions

## 📚 Additional Resources

### GitHub

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

### Linear

- [Linear API Documentation](https://developers.linear.app/docs)
- [Linear GraphQL Schema](https://studio.apollographql.com/public/Linear-API/home)
- [Authentication](https://developers.linear.app/docs/graphql/working-with-the-graphql-api#authentication)

## 🎯 Future Enhancements

Planned features for upcoming releases:

- [ ] GitLab integration
- [ ] Jira integration
- [ ] Slack notifications
- [ ] Discord webhooks
- [ ] Automated issue creation from errors
- [ ] PR review automation
- [ ] Deployment status tracking
- [ ] Time tracking integration
- [ ] Custom webhook endpoints
- [ ] API usage analytics dashboard

## ✨ Tips & Tricks

1. **Quick Test**: Use the "Test Octocat API" button to verify GitHub connection
2. **Search Issues**: Use Linear's search to find specific issues quickly
3. **Team Switching**: Click different teams to view their issues
4. **Token Visibility**: Toggle the eye icon to show/hide tokens
5. **Auto-Refresh**: Disconnect and reconnect to refresh all data

## 💬 Support

If you encounter issues:

1. Check this documentation first
2. Review error messages in browser console (F12)
3. Verify API keys are valid and have correct permissions
4. Try disconnecting and reconnecting
5. Generate fresh API keys if needed

---

**Remember**: Your API credentials are valuable - protect them like passwords! 🔐
