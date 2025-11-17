/**
 * Centralized Error Handler with Retry Logic and Connection Management
 */

import { getErrorByCode, isRetryableError, getErrorSeverity, VercelError } from './error-codes'

export interface ErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  onRetry?: (attempt: number, error: Error) => void
  onError?: (error: HandledError) => void
  timeout?: number
}

export interface HandledError {
  original: Error
  vercelError?: VercelError
  code?: string
  message: string
  userMessage: string
  suggestions: string[]
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  context?: Record<string, any>
}

export class ErrorHandler {
  private options: Required<ErrorHandlerOptions>

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 1000,
      exponentialBackoff: options.exponentialBackoff ?? true,
      onRetry: options.onRetry ?? (() => {}),
      onError: options.onError ?? (() => {}),
      timeout: options.timeout ?? 30000
    }
  }

  /**
   * Parse error response and extract error code
   */
  private parseErrorResponse(error: any): { code?: string; message: string } {
    // Check for Vercel error code in response
    if (error.response?.data?.error?.code) {
      return {
        code: error.response.data.error.code,
        message: error.response.data.error.message || error.message
      }
    }

    // Check for error code in headers
    if (error.response?.headers?.['x-vercel-error']) {
      return {
        code: error.response.headers['x-vercel-error'],
        message: error.message
      }
    }

    // Check for error in body
    if (typeof error === 'object' && error.code) {
      return {
        code: error.code,
        message: error.message || 'Unknown error'
      }
    }

    return {
      message: error.message || error.toString()
    }
  }

  /**
   * Handle and transform error into HandledError
   */
  handleError(error: Error | any, context?: Record<string, any>): HandledError {
    const parsed = this.parseErrorResponse(error)
    const vercelError = parsed.code ? getErrorByCode(parsed.code) : null

    const handledError: HandledError = {
      original: error instanceof Error ? error : new Error(parsed.message),
      vercelError: vercelError || undefined,
      code: parsed.code,
      message: parsed.message,
      userMessage: vercelError?.userMessage || parsed.message,
      suggestions: vercelError?.suggestions || ['Check logs for more details', 'Try again later'],
      retryable: vercelError?.retryable ?? this.isNetworkError(error),
      severity: vercelError?.severity || this.inferSeverity(error),
      timestamp: new Date(),
      context
    }

    this.options.onError(handledError)
    return handledError
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    if (!error) return false
    
    const message = error.message?.toLowerCase() || ''
    const networkErrors = [
      'network',
      'timeout',
      'econnrefused',
      'enotfound',
      'econnreset',
      'etimedout',
      'fetch failed'
    ]

    return networkErrors.some(err => message.includes(err))
  }

  /**
   * Infer error severity from error type
   */
  private inferSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium'

    const status = error.response?.status || error.status
    
    if (status >= 500) return 'critical'
    if (status >= 400) return 'high'
    if (this.isNetworkError(error)) return 'high'
    
    return 'medium'
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    if (!this.options.exponentialBackoff) {
      return this.options.retryDelay
    }

    // Exponential backoff: delay * 2^attempt with jitter
    const exponentialDelay = this.options.retryDelay * Math.pow(2, attempt)
    const jitter = Math.random() * 1000
    return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
  }

  /**
   * Execute function with retry logic
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    let lastError: HandledError | null = null

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timeout after ${this.options.timeout}ms`))
          }, this.options.timeout)
        })

        // Race between function execution and timeout
        const result = await Promise.race([fn(), timeoutPromise])
        return result
      } catch (error) {
        lastError = this.handleError(error, {
          ...context,
          attempt,
          maxRetries: this.options.maxRetries
        })

        // Don't retry if error is not retryable
        if (!lastError.retryable) {
          throw lastError
        }

        // Don't retry on last attempt
        if (attempt === this.options.maxRetries) {
          throw lastError
        }

        // Calculate delay and wait before retry
        const delay = this.calculateDelay(attempt)
        this.options.onRetry(attempt + 1, lastError.original)

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler({
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  onRetry: (attempt, error) => {
    console.warn(`Retry attempt ${attempt}:`, error.message)
  },
  onError: (error) => {
    console.error('Error handled:', {
      code: error.code,
      message: error.message,
      severity: error.severity,
      retryable: error.retryable,
      timestamp: error.timestamp
    })
  }
})

/**
 * Enhanced fetch with automatic retry and error handling
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: ErrorHandlerOptions
): Promise<Response> {
  const handler = new ErrorHandler(retryOptions)

  return handler.withRetry(async () => {
    const response = await fetch(url, options)

    // Check for Vercel error codes in response
    const errorCode = response.headers.get('x-vercel-error')
    
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.response = response
      error.status = response.status
      
      if (errorCode) {
        error.code = errorCode
      }

      // Try to parse error body
      try {
        const body = await response.clone().json()
        if (body.error) {
          error.code = body.error.code || errorCode
          error.message = body.error.message || error.message
        }
      } catch {
        // Ignore JSON parse errors
      }

      throw error
    }

    return response
  }, { url, method: options?.method || 'GET' })
}

/**
 * Create API client with automatic error handling
 */
export function createAPIClient(baseURL: string, defaultHeaders: Record<string, string> = {}) {
  return {
    async get<T>(path: string, options?: RequestInit): Promise<T> {
      const response = await fetchWithRetry(`${baseURL}${path}`, {
        ...options,
        method: 'GET',
        headers: {
          ...defaultHeaders,
          ...options?.headers
        }
      })
      return response.json()
    },

    async post<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
      const response = await fetchWithRetry(`${baseURL}${path}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined
      })
      return response.json()
    },

    async put<T>(path: string, data?: any, options?: RequestInit): Promise<T> {
      const response = await fetchWithRetry(`${baseURL}${path}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options?.headers
        },
        body: data ? JSON.stringify(data) : undefined
      })
      return response.json()
    },

    async delete<T>(path: string, options?: RequestInit): Promise<T> {
      const response = await fetchWithRetry(`${baseURL}${path}`, {
        ...options,
        method: 'DELETE',
        headers: {
          ...defaultHeaders,
          ...options?.headers
        }
      })
      return response.json()
    }
  }
}

/**
 * Connection health checker
 */
export class ConnectionHealthChecker {
  private healthCheckURL: string
  private intervalMs: number
  private callback: (isHealthy: boolean) => void
  private intervalId?: NodeJS.Timeout

  constructor(
    healthCheckURL: string,
    intervalMs: number = 30000,
    callback: (isHealthy: boolean) => void
  ) {
    this.healthCheckURL = healthCheckURL
    this.intervalMs = intervalMs
    this.callback = callback
  }

  start() {
    this.check() // Check immediately
    this.intervalId = setInterval(() => this.check(), this.intervalMs)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private async check() {
    try {
      const response = await fetch(this.healthCheckURL, {
        method: 'HEAD',
        cache: 'no-cache'
      })
      this.callback(response.ok)
    } catch (error) {
      this.callback(false)
    }
  }
}

/**
 * Batch error handler for multiple requests
 */
export async function handleBatchRequests<T>(
  requests: Array<() => Promise<T>>,
  options: {
    maxConcurrent?: number
    continueOnError?: boolean
    onProgress?: (completed: number, total: number) => void
  } = {}
): Promise<Array<{ success: true; data: T } | { success: false; error: HandledError }>> {
  const maxConcurrent = options.maxConcurrent ?? 5
  const continueOnError = options.continueOnError ?? true
  const results: Array<{ success: true; data: T } | { success: false; error: HandledError }> = []
  
  const executing: Promise<any>[] = []
  let completed = 0

  for (const [index, request] of requests.entries()) {
    const promise = (async () => {
      try {
        const data = await globalErrorHandler.withRetry(request, { requestIndex: index })
        results[index] = { success: true, data }
      } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { requestIndex: index })
        results[index] = { success: false, error: handledError }
        
        if (!continueOnError) {
          throw handledError
        }
      } finally {
        completed++
        options.onProgress?.(completed, requests.length)
      }
    })()

    executing.push(promise)

    if (executing.length >= maxConcurrent) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      )
    }
  }

  await Promise.all(executing)
  return results
}
