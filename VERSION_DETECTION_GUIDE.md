# Version Detection System

## Overview

The LUXE IDE now includes an automatic version detection system that monitors and displays version information from `package.json` files across your local project and connected GitHub repositories.

## Features

### 🔍 Automatic Detection
- **Local Project Scanning**: Automatically detects versions from your local `package.json` on app startup
- **Repository Integration**: Fetches version info from GitHub repositories when authenticated
- **Real-time Updates**: Manual refresh capability with visual feedback

### 📦 Comprehensive Information
The system detects and displays:
- **Application Version**: Main app version from `package.json`
- **CLI Tool Versions**: Vite, TypeScript, React, and other key development tools
- **Dependencies**: Complete list of production dependencies with versions
- **Dev Dependencies**: Development dependencies and their versions

### 🎯 Multiple Access Points

#### 1. Version Tab
Navigate to the **VERSIONS** tab to access the full version dashboard with:
- Local project version overview
- Repository version tracking
- CLI tools showcase
- Detailed dependency lists

#### 2. Header Display
The app version is automatically displayed in the header next to "Premium Command Center" with a styled badge showing `v0.0.0` format.

#### 3. Console Commands
Use the console to interact with version detection:

```bash
version              # Show current version information
detect versions      # Re-scan and update version data
help                 # See all available commands
```

#### 4. Version Badge Component
For developers: Use the `<VersionBadge>` component to display version info inline:

```tsx
import VersionBadge from '@/components/VersionBadge'

<VersionBadge 
  owner="username" 
  repo="repository" 
  branch="main" 
  token={githubToken}
/>
```

## API Reference

### Version Detector Functions

```typescript
// Detect versions from package.json content
detectVersionsFromPackageJson(content: string): Promise<VersionInfo>

// Fetch and detect from GitHub repository
detectVersionsFromGitHub(
  owner: string, 
  repo: string, 
  branch: string, 
  token?: string
): Promise<VersionInfo>

// Detect from local project
detectLocalVersion(): Promise<VersionInfo>

// Compare version numbers
compareVersions(v1: string, v2: string): number

// Check if version is outdated
isVersionOutdated(current: string, latest: string): boolean

// Get version status
getVersionStatus(current: string, latest: string): 'up-to-date' | 'minor-update' | 'major-update'
```

### Data Structures

```typescript
interface VersionInfo {
  appVersion: string
  cliVersions: {
    npm?: string
    node?: string
    git?: string
    vite?: string
    typescript?: string
    react?: string
  }
  dependencies: {
    name: string
    version: string
    type: 'dependency' | 'devDependency'
  }[]
  lastDetected: number
}

interface RepositoryVersions {
  owner: string
  repo: string
  branch: string
  versions: VersionInfo
}
```

## Usage Examples

### Console Commands

```bash
# Show version info
> version
Application Version: v0.0.0
├─ Vite: v6.3.5
├─ TypeScript: v5.7.2
├─ React: v19.0.0
└─ Total Dependencies: 75

# Re-detect all versions
> detect versions
Detecting version information...
Version detection complete
```

### Programmatic Usage

```typescript
import { detectLocalVersion } from '@/lib/version-detector'

const versionInfo = await detectLocalVersion()
console.log(`App version: ${versionInfo.appVersion}`)
console.log(`Dependencies: ${versionInfo.dependencies.length}`)
```

### React Component Integration

```tsx
import { useState, useEffect } from 'react'
import { detectLocalVersion } from '@/lib/version-detector'

function MyComponent() {
  const [version, setVersion] = useState('0.0.0')
  
  useEffect(() => {
    detectLocalVersion().then(info => {
      setVersion(info.appVersion)
    })
  }, [])
  
  return <div>v{version}</div>
}
```

## GitHub Integration

To detect versions from GitHub repositories:

1. **Authenticate with GitHub**: Use the GitHub OAuth integration in the GIT INTEGRATION tab
2. **Access Token**: The system uses your GitHub token to fetch `package.json` files
3. **Repository Access**: Ensure you have read permissions for the repositories you want to scan

### Detecting Remote Versions

The version detector can fetch `package.json` from any GitHub repository you have access to:

```typescript
import { detectVersionsFromGitHub } from '@/lib/version-detector'

const versions = await detectVersionsFromGitHub(
  'microsoft',      // owner
  'vscode',         // repo
  'main',          // branch
  githubToken      // your access token
)
```

## Storage and Persistence

Version data is stored using the Spark KV system:

- `repository-versions`: Array of detected repository versions
- `version-auto-detect`: Boolean for auto-detection on startup
- `version-last-detection`: Timestamp of last detection

## UI Components

### Version Detector Component
Full-featured version dashboard with tabs for:
- **LOCAL PROJECT**: Shows current project's package versions
- **REPOSITORIES**: Lists versions from connected GitHub repos
- **CLI TOOLS**: Displays key development tool versions

### Version Badge Component
Compact, inline version display with popover details:
- Shows version number in a styled badge
- Click to reveal detailed version information
- Automatic refresh capability
- Loading and error states

## Best Practices

1. **Regular Updates**: Run `detect versions` command periodically to keep data fresh
2. **GitHub Authentication**: Authenticate with GitHub to enable repository version detection
3. **Version Monitoring**: Check the VERSIONS tab regularly to stay informed about dependencies
4. **Console Integration**: Use console commands for quick version checks during development

## Troubleshooting

### Version Not Detected
- Ensure `package.json` exists in your project root
- Check that the file is valid JSON
- Verify file permissions

### GitHub Repository Access Denied
- Confirm you're authenticated with GitHub
- Check that your token has `repo` read permissions
- Verify the repository owner and name are correct

### Outdated Version Info
- Click the refresh button in the Version Detector
- Run `detect versions` in any console
- Check the "Last detected" timestamp

## Integration with Git System

The version detection system integrates with:
- **Git Integration Manager**: Shows version badges for connected repositories
- **Webhook System**: Can trigger version re-detection on push events
- **Console System**: Accessible via commands in all consoles
- **Notification System**: Alerts on version updates (if configured)

## Future Enhancements

Planned features include:
- Automatic version update notifications
- Dependency vulnerability scanning
- Version comparison across branches
- Automated changelog generation
- npm registry integration for latest versions
- Workspace package detection for monorepos

## Related Documentation

- [Git Integration Guide](./GIT_INTEGRATION_GUIDE.md)
- [Webhook Integration](./WEBHOOK_INTEGRATION_GUIDE.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
