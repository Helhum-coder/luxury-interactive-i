import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  GlobeHemisphereWest, 
  CheckCircle, 
  XCircle, 
  Warning,
  ArrowLeft,
  CircleNotch,
  ClockCounterClockwise,
  Code,
  ShieldCheck
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface DiagnosticResult {
  timestamp: string
  url: string
  status: 'success' | 'error' | 'warning'
  statusCode?: number
  responseTime?: number
  headers?: Record<string, string>
  error?: string
  sslInfo?: {
    valid: boolean
    issuer?: string
    expiresAt?: string
  }
  corsEnabled?: boolean
  contentType?: string
  serverType?: string
}

interface ServerDiagnosticProps {
  onClose: () => void
  initialUrl?: string
}

export function ServerDiagnostic({ onClose, initialUrl = 'https://169.94.23.117:8443' }: ServerDiagnosticProps) {
  const [serverUrl, setServerUrl] = useState(initialUrl)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null)

  const diagnoseServer = async () => {
    setLoading(true)
    const startTime = performance.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(serverUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      })

      clearTimeout(timeoutId)
      const endTime = performance.now()

      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        url: serverUrl,
        status: response.ok ? 'success' : 'warning',
        statusCode: response.status,
        responseTime: Math.round(endTime - startTime),
        headers,
        corsEnabled: headers['access-control-allow-origin'] !== undefined,
        contentType: headers['content-type'] || 'unknown',
        serverType: headers['server'] || 'unknown',
      }

      setCurrentResult(result)
      setResults(prev => [result, ...prev])
    } catch (error: any) {
      const endTime = performance.now()
      
      let errorMessage = error.message
      let status: 'error' | 'warning' = 'error'

      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout (>10s) - Server may be unreachable'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - Possible causes: CORS blocked, SSL certificate invalid, server offline, or firewall blocking'
        status = 'warning'
      }

      const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        url: serverUrl,
        status,
        responseTime: Math.round(endTime - startTime),
        error: errorMessage,
      }

      setCurrentResult(result)
      setResults(prev => [result, ...prev])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={24} weight="fill" className="text-green-500" />
      case 'warning':
        return <Warning size={24} weight="fill" className="text-amber-500" />
      case 'error':
        return <XCircle size={24} weight="fill" className="text-red-500" />
      default:
        return <CircleNotch size={24} className="text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/10 text-green-700 border-green-500/20'
      case 'warning':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'error':
        return 'bg-red-500/10 text-red-700 border-red-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GlobeHemisphereWest size={32} weight="duotone" className="text-primary" />
              Server Diagnostic Tool
            </h1>
            <p className="text-muted-foreground mt-1">
              Investigate server connectivity, SSL, CORS, and response issues
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Server URL</CardTitle>
            <CardDescription>Enter the server URL you want to diagnose</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://example.com:8443"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={diagnoseServer} 
                disabled={loading || !serverUrl}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <CircleNotch size={16} className="animate-spin mr-2" />
                    Testing...
                  </>
                ) : (
                  'Run Diagnostic'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {currentResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className={`border-2 ${getStatusColor(currentResult.status)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(currentResult.status)}
                    <div>
                      <CardTitle>Latest Result</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(currentResult.timestamp).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  {currentResult.statusCode && (
                    <Badge variant={currentResult.status === 'success' ? 'default' : 'destructive'}>
                      HTTP {currentResult.statusCode}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="recommendations">Fix Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4 mt-4">
                    {currentResult.error ? (
                      <Alert variant="destructive">
                        <AlertDescription className="font-mono text-sm">
                          {currentResult.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Response Time</div>
                          <div className="text-2xl font-bold">{currentResult.responseTime}ms</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Content Type</div>
                          <div className="text-lg font-mono">{currentResult.contentType}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Server Type</div>
                          <div className="text-lg font-mono">{currentResult.serverType}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">CORS Enabled</div>
                          <div className="flex items-center gap-2">
                            {currentResult.corsEnabled ? (
                              <>
                                <CheckCircle size={20} className="text-green-500" />
                                <span className="text-lg">Yes</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={20} className="text-red-500" />
                                <span className="text-lg">No</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="headers" className="mt-4">
                    {currentResult.headers ? (
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="space-y-2 font-mono text-sm">
                          {Object.entries(currentResult.headers).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-3 gap-4">
                              <div className="text-muted-foreground font-semibold">{key}:</div>
                              <div className="col-span-2 break-all">{value}</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <Alert>
                        <AlertDescription>No headers received - connection failed</AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-4 space-y-3">
                    {currentResult.error?.includes('CORS') && (
                      <Alert>
                        <ShieldCheck size={20} />
                        <AlertDescription>
                          <strong>CORS Issue:</strong> The server needs to include proper CORS headers. 
                          Add <code className="bg-muted px-1 py-0.5 rounded">Access-Control-Allow-Origin</code> header.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {currentResult.error?.includes('SSL') && (
                      <Alert>
                        <ShieldCheck size={20} />
                        <AlertDescription>
                          <strong>SSL Issue:</strong> The SSL certificate may be self-signed or expired. 
                          Check certificate validity and ensure proper CA chain.
                        </AlertDescription>
                      </Alert>
                    )}

                    {currentResult.error?.includes('timeout') && (
                      <Alert>
                        <ShieldCheck size={20} />
                        <AlertDescription>
                          <strong>Timeout:</strong> Server took too long to respond. 
                          Check if server is running, firewall rules, and network connectivity.
                        </AlertDescription>
                      </Alert>
                    )}

                    {currentResult.error?.includes('Failed to fetch') && (
                      <Alert>
                        <ShieldCheck size={20} />
                        <AlertDescription>
                          <strong>Connection Failed:</strong> Multiple possible causes:
                          <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Server is offline or unreachable</li>
                            <li>Firewall blocking the connection</li>
                            <li>Invalid SSL certificate</li>
                            <li>Port {serverUrl.split(':').pop()} may not be open</li>
                            <li>CORS policy blocking cross-origin requests</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {!currentResult.corsEnabled && currentResult.status === 'success' && (
                      <Alert>
                        <ShieldCheck size={20} />
                        <AlertDescription>
                          <strong>CORS Not Enabled:</strong> Browser may block requests from web apps. 
                          Configure server to send proper CORS headers.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {results.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockCounterClockwise size={24} />
                Test History
              </CardTitle>
              <CardDescription>Previous diagnostic results</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {results.slice(1).map((result, index) => (
                    <div 
                      key={result.timestamp + index}
                      className="border rounded-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-mono text-sm">{result.url}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {result.statusCode && (
                          <Badge variant="outline">HTTP {result.statusCode}</Badge>
                        )}
                        {result.responseTime && (
                          <span className="text-sm text-muted-foreground">
                            {result.responseTime}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {results.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Code size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Enter a server URL and click "Run Diagnostic" to begin
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
