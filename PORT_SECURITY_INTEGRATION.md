# Port Security & Webhook Integration

## Overview

The LUXE IDE now features **automatic port security** for incoming webhook connections. When you create a webhook to monitor repository events, the system automatically secures the necessary ports under your exclusive control.

## How It Works

### 1. **Automatic Port Detection**
When you configure a webhook:
- The system detects which ports are needed based on webhook events
- Ports are assigned from secure ranges:
  - **8000-8999**: Webhook ports
  - **5000-5999**: Production/deployment ports
  - **4000-4999**: Staging ports
  - **3000-3999**: Development ports

### 2. **Auto-Security**
If "Auto-Secure Webhook Ports" is enabled:
- Ports are **immediately secured** when webhooks are created
- Only the repository owner can approve changes
- Third-party access is automatically blocked
- All port configurations are logged

### 3. **Webhook-Port Mapping**
Each secured port is linked to its webhook:
- View which webhook uses which port
- Track auto-secured vs manually configured ports
- See webhook repository info in port details

## Features

### Port Security Manager
- **Master Password Protection**: Only you can access port configurations
- **Auto-Block Third Party**: Automatically blocks unauthorized access attempts
- **Webhook Port Mappings**: See all ports secured for webhooks
- **Security Logs**: Complete audit trail of all port activities
- **Quick Setup**: Bulk-secure common ports at once

### Webhook Manager
- **Real-Time Monitoring**: Live webhook event tracking
- **Auto-Sync**: Automatically trigger syncs on repository events
- **Port Integration**: Ports are secured when webhooks are configured
- **Event Simulation**: Test webhook flows without real events
- **Multi-Repository**: Monitor multiple repositories simultaneously

## Security Guarantees

✅ **Owner-Only Control**: Only the repository owner can configure ports  
✅ **No Third-Party Access**: Unauthorized access is blocked automatically  
✅ **Audit Trail**: Every action is logged with timestamp and actor  
✅ **Approval Required**: All port changes require explicit approval  
✅ **Auto-Protected**: Webhook ports are secured immediately  

## Usage Example

### 1. Enable Auto-Security
Navigate to **PORT SECURITY** tab → **Security Settings** → Enable "Auto-Secure Webhook Ports"

### 2. Create a Webhook
Go to **GIT INTEGRATION** tab → **Webhooks** section:
- Enter repository name (e.g., `microsoft/vscode-docs`)
- Select events to monitor (push, pull_request, etc.)
- Enable auto-sync if desired
- Click "Create Webhook"

### 3. Ports Are Secured Automatically
The system will:
- Assign a port from the webhook range (8000-8999)
- Secure it under your exclusive control
- Link it to the webhook configuration
- Log the security event
- Notify you of the action

### 4. Monitor Security
View secured ports in **PORT SECURITY** tab:
- See which ports are linked to webhooks (lightning bolt icon)
- View webhook repository info
- Track auto-secured vs manual ports
- Block/unblock ports as needed

## Port Range Guide

| Range | Purpose | Auto-Assigned For |
|-------|---------|-------------------|
| 3000-3999 | Development | Local dev servers |
| 4000-4999 | Staging | Staging deployments |
| 5000-5999 | Production | Deployment events |
| 8000-8999 | Webhooks | Webhook listeners |
| 9000-9999 | Custom | User-defined |

## Security Best Practices

1. **Keep Master Password Secure**: Never share your port security password
2. **Enable Auto-Block**: Let the system block third-party access automatically
3. **Review Security Logs**: Regularly check for unauthorized access attempts
4. **Use Auto-Secure**: Let webhooks automatically secure their ports
5. **Monitor Notifications**: Stay informed of all port activities

## Integration Points

The port security system integrates with:
- **Webhook Manager**: Auto-secures webhook ports
- **Git Integration**: Protects sync and deployment ports
- **Notification Center**: Alerts on security events
- **Security Logs**: Complete audit trail

## Troubleshooting

**Q: Webhook created but port not showing?**  
A: Check that "Auto-Secure Webhook Ports" is enabled in Port Security settings.

**Q: Third-party trying to access my ports?**  
A: Enable "Auto-Block Third Party" in security settings. All unauthorized access will be blocked automatically.

**Q: How do I change a port's configuration?**  
A: Authenticate with your master password, then modify the port in the Port Security Manager.

**Q: Can I manually assign webhook ports?**  
A: Yes! Disable auto-secure and manually add ports with the webhook configuration.

## API

The integration provides these utility functions:

```typescript
// Detect ports needed for a webhook
detectWebhookPortRequirements(webhookConfig)

// Generate a secure port in specific range
generateWebhookPort('webhooks') // Returns port in 8000-8999

// Create port security payload
createPortSecurityPayload(port, webhookConfig, user)

// Validate port security status
validatePortSecurity(port, securedPorts)

// Check for third-party access
detectThirdPartyAccess(accessLog)
```

## Future Enhancements

- SSL/TLS certificate management
- IP whitelist/blacklist per port
- Rate limiting configuration
- Port usage analytics
- Automated security reports
