/**
 * Vercel Error Code Definitions and Handlers
 * Comprehensive error handling for deployment, DNS, functions, and routing
 */

export type ErrorCategory = 
  | 'Function'
  | 'Deployment'
  | 'DNS'
  | 'Cache'
  | 'Image'
  | 'Request'
  | 'Runtime'
  | 'Routing'
  | 'Sandbox'
  | 'Internal'

export interface VercelError {
  code: string
  category: ErrorCategory
  status: number
  message: string
  userMessage: string
  suggestions: string[]
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export const VERCEL_ERROR_DEFINITIONS: Record<string, VercelError> = {
  // Function Errors
  BODY_NOT_A_STRING_FROM_FUNCTION: {
    code: 'BODY_NOT_A_STRING_FROM_FUNCTION',
    category: 'Function',
    status: 502,
    message: 'Function returned non-string body',
    userMessage: 'The serverless function returned an invalid response format.',
    suggestions: [
      'Ensure function returns a string or properly serialized response',
      'Check JSON.stringify() is used for objects',
      'Verify response headers include correct Content-Type'
    ],
    retryable: false,
    severity: 'high'
  },
  EDGE_FUNCTION_INVOCATION_FAILED: {
    code: 'EDGE_FUNCTION_INVOCATION_FAILED',
    category: 'Function',
    status: 500,
    message: 'Edge function failed to execute',
    userMessage: 'The edge function encountered an error during execution.',
    suggestions: [
      'Check edge function logs for specific error',
      'Verify edge runtime compatibility',
      'Review function code for unhandled exceptions'
    ],
    retryable: true,
    severity: 'critical'
  },
  EDGE_FUNCTION_INVOCATION_TIMEOUT: {
    code: 'EDGE_FUNCTION_INVOCATION_TIMEOUT',
    category: 'Function',
    status: 504,
    message: 'Edge function execution timed out',
    userMessage: 'The edge function took too long to respond.',
    suggestions: [
      'Optimize function execution time',
      'Move long-running operations to background jobs',
      'Increase timeout limits if supported'
    ],
    retryable: true,
    severity: 'high'
  },
  FUNCTION_INVOCATION_FAILED: {
    code: 'FUNCTION_INVOCATION_FAILED',
    category: 'Function',
    status: 500,
    message: 'Serverless function invocation failed',
    userMessage: 'The serverless function failed to execute properly.',
    suggestions: [
      'Check function logs in Vercel dashboard',
      'Verify all dependencies are included',
      'Review function code for runtime errors'
    ],
    retryable: true,
    severity: 'critical'
  },
  FUNCTION_INVOCATION_TIMEOUT: {
    code: 'FUNCTION_INVOCATION_TIMEOUT',
    category: 'Function',
    status: 504,
    message: 'Function execution exceeded time limit',
    userMessage: 'The serverless function timed out.',
    suggestions: [
      'Optimize database queries',
      'Reduce external API calls',
      'Consider upgrading to Pro plan for longer timeouts'
    ],
    retryable: true,
    severity: 'high'
  },
  FUNCTION_PAYLOAD_TOO_LARGE: {
    code: 'FUNCTION_PAYLOAD_TOO_LARGE',
    category: 'Function',
    status: 413,
    message: 'Request payload exceeds function limits',
    userMessage: 'The request body is too large for the function to process.',
    suggestions: [
      'Reduce request payload size',
      'Use streaming for large uploads',
      'Consider direct S3/storage uploads'
    ],
    retryable: false,
    severity: 'medium'
  },
  FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE: {
    code: 'FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE',
    category: 'Function',
    status: 500,
    message: 'Function response exceeds size limits',
    userMessage: 'The function response is too large.',
    suggestions: [
      'Paginate large responses',
      'Use streaming responses',
      'Return references instead of full data'
    ],
    retryable: false,
    severity: 'medium'
  },
  FUNCTION_THROTTLED: {
    code: 'FUNCTION_THROTTLED',
    category: 'Function',
    status: 503,
    message: 'Function execution rate limited',
    userMessage: 'Too many function invocations. Rate limit exceeded.',
    suggestions: [
      'Implement request throttling',
      'Use caching to reduce function calls',
      'Upgrade plan for higher limits'
    ],
    retryable: true,
    severity: 'high'
  },
  NO_RESPONSE_FROM_FUNCTION: {
    code: 'NO_RESPONSE_FROM_FUNCTION',
    category: 'Function',
    status: 502,
    message: 'Function did not return a response',
    userMessage: 'The function completed but did not send a response.',
    suggestions: [
      'Ensure function returns a Response object',
      'Check for early exits without return',
      'Verify async/await usage'
    ],
    retryable: true,
    severity: 'high'
  },

  // Deployment Errors
  DEPLOYMENT_BLOCKED: {
    code: 'DEPLOYMENT_BLOCKED',
    category: 'Deployment',
    status: 403,
    message: 'Deployment access blocked',
    userMessage: 'Access to this deployment is blocked.',
    suggestions: [
      'Check deployment protection settings',
      'Verify authentication credentials',
      'Review access control policies'
    ],
    retryable: false,
    severity: 'critical'
  },
  DEPLOYMENT_DELETED: {
    code: 'DEPLOYMENT_DELETED',
    category: 'Deployment',
    status: 410,
    message: 'Deployment has been deleted',
    userMessage: 'This deployment no longer exists.',
    suggestions: [
      'Deploy a new version',
      'Check deployment history',
      'Restore from backup if available'
    ],
    retryable: false,
    severity: 'medium'
  },
  DEPLOYMENT_DISABLED: {
    code: 'DEPLOYMENT_DISABLED',
    category: 'Deployment',
    status: 402,
    message: 'Deployment is disabled',
    userMessage: 'This deployment has been disabled.',
    suggestions: [
      'Check billing status',
      'Verify account is active',
      'Contact support if issue persists'
    ],
    retryable: false,
    severity: 'critical'
  },
  DEPLOYMENT_NOT_FOUND: {
    code: 'DEPLOYMENT_NOT_FOUND',
    category: 'Deployment',
    status: 404,
    message: 'Deployment not found',
    userMessage: 'The requested deployment could not be found.',
    suggestions: [
      'Verify deployment URL',
      'Check if deployment was deleted',
      'Ensure correct project/domain'
    ],
    retryable: false,
    severity: 'medium'
  },
  DEPLOYMENT_NOT_READY_REDIRECTING: {
    code: 'DEPLOYMENT_NOT_READY_REDIRECTING',
    category: 'Deployment',
    status: 303,
    message: 'Deployment building, redirecting',
    userMessage: 'Deployment is still building. Please wait.',
    suggestions: [
      'Wait for deployment to complete',
      'Check build logs for progress',
      'Retry in a few moments'
    ],
    retryable: true,
    severity: 'low'
  },
  DEPLOYMENT_PAUSED: {
    code: 'DEPLOYMENT_PAUSED',
    category: 'Deployment',
    status: 503,
    message: 'Deployment is paused',
    userMessage: 'This deployment has been paused.',
    suggestions: [
      'Resume deployment from dashboard',
      'Check account status',
      'Contact support if needed'
    ],
    retryable: false,
    severity: 'high'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    category: 'Deployment',
    status: 404,
    message: 'Resource not found',
    userMessage: 'The requested resource was not found.',
    suggestions: [
      'Verify URL path is correct',
      'Check routing configuration',
      'Ensure file exists in deployment'
    ],
    retryable: false,
    severity: 'medium'
  },

  // DNS Errors
  DNS_HOSTNAME_EMPTY: {
    code: 'DNS_HOSTNAME_EMPTY',
    category: 'DNS',
    status: 502,
    message: 'Hostname is empty',
    userMessage: 'Invalid hostname in request.',
    suggestions: [
      'Verify URL includes hostname',
      'Check domain configuration',
      'Ensure proper DNS setup'
    ],
    retryable: false,
    severity: 'high'
  },
  DNS_HOSTNAME_NOT_FOUND: {
    code: 'DNS_HOSTNAME_NOT_FOUND',
    category: 'DNS',
    status: 502,
    message: 'DNS lookup failed',
    userMessage: 'Could not resolve hostname.',
    suggestions: [
      'Verify domain DNS settings',
      'Check nameserver configuration',
      'Wait for DNS propagation (up to 48h)'
    ],
    retryable: true,
    severity: 'high'
  },
  DNS_HOSTNAME_RESOLVE_FAILED: {
    code: 'DNS_HOSTNAME_RESOLVE_FAILED',
    category: 'DNS',
    status: 502,
    message: 'DNS resolution failed',
    userMessage: 'Failed to resolve domain name.',
    suggestions: [
      'Check DNS records in Vercel dashboard',
      'Verify domain registrar settings',
      'Contact DNS provider support'
    ],
    retryable: true,
    severity: 'high'
  },
  DNS_HOSTNAME_RESOLVED_PRIVATE: {
    code: 'DNS_HOSTNAME_RESOLVED_PRIVATE',
    category: 'DNS',
    status: 404,
    message: 'Hostname resolves to private IP',
    userMessage: 'Domain points to a private IP address.',
    suggestions: [
      'Update DNS to point to public IP',
      'Check for local network configuration',
      'Verify Vercel DNS settings'
    ],
    retryable: false,
    severity: 'high'
  },
  DNS_HOSTNAME_SERVER_ERROR: {
    code: 'DNS_HOSTNAME_SERVER_ERROR',
    category: 'DNS',
    status: 502,
    message: 'DNS server error',
    userMessage: 'DNS server encountered an error.',
    suggestions: [
      'Retry request after a moment',
      'Check DNS provider status',
      'Contact support if persistent'
    ],
    retryable: true,
    severity: 'medium'
  },

  // Cache Errors
  FALLBACK_BODY_TOO_LARGE: {
    code: 'FALLBACK_BODY_TOO_LARGE',
    category: 'Cache',
    status: 502,
    message: 'Fallback response too large',
    userMessage: 'Cached fallback response exceeds size limit.',
    suggestions: [
      'Reduce response size',
      'Implement response compression',
      'Use streaming for large responses'
    ],
    retryable: false,
    severity: 'medium'
  },

  // Image Errors
  INVALID_IMAGE_OPTIMIZE_REQUEST: {
    code: 'INVALID_IMAGE_OPTIMIZE_REQUEST',
    category: 'Image',
    status: 400,
    message: 'Invalid image optimization request',
    userMessage: 'Image optimization request is malformed.',
    suggestions: [
      'Check image URL format',
      'Verify optimization parameters',
      'Review Next.js Image component usage'
    ],
    retryable: false,
    severity: 'medium'
  },
  OPTIMIZED_EXTERNAL_IMAGE_REQUEST_FAILED: {
    code: 'OPTIMIZED_EXTERNAL_IMAGE_REQUEST_FAILED',
    category: 'Image',
    status: 502,
    message: 'Failed to fetch external image',
    userMessage: 'Could not retrieve image from external source.',
    suggestions: [
      'Verify image URL is accessible',
      'Check external domain CORS settings',
      'Add domain to image domains list'
    ],
    retryable: true,
    severity: 'medium'
  },
  OPTIMIZED_EXTERNAL_IMAGE_REQUEST_INVALID: {
    code: 'OPTIMIZED_EXTERNAL_IMAGE_REQUEST_INVALID',
    category: 'Image',
    status: 502,
    message: 'Invalid external image request',
    userMessage: 'External image request is invalid.',
    suggestions: [
      'Check image URL format',
      'Verify domain is whitelisted',
      'Review next.config.js images configuration'
    ],
    retryable: false,
    severity: 'medium'
  },
  OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED: {
    code: 'OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED',
    category: 'Image',
    status: 502,
    message: 'Unauthorized external image request',
    userMessage: 'Not authorized to access external image.',
    suggestions: [
      'Add domain to remotePatterns in next.config.js',
      'Check image hosting authentication',
      'Verify CORS headers'
    ],
    retryable: false,
    severity: 'medium'
  },
  OPTIMIZED_EXTERNAL_IMAGE_TOO_MANY_REDIRECTS: {
    code: 'OPTIMIZED_EXTERNAL_IMAGE_TOO_MANY_REDIRECTS',
    category: 'Image',
    status: 502,
    message: 'Too many redirects fetching image',
    userMessage: 'Image URL redirects too many times.',
    suggestions: [
      'Use direct image URL',
      'Check for redirect loops',
      'Contact image host support'
    ],
    retryable: false,
    severity: 'low'
  },

  // Request Errors
  INVALID_REQUEST_METHOD: {
    code: 'INVALID_REQUEST_METHOD',
    category: 'Request',
    status: 405,
    message: 'HTTP method not allowed',
    userMessage: 'This HTTP method is not allowed for this endpoint.',
    suggestions: [
      'Use correct HTTP method (GET, POST, etc.)',
      'Check API documentation',
      'Verify endpoint supports method'
    ],
    retryable: false,
    severity: 'medium'
  },
  MALFORMED_REQUEST_HEADER: {
    code: 'MALFORMED_REQUEST_HEADER',
    category: 'Request',
    status: 400,
    message: 'Invalid request header',
    userMessage: 'Request contains malformed headers.',
    suggestions: [
      'Check header format and values',
      'Remove invalid characters',
      'Verify header encoding'
    ],
    retryable: false,
    severity: 'medium'
  },
  REQUEST_HEADER_TOO_LARGE: {
    code: 'REQUEST_HEADER_TOO_LARGE',
    category: 'Request',
    status: 431,
    message: 'Request headers exceed size limit',
    userMessage: 'Request headers are too large.',
    suggestions: [
      'Reduce cookie size',
      'Remove unnecessary headers',
      'Use token storage instead of headers'
    ],
    retryable: false,
    severity: 'medium'
  },
  URL_TOO_LONG: {
    code: 'URL_TOO_LONG',
    category: 'Request',
    status: 414,
    message: 'URL exceeds maximum length',
    userMessage: 'The request URL is too long.',
    suggestions: [
      'Use POST with body instead of query params',
      'Shorten query parameters',
      'Use URL shortening service'
    ],
    retryable: false,
    severity: 'low'
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    category: 'Request',
    status: 404,
    message: 'Resource not found',
    userMessage: 'The requested resource does not exist.',
    suggestions: [
      'Verify resource path',
      'Check if resource was deleted',
      'Review routing configuration'
    ],
    retryable: false,
    severity: 'medium'
  },

  // Range Request Errors
  RANGE_END_NOT_VALID: {
    code: 'RANGE_END_NOT_VALID',
    category: 'Request',
    status: 416,
    message: 'Invalid range end value',
    userMessage: 'Range request end value is invalid.',
    suggestions: [
      'Check Range header format',
      'Ensure end value is within bounds',
      'Remove Range header if not needed'
    ],
    retryable: false,
    severity: 'low'
  },
  RANGE_GROUP_NOT_VALID: {
    code: 'RANGE_GROUP_NOT_VALID',
    category: 'Request',
    status: 416,
    message: 'Invalid range group',
    userMessage: 'Range request group is malformed.',
    suggestions: [
      'Use standard Range header format',
      'Check for syntax errors',
      'Review HTTP range specification'
    ],
    retryable: false,
    severity: 'low'
  },
  RANGE_MISSING_UNIT: {
    code: 'RANGE_MISSING_UNIT',
    category: 'Request',
    status: 416,
    message: 'Range header missing unit',
    userMessage: 'Range header must specify unit (bytes).',
    suggestions: [
      'Add "bytes=" prefix to Range header',
      'Follow standard Range format',
      'Example: "Range: bytes=0-1023"'
    ],
    retryable: false,
    severity: 'low'
  },
  RANGE_START_NOT_VALID: {
    code: 'RANGE_START_NOT_VALID',
    category: 'Request',
    status: 416,
    message: 'Invalid range start value',
    userMessage: 'Range request start value is invalid.',
    suggestions: [
      'Check Range header format',
      'Ensure start value is valid number',
      'Start must be less than content length'
    ],
    retryable: false,
    severity: 'low'
  },
  RANGE_UNIT_NOT_SUPPORTED: {
    code: 'RANGE_UNIT_NOT_SUPPORTED',
    category: 'Request',
    status: 416,
    message: 'Range unit not supported',
    userMessage: 'Only "bytes" unit is supported for ranges.',
    suggestions: [
      'Use "bytes" as range unit',
      'Remove unsupported range units',
      'Check Range header specification'
    ],
    retryable: false,
    severity: 'low'
  },
  TOO_MANY_RANGES: {
    code: 'TOO_MANY_RANGES',
    category: 'Request',
    status: 416,
    message: 'Too many ranges in request',
    userMessage: 'Request contains too many byte ranges.',
    suggestions: [
      'Reduce number of ranges',
      'Make separate requests',
      'Use single continuous range'
    ],
    retryable: false,
    severity: 'low'
  },

  // Runtime Errors
  INFINITE_LOOP_DETECTED: {
    code: 'INFINITE_LOOP_DETECTED',
    category: 'Runtime',
    status: 508,
    message: 'Infinite loop detected',
    userMessage: 'Request is stuck in an infinite redirect loop.',
    suggestions: [
      'Check middleware redirect logic',
      'Review rewrite rules',
      'Verify routing configuration'
    ],
    retryable: false,
    severity: 'critical'
  },
  MIDDLEWARE_INVOCATION_FAILED: {
    code: 'MIDDLEWARE_INVOCATION_FAILED',
    category: 'Function',
    status: 500,
    message: 'Middleware execution failed',
    userMessage: 'Edge middleware encountered an error.',
    suggestions: [
      'Check middleware code for errors',
      'Review middleware logs',
      'Verify middleware configuration'
    ],
    retryable: true,
    severity: 'critical'
  },
  MIDDLEWARE_INVOCATION_TIMEOUT: {
    code: 'MIDDLEWARE_INVOCATION_TIMEOUT',
    category: 'Function',
    status: 504,
    message: 'Middleware execution timeout',
    userMessage: 'Edge middleware took too long to execute.',
    suggestions: [
      'Optimize middleware performance',
      'Reduce external API calls',
      'Consider moving logic to route handlers'
    ],
    retryable: true,
    severity: 'high'
  },
  MIDDLEWARE_RUNTIME_DEPRECATED: {
    code: 'MIDDLEWARE_RUNTIME_DEPRECATED',
    category: 'Runtime',
    status: 503,
    message: 'Middleware runtime deprecated',
    userMessage: 'Middleware is using a deprecated runtime.',
    suggestions: [
      'Update to latest runtime version',
      'Check Vercel changelog',
      'Migrate to supported runtime'
    ],
    retryable: false,
    severity: 'high'
  },

  // Routing Errors
  ROUTER_CANNOT_MATCH: {
    code: 'ROUTER_CANNOT_MATCH',
    category: 'Routing',
    status: 502,
    message: 'Router cannot match request',
    userMessage: 'No route matches the request.',
    suggestions: [
      'Check vercel.json routing rules',
      'Verify path patterns',
      'Review catch-all routes'
    ],
    retryable: false,
    severity: 'high'
  },
  ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR: {
    code: 'ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR',
    category: 'Routing',
    status: 502,
    message: 'Cannot connect to external target',
    userMessage: 'Failed to connect to external upstream server.',
    suggestions: [
      'Verify external server is running',
      'Check network connectivity',
      'Review proxy configuration'
    ],
    retryable: true,
    severity: 'critical'
  },
  ROUTER_EXTERNAL_TARGET_ERROR: {
    code: 'ROUTER_EXTERNAL_TARGET_ERROR',
    category: 'Routing',
    status: 502,
    message: 'External target error',
    userMessage: 'External server returned an error.',
    suggestions: [
      'Check external server logs',
      'Verify upstream server health',
      'Contact external service provider'
    ],
    retryable: true,
    severity: 'high'
  },
  ROUTER_EXTERNAL_TARGET_HANDSHAKE_ERROR: {
    code: 'ROUTER_EXTERNAL_TARGET_HANDSHAKE_ERROR',
    category: 'Routing',
    status: 502,
    message: 'SSL/TLS handshake failed',
    userMessage: 'Failed to establish secure connection to external server.',
    suggestions: [
      'Check SSL certificate validity',
      'Verify TLS version compatibility',
      'Review proxy SSL settings'
    ],
    retryable: true,
    severity: 'high'
  },
  ROUTER_TOO_MANY_HAS_SELECTIONS: {
    code: 'ROUTER_TOO_MANY_HAS_SELECTIONS',
    category: 'Routing',
    status: 502,
    message: 'Too many route conditions',
    userMessage: 'Routing configuration is too complex.',
    suggestions: [
      'Simplify routing rules',
      'Reduce conditional checks',
      'Review vercel.json configuration'
    ],
    retryable: false,
    severity: 'medium'
  },
  TOO_MANY_FILESYSTEM_CHECKS: {
    code: 'TOO_MANY_FILESYSTEM_CHECKS',
    category: 'Routing',
    status: 502,
    message: 'Excessive filesystem checks',
    userMessage: 'Too many filesystem operations in routing.',
    suggestions: [
      'Optimize routing configuration',
      'Use explicit routes',
      'Reduce dynamic route checks'
    ],
    retryable: false,
    severity: 'medium'
  },
  TOO_MANY_FORKS: {
    code: 'TOO_MANY_FORKS',
    category: 'Routing',
    status: 502,
    message: 'Too many routing forks',
    userMessage: 'Routing has too many conditional branches.',
    suggestions: [
      'Simplify route matching logic',
      'Consolidate similar routes',
      'Review routing strategy'
    ],
    retryable: false,
    severity: 'medium'
  },

  // Sandbox Errors
  SANDBOX_NOT_FOUND: {
    code: 'SANDBOX_NOT_FOUND',
    category: 'Sandbox',
    status: 404,
    message: 'Sandbox not found',
    userMessage: 'The requested sandbox environment was not found.',
    suggestions: [
      'Verify sandbox ID',
      'Check if sandbox was deleted',
      'Create new sandbox if needed'
    ],
    retryable: false,
    severity: 'medium'
  },
  SANDBOX_NOT_LISTENING: {
    code: 'SANDBOX_NOT_LISTENING',
    category: 'Sandbox',
    status: 502,
    message: 'Sandbox not accepting connections',
    userMessage: 'Sandbox environment is not ready.',
    suggestions: [
      'Wait for sandbox to start',
      'Check sandbox logs',
      'Restart sandbox if needed'
    ],
    retryable: true,
    severity: 'high'
  },
  SANDBOX_STOPPED: {
    code: 'SANDBOX_STOPPED',
    category: 'Sandbox',
    status: 410,
    message: 'Sandbox has been stopped',
    userMessage: 'The sandbox environment has been terminated.',
    suggestions: [
      'Start a new sandbox',
      'Check sandbox timeout settings',
      'Review usage limits'
    ],
    retryable: false,
    severity: 'medium'
  },

  // Microfrontends Errors
  MICROFRONTENDS_MIDDLEWARE_ERROR: {
    code: 'MICROFRONTENDS_MIDDLEWARE_ERROR',
    category: 'Function',
    status: 500,
    message: 'Microfrontends middleware error',
    userMessage: 'Error in microfrontends middleware.',
    suggestions: [
      'Check microfrontends configuration',
      'Review middleware logs',
      'Verify remote module URLs'
    ],
    retryable: true,
    severity: 'high'
  },
  MICROFRONTENDS_MISSING_FALLBACK_ERROR: {
    code: 'MICROFRONTENDS_MISSING_FALLBACK_ERROR',
    category: 'Function',
    status: 400,
    message: 'Missing microfrontends fallback',
    userMessage: 'No fallback configured for microfrontend.',
    suggestions: [
      'Add fallback component',
      'Configure error boundaries',
      'Set default fallback in config'
    ],
    retryable: false,
    severity: 'medium'
  },

  // Internal/Platform Errors
  INTERNAL_CACHE_ERROR: {
    code: 'INTERNAL_CACHE_ERROR',
    category: 'Internal',
    status: 500,
    message: 'Internal caching error',
    userMessage: 'A platform caching error occurred.',
    suggestions: [
      'Retry the request',
      'Clear cache if possible',
      'Contact Vercel support'
    ],
    retryable: true,
    severity: 'high'
  },
  INTERNAL_UNEXPECTED_ERROR: {
    code: 'INTERNAL_UNEXPECTED_ERROR',
    category: 'Internal',
    status: 500,
    message: 'Unexpected internal error',
    userMessage: 'An unexpected platform error occurred.',
    suggestions: [
      'Retry the request',
      'Check Vercel status page',
      'Contact support with error details'
    ],
    retryable: true,
    severity: 'critical'
  }
}

export function getErrorByCode(code: string): VercelError | null {
  return VERCEL_ERROR_DEFINITIONS[code] || null
}

export function getErrorsByCategory(category: ErrorCategory): VercelError[] {
  return Object.values(VERCEL_ERROR_DEFINITIONS).filter(
    error => error.category === category
  )
}

export function isRetryableError(code: string): boolean {
  const error = getErrorByCode(code)
  return error?.retryable ?? false
}

export function getErrorSeverity(code: string): 'low' | 'medium' | 'high' | 'critical' {
  const error = getErrorByCode(code)
  return error?.severity ?? 'medium'
}
