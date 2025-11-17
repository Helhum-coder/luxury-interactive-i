import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Info,
  Shield,
  Zap,
  Network,
  Server,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  VERCEL_ERROR_DEFINITIONS, 
  getErrorByCode,
  getErrorsByCategory,
  ErrorCategory,
  VercelError 
} from '@/lib/error-codes'
import { 
  ConnectionHealthChecker, 
  globalErrorHandler,
  HandledError,
  fetchWithRetry
} from '@/lib/error-handler'

interface ConnectionStatus {
  endpoint: string
  status: 'healthy' | 'degraded' | 'down' | 'checking'
  lastChecked?: Date
  error?: HandledError
  responseTime?: number
}

export default function ConnectionErrorManager() {
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    { endpoint: 'GitHub API', status: 'checking' },
    { endpoint: 'Vercel API', status: 'checking' },
    { endpoint: 'Deployment', status: 'checking' }
  ])
  const [recentErrors, setRecentErrors] = useState<HandledError[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory | 'all'>('all')
  const [healthCheckers] = useState<ConnectionHealthChecker[]>([])
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Monitor errors globally
    const originalOnError = globalErrorHandler['options'].onError
    globalErrorHandler['options'].onError = (error) => {
      originalOnError(error)
      setRecentErrors(prev => [error, ...prev].slice(0, 20))
    }

    checkAllConnections()

    return () => {
      healthCheckers.forEach(checker => checker.stop())
    }
  }, [])

  const checkAllConnections = async () => {
    setIsChecking(true)
    
    const endpoints = [
      { name: 'GitHub API', url: 'https://api.github.com/zen' },
      { name: 'Vercel API', url: 'https://vercel.com/api/status' },
      { name: 'Deployment', url: window.location.origin + '/health' }
    ]

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now()
        const response = await fetchWithRetry(endpoint.url, {
          method: 'GET',
          cache: 'no-cache'
        }, {
          maxRetries: 1,
          timeout: 5000
        })

        const responseTime = Date.now() - startTime

        setConnections(prev => prev.map(conn =>
          conn.endpoint === endpoint.name
            ? {
                ...conn,
                status: response.ok ? 'healthy' : 'degraded',
                lastChecked: new Date(),
                responseTime
              }
            : conn
        ))

        if (response.ok) {
          toast.success(`${endpoint.name} is healthy`)
        }
      } catch (error) {
        const handledError = globalErrorHandler.handleError(error, { endpoint: endpoint.name })
        
        setConnections(prev => prev.map(conn =>
          conn.endpoint === endpoint.name
            ? {
                ...conn,
                status: 'down',
                lastChecked: new Date(),
                error: handledError
              }
            : conn
        ))

        toast.error(`${endpoint.name} is down`, {
          description: handledError.userMessage
        })
      }
    }

    setIsChecking(false)
  }

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="text-green-500" size={20} />
      case 'degraded':
        return <AlertTriangle className="text-yellow-500" size={20} />
      case 'down':
        return <XCircle className="text-red-500" size={20} />
      case 'checking':
        return <RefreshCw className="text-blue-500 animate-spin" size={20} />
    }
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  }

  const getCategoryIcon = (category: ErrorCategory) => {
    switch (category) {
      case 'Function':
        return <Zap size={16} />
      case 'Deployment':
        return <Server size={16} />
      case 'DNS':
        return <Network size={16} />
      case 'Runtime':
        return <Clock size={16} />
      default:
        return <Shield size={16} />
    }
  }

  const filteredErrors = selectedCategory === 'all' 
    ? Object.values(VERCEL_ERROR_DEFINITIONS)
    : getErrorsByCategory(selectedCategory)

  const categories: Array<ErrorCategory | 'all'> = [
    'all', 'Function', 'Deployment', 'DNS', 'Cache', 'Image', 
    'Request', 'Runtime', 'Routing', 'Sandbox', 'Internal'
  ]

  return (
    <div className="h-full flex flex-col bg-background">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-orbitron text-2xl tracking-wide flex items-center gap-2">
              <Shield size={28} className="text-accent" />
              CONNECTION & ERROR MANAGER
            </CardTitle>
            <CardDescription>
              Monitor connections and handle deployment errors
            </CardDescription>
          </div>
          <Button 
            onClick={checkAllConnections}
            disabled={isChecking}
            variant="outline"
          >
            <RefreshCw className={isChecking ? 'animate-spin' : ''} size={16} />
            Check All
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
          {/* Connection Status */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="font-orbitron text-lg flex items-center gap-2">
                <Network size={20} />
                CONNECTION STATUS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connections.map((conn, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border/30 bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(conn.status)}
                        <div>
                          <p className="font-mono text-sm font-semibold">
                            {conn.endpoint}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {conn.lastChecked 
                              ? `Checked ${conn.lastChecked.toLocaleTimeString()}`
                              : 'Not checked yet'}
                          </p>
                        </div>
                      </div>
                      {conn.responseTime && (
                        <Badge variant="outline" className="font-mono">
                          {conn.responseTime}ms
                        </Badge>
                      )}
                    </div>
                    
                    {conn.error && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertTriangle size={16} />
                        <AlertTitle className="text-sm">
                          {conn.error.code || 'Connection Error'}
                        </AlertTitle>
                        <AlertDescription className="text-xs">
                          {conn.error.userMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>

              {/* Recent Errors */}
              {recentErrors.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-mono text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    RECENT ERRORS ({recentErrors.length})
                  </h3>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {recentErrors.map((error, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${getSeverityColor(error.severity)}`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-mono text-xs font-bold">
                              {error.code || 'Unknown Error'}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {error.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {error.userMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {error.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Code Reference */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <CardTitle className="font-orbitron text-lg flex items-center gap-2">
                <Info size={20} />
                ERROR CODE REFERENCE
              </CardTitle>
              <CardDescription>
                All supported Vercel error codes and solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    {cat === 'all' ? 'ALL' : cat}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {filteredErrors.map((error, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border/30 bg-muted/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(error.category)}
                          <p className="font-mono text-sm font-bold">
                            {error.code}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            HTTP {error.status}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(error.severity)}`}
                          >
                            {error.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {error.userMessage}
                      </p>

                      <div className="space-y-1 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Solutions:
                        </p>
                        {error.suggestions.map((suggestion, sidx) => (
                          <div key={sidx} className="flex items-start gap-2">
                            <span className="text-xs text-accent">•</span>
                            <p className="text-xs text-muted-foreground">
                              {suggestion}
                            </p>
                          </div>
                        ))}
                      </div>

                      {error.retryable && (
                        <Badge 
                          variant="outline" 
                          className="mt-2 text-xs bg-green-500/10 text-green-400"
                        >
                          Retryable
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
