# Network Setup Quick Start

## 🚀 Immediate Steps to Check Your Network

### 1. Run the Diagnostic Script

```bash
# Make the script executable
chmod +x network-diagnostic.sh

# Run the diagnostic
./network-diagnostic.sh
```

This will show you:
- ✓ Current network interfaces and IP addresses
- ✓ DNS configuration and resolution
- ✓ All listening ports and their security status
- ✓ Active network connections
- ✓ GitHub API connectivity
- ✓ Proxy settings
- ✓ Firewall status

### 2. Use the Web Interface

1. Start your application:
   ```bash
   npm run dev
   ```

2. Open the application in your browser

3. Click **"Network Diagnostics"** button in the header

4. Review all three tabs:
   - **Connection Checks**: Real-time API and connectivity tests
   - **Port Status**: Monitor which ports are open/blocked/redirected
   - **System Info**: Environment and browser details

### 3. Common Issues You Described

Based on your message, here's what to check:

#### Issue: "All my ports are redirected somewhere else"

**Check:**
```bash
# See what's listening
ss -tulpn | grep LISTEN

# Check for proxy variables
env | grep -i proxy

# View active connections
ss -tuna state established
```

**Fix:**
```bash
# Clear any proxy settings
unset HTTP_PROXY
unset HTTPS_PROXY
unset NO_PROXY

# Check VS Code port forwarding
# Open VS Code > View > Ports
# Set all ports to "Private"
```

#### Issue: "Firewall blocking connections"

**Check:**
```bash
# See firewall rules
sudo iptables -L -n

# Check UFW status
sudo ufw status
```

**Fix:**
```bash
# Allow specific ports (if blocked)
sudo ufw allow 5173/tcp
sudo ufw allow 3000/tcp

# Or temporarily disable for testing (not recommended for production)
sudo ufw disable
```

#### Issue: "Can't access my own cluster"

**The URL you shared suggests you're in a Google Cloud Workstation:**
`firebase-developer-documentat-1762941395929.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev`

**Check:**
1. Verify you're authenticated:
   ```bash
   gcloud auth list
   gcloud config list
   ```

2. Check workstation access:
   ```bash
   gcloud workstations list
   ```

3. Verify IAM permissions in Google Cloud Console

#### Issue: "GitHub API not working"

**Check:**
```bash
# Test your token
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-GitHub-Api-Version: 2022-11-28" \
     https://api.github.com/user
```

**Fix:**
1. Go to GitHub.com > Settings > Developer settings > Personal access tokens
2. Create a new token with scopes: `repo`, `workflow`, `read:org`
3. Copy the token immediately (it won't be shown again)
4. Set it in your environment:
   ```bash
   export GITHUB_TOKEN="your_token_here"
   ```

### 4. Verify Your Configuration

#### Check Vite Config
```bash
cat vite.config.ts
```

Should look like:
```typescript
server: {
  host: '0.0.0.0',  // or '127.0.0.1' for localhost only
  port: 5173,
  strictPort: true
}
```

#### Check Environment Variables
```bash
# View all env vars
env | sort

# Check specific ones
echo $GITHUB_TOKEN
echo $VITE_PORT
```

#### Check Package Versions
```bash
npm list --depth=0
```

### 5. Security Checklist

- [ ] All ports set to "Private" in VS Code
- [ ] No unauthorized proxy settings
- [ ] GitHub token has minimal required permissions
- [ ] Firewall rules are documented
- [ ] No secrets committed to git
- [ ] Connection logs reviewed for suspicious activity
- [ ] DNS resolving correctly
- [ ] API endpoints responding as expected

### 6. Quick Reference Commands

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Test port connectivity
nc -zv localhost 5173

# Monitor network traffic
sudo tcpdump -i any port 5173

# Check what's using bandwidth
sudo nethogs

# View routing table
ip route show

# Test DNS
nslookup github.com

# Trace route to endpoint
traceroute github.com

# Check SSL certificate
openssl s_client -connect github.com:443
```

### 7. Getting Detailed Help

For comprehensive troubleshooting, see:
- **[NETWORK_SETUP_GUIDE.md](./NETWORK_SETUP_GUIDE.md)** - Complete network configuration guide
- **Network Diagnostic Panel** - In-app real-time diagnostics
- **network-diagnostic.sh** - Command-line diagnostic script

### 8. What to Do Next

1. ✅ Run `./network-diagnostic.sh` and save the output
2. ✅ Open the web app and check "Network Diagnostics"
3. ✅ Review the "Port Status" tab for any redirections
4. ✅ Check "System Info" tab for environment details
5. ✅ Compare expected vs actual port destinations
6. ✅ Document any anomalies you find
7. ✅ Apply fixes from the guides above

### 9. Understanding Your Network Setup

Your environment appears to be:
- **Platform**: Google Cloud Workstations (Firebase project)
- **Cluster ID**: `1762941395929`
- **Region**: Likely US or EU based on cluster naming
- **Access**: Through Cloud Workstations Dev Environment

**Important Notes:**
- Cloud Workstations have their own network isolation
- Ports may be managed by the workstation configuration
- IAM permissions control cluster access
- GitKraken registration URL suggests GitLens integration

### 10. If Issues Persist

Collect this information:
```bash
# Run full diagnostic
./network-diagnostic.sh > network-report.txt 2>&1

# Get system info
uname -a >> network-report.txt

# Get network config
ip addr >> network-report.txt

# Get routing
ip route >> network-report.txt

# Get connections
ss -tuna >> network-report.txt
```

Then review the output in `network-report.txt` for any red flags.

---

## 🔧 Emergency Quick Fixes

### Reset All Network Settings
```bash
# Clear proxy vars
unset HTTP_PROXY HTTPS_PROXY NO_PROXY

# Restart network (Linux)
sudo systemctl restart NetworkManager

# Flush DNS cache
sudo systemd-resolve --flush-caches
```

### Reset Development Server
```bash
# Kill all node processes
pkill -9 node

# Clear npm cache
npm cache clean --force

# Reinstall and restart
npm install
npm run dev
```

### Reset VS Code Port Forwarding
1. Open VS Code
2. Go to "Ports" panel (View > Ports)
3. Right-click each port > "Stop Forwarding Port"
4. Restart your dev server
5. Ports should auto-forward with correct settings

---

**Need Help?** Check the interactive Network Diagnostic Panel in the application for real-time monitoring and detailed analysis.
