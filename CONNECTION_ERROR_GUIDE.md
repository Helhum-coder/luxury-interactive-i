# Connection Error Integration Guide

## Overview

Your application now includes a comprehensive error handling system designed to handle all Vercel deployment and application errors, with automatic retry logic, connection health monitoring, and user-friendly error messages.

## 🎯 What's Been Integrated

### 1. **Error Code Definitions** (`src/lib/error-codes.ts`)
- Complete catalog of all Vercel error codes
- Categorized by type (Function, Deployment, DNS, Cache, Image, Request, Runtime, Routing, Sandbox, Internal)
- Each error includes:
  - HTTP status code
  - User-friendly message
  - Actionable suggestions
  - Retry guidance
  - Severity level

### 2. **Error Handler** (`src/lib/error-handler.ts`)
- Automatic retry with exponential backoff
- Request timeout handling
- Connection health monitoring
- Batch request processing
- Enhanced fetch with error handling

### 3. **Connection Error Manager UI** (`src/components/ConnectionErrorManager.tsx`)
- Real-time connection status monitoring
- Error code reference browser
- Recent error tracking
- Categorized error display
- Health check dashboard

### 4. **Enhanced API Manager** (`src/lib/api-manager.ts`)
- Integrated with new error handling system
- Automatic retries on transient failures
- Better error reporting
- Connection diagnostics

## 🚀 Quick Start

### Accessing the Error Manager

1. Launch your application
2. Navigate to the **ERROR MANAGER** tab
3. Click "Check All" to test all connections

### Using the Error Handler

#### Basic Usage

```typescript
import { fetchWithRetry } from '@/lib/error-handler'

// Automatic retry on failure
const response = await fetchWithRetry('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token'
  }
}, {
  maxRetries: 3,
  timeout: 10000
})
```

#### With Custom Options

```typescript
import { ErrorHandler } from '@/lib/error-handler'

const handler = new ErrorHandler({
  maxRetries: 5,
  retryDelay: 2000,
  exponentialBackoff: true,
  onRetry: (attempt, error) => {
    console.log(`Retry ${attempt}:`, error.message)
  }
})

const result = await handler.withRetry(async () => {
  return await fetch('https://api.example.com/endpoint')
})
```

#### API Client

```typescript
import { createAPIClient } from '@/lib/error-handler'

const client = createAPIClient('https://api.example.com', {
  'Authorization': 'Bearer token'
})

// All methods include automatic retry
const data = await client.get('/users')
const created = await client.post('/users', { name: 'John' })
const updated = await client.put('/users/1', { name: 'Jane' })
await client.delete('/users/1')
```

### Connection Health Monitoring

```typescript
import { ConnectionHealthChecker } from '@/lib/error-handler'

const checker = new ConnectionHealthChecker(
  'https://api.example.com/health',
  30000, // Check every 30 seconds
  (isHealthy) => {
    console.log('API is', isHealthy ? 'healthy' : 'down')
  }
)

checker.start()

// Stop monitoring when done
checker.stop()
```

### Batch Request Handling

```typescript
import { handleBatchRequests } from '@/lib/error-handler'

const requests = [
  () => fetch('https://api.example.com/user/1'),
  () => fetch('https://api.example.com/user/2'),
  () => fetch('https://api.example.com/user/3')
]

const results = await handleBatchRequests(requests, {
  maxConcurrent: 2,
  continueOnError: true,
  onProgress: (completed, total) => {
    console.log(`${completed}/${total} completed`)
  }
})

// Handle results
results.forEach((result, index) => {
  if (result.success) {
    console.log('Success:', result.data)
  } else {
    console.error('Error:', result.error.userMessage)
  }
})
```

## 📋 Error Code Categories

### Function Errors (5xx)
- `FUNCTION_INVOCATION_FAILED` - Function execution error
- `FUNCTION_INVOCATION_TIMEOUT` - Function timeout
- `FUNCTION_PAYLOAD_TOO_LARGE` - Request too large
- `EDGE_FUNCTION_INVOCATION_FAILED` - Edge function error
- `MIDDLEWARE_INVOCATION_FAILED` - Middleware error

### Deployment Errors (4xx, 5xx)
- `DEPLOYMENT_BLOCKED` - Access blocked
- `DEPLOYMENT_NOT_FOUND` - Deployment missing
- `DEPLOYMENT_NOT_READY_REDIRECTING` - Still building
- `DEPLOYMENT_PAUSED` - Deployment paused
- `DEPLOYMENT_DISABLED` - Account issue

### DNS Errors (5xx)
- `DNS_HOSTNAME_NOT_FOUND` - DNS lookup failed
- `DNS_HOSTNAME_RESOLVE_FAILED` - Resolution error
- `DNS_HOSTNAME_SERVER_ERROR` - DNS server error

### Image Optimization Errors (4xx, 5xx)
- `INVALID_IMAGE_OPTIMIZE_REQUEST` - Invalid parameters
- `OPTIMIZED_EXTERNAL_IMAGE_REQUEST_FAILED` - Fetch failed
- `OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED` - Domain not whitelisted

### Request Errors (4xx)
- `INVALID_REQUEST_METHOD` - Wrong HTTP method
- `REQUEST_HEADER_TOO_LARGE` - Headers too big
- `URL_TOO_LONG` - URL exceeds limit
- `MALFORMED_REQUEST_HEADER` - Invalid header format

### Runtime Errors (5xx)
- `INFINITE_LOOP_DETECTED` - Redirect loop
- `MIDDLEWARE_RUNTIME_DEPRECATED` - Old runtime version

### Routing Errors (5xx)
- `ROUTER_CANNOT_MATCH` - No matching route
- `ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR` - Proxy failed
- `ROUTER_EXTERNAL_TARGET_HANDSHAKE_ERROR` - SSL error

## 🔧 Configuration

### Global Error Handler

The global error handler is pre-configured with sensible defaults:

```typescript
import { globalErrorHandler } from '@/lib/error-handler'

// Used automatically by fetchWithRetry and API clients
// Configuration:
// - maxRetries: 3
// - retryDelay: 1000ms
// - exponentialBackoff: true
// - timeout: 30000ms
```

### Custom Configuration

Create a custom handler for specific needs:

```typescript
const customHandler = new ErrorHandler({
  maxRetries: 5,
  retryDelay: 2000,
  exponentialBackoff: true,
  timeout: 60000,
  onRetry: (attempt, error) => {
    toast.warning(`Retry attempt ${attempt}`)
  },
  onError: (error) => {
    analytics.trackError(error)
  }
})
```

## 🎨 UI Components

### Connection Status Display

The Connection Error Manager shows:
- **Connection Status** - Real-time health of key endpoints
- **Response Times** - Latency measurements
- **Recent Errors** - Last 20 errors with details
- **Error Code Reference** - Searchable error catalog

### Error Display Features

- Color-coded severity (Low → Medium → High → Critical)
- Category filtering (Function, Deployment, DNS, etc.)
- Retryable status indicators
- Actionable suggestions
- Timestamp tracking

## 🔍 Troubleshooting

### Common Issues

#### "No response from function"
- **Cause**: Function didn't return Response object
- **Solution**: Ensure all code paths return a response
- **Retryable**: Yes

#### "Deployment not ready"
- **Cause**: Build still in progress
- **Solution**: Wait for deployment to complete
- **Retryable**: Yes

#### "DNS hostname not found"
- **Cause**: Domain not properly configured
- **Solution**: Check DNS settings, wait for propagation
- **Retryable**: Yes

#### "Function invocation timeout"
- **Cause**: Function exceeded time limit
- **Solution**: Optimize queries, reduce processing time
- **Retryable**: Yes

### Debugging Tips

1. **Check Recent Errors** - View in Error Manager tab
2. **Enable Console Logging** - Errors logged automatically
3. **Test Connections** - Use "Check All" button
4. **Review Suggestions** - Each error includes fixes
5. **Check Severity** - Focus on Critical/High first

## 📊 Monitoring

### Real-Time Monitoring

```typescript
// Monitor connection health
const checker = new ConnectionHealthChecker(
  'https://your-api.com/health',
  30000,
  (isHealthy) => {
    if (!isHealthy) {
      toast.error('API connection lost')
    }
  }
)
```

### Error Tracking

```typescript
import { globalErrorHandler } from '@/lib/error-handler'

// All errors automatically tracked
// Access last error:
const lastError = apiManager.getLastError()
if (lastError) {
  console.log('Last error:', {
    code: lastError.code,
    message: lastError.userMessage,
    suggestions: lastError.suggestions
  })
}
```

## 🛡️ Best Practices

### 1. Use fetchWithRetry for External APIs

```typescript
// Good
const response = await fetchWithRetry(url, options)

// Avoid
const response = await fetch(url, options)
```

### 2. Handle Errors Gracefully

```typescript
try {
  const data = await client.get('/data')
  // Process data
} catch (error) {
  const handledError = globalErrorHandler.handleError(error)
  toast.error(handledError.userMessage)
  // Show suggestions to user
  handledError.suggestions.forEach(s => console.log('→', s))
}
```

### 3. Set Appropriate Timeouts

```typescript
// Short timeout for quick operations
await fetchWithRetry(url, {}, { timeout: 5000 })

// Longer timeout for heavy operations
await fetchWithRetry(url, {}, { timeout: 30000 })
```

### 4. Use Batch Processing for Multiple Requests

```typescript
// More efficient than sequential requests
const results = await handleBatchRequests(requests, {
  maxConcurrent: 5
})
```

### 5. Monitor Critical Endpoints

```typescript
// Setup health checks for important services
const githubChecker = new ConnectionHealthChecker(
  'https://api.github.com/zen',
  60000,
  handleGitHubHealth
)
githubChecker.start()
```

## 📈 Performance

### Retry Strategy

- **Exponential Backoff**: Delays increase with each retry
- **Jitter**: Random delay added to prevent thundering herd
- **Max Delay**: Capped at 30 seconds
- **Smart Retries**: Only retryable errors are retried

### Connection Pooling

- Reuses existing connections when possible
- Automatic cleanup of stale connections
- Optimized for concurrent requests

## 🔐 Security

- No sensitive data in error messages
- Error codes help debugging without exposing internals
- Connection health checks don't leak system info
- Automatic sanitization of error details

## 📚 Additional Resources

- [Vercel Error Documentation](https://vercel.com/docs/errors)
- [Error Code Reference](src/lib/error-codes.ts)
- [Error Handler Implementation](src/lib/error-handler.ts)
- [Connection Manager UI](src/components/ConnectionErrorManager.tsx)

## 🆘 Support

If you encounter issues:

1. Check the **ERROR MANAGER** tab for diagnostics
2. Review error suggestions for solutions
3. Verify connection status
4. Check Vercel status page
5. Review application logs

## 🎉 Summary

Your connection error handling is now:
- ✅ Comprehensive - All Vercel errors covered
- ✅ Automatic - Retry and recovery built-in
- ✅ User-friendly - Clear messages and suggestions
- ✅ Monitored - Real-time health checking
- ✅ Debuggable - Detailed error tracking
- ✅ Production-ready - Battle-tested patterns

The system will automatically handle transient failures, provide clear feedback to users, and help you quickly diagnose and fix connection issues.
