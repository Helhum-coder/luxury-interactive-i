import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Link as LinkIcon, 
  LinkBreak,
  Warning,
  Check,
  X,
  ArrowsClockwise,
  Eye,
  CloudArrowUp,
  ShieldSlash,
  Bug,
  Info,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ConnectionTest {
  id: string
  url: string
  method: string
  status: 'pending' | 'success' | 'failed' | 'redirected' | 'blocked'
  statusCode?: number
  responseTime?: number
  actualUrl?: string
  headers?: Record<string, string>
  error?: string
  timestamp: number
}

export default function ClusterConnectionAnalyzer() {
  const [tests, setTests] = useState<ConnectionTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [clusterInfo, setClusterInfo] = useState({
    currentUrl: window.location.href,
    origin: window.location.origin,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isCloudWorkstation: window.location.hostname.includes('cloudworkstations.dev')
  })

  const addTest = (test: Omit<ConnectionTest, 'id' | 'timestamp'>) => {
    const newTest: ConnectionTest = {
      ...test,
      id: `test-${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    }
    setTests(prev => [newTest, ...prev])
    return newTest
  }

  const updateTest = (id: string, updates: Partial<ConnectionTest>) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const testGitHubAPI = async () => {
    setIsRunning(true)
    toast.info('Testing GitHub API connection...')

    const endpoints = [
      { url: 'https://api.github.com', name: 'GitHub API Root' },
      { url: 'https://api.github.com/zen', name: 'GitHub Zen' },
      { url: 'https://api.github.com/user', name: 'GitHub User' },
      { url: 'https://github.com', name: 'GitHub Main Site' }
    ]

    for (const endpoint of endpoints) {
      const test = addTest({
        url: endpoint.url,
        method: 'GET',
        status: 'pending'
      })

      try {
        const startTime = Date.now()
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })
        const responseTime = Date.now() - startTime

        const isRedirected = response.url !== endpoint.url
        const headers: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          headers[key] = value
        })

        updateTest(test.id, {
          status: isRedirected ? 'redirected' : response.ok ? 'success' : 'failed',
          statusCode: response.status,
          responseTime,
          actualUrl: response.url,
          headers
        })

        if (isRedirected) {
          toast.warning(`${endpoint.name} redirected!`, {
            description: `Expected: ${endpoint.url}\nGot: ${response.url}`
          })
        } else if (response.ok) {
          toast.success(`${endpoint.name} accessible`)
        }
      } catch (error) {
        updateTest(test.id, {
          status: 'blocked',
          error: error instanceof Error ? error.message : 'Connection failed'
        })
        toast.error(`${endpoint.name} blocked!`, {
          description: error instanceof Error ? error.message : 'Connection failed'
        })
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    toast.success('GitHub API tests complete')
  }

  const testCallbackURL = async () => {
    const callbackUrl = `${window.location.origin}/callback`
    
    toast.info('Testing OAuth callback URL...')

    const test = addTest({
      url: callbackUrl,
      method: 'GET',
      status: 'pending'
    })

    try {
      const startTime = Date.now()
      const response = await fetch(callbackUrl, {
        method: 'GET',
        redirect: 'follow'
      })
      const responseTime = Date.now() - startTime

      const isRedirected = response.url !== callbackUrl

      updateTest(test.id, {
        status: isRedirected ? 'redirected' : response.ok ? 'success' : 'failed',
        statusCode: response.status,
        responseTime,
        actualUrl: response.url
      })

      if (isRedirected) {
        toast.error('Callback URL is being redirected!', {
          description: 'This is why OAuth authentication is failing'
        })
      } else {
        toast.success('Callback URL is accessible')
      }
    } catch (error) {
      updateTest(test.id, {
        status: 'blocked',
        error: error instanceof Error ? error.message : 'Connection failed'
      })
      toast.error('Callback URL is blocked!', {
        description: 'OAuth authentication cannot complete'
      })
    }
  }

  const testCustomURL = async () => {
    if (!customUrl) {
      toast.error('Please enter a URL')
      return
    }

    const test = addTest({
      url: customUrl,
      method: 'GET',
      status: 'pending'
    })

    try {
      const startTime = Date.now()
      const response = await fetch(customUrl, {
        method: 'GET',
        mode: 'no-cors'
      })
      const responseTime = Date.now() - startTime

      const isRedirected = response.url !== customUrl

      updateTest(test.id, {
        status: isRedirected ? 'redirected' : 'success',
        responseTime,
        actualUrl: response.url || customUrl
      })

      toast.success(`Test complete: ${customUrl}`)
    } catch (error) {
      updateTest(test.id, {
        status: 'blocked',
        error: error instanceof Error ? error.message : 'Connection failed'
      })
      toast.error('Connection blocked')
    }

    setCustomUrl('')
  }

  const analyzeCluster = () => {
    const issues: string[] = []
    
    if (clusterInfo.isCloudWorkstation) {
      issues.push('Running in Google Cloud Workstation - firewall rules may apply')
    }
    
    const redirectedTests = tests.filter(t => t.status === 'redirected')
    const blockedTests = tests.filter(t => t.status === 'blocked')
    
    if (redirectedTests.length > 0) {
      issues.push(`${redirectedTests.length} connections are being redirected`)
    }
    
    if (blockedTests.length > 0) {
      issues.push(`${blockedTests.length} connections are blocked`)
    }

    return issues
  }

  const getStatusIcon = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'success':
        return <Check className="text-green-500" size={20} weight="bold" />
      case 'failed':
      case 'blocked':
        return <X className="text-red-500" size={20} weight="bold" />
      case 'redirected':
        return <LinkBreak className="text-orange-500" size={20} weight="bold" />
      case 'pending':
        return <ArrowsClockwise className="text-blue-500 animate-spin" size={20} weight="bold" />
    }
  }

  const getStatusColor = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-500 border-green-500/50'
      case 'failed': return 'bg-red-500/20 text-red-500 border-red-500/50'
      case 'blocked': return 'bg-red-600/20 text-red-600 border-red-600/50'
      case 'redirected': return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
      case 'pending': return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
    }
  }

  const issues = analyzeCluster()

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border-2 border-purple-500/50">
              <Bug size={32} weight="fill" className="text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-orbitron tracking-wide text-purple-500">
                CLUSTER CONNECTION ANALYZER
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Real-time API connection testing and redirection detection
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={testGitHubAPI}
              disabled={isRunning}
              className="bg-purple-500 hover:bg-purple-600 text-white font-orbitron"
            >
              {isRunning ? (
                <>
                  <ArrowsClockwise size={18} weight="bold" className="animate-spin mr-2" />
                  TESTING...
                </>
              ) : (
                <>
                  <Eye size={18} weight="bold" className="mr-2" />
                  TEST GITHUB API
                </>
              )}
            </Button>
            <Button
              onClick={testCallbackURL}
              variant="outline"
              className="border-accent/50 hover:bg-accent/20 font-orbitron"
            >
              <LinkIcon size={18} weight="bold" className="mr-2" />
              TEST CALLBACK
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-6">
        <Tabs defaultValue="tests" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests" className="font-orbitron">
              <Eye size={16} weight="fill" className="mr-2" />
              CONNECTION TESTS
            </TabsTrigger>
            <TabsTrigger value="cluster" className="font-orbitron">
              <CloudArrowUp size={16} weight="fill" className="mr-2" />
              CLUSTER INFO
            </TabsTrigger>
            <TabsTrigger value="custom" className="font-orbitron">
              <LinkIcon size={16} weight="fill" className="mr-2" />
              CUSTOM TEST
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="flex-1 mt-4 overflow-hidden">
            <Card className="h-full border-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron">CONNECTION TEST RESULTS</CardTitle>
                <CardDescription>
                  Live testing of API endpoints and redirection detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {tests.length === 0 ? (
                    <Alert>
                      <Info size={20} weight="bold" />
                      <AlertTitle>No tests run yet</AlertTitle>
                      <AlertDescription>
                        Click "TEST GITHUB API" to start analyzing your connections
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {tests.map((test) => (
                        <motion.div
                          key={test.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-lg border-2 ${
                            test.status === 'success' ? 'border-green-500/50 bg-green-500/5' :
                            test.status === 'redirected' ? 'border-orange-500/50 bg-orange-500/5' :
                            'border-red-500/50 bg-red-500/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getStatusIcon(test.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold font-mono text-sm break-all">{test.url}</h4>
                                <Badge className={getStatusColor(test.status)}>
                                  {test.status.toUpperCase()}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {test.method && (
                                  <div>
                                    <span className="text-muted-foreground">Method:</span>{' '}
                                    <span className="font-mono">{test.method}</span>
                                  </div>
                                )}
                                {test.statusCode && (
                                  <div>
                                    <span className="text-muted-foreground">Status:</span>{' '}
                                    <span className="font-mono">{test.statusCode}</span>
                                  </div>
                                )}
                                {test.responseTime && (
                                  <div>
                                    <span className="text-muted-foreground">Time:</span>{' '}
                                    <span className="font-mono">{test.responseTime}ms</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Tested:</span>{' '}
                                  <span className="font-mono">{new Date(test.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>

                              {test.actualUrl && test.actualUrl !== test.url && (
                                <div className="mt-3 p-2 bg-orange-500/10 rounded text-xs font-mono">
                                  <div className="text-orange-500 font-bold mb-1">⚠ REDIRECTED TO:</div>
                                  <div className="text-orange-400 break-all">{test.actualUrl}</div>
                                </div>
                              )}

                              {test.error && (
                                <div className="mt-3 p-2 bg-red-500/10 rounded text-xs font-mono">
                                  <div className="text-red-500 font-bold mb-1">ERROR:</div>
                                  <div className="text-red-400">{test.error}</div>
                                </div>
                              )}

                              {test.headers && Object.keys(test.headers).length > 0 && (
                                <details className="mt-3">
                                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                    View Response Headers
                                  </summary>
                                  <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono max-h-40 overflow-auto">
                                    {Object.entries(test.headers).map(([key, value]) => (
                                      <div key={key} className="mb-1">
                                        <span className="text-blue-400">{key}:</span>{' '}
                                        <span className="text-muted-foreground">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cluster" className="flex-1 mt-4 overflow-hidden">
            <div className="space-y-4 h-full overflow-auto">
              <Card className="border-2 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron">CURRENT ENVIRONMENT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Hostname</Label>
                      <div className="font-mono text-sm mt-1 break-all">{clusterInfo.hostname}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Protocol</Label>
                      <div className="font-mono text-sm mt-1">{clusterInfo.protocol}</div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground text-xs">Full URL</Label>
                      <div className="font-mono text-xs mt-1 break-all bg-black/20 p-2 rounded">
                        {clusterInfo.currentUrl}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground text-xs">Origin</Label>
                      <div className="font-mono text-xs mt-1 break-all bg-black/20 p-2 rounded">
                        {clusterInfo.origin}
                      </div>
                    </div>
                  </div>

                  {clusterInfo.isCloudWorkstation && (
                    <Alert className="border-orange-500/50 bg-orange-500/10">
                      <Warning size={20} weight="bold" className="text-orange-500" />
                      <AlertTitle className="text-orange-500">Cloud Workstation Detected</AlertTitle>
                      <AlertDescription>
                        You are running in a Google Cloud Workstation. Firewall rules may be affecting your connections.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {issues.length > 0 && (
                <Card className="border-2 border-red-500/50">
                  <CardHeader>
                    <CardTitle className="text-lg font-orbitron text-red-500 flex items-center gap-2">
                      <ShieldSlash size={20} weight="fill" />
                      DETECTED ISSUES
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <X size={16} weight="bold" className="text-red-500 mt-0.5" />
                          <span className="text-sm">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 border-accent/50">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron flex items-center gap-2">
                    <Lightning size={20} weight="fill" className="text-accent" />
                    RECOMMENDED ACTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-accent/10 rounded">
                    <h5 className="font-bold mb-2">1. Contact Cloud Admin</h5>
                    <p className="text-muted-foreground">
                      Your Cloud Workstation administrator needs to review firewall rules that are blocking or redirecting GitHub API connections.
                    </p>
                  </div>

                  <div className="p-3 bg-accent/10 rounded">
                    <h5 className="font-bold mb-2">2. Whitelist GitHub Domains</h5>
                    <p className="text-muted-foreground mb-2">Ensure these domains are whitelisted:</p>
                    <div className="font-mono text-xs space-y-1 bg-black/20 p-2 rounded">
                      <div>• api.github.com</div>
                      <div>• github.com</div>
                      <div>• *.github.com</div>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/10 rounded">
                    <h5 className="font-bold mb-2">3. Fix Callback Routing</h5>
                    <p className="text-muted-foreground">
                      OAuth callbacks need to reach your workstation without redirection. Verify callback URLs are not being intercepted.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 mt-4 overflow-hidden">
            <Card className="border-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron">TEST CUSTOM URL</CardTitle>
                <CardDescription>
                  Test any URL to check for redirection or blocking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-url">URL to Test</Label>
                  <Input
                    id="custom-url"
                    placeholder="https://example.com"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && testCustomURL()}
                    className="mt-2 font-mono"
                  />
                </div>
                <Button
                  onClick={testCustomURL}
                  className="w-full font-orbitron"
                >
                  <LinkIcon size={18} weight="bold" className="mr-2" />
                  TEST CONNECTION
                </Button>

                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Info size={20} weight="bold" className="text-blue-500" />
                  <AlertTitle className="text-blue-500">Testing Tips</AlertTitle>
                  <AlertDescription className="text-sm space-y-1">
                    <div>• Test your project endpoints</div>
                    <div>• Check if specific APIs are accessible</div>
                    <div>• Verify OAuth redirect URLs</div>
                    <div>• Test callback endpoints</div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  )
}
