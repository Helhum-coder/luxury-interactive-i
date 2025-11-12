# Webhook Integration Guide

## Overview

The LUXE IDE Webhook Integration system enables real-time monitoring of repository events and automatic synchronization across your hybrid git infrastructure. This document explains how to configure and use webhooks to keep your master and main branches in sync with live deployments.

## Features

### Real-Time Event Monitoring
- **Push Events**: Track commits pushed to any branch
- **Pull Requests**: Monitor PR creation, updates, and merges
- **Branch Operations**: Detect branch creation and deletion
- **Workflow Runs**: Track GitHub Actions and CI/CD pipeline executions
- **Deployments**: Monitor deployment events to Firebase, live servers, and other platforms
- **Releases**: Track version releases and tags

### Automatic Synchronization
When webhook monitoring is enabled with auto-sync:
1. Repository events are captured in real-time
2. Events are filtered based on configured event types
3. Matching events trigger automatic branch synchronization
4. Integration targets (Firebase, Live Server) are updated
5. Sync activity is logged for audit and troubleshooting

## Configuration

### Creating a Webhook Configuration

1. **Navigate to Git Integration → Webhooks tab**
2. **Click "New Webhook"**
3. **Configure the webhook:**
   - **Repository**: Enter `owner/repo` or use `*` for all repositories
   - **Events**: Select which event types to monitor
   - **Auto-sync**: Enable to automatically trigger syncs on events
4. **Click "Create Webhook"**

### Example Configurations

#### Production Deployment Webhook
```
Repository: your-org/device-streaming
Events: push, release, workflow_run
Auto-sync: Enabled
Target Branch: master
```

This configuration monitors production-ready events and automatically syncs the master branch for live deployment.

#### Development Workflow Webhook
```
Repository: your-org/main-repo
Events: push, pull_request, create, delete
Auto-sync: Enabled
Target Branch: main
```

This configuration tracks all development activity in the main branch where workflows and automation are managed.

#### Multi-Repository Monitor
```
Repository: *
Events: workflow_run, deployment
Auto-sync: Disabled
```

This configuration monitors CI/CD and deployment events across all repositories without automatic syncing (manual review required).

## Webhook Events

### Push Event
Triggered when commits are pushed to a repository.

**Payload includes:**
- Commit SHA and message
- Author information
- Modified files
- Branch reference

**Auto-sync behavior:**
- Pulls latest changes from remote
- Syncs specified branch
- Triggers integration updates

### Pull Request Event
Triggered on PR creation, update, or merge.

**Payload includes:**
- PR number and title
- Source and target branches
- Review status
- Merge status

**Auto-sync behavior:**
- Updates branch status
- Syncs when PR is merged
- Notifies of conflicts

### Workflow Run Event
Triggered when GitHub Actions workflows execute.

**Payload includes:**
- Workflow name and status
- Trigger event
- Job outcomes
- Artifact information

**Auto-sync behavior:**
- Waits for workflow completion
- Syncs if workflow successful
- Reports failures

## Integration with Hybrid System

### Master Branch
The master branch serves as your **live production deployment**. Configure webhooks to monitor:
- Production releases
- Hotfix pushes
- Deployment workflow completions

Integrations:
- Live Server (auto-deploy on sync)
- Firebase Hosting (production target)
- CDN invalidation triggers

### Main Branch
The main branch manages **workflows, automation, and CI/CD**. Configure webhooks to monitor:
- Workflow file updates
- GitHub Actions runs
- Configuration changes

Integrations:
- GitHub Actions
- Firebase Functions
- VS Code Dev Containers

## Monitoring Dashboard

### Event Stream
View real-time webhook events as they arrive:
- Event type and timestamp
- Repository and branch
- Actor (user or bot)
- Processing status
- Auto-sync status

### Configuration Panel
Manage webhook configurations:
- Enable/disable webhooks
- Edit event filters
- View delivery statistics
- Delete configurations

### Statistics
Track webhook performance:
- Total events received
- Events processed
- Auto-syncs triggered
- Average response time

## Best Practices

### Security
1. **Use specific repository targets** instead of wildcard when possible
2. **Review webhook events** before enabling auto-sync
3. **Monitor sync activity** for unexpected behavior
4. **Test webhook configurations** in a safe environment first

### Performance
1. **Limit event types** to only what you need
2. **Use auto-sync selectively** for critical paths only
3. **Review and clear old events** periodically
4. **Monitor response times** and adjust as needed

### Reliability
1. **Configure webhooks for both branches** (master and main)
2. **Enable monitoring during active development**
3. **Pause auto-sync during critical operations**
4. **Keep backup configurations** for disaster recovery

## Troubleshooting

### Events Not Appearing
1. Check webhook configuration is active
2. Verify event types are selected
3. Ensure monitoring is enabled
4. Review repository name matches

### Auto-Sync Not Triggering
1. Verify auto-sync is enabled in configuration
2. Check event type matches configuration
3. Ensure branch matches expected target
4. Review sync activity logs for errors

### Performance Issues
1. Reduce number of monitored event types
2. Use specific repository targets
3. Disable auto-sync for non-critical events
4. Clear old event history

## Manual Event Simulation

For testing and development, you can manually trigger webhook events:

1. **Navigate to Webhooks tab**
2. **Use simulation buttons** to trigger test events:
   - Simulate Push
   - Simulate PR
   - Simulate Workflow

This helps verify your webhook configurations work correctly before connecting to live repositories.

## API Integration

The webhook system can be extended to accept real GitHub webhooks via an API endpoint:

### Webhook Endpoint
```
POST /api/webhooks/github
```

### Required Headers
```
X-GitHub-Event: push
X-Hub-Signature-256: [signature]
Content-Type: application/json
```

### Payload
Standard GitHub webhook payload format

## Support

For issues or questions about webhook integration:
1. Review this documentation
2. Check sync activity logs in Live Sync tab
3. Test with manual event simulation
4. Review conflict resolution strategies

---

**LUXE IDE** - Premium Command Center for Hybrid Git Systems
