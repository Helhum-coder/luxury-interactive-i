# Webhook Integration & Notification System Guide

This comprehensive guide explains the webhook notification system with customizable alerts and filters integrated into the LUXE IDE.

## Overview

The webhook notification system provides:
- **Real-time GitHub repository event monitoring**
- **Automatic branch synchronization triggers**
- **Advanced notification center with filtering**
- **Customizable notification rules and alerts**
- **Webhook delivery tracking and performance metrics**
- **Rule-based notification routing**

## System Architecture

### Components

1. **Webhook Manager**: Receives and processes webhook events from GitHub
2. **Notification Center**: Centralized notification hub with filtering and search
3. **Rule Engine**: Routes and processes notifications based on custom rules
4. **Auto-Sync Engine**: Triggers automatic branch synchronization
5. **Alert System**: Manages visual, audio, and toast notifications

## Getting Started

### Accessing the System

1. Open LUXE IDE
2. Navigate to **Git Integration** tab
3. Access **Webhooks** for webhook configuration
4. Access **Notifications** tab for notification center

## Webhook Configuration

### Creating a Webhook

1. Navigate to **Git Integration** → **Webhooks**
2. Enable monitoring with the toggle switch (bell icon)
3. Click **"New Webhook"** button
4. Configure webhook settings:
   - **Repository**: Enter `owner/repo` or `*` for all repositories
   - **Event Types**: Select which events to monitor (push, PR, workflow, etc.)
   - **Auto-Sync**: Enable to automatically trigger branch synchronization
5. Click **"Create Webhook"**

### Supported Event Types

| Event Type | Description | Recommended Auto-Sync |
|-----------|-------------|----------------------|
| `push` | Code pushed to repository | ✅ Yes |
| `pull_request` | Pull request opened/updated/merged | ✅ Yes |
| `create` | Branch or tag created | ⚠️ Optional |
| `delete` | Branch or tag deleted | ❌ No |
| `release` | Release published | ⚠️ Optional |
| `workflow_run` | GitHub Actions workflow completed | ✅ Yes |
| `deployment` | Deployment status updated | ⚠️ Optional |

### Example Configurations

**Monitor All Repositories**:
```typescript
{
  repository: "*",
  events: ["push", "pull_request"],
  active: true,
  auto_sync: true
}
```

**Specific Repository with Workflow Tracking**:
```typescript
{
  repository: "microsoft/vscode-docs",
  events: ["push", "workflow_run", "release"],
  active: true,
  auto_sync: true
}
```

**Development Branch Monitoring (No Auto-Sync)**:
```typescript
{
  repository: "your-org/dev-repo",
  events: ["push", "pull_request", "create"],
  active: true,
  auto_sync: false  // Manual sync only
}
```

### Managing Webhooks

**Pause Webhook**: Click the pause icon to temporarily disable
**Resume Webhook**: Click the play icon to re-enable
**Delete Webhook**: Click the trash icon to remove configuration

## Notification Center

### Overview

The Notification Center provides a unified view of all system notifications with advanced filtering, categorization, and management capabilities.

### Notification Anatomy

Each notification includes:

```typescript
{
  type: 'webhook',                       // Type indicator
  title: 'Push Event Detected',         // Short title
  message: 'New commits on main branch', // Detailed message
  category: 'Git',                       // Category
  priority: 'high',                      // Priority level
  source: 'GitHub',                      // Source system
  read: false,                           // Read status
  archived: false,                       // Archive status
  actionable: true,                      // Has actions
  actions: [                             // Available actions
    { label: 'View Changes', type: 'primary', action: 'view' },
    { label: 'Sync Now', type: 'primary', action: 'sync' },
    { label: 'Dismiss', type: 'secondary', action: 'dismiss' }
  ]
}
```

### Notification Types

| Type | Icon | Use Case | Color |
|------|------|----------|-------|
| **Info** | ℹ️ | General information | Blue |
| **Success** | ✅ | Completed operations | Green |
| **Warning** | ⚠️ | Attention needed | Yellow |
| **Error** | ❌ | Failed operations | Red |
| **Webhook** | 🔔 | Webhook events | Primary |
| **Sync** | 🔄 | Synchronization | Secondary |
| **Deployment** | 🚀 | Deployments | Accent |

### Priority Levels

| Priority | Description | Visual | Sound | Auto-Archive |
|----------|-------------|--------|-------|--------------|
| **Low** | Informational, no action needed | Green badge | None | After 24h |
| **Medium** | Standard events, review when convenient | Yellow badge | Soft beep | After 12h |
| **High** | Important events, review soon | Orange badge | Medium tone | After 6h |
| **Critical** | Urgent, immediate attention required | Red badge | Alert sound | Manual only |

### Filtering Notifications

#### Using Filters

1. Click **"Filters"** button in Notification Center
2. Select filter criteria:
   - **Type**: Filter by notification type (webhook, sync, etc.)
   - **Priority**: Show specific priority levels
   - **Category**: Filter by category (Git, System, Deployment)
   - **Read Status**: All / Unread / Read
   - **Archived**: Include or exclude archived items
3. Click **"Reset Filters"** to clear all filters

#### Filter Combinations

**Critical Unread Notifications**:
- Priority: Critical
- Read Status: Unread
- Result: Shows only critical items requiring attention

**Git-Related Success Events**:
- Type: Success
- Category: Git
- Result: Shows successful Git operations

**All Webhook Events**:
- Type: Webhook
- Archived: True
- Result: Historical webhook event log

### Managing Notifications

**Mark as Read**: Click any notification to mark as read

**Mark All Read**: Click **"Mark All Read"** button

**Archive Notification**: Click archive icon (📦) on notification

**Delete Notification**: Click delete icon (🗑️) to remove permanently

**Clear All**: Click **"Clear All"** to delete all notifications

### Actionable Notifications

Some notifications include action buttons:

**View Details**: Navigate to related information
**Sync Now**: Trigger manual synchronization
**View Branch**: Open branch details
**Dismiss**: Mark as handled without action
**Retry**: Attempt failed operation again
**Cancel**: Stop in-progress operation

## Notification Rules

### Creating Custom Rules

Define rules to automatically process notifications:

1. Navigate to **Notification Center**
2. Click **"Rules"** button
3. View global settings:
   - **Sound Notifications**: Enable/disable audio alerts
   - **Auto Archive**: Automatically archive old notifications

### Rule Structure

```typescript
{
  name: "Critical Push Alerts",
  enabled: true,
  conditions: {
    type: ["webhook"],
    category: ["Git"],
    priority: ["high", "critical"],
    source: ["GitHub"],
    keywords: ["master", "main", "production"]
  },
  actions: {
    playSound: true,
    showToast: true,
    highlightColor: "red",
    autoArchive: false,
    forwardTo: "webhook-endpoint"
  }
}
```

### Rule Examples

**High Priority Production Alerts**:
- **Conditions**: Type = webhook, Keywords = "production", Priority = critical
- **Actions**: Play sound, Show toast, Highlight red
- **Use Case**: Immediate alerts for production changes

**Auto-Archive Low Priority**:
- **Conditions**: Priority = low
- **Actions**: Auto-archive after 10 seconds
- **Use Case**: Keep notification list clean

**Silent Background Syncs**:
- **Conditions**: Type = sync, Priority = low
- **Actions**: No sound, No toast
- **Use Case**: Avoid notification fatigue

## GitHub Webhook Setup

### Configure Repository Webhooks

1. Navigate to your GitHub repository
2. Go to **Settings** → **Webhooks**
3. Click **"Add webhook"**
4. Configure:
   - **Payload URL**: `https://your-ide-domain.com/api/webhooks`
   - **Content type**: `application/json`
   - **Secret**: Generate secure secret token
   - **Events**: Select events to send
   - **Active**: Ensure checked
5. Click **"Add webhook"**

### Webhook Security

**Validate Webhook Signatures**:
```typescript
import crypto from 'crypto'

function validateGitHubWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = 'sha256=' + hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}
```

**Best Practices**:
- Store secrets in environment variables
- Never commit secrets to repository
- Rotate secrets periodically
- Monitor delivery logs for suspicious activity
- Implement rate limiting

## Auto-Sync Integration

### Enabling Auto-Sync

When creating webhooks:
1. Check **"Automatically trigger sync on events"**
2. Select appropriate event types
3. Save configuration

### How Auto-Sync Works

1. **Webhook Event Received**: GitHub sends event to LUXE IDE
2. **Event Filtered**: System checks if event matches webhook config
3. **Notification Created**: Alert appears in Notification Center
4. **Auto-Sync Triggered**: If enabled, sync begins automatically
5. **Progress Tracked**: Sync status shown in real-time
6. **Completion Notified**: Success/failure notification sent

### Sync Notifications

During auto-sync, you'll receive:

1. **Trigger Notification**:
   - Title: "Auto-Sync Triggered"
   - Message: "Synchronizing [branch] after [event]"
   - Priority: High
   - Actions: View Branch, Cancel Sync

2. **Progress Updates**:
   - In-progress status indicators
   - Real-time sync status

3. **Completion Notification**:
   - Success: "Sync Completed Successfully"
   - Failure: "Sync Failed" with error details

### Manual Sync Override

Even with auto-sync enabled, you can:
- Trigger manual sync from Git Integration Manager
- Cancel in-progress auto-sync
- Override auto-sync behavior temporarily

## Monitoring & Analytics

### Webhook Metrics

Track performance in real-time:

**Dashboard Metrics**:
- **Total Events**: Count of all received webhook events
- **Processed**: Successfully handled events
- **Auto-Synced**: Events that triggered synchronization
- **Average Response Time**: Processing speed (milliseconds)

### Event Timeline

View comprehensive event history:
- Event type with icon
- Timestamp and actor
- Repository and branch
- Processing status (processed/pending)
- Auto-sync status
- Payload preview

### Delivery Tracking

Monitor webhook deliveries:
- Delivery success rates
- Response times per event type
- Failed delivery analysis
- Payload size tracking

## Testing & Simulation

### Manual Event Simulation

Test without actual GitHub events:

1. Navigate to **Webhooks** in Git Integration
2. Click simulation buttons:
   - **"Simulate Push"**: Test push event handling
   - **"Simulate PR"**: Test pull request processing
   - **"Simulate Workflow"**: Test workflow completion
3. Observe:
   - Webhook event appears in event list
   - Notification created in Notification Center
   - Auto-sync triggered (if enabled)
   - Filters and rules applied

### Testing Checklist

Before going live:
- ✅ Webhook receives test events
- ✅ Events appear in Webhook Manager
- ✅ Notifications created correctly
- ✅ Filters work as expected
- ✅ Rules apply actions properly
- ✅ Auto-sync triggers correctly
- ✅ Sounds play (if enabled)
- ✅ Toast notifications appear
- ✅ Archive functions work
- ✅ Delete removes notifications

## Troubleshooting

### Webhooks Not Appearing

**Check LUXE IDE Configuration**:
- Verify webhook monitoring is enabled (toggle ON)
- Confirm repository name matches GitHub exactly
- Ensure event types are selected
- Check webhook marked as active

**Check GitHub Configuration**:
- Verify webhook configured in repository settings
- Check webhook delivery logs in GitHub
- Confirm payload URL is correct and accessible
- Verify webhook secret matches

**Network Issues**:
- Check firewall rules
- Verify DNS resolution
- Test webhook endpoint manually
- Check SSL certificate validity

### Notifications Not Showing

**Check Filters**:
- Review active filters in Notification Center
- Ensure notification type isn't filtered out
- Check priority level filters
- Verify read status filter
- Confirm archived setting

**Check Rules**:
- Ensure rules aren't auto-archiving immediately
- Verify rule conditions aren't too restrictive
- Check rule is enabled
- Review rule action settings

**Browser Issues**:
- Check browser console for errors
- Clear browser cache
- Verify localStorage not full
- Test in different browser

### Auto-Sync Not Triggering

**Verify Configuration**:
- Auto-sync checkbox is checked
- Event type is sync-eligible (push, PR, workflow)
- Branch is configured in Git Manager
- No conflicts preventing sync

**Check Logs**:
- Review sync-related notifications
- Check for error messages in notifications
- Look for conflict warnings
- Verify branch status in Git Manager

**Permissions**:
- Ensure GitHub token has repo access
- Verify write permissions on target branch
- Check branch protection rules

### Performance Issues

**High Notification Volume**:
- Apply stricter filters to webhook configs
- Enable auto-archive for low priority
- Increase auto-archive timeout
- Limit webhook event types

**Slow Webhook Processing**:
- Check average response time metric
- Review webhook payload sizes
- Optimize rule conditions
- Reduce number of active webhooks

**Browser Performance**:
- Clear old notifications periodically
- Limit archived notification history
- Disable sound notifications if not needed
- Use read status filters to reduce visible items

## Best Practices

### Webhook Configuration

1. **Start Specific**: Begin with specific repos, expand to `*` carefully
2. **Essential Events Only**: Subscribe only to needed event types
3. **Test Simulation First**: Verify behavior before enabling auto-sync
4. **Monitor Initial Period**: Watch first 24 hours closely
5. **Regular Review**: Audit webhook configs monthly

### Notification Management

1. **Use Filters Actively**: Create filter presets for common views
2. **Archive Regularly**: Keep notification list under 100 items
3. **Prioritize Correctly**: Ensure priority reflects actual urgency
4. **Review Rules Weekly**: Adjust rules based on usage patterns
5. **Clean Up Old**: Delete notifications older than 30 days

### Auto-Sync Strategy

1. **Critical Branches Only**: Enable auto-sync for main/master/production
2. **Workflow-Driven**: Use workflow_run events for CI/CD validated syncs
3. **Manual Override Available**: Always keep manual sync option
4. **Monitor Success Rate**: Track auto-sync success in metrics
5. **Handle Failures**: Create rules for failed sync alerts

### Security & Privacy

1. **Protect Secrets**: Never expose webhook secrets in logs
2. **Validate Always**: Always verify webhook signatures
3. **Rate Limiting**: Implement rate limits on endpoints
4. **Audit Logs**: Maintain logs of webhook activity
5. **Access Control**: Restrict webhook config changes to admins

## Advanced Features

### Custom Sound Alerts

Notifications can play different sounds based on priority:

```typescript
const playNotificationSound = (priority: string) => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  switch (priority) {
    case 'critical':
      oscillator.frequency.value = 880  // High frequency
      gainNode.gain.value = 0.3         // Louder volume
      break
    case 'high':
      oscillator.frequency.value = 660
      gainNode.gain.value = 0.2
      break
    default:
      oscillator.frequency.value = 440  // Standard A note
      gainNode.gain.value = 0.1         // Quiet
  }

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.1)
}
```

### Webhook Payload Transformation

Transform GitHub payloads to system format:

```typescript
function transformGitHubWebhook(githubPayload: any): WebhookEvent {
  return {
    id: generateUniqueId(),
    timestamp: Date.now(),
    event_type: githubPayload.action || 'push',
    repository: githubPayload.repository.full_name,
    branch: extractBranchFromRef(githubPayload.ref),
    actor: githubPayload.sender.login,
    payload: {
      ref: githubPayload.ref,
      commits: githubPayload.commits?.map(c => ({
        id: c.id,
        message: c.message,
        author: { name: c.author.name }
      })),
      pull_request: githubPayload.pull_request ? {
        number: githubPayload.pull_request.number,
        title: githubPayload.pull_request.title,
        state: githubPayload.pull_request.state
      } : undefined
    },
    processed: false,
    auto_synced: false
  }
}
```

### External Notification Forwarding

Forward notifications to external systems:

```typescript
async function forwardNotification(
  notification: NotificationAlert,
  endpoint: string
) {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Notification-Priority': notification.priority
      },
      body: JSON.stringify({
        title: notification.title,
        message: notification.message,
        timestamp: notification.timestamp,
        metadata: notification.metadata
      })
    })
  } catch (error) {
    console.error('Failed to forward notification:', error)
  }
}
```

## API Reference

### WebhookEvent Interface

```typescript
interface WebhookEvent {
  id: string                  // Unique event identifier
  timestamp: number           // Unix timestamp (milliseconds)
  event_type: string          // Event type (push, pull_request, etc.)
  repository: string          // Full repository name (owner/repo)
  branch: string              // Branch name
  actor: string               // GitHub username who triggered
  payload: {                  // Event-specific data
    ref?: string
    commits?: Array<{
      id: string
      message: string
      author: { name: string }
    }>
    pull_request?: {
      number: number
      title: string
      state: string
    }
  }
  processed: boolean          // Has been processed
  auto_synced: boolean        // Triggered auto-sync
}
```

### NotificationAlert Interface

```typescript
interface NotificationAlert {
  id: string                  // Unique notification ID
  timestamp: number           // Creation timestamp
  type: 'info' | 'success' | 'warning' | 'error' | 
        'webhook' | 'sync' | 'deployment'
  title: string               // Short title
  message: string             // Detailed message
  category: string            // Category (Git, System, etc.)
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean               // Read status
  archived: boolean           // Archived status
  source: string              // Source system name
  metadata?: any              // Additional data
  actionable: boolean         // Has action buttons
  actions?: NotificationAction[]  // Available actions
}
```

### NotificationRule Interface

```typescript
interface NotificationRule {
  id: string                  // Unique rule ID
  name: string                // Human-readable name
  enabled: boolean            // Is rule active
  conditions: {               // Matching conditions (AND logic)
    type?: string[]           // Notification types
    category?: string[]       // Categories
    priority?: string[]       // Priority levels
    source?: string[]         // Source systems
    keywords?: string[]       // Text search terms
  }
  actions: {                  // Actions to take when matched
    playSound?: boolean       // Play audio alert
    showToast?: boolean       // Show toast notification
    highlightColor?: string   // Visual highlight color
    autoArchive?: boolean     // Auto-archive after delay
    forwardTo?: string        // External webhook URL
  }
  created_at: number          // Creation timestamp
}
```

## Integration Examples

### With Git Integration Manager

```typescript
<GitIntegrationManager 
  onNotification={(type, title, message, options) => {
    createNotification(type, title, message, {
      category: 'Git',
      ...options
    })
  }}
/>
```

### With Webhook Manager

```typescript
<WebhookManager 
  branches={gitBranches}
  onTriggerSync={(branch) => {
    triggerBranchSync(branch)
  }}
  onNotification={(type, title, message, options) => {
    createNotification(type, title, message, options)
  }}
/>
```

## Support & Resources

### Documentation

- [Main README](README.md) - Project overview
- [Git Integration Guide](GIT_INTEGRATION_GUIDE.md) - Git setup
- [System Architecture](SYSTEM_ARCHITECTURE.md) - Technical details
- [Security Guide](SECURITY.md) - Security best practices

### External Resources

- [GitHub Webhooks Docs](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [GitHub Events API](https://docs.github.com/en/rest/activity/events)
- [Webhook Security](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks)

### Getting Help

For issues or questions:
1. Check notification error messages
2. Review webhook delivery logs in GitHub
3. Verify configuration settings match this guide
4. Test with simulation tools
5. Check browser console for JavaScript errors
6. Review Network tab for failed API calls

---

**Last Updated**: 2024
**Version**: 2.0
**Component**: Webhook & Notification System
