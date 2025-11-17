# Connection Error Quick Reference

## 🚨 Most Common Errors & Fixes

### Function Errors

| Error Code | Status | Quick Fix |
|------------|--------|-----------|
| `FUNCTION_INVOCATION_FAILED` | 500 | Check function logs, review code for errors |
| `FUNCTION_INVOCATION_TIMEOUT` | 504 | Optimize queries, reduce processing time |
| `FUNCTION_PAYLOAD_TOO_LARGE` | 413 | Reduce request body size, use streaming |
| `NO_RESPONSE_FROM_FUNCTION` | 502 | Ensure function returns Response object |

### Deployment Errors

| Error Code | Status | Quick Fix |
|------------|--------|-----------|
| `DEPLOYMENT_BLOCKED` | 403 | Check protection settings, verify credentials |
| `DEPLOYMENT_NOT_FOUND` | 404 | Verify deployment URL, check if deleted |
| `DEPLOYMENT_NOT_READY_REDIRECTING` | 303 | Wait for build to complete |
| `DEPLOYMENT_PAUSED` | 503 | Resume deployment from dashboard |

### DNS Errors

| Error Code | Status | Quick Fix |
|------------|--------|-----------|
| `DNS_HOSTNAME_NOT_FOUND` | 502 | Check DNS settings, wait for propagation |
| `DNS_HOSTNAME_RESOLVE_FAILED` | 502 | Verify nameserver configuration |
| `DNS_HOSTNAME_SERVER_ERROR` | 502 | Retry after moment, check DNS provider |

### Image Errors

| Error Code | Status | Quick Fix |
|------------|--------|-----------|
| `INVALID_IMAGE_OPTIMIZE_REQUEST` | 400 | Check image URL format, verify parameters |
| `OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED` | 502 | Add domain to remotePatterns in next.config.js |
| `OPTIMIZED_EXTERNAL_IMAGE_REQUEST_FAILED` | 502 | Verify image URL is accessible |

## 📦 Code Snippets

### Basic Error Handling

```typescript
import { fetchWithRetry } from '@/lib/error-handler'

try {
  const response = await fetchWithRetry('https://api.example.com/data')
  const data = await response.json()
} catch (error) {
  console.error('Request failed:', error)
}
```

### With Retry Options

```typescript
const response = await fetchWithRetry(url, options, {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000
})
```

### API Client

```typescript
import { createAPIClient } from '@/lib/error-handler'

const api = createAPIClient('https://api.example.com', {
  'Authorization': 'Bearer token'
})

const users = await api.get('/users')
```

### Health Monitoring

```typescript
import { ConnectionHealthChecker } from '@/lib/error-handler'

const checker = new ConnectionHealthChecker(
  'https://api.example.com/health',
  30000,
  (isHealthy) => console.log('Healthy:', isHealthy)
)
checker.start()
```

### Check Error Details

```typescript
import { getErrorByCode } from '@/lib/error-codes'

const error = getErrorByCode('FUNCTION_INVOCATION_TIMEOUT')
console.log(error.userMessage)      // User-friendly message
console.log(error.suggestions)      // Array of solutions
console.log(error.retryable)        // true/false
console.log(error.severity)         // low/medium/high/critical
```

### Batch Requests

```typescript
import { handleBatchRequests } from '@/lib/error-handler'

const requests = urls.map(url => () => fetch(url))
const results = await handleBatchRequests(requests, {
  maxConcurrent: 5,
  continueOnError: true
})
```

## 🎯 Decision Tree

```
Error Occurred
    │
    ├─ Status 5xx?
    │   ├─ Yes → Retry (likely server issue)
    │   └─ No → Check 4xx errors
    │
    ├─ Retryable?
    │   ├─ Yes → Use fetchWithRetry
    │   └─ No → Fix and redeploy
    │
    ├─ Timeout?
    │   ├─ Yes → Optimize function
    │   └─ No → Check other errors
    │
    └─ DNS Error?
        ├─ Yes → Check DNS config
        └─ No → Review logs
```

## 🔍 Debugging Checklist

- [ ] Check ERROR MANAGER tab for recent errors
- [ ] Review error code and suggestions
- [ ] Test connection with "Check All" button
- [ ] Verify credentials and tokens
- [ ] Check Vercel dashboard for deployment status
- [ ] Review function logs if applicable
- [ ] Test endpoint with curl or Postman
- [ ] Verify DNS settings if domain-related
- [ ] Check rate limits and quotas
- [ ] Review firewall and network settings

## 📊 Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| 🔵 Low | Minor issue, functionality works | Monitor, fix when convenient |
| 🟡 Medium | Some features affected | Fix within 24 hours |
| 🟠 High | Major features broken | Fix within 4 hours |
| 🔴 Critical | System down or data at risk | Fix immediately |

## 🛠️ Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Test DNS resolution
nslookup your-domain.com

# Test endpoint
curl -I https://your-api.com/health

# Check response headers
curl -v https://your-api.com/endpoint
```

## 📞 When to Contact Support

Contact Vercel support if:
- Error code starts with `INTERNAL_`
- Issue persists after following all suggestions
- Multiple services affected simultaneously
- Suspected platform issue
- Need urgent assistance

## 🔗 Quick Links

- [Error Manager UI](app://error-manager) - In-app error browser
- [Connection STATUS](app://error-manager#connections) - Real-time monitoring
- [Error Reference](src/lib/error-codes.ts) - Complete error catalog
- [Vercel Status](https://vercel-status.com) - Platform status
- [Documentation](CONNECTION_ERROR_GUIDE.md) - Full guide

## 💡 Pro Tips

1. **Enable auto-retry** for all external API calls
2. **Set appropriate timeouts** based on operation
3. **Monitor critical endpoints** with health checkers
4. **Log errors** for debugging and analytics
5. **Show user-friendly messages** from error.userMessage
6. **Follow suggestions** in error definitions
7. **Batch similar requests** for efficiency
8. **Use exponential backoff** for retries
9. **Check severity** to prioritize fixes
10. **Test locally** before deploying

## 🎓 Remember

- **Not all errors need immediate action** - Check severity
- **Many errors are transient** - Retry automatically handles these
- **User messages are safe** - No sensitive data exposed
- **Suggestions are actionable** - Follow them for quick fixes
- **Health checks prevent issues** - Monitor proactively
