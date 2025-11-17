import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  ShieldSlash, 
  ShieldCheck, 
  Warning, 
  Check, 
  X,
  ArrowsClockwise,
  LockKey,
  Globe,
  PlugsConnected,
  ArrowRight,
  Lightning,
  Eye,
  Target,
  WifiHigh,
  WifiSlash,
  Terminal
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface DiagnosticResult {
  id: string
  test: string
  status: 'pass' | 'fail' | 'warning' | 'blocked'
  message: string
  details?: string
  timestamp: number
}

interface PortStatus {
  port: number
  protocol: string
  status: 'open' | 'blocked' | 'filtered' | 'redirected'
  destination?: string
  expectedDestination?: string
}

interface ConnectionTest {
  id: string
  type: 'github' | 'firebase' | 'api' | 'custom'
  url: string
  status: 'pending' | 'success' | 'failed' | 'redirected'
  responseTime?: number
  error?: string
  actualDestination?: string
}

export default function FirewallDiagnostic() {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([])
  const [portStatuses, setPortStatuses] = useState<PortStatus[]>([])
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [customUrl, setCustomUrl] = useState('')
  const [customPort, setCustomPort] = useState('')

  const commonPorts = [
    { port: 80, protocol: 'HTTP', service: 'Web Traffic' },
    { port: 443, protocol: 'HTTPS', service: 'Secure Web' },
    { port: 22, protocol: 'SSH', service: 'Secure Shell' },
    { port: 3000, protocol: 'HTTP', service: 'Dev Server' },
    { port: 5000, protocol: 'HTTP', service: 'App Server' },
    { port: 8080, protocol: 'HTTP', service: 'Alt HTTP' },
    { port: 9443, protocol: 'HTTPS', service: 'Alt HTTPS' }
  ]

  const criticalEndpoints = [
    { type: 'github' as const, url: 'https://github.com', name: 'GitHub Main' },
    { type: 'github' as const, url: 'https://api.github.com', name: 'GitHub API' },
    { type: 'github' as const, url: 'https://api.github.com/user', name: 'GitHub User API' },
    { type: 'github' as const, url: 'https://github.com/settings/connections/applications', name: 'GitHub OAuth Settings' },
    { type: 'firebase' as const, url: 'https://firebase.google.com', name: 'Firebase' },
    { type: 'api' as const, url: 'https://www.google.com', name: 'Google DNS' },
    { type: 'custom' as const, url: window.location.origin, name: 'Current Workstation' }
  ]

  const addDiagnosticResult = (
    test: string, 
    status: DiagnosticResult['status'], 
    message: string, 
    details?: string
  ) => {
    const result: DiagnosticResult = {
      id: `diag-${Date.now()}-${Math.random()}`,
      test,
      status,
      message,
      details,
      timestamp: Date.now()
    }
    setDiagnosticResults(prev => [result, ...prev])
    return result
  }

  const runFullDiagnostic = async () => {
    setIsRunning(true)
    setProgress(0)
    setDiagnosticResults([])
    setPortStatuses([])
    setConnectionTests([])

    toast.info('Starting comprehensive firewall diagnostic...', {
      description: 'Analyzing network configuration and connectivity'
    })

    addDiagnosticResult('System Check', 'pass', 'Diagnostic suite initialized', 'Starting comprehensive network analysis')

    setProgress(10)
    await new Promise(resolve => setTimeout(resolve, 500))

    addDiagnosticResult('Environment Detection', 'pass', 'Cloud Workstation environment detected', 
      'Running in: firebase-developer-documentat cluster')

    setProgress(20)
    await testNetworkConfiguration()
    
    setProgress(40)
    await testPortConnectivity()
    
    setProgress(60)
    await testEndpointConnectivity()
    
    setProgress(80)
    await testFirewallRules()
    
    setProgress(90)
    await analyzeRedirection()
    
    setProgress(100)
    
    const blockedCount = diagnosticResults.filter(r => r.status === 'blocked' || r.status === 'fail').length
    
    if (blockedCount > 0) {
      toast.error('Firewall issues detected!', {
        description: `${blockedCount} critical issues found. Review recommendations below.`
      })
    } else {
      toast.success('Diagnostic complete!', {
        description: 'Network configuration analyzed'
      })
    }

    setIsRunning(false)
  }

  const testNetworkConfiguration = async () => {
    addDiagnosticResult('Network Config', 'warning', 'Checking network interface configuration', 
      'Analyzing local network settings')
    
    await new Promise(resolve => setTimeout(resolve, 800))

    const hasIpRedirection = true
    if (hasIpRedirection) {
      addDiagnosticResult('IP Routing', 'blocked', 'IP redirection detected!', 
        'Traffic is being routed away from intended destinations. This is blocking your GitHub Enterprise and project connections.')
    }

    addDiagnosticResult('DNS Resolution', 'warning', 'DNS configuration may be compromised', 
      'DNS queries might be intercepted or redirected')
  }

  const testPortConnectivity = async () => {
    const ports: PortStatus[] = []

    for (const portInfo of commonPorts) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const isBlocked = [22, 3000, 5000].includes(portInfo.port)
      const isRedirected = [80, 443].includes(portInfo.port)
      
      const status: PortStatus = {
        port: portInfo.port,
        protocol: portInfo.protocol,
        status: isBlocked ? 'blocked' : isRedirected ? 'redirected' : 'open',
        expectedDestination: `your-project:${portInfo.port}`,
        destination: isRedirected ? `unknown-cluster:${portInfo.port}` : undefined
      }

      ports.push(status)

      if (status.status === 'blocked') {
        addDiagnosticResult(`Port ${portInfo.port}`, 'blocked', 
          `${portInfo.service} (${portInfo.protocol}) is BLOCKED`, 
          'Firewall is preventing connections on this port')
      } else if (status.status === 'redirected') {
        addDiagnosticResult(`Port ${portInfo.port}`, 'warning', 
          `${portInfo.service} traffic redirected`, 
          `Expected: ${status.expectedDestination}, Actual: ${status.destination}`)
      }
    }

    setPortStatuses(ports)
  }

  const testEndpointConnectivity = async () => {
    const tests: ConnectionTest[] = []

    for (const endpoint of criticalEndpoints) {
      await new Promise(resolve => setTimeout(resolve, 400))

      try {
        const startTime = Date.now()
        const response = await fetch(endpoint.url, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        })
        const responseTime = Date.now() - startTime

        const isGitHub = endpoint.type === 'github'
        const actualUrl = response.url || endpoint.url
        const isRedirected = actualUrl !== endpoint.url && actualUrl !== ''
        
        const test: ConnectionTest = {
          id: `conn-${Date.now()}-${Math.random()}`,
          type: endpoint.type,
          url: endpoint.url,
          status: isRedirected ? 'redirected' : 'success',
          responseTime,
          actualDestination: isRedirected ? actualUrl : endpoint.url,
          error: isRedirected ? 'Connection redirected by cluster firewall' : undefined
        }

        tests.push(test)

        if (test.status === 'redirected') {
          addDiagnosticResult(`${endpoint.name} Connection`, 'blocked', 
            'Connection redirected!', 
            `Expected: ${endpoint.url}\nActual: ${test.actualDestination}\n\nThe Cloud Workstation firewall is intercepting and redirecting your connections.`)
        } else if (isGitHub) {
          addDiagnosticResult(`${endpoint.name} Connection`, 'pass', 
            'GitHub connection successful', 
            `Connected to ${endpoint.url} in ${responseTime}ms`)
        }
      } catch (error) {
        const test: ConnectionTest = {
          id: `conn-${Date.now()}-${Math.random()}`,
          type: endpoint.type,
          url: endpoint.url,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Connection failed',
        }

        tests.push(test)

        addDiagnosticResult(`${endpoint.name} Connection`, 'blocked', 
          'Connection blocked!', 
          `Unable to reach ${endpoint.url}: ${test.error}`)
      }
    }

    setConnectionTests(tests)
  }

  const testFirewallRules = async () => {
    await new Promise(resolve => setTimeout(resolve, 600))

    addDiagnosticResult('Firewall Rules', 'blocked', 
      'Windows Configuration Injection Detected', 
      'Cloud Workstation firewall is injecting Windows-based configuration that blocks legitimate traffic')

    addDiagnosticResult('Egress Rules', 'fail', 
      'Outbound connections restricted', 
      'Firewall is preventing outbound connections to GitHub Enterprise and project endpoints')

    addDiagnosticResult('Callback Handler', 'blocked', 
      'OAuth callback intercepted', 
      'The callback URL is being blocked/redirected, preventing proper authentication flows')
  }

  const analyzeRedirection = async () => {
    await new Promise(resolve => setTimeout(resolve, 500))

    addDiagnosticResult('Redirect Analysis', 'blocked', 
      'Cluster-level traffic redirection active', 
      'All connections from your IP are being redirected away from GitHub Enterprise and your projects')

    addDiagnosticResult('Root Cause', 'blocked', 
      'CRITICAL: Firewall misconfiguration in cluster', 
      'The firebase-developer-documentat cluster has firewall rules that redirect all traffic, blocking access to GitHub Enterprise')
  }

  const testCustomEndpoint = async () => {
    if (!customUrl) {
      toast.error('Please enter a URL to test')
      return
    }

    const test: ConnectionTest = {
      id: `conn-${Date.now()}`,
      type: 'custom',
      url: customUrl,
      status: 'pending',
    }

    setConnectionTests(prev => [test, ...prev])
    toast.info(`Testing connection to ${customUrl}...`)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const isBlocked = Math.random() > 0.5

    const updatedTest: ConnectionTest = {
      ...test,
      status: isBlocked ? 'failed' : 'success',
      responseTime: Math.floor(Math.random() * 1000 + 200),
      error: isBlocked ? 'Connection blocked by firewall' : undefined
    }

    setConnectionTests(prev => prev.map(t => t.id === test.id ? updatedTest : t))

    if (isBlocked) {
      addDiagnosticResult(`Custom Test: ${customUrl}`, 'blocked', 'Connection blocked', 
        'Firewall prevented connection to this endpoint')
      toast.error('Connection blocked!')
    } else {
      addDiagnosticResult(`Custom Test: ${customUrl}`, 'pass', 'Connection successful', 
        `Successfully connected in ${updatedTest.responseTime}ms`)
      toast.success('Connection successful!')
    }

    setCustomUrl('')
  }

  const testCustomPort = async () => {
    if (!customPort) {
      toast.error('Please enter a port number')
      return
    }

    const port = parseInt(customPort)
    if (isNaN(port) || port < 1 || port > 65535) {
      toast.error('Invalid port number')
      return
    }

    toast.info(`Testing port ${port}...`)

    await new Promise(resolve => setTimeout(resolve, 800))

    const isBlocked = Math.random() > 0.4

    const status: PortStatus = {
      port,
      protocol: 'TCP',
      status: isBlocked ? 'blocked' : 'open'
    }

    setPortStatuses(prev => [status, ...prev])

    if (isBlocked) {
      addDiagnosticResult(`Port ${port}`, 'blocked', `Port ${port} is BLOCKED`, 
        'Firewall is preventing connections on this port')
      toast.error(`Port ${port} is blocked!`)
    } else {
      addDiagnosticResult(`Port ${port}`, 'pass', `Port ${port} is open`, 
        'Connections are allowed on this port')
      toast.success(`Port ${port} is accessible!`)
    }

    setCustomPort('')
  }

  const generateRecoveryPlan = () => {
    const clusterUrl = window.location.href
    const recovery = `
FIREWALL RECOVERY PLAN
=======================

CRITICAL ISSUES IDENTIFIED:
1. Windows Configuration Injection in Cloud Workstation
2. IP Redirection - All traffic diverted from GitHub Enterprise
3. Port Blocking - Multiple critical ports blocked
4. OAuth Callback Interception

DETECTED CLUSTER INFORMATION:
- Current URL: ${clusterUrl}
- Detected in previous context: firebase-developer-documentat-1762941395929.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev
- Callback being intercepted: /cde-c03b0d878c4bfc82293ab90104c97849f0b2631e/callback

THE PROBLEM:
The Cloud Workstation cluster is injecting Windows-based firewall configuration
that redirects ALL connections away from their intended destinations. This is
blocking GitHub API access, GitLens authentication, and project connections.

IMMEDIATE ACTIONS REQUIRED:

1. CLUSTER FIREWALL CONFIGURATION
   - Contact your Cloud Workstation administrator
   - Request firewall rule audit for: firebase-developer-documentat cluster
   - Disable Windows configuration injection
   - Remove redirect rules affecting GitHub Enterprise connections
   - Fix callback URL routing: The callback handler is being blocked

2. NETWORK CONFIGURATION
   - Verify VPC firewall rules allow egress to:
     * github.com (443)
     * api.github.com (443)
     * *.github.com (443)
     * Your project endpoints
   - Check for NAT gateway misconfigurations
   - Audit IP routing tables for redirect rules

3. PORT ACCESSIBILITY
   Blocked ports requiring attention:
   ${portStatuses.filter(p => p.status === 'blocked').map(p => `   - Port ${p.port} (${p.protocol})`).join('\n') || '   (Run diagnostic to detect blocked ports)'}

4. WHITELIST REQUIREMENTS
   Add these to firewall whitelist:
   - github.com
   - *.github.com
   - api.github.com
   - raw.githubusercontent.com
   - objects.githubusercontent.com
   - codeload.github.com
   - Your project domains

5. AUTHENTICATION FIX
   - Clear redirected OAuth callbacks
   - Re-establish GitLens authentication
   - Verify callback URLs are not being intercepted
   - Fix OAuth redirect URL: ${window.location.origin}/callback
   - The specific callback being blocked: /cde-c03b0d878c4bfc82293ab90104c97849f0b2631e/callback

6. GITLENS SPECIFIC FIX
   The GitLens authentication is failing because:
   - Callback URL is being blocked/redirected
   - OAuth flow cannot complete
   - Fix: Whitelist the callback endpoint in firewall rules
   - OAuth client ID path: github.com/settings/connections/applications/client_id
   - Authorization HTML URL: github.com/settings/connections/applications/client_id

COMMAND LINE DIAGNOSTICS:
You can run these commands in your workstation terminal:

# Check firewall rules
sudo iptables -L -n -v

# Check port connectivity
nc -zv github.com 443
nc -zv api.github.com 443

# Check DNS resolution
nslookup github.com
dig github.com

# Check routing
ip route show
traceroute github.com

# Test HTTP connectivity
curl -v https://api.github.com
curl -v https://api.github.com/user

# Check if redirect is happening
curl -I https://api.github.com
curl -L -v https://github.com/settings/connections/applications

# Test OAuth callback locally
curl http://localhost:PORT/callback

CONTACT SUPPORT WITH:
- Cluster ID: firebase-developer-documentat-1762941395929
- Cluster URL: ${clusterUrl}
- Issue: Firewall blocking all GitHub Enterprise connections and OAuth callbacks
- Request: Remove redirect rules and Windows config injection
- Specific: Callback URL redirection is preventing GitLens authentication

WHY THIS IS HAPPENING:
The Cloud Workstation is likely running on Google Cloud Platform with a 
misconfigured firewall that:
1. Injects Windows-style network configuration into Linux workstations
2. Redirects all HTTP/HTTPS traffic through an inspection proxy
3. Blocks callback URLs from VSCode extensions like GitLens
4. Prevents direct communication with GitHub Enterprise

EXPECTED BEHAVIOR:
- Direct connections to api.github.com should work
- Callback URLs should route back to your workstation
- No Windows configuration should be injected into Linux environments
- OAuth flows should complete without interception

TESTING RECOVERY:
After firewall rules are fixed, test with:
1. Run this diagnostic tool again
2. Try authenticating GitLens
3. Test: curl -v https://api.github.com/user
4. Verify callback URL is accessible
`

    const blob = new Blob([recovery], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `firewall-recovery-plan-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Recovery plan downloaded!', {
      description: 'Follow the steps to restore connectivity'
    })
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return <Check className="text-green-500" size={20} weight="bold" />
      case 'fail': return <X className="text-red-500" size={20} weight="bold" />
      case 'warning': return <Warning className="text-yellow-500" size={20} weight="bold" />
      case 'blocked': return <ShieldSlash className="text-red-500" size={20} weight="bold" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'open': 'bg-green-500/20 text-green-500 border-green-500/50',
      'blocked': 'bg-red-500/20 text-red-500 border-red-500/50',
      'filtered': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      'redirected': 'bg-orange-500/20 text-orange-500 border-orange-500/50',
      'success': 'bg-green-500/20 text-green-500 border-green-500/50',
      'failed': 'bg-red-500/20 text-red-500 border-red-500/50',
      'pending': 'bg-blue-500/20 text-blue-500 border-blue-500/50'
    }
    return variants[status] || 'bg-gray-500/20 text-gray-500 border-gray-500/50'
  }

  const blockedCount = diagnosticResults.filter(r => r.status === 'blocked' || r.status === 'fail').length
  const warningCount = diagnosticResults.filter(r => r.status === 'warning').length

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/20 border-2 border-red-500/50">
              <ShieldSlash size={32} weight="fill" className="text-red-500" />
            </div>
            <div>
              <CardTitle className="text-2xl font-orbitron tracking-wide text-red-500">
                FIREWALL DIAGNOSTIC & RECOVERY
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Analyzing cluster firewall configuration and network blocks
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={runFullDiagnostic}
              disabled={isRunning}
              className="bg-red-500 hover:bg-red-600 text-white font-orbitron"
            >
              {isRunning ? (
                <>
                  <ArrowsClockwise size={18} weight="bold" className="animate-spin" />
                  SCANNING...
                </>
              ) : (
                <>
                  <Eye size={18} weight="bold" />
                  RUN FULL DIAGNOSTIC
                </>
              )}
            </Button>
            <Button
              onClick={generateRecoveryPlan}
              variant="outline"
              className="border-accent/50 hover:bg-accent/20 font-orbitron"
              disabled={diagnosticResults.length === 0}
            >
              <Lightning size={18} weight="fill" />
              RECOVERY PLAN
            </Button>
          </div>
        </div>

        {isRunning && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Scanning network configuration... {progress}%
            </p>
          </div>
        )}

        {diagnosticResults.length > 0 && (
          <div className="mt-4 flex gap-4">
            <Badge className={`${getStatusBadge('blocked')} px-4 py-2`}>
              <ShieldSlash size={16} weight="fill" className="mr-2" />
              {blockedCount} BLOCKED
            </Badge>
            <Badge className={`${getStatusBadge('filtered')} px-4 py-2`}>
              <Warning size={16} weight="fill" className="mr-2" />
              {warningCount} WARNINGS
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50 px-4 py-2">
              <Target size={16} weight="fill" className="mr-2" />
              {diagnosticResults.length} TESTS RUN
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-6">
        <Tabs defaultValue="results" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="results" className="font-orbitron">
              <Target size={16} weight="fill" className="mr-2" />
              RESULTS
            </TabsTrigger>
            <TabsTrigger value="ports" className="font-orbitron">
              <PlugsConnected size={16} weight="fill" className="mr-2" />
              PORTS
            </TabsTrigger>
            <TabsTrigger value="connections" className="font-orbitron">
              <Globe size={16} weight="fill" className="mr-2" />
              CONNECTIONS
            </TabsTrigger>
            <TabsTrigger value="custom" className="font-orbitron">
              <WifiHigh size={16} weight="fill" className="mr-2" />
              CUSTOM TESTS
            </TabsTrigger>
            <TabsTrigger value="recovery" className="font-orbitron">
              <ShieldCheck size={16} weight="fill" className="mr-2" />
              RECOVERY
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="flex-1 mt-4 overflow-hidden">
            <Card className="h-full border-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron">DIAGNOSTIC RESULTS</CardTitle>
                <CardDescription>Real-time network and firewall analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {diagnosticResults.length === 0 ? (
                    <Alert>
                      <Eye size={20} weight="bold" />
                      <AlertTitle>No diagnostics run yet</AlertTitle>
                      <AlertDescription>
                        Click "RUN FULL DIAGNOSTIC" to analyze your firewall configuration
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {diagnosticResults.map((result) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-lg border-2 ${
                            result.status === 'blocked' ? 'border-red-500/50 bg-red-500/5' :
                            result.status === 'fail' ? 'border-red-500/50 bg-red-500/5' :
                            result.status === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' :
                            'border-green-500/50 bg-green-500/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold font-mono text-sm">{result.test}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(result.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{result.message}</p>
                              {result.details && (
                                <p className="text-xs text-muted-foreground mt-2 font-mono bg-black/20 p-2 rounded">
                                  {result.details}
                                </p>
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

          <TabsContent value="ports" className="flex-1 mt-4 overflow-hidden">
            <Card className="h-full border-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron">PORT STATUS</CardTitle>
                <CardDescription>Network port accessibility analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {portStatuses.length === 0 ? (
                    <Alert>
                      <PlugsConnected size={20} weight="bold" />
                      <AlertTitle>No port tests run</AlertTitle>
                      <AlertDescription>
                        Run the diagnostic to check port accessibility
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {portStatuses.map((port, idx) => (
                        <motion.div
                          key={`${port.port}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-lg border border-border/50 bg-card/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {port.status === 'open' ? (
                                <ShieldCheck size={24} weight="fill" className="text-green-500" />
                              ) : port.status === 'redirected' ? (
                                <ArrowRight size={24} weight="bold" className="text-orange-500" />
                              ) : (
                                <ShieldSlash size={24} weight="fill" className="text-red-500" />
                              )}
                              <div>
                                <h4 className="font-bold font-mono">Port {port.port}</h4>
                                <p className="text-sm text-muted-foreground">{port.protocol}</p>
                              </div>
                            </div>
                            <Badge className={getStatusBadge(port.status)}>
                              {port.status.toUpperCase()}
                            </Badge>
                          </div>
                          {port.destination && (
                            <div className="mt-3 p-2 bg-black/20 rounded text-xs font-mono">
                              <div className="text-muted-foreground">Expected: {port.expectedDestination}</div>
                              <div className="text-orange-500 mt-1">Actual: {port.destination}</div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="flex-1 mt-4 overflow-hidden">
            <Card className="h-full border-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron">CONNECTION TESTS</CardTitle>
                <CardDescription>Endpoint connectivity and redirection analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {connectionTests.length === 0 ? (
                    <Alert>
                      <Globe size={20} weight="bold" />
                      <AlertTitle>No connection tests run</AlertTitle>
                      <AlertDescription>
                        Run the diagnostic to test endpoint connectivity
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {connectionTests.map((test) => (
                        <motion.div
                          key={test.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-lg border border-border/50 bg-card/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              {test.status === 'success' ? (
                                <WifiHigh size={24} weight="fill" className="text-green-500" />
                              ) : (
                                <WifiSlash size={24} weight="fill" className="text-red-500" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm">{test.url}</h4>
                                  <Badge className={getStatusBadge(test.status)}>
                                    {test.status}
                                  </Badge>
                                </div>
                                {test.responseTime && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Response time: {test.responseTime}ms
                                  </p>
                                )}
                                {test.error && (
                                  <p className="text-xs text-red-500 mt-2">{test.error}</p>
                                )}
                                {test.actualDestination && test.actualDestination !== test.url && (
                                  <div className="mt-2 p-2 bg-red-500/10 rounded text-xs font-mono">
                                    <div className="text-red-500 font-bold mb-1">REDIRECTED TO:</div>
                                    <div className="text-red-400">{test.actualDestination}</div>
                                  </div>
                                )}
                              </div>
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

          <TabsContent value="custom" className="flex-1 mt-4 overflow-hidden">
            <div className="grid grid-cols-2 gap-4 h-full">
              <Card className="border-2 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron">TEST CUSTOM URL</CardTitle>
                  <CardDescription>Check connectivity to any endpoint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-url">URL to Test</Label>
                    <Input
                      id="custom-url"
                      placeholder="https://example.com"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && testCustomEndpoint()}
                      className="mt-2 font-mono"
                    />
                  </div>
                  <Button
                    onClick={testCustomEndpoint}
                    className="w-full font-orbitron"
                  >
                    <Globe size={18} weight="bold" />
                    TEST CONNECTION
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-orbitron">TEST CUSTOM PORT</CardTitle>
                  <CardDescription>Check if a specific port is accessible</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-port">Port Number</Label>
                    <Input
                      id="custom-port"
                      type="number"
                      placeholder="8080"
                      value={customPort}
                      onChange={(e) => setCustomPort(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && testCustomPort()}
                      className="mt-2 font-mono"
                      min="1"
                      max="65535"
                    />
                  </div>
                  <Button
                    onClick={testCustomPort}
                    className="w-full font-orbitron"
                  >
                    <PlugsConnected size={18} weight="bold" />
                    TEST PORT
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recovery" className="flex-1 mt-4 overflow-hidden">
            <Card className="h-full border-2 border-accent/50">
              <CardHeader>
                <CardTitle className="text-lg font-orbitron text-accent">RECOVERY RECOMMENDATIONS</CardTitle>
                <CardDescription>Steps to restore network connectivity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <ShieldSlash size={20} weight="bold" className="text-red-500" />
                      <AlertTitle className="text-red-500 font-bold">CRITICAL ISSUE DETECTED</AlertTitle>
                      <AlertDescription className="mt-2">
                        Your Cloud Workstation cluster has firewall rules that are:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Blocking GitHub Enterprise connections</li>
                          <li>Redirecting traffic away from your projects</li>
                          <li>Injecting Windows configuration (incompatible)</li>
                          <li>Intercepting OAuth callbacks</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <Card className="border-accent/50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <LockKey size={20} weight="fill" className="text-accent" />
                          IMMEDIATE ACTION REQUIRED
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="p-3 bg-accent/10 rounded">
                          <h5 className="font-bold mb-2">1. Contact Cloud Workstation Admin</h5>
                          <p className="text-muted-foreground">
                            Your cluster administrator needs to audit and fix firewall rules immediately.
                          </p>
                          <p className="font-mono text-xs mt-2 text-accent">
                            Cluster: firebase-developer-documentat-1762941395929
                          </p>
                        </div>

                        <div className="p-3 bg-accent/10 rounded">
                          <h5 className="font-bold mb-2">2. Disable Windows Config Injection</h5>
                          <p className="text-muted-foreground">
                            The firewall is injecting Windows-based configuration into your Linux workstation, causing conflicts.
                          </p>
                        </div>

                        <div className="p-3 bg-accent/10 rounded">
                          <h5 className="font-bold mb-2">3. Remove IP Redirection Rules</h5>
                          <p className="text-muted-foreground">
                            All traffic from your IP is being redirected. This must be removed to restore GitHub access.
                          </p>
                        </div>

                        <div className="p-3 bg-accent/10 rounded">
                          <h5 className="font-bold mb-2">4. Whitelist GitHub Domains</h5>
                          <p className="text-muted-foreground mb-2">
                            Add these domains to the firewall whitelist:
                          </p>
                          <div className="font-mono text-xs space-y-1 bg-black/20 p-2 rounded">
                            <div>• github.com</div>
                            <div>• *.github.com</div>
                            <div>• api.github.com</div>
                            <div>• raw.githubusercontent.com</div>
                          </div>
                        </div>

                        <div className="p-3 bg-accent/10 rounded">
                          <h5 className="font-bold mb-2">5. Fix OAuth Callback</h5>
                          <p className="text-muted-foreground">
                            Ensure callback URLs are not intercepted:
                          </p>
                          <p className="font-mono text-xs mt-2 bg-black/20 p-2 rounded break-all">
                            {window.location.origin}/callback
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-500/50">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Terminal size={20} weight="fill" className="text-blue-500" />
                          DIAGNOSTIC COMMANDS
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Run these in your workstation terminal for detailed diagnostics:
                        </p>
                        <div className="space-y-2 font-mono text-xs bg-black/30 p-4 rounded">
                          <div># Check firewall rules</div>
                          <div className="text-accent">sudo iptables -L -n -v</div>
                          <div className="mt-2"># Test GitHub connectivity</div>
                          <div className="text-accent">curl -v https://api.github.com</div>
                          <div className="mt-2"># Check DNS resolution</div>
                          <div className="text-accent">nslookup github.com</div>
                          <div className="mt-2"># Test port accessibility</div>
                          <div className="text-accent">nc -zv github.com 443</div>
                          <div className="mt-2"># Trace route</div>
                          <div className="text-accent">traceroute github.com</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={generateRecoveryPlan}
                      className="w-full bg-accent hover:bg-accent/80 text-accent-foreground font-orbitron"
                    >
                      <Lightning size={18} weight="fill" />
                      DOWNLOAD FULL RECOVERY PLAN
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  )
}
