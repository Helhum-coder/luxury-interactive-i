# Port Redirection & Deployment Blocker Diagnostic Tools

## Overview

Two powerful diagnostic and recovery tools have been added to help you identify and resolve port hijacking, unauthorized redirections, and deployment blockers that prevent you from publishing and accessing your clusters.

## New Features

### 1. PORT REDIRECTION DIAGNOSTIC

**Location:** `PORT REDIRECTION FIX` tab

**Purpose:** Identifies when your local ports are being redirected to external destinations instead of binding directly to localhost.

#### Features:
- **Deep Port Scanning**: Analyzes all active ports (3000, 5173, 4173, 8080, 9000, 443, etc.)
- **Redirection Detection**: Identifies unauthorized proxy layers and external redirects
- **Error Code Mapping**: Matches detected issues to known Vercel/deployment error codes
- **Real-time Status**: Shows expected vs actual destinations for each port
- **Severity Classification**: Rates issues as Critical, High, Medium, or Low
- **One-Click Fix**: Removes redirections and restores direct localhost bindings

#### Common Issues Detected:
- Port 3000/5173 redirected to Vercel proxy systems
- Vite dev server routing through Azure/Cloud IPs
- HTTPS traffic forced through cloudworkstations.dev proxy
- GitHub Enterprise sandbox hijacking application ports
- Firewall blocking legitimate port access

#### How to Use:
1. Click `SCAN PORTS` to run deep analysis
2. Review detected issues with severity levels
3. Click `FIX ALL` to remove all redirections at once
4. Or fix individual ports using the button on each issue card

#### Error Codes Reference:
The tool recognizes and explains common deployment error codes:
- `DEPLOYMENT_NOT_READY_REDIRECTING` (303)
- `DEPLOYMENT_BLOCKED` (403)
- `DNS_HOSTNAME_RESOLVE_FAILED` (502)
- `ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR` (502)
- `SANDBOX_NOT_LISTENING` (502)
- `INFINITE_LOOP_DETECTED` (508)

---

### 2. DEPLOYMENT BLOCKER REMOVAL

**Location:** `DEPLOYMENT UNBLOCK` tab

**Purpose:** Identifies and removes restrictions preventing you from publishing your application and accessing your clusters.

#### Features:
- **Comprehensive Blocker Detection**: Scans for firewall rules, permission issues, DNS misconfigurations, deployment errors, and authentication problems
- **Cluster Access Verification**: Checks accessibility of Firebase clusters, GitHub Enterprise, and Vercel deployments
- **Detailed Solutions**: Provides actionable steps for each blocker type
- **Deployment ID Analysis**: Enter your Vercel deployment ID for targeted analysis
- **Batch Removal**: Remove all blockers at once or handle them individually
- **Real-time Status Updates**: Watch as each blocker is removed with progress indication

#### Blocker Types:
1. **Firewall Blockers** (Critical)
   - Cloud Workstations firewall blocking external access
   - Restricts inbound traffic on ports 80, 443

2. **Permission Blockers** (Critical)
   - Insufficient deployment permissions
   - GitHub Enterprise access restrictions
   - Publishing rights not granted

3. **DNS Configuration** (High)
   - DNS redirecting to proxy instead of deployment
   - Custom domain mapping failures

4. **Deployment Configuration** (High)
   - HTML fallback showing instead of React app
   - Build output misconfiguration
   - Routing and navigation failures

5. **Authentication Issues** (Medium)
   - OAuth redirect URI mismatches
   - GitKraken/cluster authentication failures

#### Cluster Access Status:
Monitors and reports on:
- Firebase Developer Documentation Cluster
- GitHub Enterprise (Helhum-coder)
- Vercel Deployments

#### How to Use:
1. Enter your deployment ID (e.g., `dpl_8b7EehuYDTtp8KTX2sWpskLW9kNd`)
2. Click `ANALYZE` to scan for blockers
3. Review detected blockers with severity levels and solutions
4. Click `REMOVE ALL` to clear all blockers at once
5. Or remove individual blockers using their specific buttons
6. Check Cluster Access Status panel to verify accessibility

#### Metrics Dashboard:
- **Blockers Found**: Total number of issues detected
- **Active**: Currently blocking issues
- **Removed**: Successfully cleared blockers
- **Clusters**: Accessible clusters out of total

---

## Integration with Existing Features

These tools complement your existing diagnostic features:
- **Network Diagnostic**: General network connectivity
- **Firewall Recovery**: Firewall-specific fixes
- **Cluster Access Diagnostic**: Cluster authentication
- **Connection Analyzer**: Deep connection analysis

## Technical Details

### Port Redirection Detection
The tool analyzes:
- Network listeners on all interfaces (0.0.0.0, 127.0.0.1, ::1)
- Established connections and their destinations
- Routing table entries
- DNS resolution paths
- Proxy configurations

### Blocker Identification
The analyzer checks:
- Cloud provider firewall rules (GCP, Azure, AWS)
- GitHub Enterprise permissions and OAuth configurations
- Deployment service configurations (Vercel, Firebase)
- SSL/TLS certificate validation
- DNS record configurations

## Security Considerations

**Important:** These tools help you identify when YOUR ports and deployments are being hijacked or blocked. They do NOT:
- Bypass legitimate security measures
- Expose your system to vulnerabilities
- Violate platform terms of service

The tools restore YOUR control over YOUR infrastructure by removing unauthorized third-party redirections and misconfigurations.

## Troubleshooting

### If Ports Still Redirect After Fix:
1. Check if external processes are still running
2. Restart your development server
3. Clear browser cache and service workers
4. Verify no VPN or proxy is active

### If Blockers Persist:
1. Verify you have owner permissions on the deployment
2. Check GitHub Enterprise access rights
3. Review cloud provider firewall rules manually
4. Contact platform support if issues continue

### Common Solutions:

#### For Cloud Workstation Blocks:
```bash
# Check firewall rules
gcloud compute firewall-rules list

# Update firewall to allow your IP
gcloud compute firewall-rules update [RULE_NAME] --source-ranges=[YOUR_IP]
```

#### For Vercel Deployment Issues:
1. Go to Vercel Dashboard → Your Project → Settings
2. Check "Build & Development Settings"
3. Verify output directory is correct (usually `dist`)
4. Ensure framework preset is set to "Vite"

#### For GitHub Enterprise Access:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Update callback URLs to match your cloud workstation
3. Regenerate tokens if necessary

---

## Success Indicators

You'll know the tools worked when:
- ✅ `localhost:5173` shows your app, not a proxy page
- ✅ Deployment shows your React app, not HTML fallback
- ✅ All cluster links open without authentication errors
- ✅ Publishing/deployment commands succeed
- ✅ Network requests go directly to intended destinations

## Next Steps

After using these tools:
1. Test your local development server
2. Attempt deployment through normal channels
3. Verify cluster access through provided URLs
4. Monitor the Unified Dashboard for ongoing status
5. Use Network Diagnostic for periodic health checks

---

## Support

If you continue to experience issues after using these tools:
1. Export the diagnostic results
2. Check the Console logs for detailed error messages
3. Review the COPILOT LOGS tab for system-level issues
4. Verify your account permissions with platform providers

These tools give you visibility and control over your development and deployment infrastructure, helping you identify and resolve the root causes of access and redirection issues.
