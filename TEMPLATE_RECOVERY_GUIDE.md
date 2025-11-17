# Template Protection & Recovery Guide

## Overview
This guide explains how your personal templates are protected from deletion and how to recover them if needed.

## Automatic Protection Features

### 1. Auto-Backup System
- **Frequency**: Every 5 minutes when templates exist
- **Storage**: Up to 10 backup snapshots stored in persistent KV storage
- **Coverage**: All custom templates are backed up automatically
- **Visibility**: Last backup time displayed in template manager header

### 2. Persistent Storage
Your templates use the `useKV` hook which stores data in a persistent key-value store that survives:
- Browser refreshes
- Tab closes
- Computer restarts
- Deployments

### 3. Export/Import Protection
- **Export Single**: Download any template as JSON
- **Export All**: Backup all templates at once
- **Import**: Restore templates from exported files
- **Format**: Human-readable JSON format

## How Templates Are Stored

Templates are stored in multiple locations for redundancy:

```
Key-Value Store:
├── user-custom-templates    (Primary storage for all templates)
├── template-backups          (10 most recent auto-backups)
└── last-template-backup      (Timestamp of last backup)
```

## Recovery Procedures

### If Templates Disappear

1. **Check Auto-Backups**
   - Open the Personal Templates tab
   - Check "Last backup" badge in header
   - If recent backup exists, templates should auto-restore

2. **Manual Restoration**
   - Click the backup icon (💾) in header to trigger manual backup
   - This will create a new snapshot of current state

3. **Import from Export**
   - If you previously exported templates, click upload icon (⬆️)
   - Select your exported .json file
   - Templates will be imported immediately

### Preventing Loss

1. **Regular Exports**
   ```
   - Click "Download" icon (⬇️) to export all templates
   - Save file to secure location (cloud storage, backup drive)
   - Do this weekly or after creating important templates
   ```

2. **Version Control**
   - Each template has a version number
   - Duplicating templates creates new versions
   - Keep multiple versions of critical templates

3. **Naming Convention**
   ```
   Use descriptive names:
   ✓ Q4-2025-Sales-Dashboard
   ✓ Client-ABC-Analytics-v2
   ✗ Dashboard
   ✗ Test
   ```

## Understanding Copilot Branches

The "Copilot Logs" tab reveals:

### Hidden Copilot Activity
- **Branches**: Git branches created by GitHub Copilot
- **Pattern**: Usually named `copilot/fix-XXXX` or `copilot/feature-XXXX`
- **Commits**: Changes made automatically by Copilot
- **Files**: Which files were modified

### Why This Matters
- Copilot may create branches without explicit user action
- These branches can contain automated fixes or suggestions
- Understanding these helps track unexpected changes
- Useful for debugging deployment issues

### Common Copilot Patterns
```
copilot/fix-5501681c-36cf-43cf-a621    (Auto-fix branch)
copilot/feature-b439c4                  (Feature suggestion)
Helhum-coder/copilot/*                  (User-scoped copilot branches)
```

## Scrolling Through Content

All sections now have enhanced scrolling:

### Console Views
- Each console has independent scrolling
- Auto-scrolls to latest messages
- Manual scroll to review history
- Copy button to save console output

### Template Lists
- Smooth scrolling through all templates
- Filter and search without losing scroll position
- Grid layout adapts to screen size

### Copilot Logs
- **Branch Lists**: Scroll through all branches
- **Commit History**: Scroll through full git history
- **Search**: Filter logs while maintaining scroll context
- **Details**: Expand to see file changes

## Best Practices

### For Template Safety
1. **Create templates with clear names**
2. **Add detailed descriptions**
3. **Use tags for organization**
4. **Export important templates monthly**
5. **Test restoration process once**

### For Copilot Awareness
1. **Check Copilot Logs tab weekly**
2. **Review branches with "copilot" in name**
3. **Understand which files Copilot modified**
4. **Merge or delete old copilot branches**

### For Vercel Deployments
1. **Monitor deployment branches**
2. **Check for hidden copilot branches before deploying**
3. **Review commit history in Copilot Logs**
4. **Ensure main branch reflects intended state**

## Troubleshooting

### Templates Not Showing
```
1. Click refresh/reload button
2. Check if filters are too restrictive
3. Try "My Templates" button to show only custom ones
4. Clear search box
5. Set industry and category to "All"
```

### Can't Create Templates
```
1. Ensure template name is filled
2. Check browser console for errors
3. Try simpler template first
4. Export existing templates as backup
5. Refresh page and try again
```

### Backup Not Working
```
1. Check KV storage isn't full
2. Verify templates exist before backup
3. Look for "Last backup" timestamp
4. Manual backup with 💾 button
5. Export to file as alternative
```

## Technical Details

### Storage Technology
- **Key-Value Store**: Persistent, distributed storage
- **Automatic Syncing**: Changes sync across sessions
- **No Size Limit**: Within reasonable template counts
- **Instant Access**: No loading delays

### Data Format
```json
{
  "id": "template-unique-id",
  "name": "My Dashboard",
  "description": "Custom analytics",
  "industry": "finance",
  "widgets": [...],
  "tags": ["sales", "quarterly"],
  "isCustom": true,
  "isFavorite": false,
  "category": "work",
  "version": 1,
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "createdBy": "user-id"
}
```

### Backup Format
```json
{
  "backupId": "backup-unique-id",
  "timestamp": 1234567890,
  "userId": "user-id",
  "templates": [...all templates...],
  "version": "1.0.0"
}
```

## Support

If templates are still being deleted:
1. Check browser's local storage settings
2. Verify no browser extensions are clearing data
3. Ensure cookies/storage aren't auto-cleared
4. Try different browser to test
5. Review browser console for errors

## Summary

Your templates are protected by:
- ✅ Automatic backups every 5 minutes
- ✅ Persistent key-value storage
- ✅ Export/import capabilities
- ✅ Version tracking
- ✅ Multiple recovery methods

The system is designed to prevent data loss, but regular manual exports provide an additional safety net.
