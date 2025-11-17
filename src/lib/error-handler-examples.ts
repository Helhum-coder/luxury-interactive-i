/**
 * Example Usage of Connection Error Handling System
 * 
 * This file demonstrates various patterns for using the error handling system
 * in real-world scenarios.
 */

import { 
  fetchWithRetry, 
  createAPIClient, 
  ConnectionHealthChecker,
  globalErrorHandler,
  handleBatchRequests,
  ErrorHandler
} from '@/lib/error-handler'
import { getErrorByCode, VERCEL_ERROR_DEFINITIONS } from '@/lib/error-codes'
import { toast } from 'sonner'

// ============================================================================
// EXAMPLE 1: Basic API Call with Automatic Retry
// ============================================================================

export async function fetchUserData(userId: string) {
  try {
    const response = await fetchWithRetry(`https://api.example.com/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`
      }
    }, {
      maxRetries: 3,
      timeout: 10000
    })

    return await response.json()
  } catch (error) {
    const handled = globalErrorHandler.handleError(error, { userId })
    toast.error(handled.userMessage)
    
    // Show suggestions to user
    if (handled.suggestions.length > 0) {
      console.log('Try these solutions:')
      handled.suggestions.forEach(s => console.log('→', s))
    }
    
    throw handled
  }
}

// ============================================================================
// EXAMPLE 2: Using API Client with Automatic Retry
// ============================================================================

export function createGitHubClient(token: string) {
  const client = createAPIClient('https://api.github.com', {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  })

  return {
    async getUser() {
      return client.get('/user')
    },
    
    async getRepos() {
      return client.get('/user/repos?sort=updated&per_page=100')
    },
    
    async getRepo(owner: string, repo: string) {
      return client.get(`/repos/${owner}/${repo}`)
    },
    
    async createIssue(owner: string, repo: string, title: string, body: string) {
      return client.post(`/repos/${owner}/${repo}/issues`, {
        title,
        body
      })
    }
  }
}

// Usage:
// const github = createGitHubClient('your-token')
// const user = await github.getUser()
// const repos = await github.getRepos()

// ============================================================================
// EXAMPLE 3: Connection Health Monitoring
// ============================================================================

export class ServiceHealthMonitor {
  private checkers: ConnectionHealthChecker[] = []
  private status: Record<string, boolean> = {}

  constructor() {
    this.setupHealthChecks()
  }

  private setupHealthChecks() {
    const services = [
      { name: 'github', url: 'https://api.github.com/zen' },
      { name: 'vercel', url: 'https://vercel.com/api/status' },
      { name: 'api', url: 'https://your-api.com/health' }
    ]

    services.forEach(service => {
      const checker = new ConnectionHealthChecker(
        service.url,
        30000, // Check every 30 seconds
        (isHealthy) => {
          this.status[service.name] = isHealthy
          
          if (!isHealthy) {
            toast.error(`${service.name} service is down`)
          } else if (this.status[service.name] === false) {
            toast.success(`${service.name} service recovered`)
          }
        }
      )
      
      this.checkers.push(checker)
    })
  }

  start() {
    this.checkers.forEach(c => c.start())
  }

  stop() {
    this.checkers.forEach(c => c.stop())
  }

  getStatus() {
    return { ...this.status }
  }

  isAllHealthy() {
    return Object.values(this.status).every(s => s === true)
  }
}

// Usage:
// const monitor = new ServiceHealthMonitor()
// monitor.start()
// if (monitor.isAllHealthy()) { ... }
// monitor.stop()

// ============================================================================
// EXAMPLE 4: Custom Error Handler with Analytics
// ============================================================================

export function createAnalyticsErrorHandler() {
  return new ErrorHandler({
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    onRetry: (attempt, error) => {
      // Track retry attempts
      console.log(`Retry attempt ${attempt} for: ${error.message}`)
      // analytics.track('api_retry', { attempt, error: error.message })
    },
    onError: (error) => {
      // Track all errors
      console.error('Error occurred:', {
        code: error.code,
        severity: error.severity,
        message: error.message
      })
      
      // Send to analytics
      // analytics.track('api_error', {
      //   code: error.code,
      //   severity: error.severity,
      //   retryable: error.retryable
      // })
      
      // Alert on critical errors
      if (error.severity === 'critical') {
        // sendAlert(error)
      }
    }
  })
}

// Usage:
// const handler = createAnalyticsErrorHandler()
// await handler.withRetry(() => fetch(url))

// ============================================================================
// EXAMPLE 5: Batch Data Loading with Progress
// ============================================================================

export async function loadMultipleUsers(userIds: string[]) {
  const requests = userIds.map(id => 
    () => fetch(`https://api.example.com/users/${id}`)
      .then(r => r.json())
  )

  const results = await handleBatchRequests(requests, {
    maxConcurrent: 5,
    continueOnError: true,
    onProgress: (completed, total) => {
      console.log(`Loading users: ${completed}/${total}`)
      // Update progress bar UI
    }
  })

  const successful = results.filter(r => r.success).map(r => r.data)
  const failed = results.filter(r => !r.success).map(r => r.error)

  if (failed.length > 0) {
    console.warn(`${failed.length} users failed to load`)
    failed.forEach(error => {
      console.error(`- ${error.userMessage}`)
    })
  }

  return {
    users: successful,
    errors: failed
  }
}

// Usage:
// const { users, errors } = await loadMultipleUsers(['id1', 'id2', 'id3'])

// ============================================================================
// EXAMPLE 6: Error Code Lookup and Display
// ============================================================================

export function displayErrorInfo(errorCode: string) {
  const error = getErrorByCode(errorCode)
  
  if (!error) {
    console.log('Unknown error code')
    return
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Error: ${error.code}`)
  console.log(`Category: ${error.category}`)
  console.log(`Status: ${error.status}`)
  console.log(`Severity: ${error.severity.toUpperCase()}`)
  console.log(`Retryable: ${error.retryable ? 'Yes' : 'No'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\nMessage: ${error.userMessage}`)
  console.log('\nSuggested Solutions:')
  error.suggestions.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s}`)
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Usage:
// displayErrorInfo('FUNCTION_INVOCATION_TIMEOUT')

// ============================================================================
// EXAMPLE 7: Smart Retry Strategy
// ============================================================================

export async function smartFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  // Analyze request to determine retry strategy
  const method = options?.method || 'GET'
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'].includes(method)
  
  const retryOptions = {
    maxRetries: isIdempotent ? 3 : 0, // Only retry safe operations
    timeout: method === 'GET' ? 10000 : 30000, // Longer timeout for mutations
    exponentialBackoff: true
  }

  try {
    const response = await fetchWithRetry(url, options, retryOptions)
    return await response.json()
  } catch (error) {
    const handled = globalErrorHandler.handleError(error, { url, method })
    
    // Provide context-specific error messages
    if (handled.code === 'FUNCTION_INVOCATION_TIMEOUT') {
      throw new Error('The operation took too long. Try reducing the amount of data.')
    } else if (handled.code === 'DEPLOYMENT_NOT_FOUND') {
      throw new Error('The service is not available. Please try again later.')
    } else {
      throw new Error(handled.userMessage)
    }
  }
}

// Usage:
// const data = await smartFetch<User>('/api/users/123')

// ============================================================================
// EXAMPLE 8: Graceful Degradation
// ============================================================================

export async function fetchWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  cacheFallback?: T
): Promise<T> {
  try {
    // Try primary source
    return await globalErrorHandler.withRetry(primary, { source: 'primary' })
  } catch (primaryError) {
    console.warn('Primary source failed, trying fallback')
    
    try {
      // Try fallback source
      return await fallback()
    } catch (fallbackError) {
      console.error('Fallback also failed')
      
      // Use cached data if available
      if (cacheFallback !== undefined) {
        console.log('Using cached data')
        return cacheFallback
      }
      
      throw fallbackError
    }
  }
}

// Usage:
// const data = await fetchWithFallback(
//   () => fetch('https://primary-api.com/data').then(r => r.json()),
//   () => fetch('https://backup-api.com/data').then(r => r.json()),
//   cachedData
// )

// ============================================================================
// EXAMPLE 9: React Hook for Error Handling
// ============================================================================

import { useState, useCallback } from 'react'
import type { HandledError } from '@/lib/error-handler'

export function useErrorHandler() {
  const [error, setError] = useState<HandledError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async <T,>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await globalErrorHandler.withRetry(fn)
      return result
    } catch (err) {
      const handledError = globalErrorHandler.handleError(err)
      setError(handledError)
      toast.error(handledError.userMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    error,
    isLoading,
    execute,
    clearError,
    hasError: error !== null
  }
}

// Usage in component:
// const { error, isLoading, execute } = useErrorHandler()
// const loadData = () => execute(() => fetch('/api/data'))

// ============================================================================
// EXAMPLE 10: Pre-flight Connection Check
// ============================================================================

export async function checkConnections(): Promise<{
  healthy: string[]
  degraded: string[]
  down: string[]
}> {
  const endpoints = [
    { name: 'GitHub API', url: 'https://api.github.com/zen' },
    { name: 'Vercel API', url: 'https://vercel.com/api/status' },
    { name: 'Primary API', url: 'https://your-api.com/health' }
  ]

  const results = await handleBatchRequests(
    endpoints.map(e => () => fetch(e.url)),
    { maxConcurrent: 3 }
  )

  const status = {
    healthy: [] as string[],
    degraded: [] as string[],
    down: [] as string[]
  }

  endpoints.forEach((endpoint, index) => {
    const result = results[index]
    if (result.success) {
      status.healthy.push(endpoint.name)
    } else if (result.error.retryable) {
      status.degraded.push(endpoint.name)
    } else {
      status.down.push(endpoint.name)
    }
  })

  return status
}

// Usage:
// const status = await checkConnections()
// if (status.down.length > 0) {
//   alert('Some services are unavailable')
// }

// ============================================================================
// EXAMPLE 11: Rate Limit Aware Client
// ============================================================================

export class RateLimitedClient {
  private client: ReturnType<typeof createAPIClient>
  private rateLimitRemaining: number = Infinity
  private rateLimitReset: Date | null = null

  constructor(baseURL: string, headers: Record<string, string>) {
    this.client = createAPIClient(baseURL, headers)
  }

  private async checkRateLimit() {
    if (this.rateLimitRemaining <= 0 && this.rateLimitReset) {
      const waitTime = this.rateLimitReset.getTime() - Date.now()
      if (waitTime > 0) {
        toast.warning(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  async get<T>(path: string): Promise<T> {
    await this.checkRateLimit()
    
    try {
      const response = await this.client.get<T>(path)
      // Update rate limit info from response headers if available
      return response
    } catch (error) {
      const handled = globalErrorHandler.handleError(error)
      
      if (handled.code === 'FUNCTION_THROTTLED') {
        toast.error('Rate limit exceeded. Please wait before retrying.')
        this.rateLimitRemaining = 0
        this.rateLimitReset = new Date(Date.now() + 60000) // Wait 1 minute
      }
      
      throw handled
    }
  }
}

// Usage:
// const client = new RateLimitedClient('https://api.example.com', headers)
// const data = await client.get('/resource')
