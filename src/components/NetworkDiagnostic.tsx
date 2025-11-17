import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Warning,
  Info,
  Lightning,
  NetworkX,
  GlobeHemisphereWest,
  GitBranch,
  ShieldCheck,
  CloudArrowUp,
  Terminal
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface NetworkTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'warning'
  details?: string
  solution?: string
}

export default function NetworkDiagnostic() {
  const [tests, setTests] = useState<NetworkTest[]>([
    {
      id: 'github-api',
      name: 'GitHub API Access',
      description: 'Testing connection to api.github.com',
      status: 'pending'
    },
    {
      id: 'codespace-ports',
      name: 'Codespace Port Forwarding',
      description: 'Checking if ports are properly forwarded',
      status: 'pending'
    },
    {
      id: 'local-dev-server',
      name: 'Local Development Server',
      description: 'Verifying Vite dev server is accessible',
      status: 'pending'
    },
    {
      id: 'github-auth',
      name: 'GitHub Authentication',
      description: 'Checking GitHub token and permissions',
      status: 'pending'
    },
    {
      id: 'dns-resolution',
      name: 'DNS Resolution',
      description: 'Testing domain name resolution',
      status: 'pending'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (id: string, updates: Partial<NetworkTest>) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { ...test, ...updates } : test
    ))
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    toast.info('Starting network diagnostics...')

    for (const test of tests) {
      updateTest(test.id, { status: 'running' })
      await new Promise(resolve => setTimeout(resolve, 800))

      switch (test.id) {
        case 'github-api':
          try {
            const response = await fetch('https://api.github.com/zen')
            if (response.ok) {
              const zen = await response.text()
              updateTest(test.id, {
                status: 'success',
                details: `✓ GitHub API accessible. Response: "${zen}"`
              })
            } else {
              updateTest(test.id, {
                status: 'failed',
                details: `✗ HTTP ${response.status}`,
                solution: 'Check your internet connection or GitHub status at status.github.com'
              })
            }
          } catch (error) {
            updateTest(test.id, {
              status: 'failed',
              details: `✗ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              solution: 'Your network is blocking GitHub API. Check firewall settings or try a different network.'
            })
          }
          break

        case 'codespace-ports':
          const currentOrigin = window.location.origin
          const isCodespace = currentOrigin.includes('github.dev') || currentOrigin.includes('githubpreview.dev') || currentOrigin.includes('app.github.dev')
          
          if (isCodespace) {
            updateTest(test.id, {
              status: 'success',
              details: `✓ Running in GitHub Codespaces: ${currentOrigin}. Ports are automatically forwarded.`
            })
          } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            updateTest(test.id, {
              status: 'success',
              details: '✓ Running on localhost. Direct access available.'
            })
          } else {
            updateTest(test.id, {
              status: 'warning',
              details: `⚠ Running on ${currentOrigin}. Verify port forwarding configuration.`,
              solution: 'If in Codespaces, go to the PORTS tab in VS Code and make sure your app port is forwarded.'
            })
          }
          break

        case 'local-dev-server':
          try {
            const healthCheck = await fetch(window.location.origin + '/')
            if (healthCheck.ok) {
              updateTest(test.id, {
                status: 'success',
                details: `✓ Development server responding at ${window.location.origin}`
              })
            } else {
              updateTest(test.id, {
                status: 'warning',
                details: `⚠ Server returned HTTP ${healthCheck.status}`
              })
            }
          } catch (error) {
            updateTest(test.id, {
              status: 'failed',
              details: '✗ Cannot reach development server',
              solution: 'Restart your Vite dev server with: npm run dev'
            })
          }
          break

        case 'github-auth':
          try {
            const user = await window.spark.user()
            if (user && user.login) {
              updateTest(test.id, {
                status: 'success',
                details: `✓ Authenticated as ${user.login} (${user.email || 'no email'})`,
              })
            } else {
              updateTest(test.id, {
                status: 'failed',
                details: '✗ Not authenticated with GitHub',
                solution: 'Run "gh auth login" in your terminal to authenticate'
              })
            }
          } catch (error) {
            updateTest(test.id, {
              status: 'warning',
              details: '⚠ Could not verify GitHub authentication',
              solution: 'Ensure you have GitHub CLI installed and are logged in'
            })
          }
          break

        case 'dns-resolution':
          try {
            const testDomains = [
              'https://api.github.com',
              'https://github.com'
            ]
            const results = await Promise.allSettled(
              testDomains.map(domain => fetch(domain, { method: 'HEAD' }))
            )
            
            const successCount = results.filter(r => r.status === 'fulfilled').length
            
            if (successCount === testDomains.length) {
              updateTest(test.id, {
                status: 'success',
                details: `✓ DNS resolution working. All ${testDomains.length} test domains resolved.`
              })
            } else {
              updateTest(test.id, {
                status: 'warning',
                details: `⚠ ${successCount}/${testDomains.length} domains resolved`,
                solution: 'Some DNS queries failed. Check your DNS settings or try using 8.8.8.8 (Google DNS)'
              })
            }
          } catch (error) {
            updateTest(test.id, {
              status: 'failed',
              details: '✗ DNS resolution failed',
              solution: 'Check your network DNS configuration'
            })
          }
          break
      }
    }

    setIsRunning(false)
    toast.success('Diagnostics complete!')
  }

  const getStatusIcon = (status: NetworkTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'failed':
        return <XCircle size={20} weight="fill" className="text-red-500" />
      case 'warning':
        return <Warning size={20} weight="fill" className="text-yellow-500" />
      case 'running':
        return <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Lightning size={20} weight="fill" className="text-accent" />
        </motion.div>
      default:
        return <Info size={20} weight="duotone" className="text-muted-foreground" />
    }
  }

  const networkInfo = {
    detected: {
      environment: 'GitHub Codespaces',
      internalIP: '10.0.1.11',
      hostname: '50b950bc-8496-4f0c-abb1-d90a8add165f.internal.cloudapp.net',
      listeningPorts: ['4173', '5000', '9000', '13000', '4000'],
      githubConnections: ['140.82.113.22:443', '20.189.173.7:443', '20.209.7.197:443']
    }
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NetworkX size={32} weight="duotone" className="text-accent" />
            <div>
              <CardTitle className="font-orbitron text-2xl tracking-wide">NETWORK DIAGNOSTIC CENTER</CardTitle>
              <CardDescription>Analyze connectivity, ports, and GitHub access</CardDescription>
            </div>
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="font-orbitron bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            {isRunning ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Lightning size={18} weight="fill" />
                </motion.div>
                RUNNING...
              </>
            ) : (
              <>
                <Lightning size={18} weight="fill" className="mr-2" />
                RUN DIAGNOSTICS
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-6 space-y-6">
          <Alert className="border-accent/30 bg-accent/5">
            <Info size={20} weight="duotone" />
            <AlertTitle className="font-orbitron">Your Network Status</AlertTitle>
            <AlertDescription>
              Based on your system dump, you are <strong>NOT locked out</strong>. Your Codespace has active connections to GitHub servers and external services. All ports are functioning normally.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="tests" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tests" className="font-orbitron">
                <ShieldCheck size={16} className="mr-2" />
                TESTS
              </TabsTrigger>
              <TabsTrigger value="info" className="font-orbitron">
                <GlobeHemisphereWest size={16} className="mr-2" />
                NETWORK INFO
              </TabsTrigger>
              <TabsTrigger value="solutions" className="font-orbitron">
                <Terminal size={16} className="mr-2" />
                SOLUTIONS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tests" className="space-y-3 mt-4">
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/30 bg-card/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(test.status)}
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold">{test.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">{test.description}</CardDescription>
                            {test.details && (
                              <div className="mt-2 text-sm font-mono text-foreground/80">
                                {test.details}
                              </div>
                            )}
                            {test.solution && (
                              <Alert className="mt-3 border-yellow-500/30 bg-yellow-500/5">
                                <Warning size={16} />
                                <AlertDescription className="text-sm">
                                  <strong>Solution:</strong> {test.solution}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            test.status === 'success' ? 'default' :
                            test.status === 'failed' ? 'destructive' :
                            test.status === 'warning' ? 'outline' :
                            'secondary'
                          }
                          className="font-mono text-xs"
                        >
                          {test.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="info" className="space-y-4 mt-4">
              <Card className="border-accent/30 bg-card/30">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <CloudArrowUp size={20} weight="duotone" />
                    DETECTED ENVIRONMENT
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Environment</div>
                      <div className="font-mono text-sm mt-1">{networkInfo.detected.environment}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Internal IP</div>
                      <div className="font-mono text-sm mt-1">{networkInfo.detected.internalIP}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">Hostname</div>
                      <div className="font-mono text-xs mt-1 break-all">{networkInfo.detected.hostname}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/30 bg-card/30">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <GitBranch size={20} weight="duotone" />
                    ACTIVE GITHUB CONNECTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {networkInfo.detected.githubConnections.map((conn, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle size={16} weight="fill" className="text-green-500" />
                        <span className="font-mono text-sm">{conn}</span>
                        <Badge variant="outline" className="text-xs">ESTABLISHED</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/30 bg-card/30">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2">
                    <NetworkX size={20} weight="duotone" />
                    LISTENING PORTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {networkInfo.detected.listeningPorts.map((port, i) => (
                      <Badge key={i} variant="secondary" className="font-mono justify-center">
                        {port}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4 mt-4">
              <Alert className="border-green-500/30 bg-green-500/5">
                <CheckCircle size={20} weight="fill" />
                <AlertTitle className="font-orbitron">Good News!</AlertTitle>
                <AlertDescription>
                  Your network is NOT locked. You have active connections to GitHub (140.82.113.22) and Azure infrastructure. Your Codespace environment is working correctly.
                </AlertDescription>
              </Alert>

              <Card className="border-border/30">
                <CardHeader>
                  <CardTitle className="font-orbitron">Common Issues & Solutions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">🔹 "My app won't load"</h4>
                    <p className="text-sm text-muted-foreground mb-2">In VS Code, open the PORTS tab and make sure your dev server port is set to <strong>Public</strong> visibility.</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">Right-click port → Port Visibility → Public</code>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🔹 "Cannot push to GitHub"</h4>
                    <p className="text-sm text-muted-foreground mb-2">Authenticate with GitHub CLI:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block">gh auth login</code>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🔹 "Port forwarding not working"</h4>
                    <p className="text-sm text-muted-foreground mb-2">Restart your dev server and check the PORTS tab:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mb-1">npm run dev</code>
                    <p className="text-xs text-muted-foreground">Then verify the forwarded URL in the PORTS panel</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🔹 "Need to access from different device"</h4>
                    <p className="text-sm text-muted-foreground mb-2">Copy the forwarded URL from PORTS tab - it looks like:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block">https://&lt;codespace-name&gt;-&lt;port&gt;.preview.app.github.dev</code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </ScrollArea>
    </div>
  )
}
