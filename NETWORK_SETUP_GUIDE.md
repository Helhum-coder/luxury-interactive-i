# Network Configuration & Security Guide

## Overview
This guide helps you diagnose and resolve network connectivity issues, port redirections, and security concerns in your development environment.

## Accessing Network Diagnostics

1. **Open the Application**
   - Navigate to your application in the browser
   - Click the "Network Diagnostics" button in the header

2. **Run Diagnostics**
   - The diagnostic tool automatically scans on load
   - Click "Refresh Scan" to run a new diagnostic check

## Understanding the Diagnostics

### Connection Checks Tab
Shows real-time status of:
- **DNS Resolution**: Verifies DNS is working correctly
- **GitHub API**: Tests connectivity to GitHub services
- **Local Server**: Confirms your development server is responding
- **Browser Status**: Verifies online connectivity

### Port Status Tab
Monitors critical development ports:
- **Port 3000**: React Development Server
- **Port 5000**: Vite Preview Server
- **Port 4173**: Vite Build Preview
- **Port 8080**: Alternative HTTP Port
- **Port 9000**: Custom Application Port

**Status Indicators:**
- 🟢 **Open**: Port is accessible and responding
- 🔴 **Blocked**: Port is not accessible
- 🟡 **Redirected**: Port may be redirected (needs verification)
- ⚪ **Unknown**: Status cannot be determined

### System Info Tab
Displays current environment details:
- User Agent
- Platform
- Language
- Connection Status
- Origin/Hostname
- Protocol
- Port Information

## Common Issues & Solutions

### Issue: Ports Redirected to Wrong Destinations

**Symptoms:**
- Connections going to unexpected URLs
- Traffic not reaching your local development server
- Third-party configurations intercepting requests

**Solutions:**

1. **Check Vite Configuration**
   ```bash
   # Verify vite.config.ts settings
   cat vite.config.ts
   ```
   
   Ensure server configuration is correct:
   ```typescript
   server: {
     host: '0.0.0.0',
     port: 5173,
     strictPort: true
   }
   ```

2. **Verify No Proxy Settings**
   ```bash
   # Check for proxy environment variables
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   echo $NO_PROXY
   ```
   
   If set, clear them:
   ```bash
   unset HTTP_PROXY
   unset HTTPS_PROXY
   unset NO_PROXY
   ```

3. **Check VS Code Port Forwarding**
   - Open VS Code "Ports" panel (View > Ports)
   - Verify forwarded ports match your configuration
   - Remove any unauthorized port forwards
   - Set visibility to "Private" for security

### Issue: Cannot Access GitHub APIs

**Symptoms:**
- GitHub API calls failing
- Authentication issues
- Token errors

**Solutions:**

1. **Verify GitHub Token**
   ```bash
   # Test your token
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        https://api.github.com/user
   ```

2. **Check Token Permissions**
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Verify token has required scopes: `repo`, `workflow`, `read:org`
   - Regenerate if expired

3. **Update API Version**
   - Always use latest stable API version: `2022-11-28`
   - Set in headers: `X-GitHub-Api-Version: 2022-11-28`

### Issue: Firewall Blocking Connections

**Symptoms:**
- All external connections fail
- Only specific IPs/domains accessible
- Intermittent connectivity

**Solutions:**

1. **Check Firewall Rules (Linux/Codespaces)**
   ```bash
   # List firewall rules
   sudo iptables -L -n -v
   
   # Check UFW status
   sudo ufw status
   ```

2. **Verify Network Routes**
   ```bash
   # Show routing table
   ip route show
   
   # Test specific connection
   traceroute github.com
   ```

3. **Check DNS Resolution**
   ```bash
   # Test DNS
   nslookup github.com
   dig github.com
   ```

### Issue: Port Security - Unauthorized Access

**Symptoms:**
- Ports accessible from unexpected sources
- Security warnings in diagnostics
- Unauthorized configuration changes

**Solutions:**

1. **Secure Port Forwarding**
   In VS Code:
   - Open Ports panel
   - Right-click each port
   - Set "Port Visibility" to "Private"
   - Add "Label" to identify your ports

2. **Restrict Access by IP**
   ```bash
   # Allow only localhost
   sudo iptables -A INPUT -p tcp --dport 5173 -s 127.0.0.1 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 5173 -j DROP
   ```

3. **Use Environment Variables**
   Create `.env.local`:
   ```env
   VITE_API_URL=http://localhost:5173
   VITE_ALLOWED_ORIGINS=http://localhost:5173
   ```

## Codespaces-Specific Configuration

### Setting Up Secure Codespace

1. **Configure devcontainer.json**
   ```json
   {
     "forwardPorts": [5173],
     "portsAttributes": {
       "5173": {
         "label": "Application",
         "onAutoForward": "notify",
         "visibility": "private"
       }
     }
   }
   ```

2. **Prevent Unauthorized Port Exposure**
   - Never commit credentials to repository
   - Use GitHub Secrets for sensitive data
   - Enable Codespaces access restrictions

3. **Monitor Active Connections**
   ```bash
   # List all active connections
   ss -tuna state established
   
   # Show listening ports
   ss -tulpn
   ```

## Verifying Configuration

### Quick Verification Script

Run this in your terminal to check current status:

```bash
#!/bin/bash

echo "=== Network Diagnostics ==="
echo

echo "Current IP Addresses:"
ip addr show | grep "inet " | awk '{print $2}'
echo

echo "Active Listening Ports:"
ss -tulpn | grep LISTEN
echo

echo "GitHub API Test:"
curl -s https://api.github.com/zen
echo
echo

echo "DNS Resolution:"
nslookup github.com
echo

echo "=== End Diagnostics ==="
```

### Testing API Connectivity

```bash
# Test GitHub API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "X-GitHub-Api-Version: 2022-11-28" \
     https://api.github.com/user

# Test with specific endpoints
curl https://api.github.com/octocat
```

## Security Best Practices

### 1. Token Management
- ✅ Store tokens in environment variables or secrets manager
- ✅ Use fine-grained tokens with minimal permissions
- ✅ Rotate tokens regularly
- ❌ Never commit tokens to git
- ❌ Never log tokens in console

### 2. Port Configuration
- ✅ Use non-standard ports when possible
- ✅ Set strict port binding (127.0.0.1 only)
- ✅ Enable HTTPS in production
- ❌ Expose ports to 0.0.0.0 unnecessarily
- ❌ Allow public access without authentication

### 3. Network Isolation
- ✅ Use private networks in Codespaces
- ✅ Restrict IP ranges
- ✅ Monitor connection logs
- ❌ Trust all incoming connections
- ❌ Disable firewall without reason

## Getting Help

If issues persist:

1. **Run Full Diagnostics**
   - Use the Network Diagnostic Panel in the application
   - Export logs from all three tabs
   - Note specific error messages

2. **Check System Logs**
   ```bash
   # Application logs
   journalctl -u your-service -n 100
   
   # Network logs
   dmesg | grep -i network
   ```

3. **Verify Environment**
   ```bash
   # List all environment variables
   env | sort
   
   # Check specific variables
   echo $GITHUB_TOKEN
   echo $VITE_PORT
   ```

4. **Contact Support**
   - Include diagnostic output
   - Describe specific symptoms
   - List recent changes to configuration
   - Provide error messages and stack traces

## Reference Links

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [VS Code Port Forwarding](https://code.visualstudio.com/docs/remote/ssh#_forwarding-a-port-creating-ssh-tunnel)
- [Vite Configuration](https://vitejs.dev/config/server-options.html)
- [GitHub Codespaces Security](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-encrypted-secrets-for-your-codespaces)

## Quick Command Reference

```bash
# Check what's listening on ports
netstat -tuln

# Test port connectivity
nc -zv localhost 5173

# View firewall rules
sudo iptables -L -n

# Check DNS
dig @8.8.8.8 github.com

# Monitor network traffic
sudo tcpdump -i any port 5173

# Check routing
ip route get 8.8.8.8

# View active connections
lsof -i -P -n | grep LISTEN
```
