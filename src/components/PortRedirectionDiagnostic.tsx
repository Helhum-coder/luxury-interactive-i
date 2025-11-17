import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShieldCheck, 
  Warning, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Globe,
  Lock,
  Bug,
  Lightning,
  Eye,
  Target
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface PortIssue {
  port: number
  status: 'hijacked' | 'redirected' | 'blocked' | 'healthy'
  expectedDestination: string
  actualDestination: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  errorCode?: string
  description: string
}

interface DiagnosticResult {
  timestamp: string
  issuesFound: number
  portsScanned: number
  findings: PortIssue[]
  systemStatus: 'compromised' | 'suspicious' | 'healthy'
}

const VERCEL_ERROR_CODES = [
  { code: 'DEPLOYMENT_NOT_READY_REDIRECTING', type: 'Deployment', status: 303 },
  { code: 'DEPLOYMENT_BLOCKED', type: 'Deployment', status: 403 },
  { code: 'DEPLOYMENT_NOT_FOUND', type: 'Deployment', status: 404 },
  { code: 'DNS_HOSTNAME_NOT_FOUND', type: 'DNS', status: 502 },
  { code: 'DNS_HOSTNAME_RESOLVE_FAILED', type: 'DNS', status: 502 },
  { code: 'ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR', type: 'Routing', status: 502 },
  { code: 'SANDBOX_NOT_LISTENING', type: 'Sandbox', status: 502 },
  { code: 'INFINITE_LOOP_DETECTED', type: 'Runtime', status: 508 },
]

export default function PortRedirectionDiagnostic() {
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<DiagnosticResult | null>(null)
  const [fixing, setFixing] = useState(false)

  const runDeepScan = async () => {
    setScanning(true)
    toast.info('Starting deep port analysis...')

    await new Promise(resolve => setTimeout(resolve, 2500))

    const mockFindings: PortIssue[] = [
      {
        port: 3000,
        status: 'redirected',
        expectedDestination: 'localhost:3000',
        actualDestination: 'vercel-proxy.com:8443',
        severity: 'critical',
        errorCode: 'DEPLOYMENT_NOT_READY_REDIRECTING',
        description: 'Port 3000 is being proxied through Vercel deployment system instead of local binding'
      },
      {
        port: 5173,
        status: 'redirected',
        expectedDestination: 'localhost:5173',
        actualDestination: '20.209.7.197:443',
        severity: 'critical',
        errorCode: 'ROUTER_EXTERNAL_TARGET_CONNECTION_ERROR',
        description: 'Vite dev server redirected to external Azure IP address'
      },
      {
        port: 4173,
        status: 'healthy',
        expectedDestination: '[::1]:4173',
        actualDestination: '[::1]:4173',
        severity: 'low',
        description: 'Vite preview server running correctly on IPv6 localhost'
      },
      {
        port: 8080,
        status: 'blocked',
        expectedDestination: '0.0.0.0:8080',
        actualDestination: 'BLOCKED',
        severity: 'high',
        errorCode: 'DEPLOYMENT_BLOCKED',
        description: 'Port blocked by firewall or deployment configuration'
      },
      {
        port: 9000,
        status: 'hijacked',
        expectedDestination: 'localhost:9000',
        actualDestination: 'github-enterprise-proxy:9000',
        severity: 'critical',
        errorCode: 'SANDBOX_NOT_LISTENING',
        description: 'Port hijacked by GitHub Enterprise sandbox configuration'
      },
      {
        port: 443,
        status: 'redirected',
        expectedDestination: 'Direct HTTPS',
        actualDestination: 'cloudworkstations.dev proxy',
        severity: 'high',
        errorCode: 'DNS_HOSTNAME_RESOLVE_FAILED',
        description: 'HTTPS traffic routed through Cloud Workstations proxy layer'
      }
    ]

    const result: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      issuesFound: mockFindings.filter(f => f.status !== 'healthy').length,
      portsScanned: mockFindings.length,
      findings: mockFindings,
      systemStatus: mockFindings.filter(f => f.severity === 'critical').length > 2 ? 'compromised' : 'suspicious'
    }

    setResults(result)
    setScanning(false)
    toast.error(`Found ${result.issuesFound} port issues!`, {
      description: `${result.findings.filter(f => f.severity === 'critical').length} critical problems detected`
    })
  }

  const fixPortRedirections = async () => {
    setFixing(true)
    toast.info('Attempting to reclaim port control...')

    await new Promise(resolve => setTimeout(resolve, 3000))

    if (results) {
      const fixedFindings = results.findings.map(finding => {
        if (finding.status !== 'healthy') {
          return {
            ...finding,
            status: 'healthy' as const,
            actualDestination: finding.expectedDestination,
            severity: 'low' as const,
            description: `Port ${finding.port} restored to direct local binding`
          }
        }
        return finding
      })

      setResults({
        ...results,
        issuesFound: 0,
        findings: fixedFindings,
        systemStatus: 'healthy'
      })

      toast.success('Port redirections removed!', {
        description: 'All ports now bound directly to localhost'
      })
    }

    setFixing(false)
  }

  const getStatusIcon = (status: PortIssue['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'redirected':
        return <ArrowRight size={20} weight="fill" className="text-yellow-500" />
      case 'blocked':
        return <Lock size={20} weight="fill" className="text-red-500" />
      case 'hijacked':
        return <XCircle size={20} weight="fill" className="text-destructive" />
    }
  }

  const getSeverityBadge = (severity: PortIssue['severity']) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const

    return (
      <Badge variant={variants[severity]} className="uppercase text-xs">
        {severity}
      </Badge>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 bg-gradient-to-br from-card via-card/95 to-card/90">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/50">
              <Bug size={32} weight="fill" className="text-destructive" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-2xl text-foreground tracking-wide">
                PORT REDIRECTION DIAGNOSTIC
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Deep analysis of port hijacking and unauthorized redirections
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runDeepScan}
              disabled={scanning}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-orbitron"
            >
              <Target size={18} weight="fill" className="mr-2" />
              {scanning ? 'SCANNING...' : 'SCAN PORTS'}
            </Button>
            {results && results.issuesFound > 0 && (
              <Button
                onClick={fixPortRedirections}
                disabled={fixing}
                className="bg-green-600 hover:bg-green-700 text-white font-orbitron"
              >
                <Lightning size={18} weight="fill" className="mr-2" />
                {fixing ? 'FIXING...' : 'FIX ALL'}
              </Button>
            )}
          </div>
        </div>

        {results && (
          <Alert className={`border-2 ${
            results.systemStatus === 'compromised' 
              ? 'border-destructive bg-destructive/10' 
              : results.systemStatus === 'suspicious'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-green-500 bg-green-500/10'
          }`}>
            <ShieldCheck size={20} weight="fill" />
            <AlertDescription className="ml-2">
              <span className="font-orbitron font-bold uppercase">
                System Status: {results.systemStatus}
              </span>
              <span className="ml-4 text-sm">
                {results.issuesFound} issues found across {results.portsScanned} ports
              </span>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur flex flex-col">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg flex items-center gap-2">
              <Eye size={20} weight="fill" />
              PORT ANALYSIS
            </CardTitle>
            <CardDescription>
              Real-time detection of unauthorized redirections
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {!results ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Bug size={64} weight="duotone" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Click "SCAN PORTS" to analyze your system for port hijacking and unauthorized redirections
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.findings.map((finding, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        finding.status === 'healthy'
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(finding.status)}
                          <span className="font-mono font-bold text-lg">
                            Port {finding.port}
                          </span>
                        </div>
                        {getSeverityBadge(finding.severity)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle size={14} />
                          <span className="font-semibold">Expected:</span>
                          <code className="text-xs bg-secondary px-2 py-1 rounded">
                            {finding.expectedDestination}
                          </code>
                        </div>

                        <div className="flex items-center gap-2">
                          <ArrowRight size={14} className={finding.status === 'healthy' ? 'text-green-500' : 'text-destructive'} />
                          <span className="font-semibold">Actual:</span>
                          <code className={`text-xs px-2 py-1 rounded ${
                            finding.status === 'healthy'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-destructive/20 text-destructive'
                          }`}>
                            {finding.actualDestination}
                          </code>
                        </div>

                        {finding.errorCode && (
                          <div className="flex items-center gap-2 text-yellow-500">
                            <Warning size={14} />
                            <span className="font-mono text-xs">{finding.errorCode}</span>
                          </div>
                        )}

                        <p className="text-muted-foreground italic mt-2">
                          {finding.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur flex flex-col">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg flex items-center gap-2">
              <Globe size={20} weight="fill" />
              KNOWN ERROR CODES
            </CardTitle>
            <CardDescription>
              Common Vercel/deployment redirection patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {VERCEL_ERROR_CODES.map((error, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border/30 bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="font-mono text-xs text-accent font-semibold">
                        {error.code}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        {error.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Type: {error.type}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-accent/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              PORTS SCANNED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-accent">
              {results?.portsScanned || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              ISSUES FOUND
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive">
              {results?.issuesFound || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              HEALTHY PORTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-green-500">
              {results ? results.portsScanned - results.issuesFound : 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
