import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  GlobeHemisphereWest, 
  ShieldCheck, 
  Warning, 
  CheckCircle,
  XCircle,
  ArrowClockwise,
  Code,
  DownloadSimple,
  Bell,
  BellSlash,
  Wrench,
  Lightning,
  Copy,
  Check
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface QuickFix {
  id: string
  title: string
  description: string
  action: () => void | Promise<void>
  icon?: React.ReactNode
}

interface NetworkCheck {
  name: string
  status: 'checking' | 'success' | 'warning' | 'error'
  message: string
  details?: string
  timestamp: string
  quickFixes?: QuickFix[]
}

interface PortInfo {
  port: number
  status: 'open' | 'blocked' | 'redirected' | 'unknown'
  expectedDestination: string
  actualDestination?: string
  secure: boolean
}

export function NetworkDiagnosticPanel() {
  const [checks, setChecks] = useState<NetworkCheck[]>([])
  const [ports, setPorts] = useState<PortInfo[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [autoMonitor, setAutoMonitor] = useKV<boolean>('network-auto-monitor', false)
  const [notificationsEnabled, setNotificationsEnabled] = useKV<boolean>('network-notifications', true)
  const [lastScanResults, setLastScanResults] = useState<{ successCount: number; errorCount: number } | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      toast.success(`${label} copied to clipboard`)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const clearBrowserCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        toast.success('Browser cache cleared successfully')
        setTimeout(() => runDiagnostics(false), 1000)
      } else {
        toast.info('Please manually clear your browser cache', {
          description: 'Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)'
        })
      }
    } catch (error) {
      toast.error('Failed to clear cache')
    }
  }

  const reloadPage = () => {
    toast.info('Reloading page...')
    setTimeout(() => window.location.reload(), 500)
  }

  const openNetworkSettings = () => {
    toast.info('Opening browser network settings', {
      description: 'Check your DevTools Network tab'
    })
    window.open('about:blank', '_blank')
  }

  const testAlternativeEndpoint = async () => {
    try {
      toast.info('Testing alternative endpoints...')
      const endpoints = [
        'https://httpbin.org/get',
        'https://jsonplaceholder.typicode.com/posts/1',
        'https://api.ipify.org?format=json'
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          if (response.ok) {
            toast.success(`Successfully connected to ${endpoint}`)
            return
          }
        } catch {
          continue
        }
      }
      toast.warning('All alternative endpoints failed')
    } catch (error) {
      toast.error('Test failed')
    }
  }

  const generateQuickFixes = (check: NetworkCheck): QuickFix[] => {
    const fixes: QuickFix[] = []

    if (check.status === 'error' || check.status === 'warning') {
      if (check.name.includes('GitHub API')) {
        fixes.push({
          id: 'test-alt-endpoint',
          title: 'Test Alternative Endpoint',
          description: 'Try connecting to alternative test APIs',
          action: testAlternativeEndpoint,
          icon: <Lightning size={16} />
        })
        fixes.push({
          id: 'clear-cache',
          title: 'Clear Browser Cache',
          description: 'Clear cached data that might be causing issues',
          action: clearBrowserCache,
          icon: <ArrowClockwise size={16} />
        })
        fixes.push({
          id: 'copy-error',
          title: 'Copy Error Details',
          description: 'Copy error information for support',
          action: () => copyToClipboard(check.details || check.message, 'Error details'),
          icon: <Copy size={16} />
        })
      }

      if (check.name.includes('Browser Status') || check.name.includes('Local Server')) {
        fixes.push({
          id: 'reload-page',
          title: 'Reload Page',
          description: 'Refresh the page to re-establish connection',
          action: reloadPage,
          icon: <ArrowClockwise size={16} />
        })
        fixes.push({
          id: 'check-network',
          title: 'Check Network Settings',
          description: 'Open browser DevTools to inspect network',
          action: openNetworkSettings,
          icon: <Code size={16} />
        })
      }

      if (check.name.includes('DNS')) {
        fixes.push({
          id: 'flush-dns',
          title: 'Flush DNS Cache',
          description: 'Instructions to flush your DNS cache',
          action: () => {
            toast.info('DNS Flush Instructions', {
              description: 'Windows: ipconfig /flushdns | Mac: sudo dscacheutil -flushcache | Linux: sudo systemd-resolve --flush-caches'
            })
          },
          icon: <Code size={16} />
        })
      }
    }

    return fixes
  }

  const runDiagnostics = useCallback(async (silent = false) => {
    setIsScanning(true)
    const newChecks: NetworkCheck[] = []

    const addCheck = (name: string, status: NetworkCheck['status'], message: string, details?: string) => {
      const check: NetworkCheck = {
        name,
        status,
        message,
        details,
        timestamp: new Date().toISOString()
      }
      
      if (status === 'error' || status === 'warning') {
        check.quickFixes = generateQuickFixes(check)
      }
      
      newChecks.push(check)
      setChecks([...newChecks])
    }

    addCheck('DNS Resolution', 'checking', 'Checking DNS configuration...', '')

    try {
      const response = await fetch('https://api.github.com/octocat')
      if (response.ok) {
        addCheck('GitHub API', 'success', 'GitHub API is accessible', `Status: ${response.status}`)
      } else {
        addCheck('GitHub API', 'warning', 'GitHub API returned non-200 status', `Status: ${response.status}`)
      }
    } catch (error) {
      addCheck('GitHub API', 'error', 'Cannot reach GitHub API', error instanceof Error ? error.message : 'Unknown error')
    }

    try {
      const response = await fetch(window.location.origin)
      addCheck('Local Server', 'success', 'Local development server is responding', `Origin: ${window.location.origin}`)
    } catch (error) {
      addCheck('Local Server', 'error', 'Local server check failed', error instanceof Error ? error.message : 'Unknown error')
    }

    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const language = navigator.language
    const online = navigator.onLine
    
    setSystemInfo({
      userAgent,
      platform,
      language,
      online,
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port || '(default)'
    })

    addCheck('Browser Status', online ? 'success' : 'error', 
      online ? 'Browser is online' : 'Browser is offline',
      `Platform: ${platform}`)

    const commonPorts = [
      { port: 3000, name: 'React Dev Server', expectedDest: 'localhost:3000' },
      { port: 5000, name: 'Vite Preview', expectedDest: 'localhost:5000' },
      { port: 4173, name: 'Vite Build Preview', expectedDest: 'localhost:4173' },
      { port: 8080, name: 'Alternative HTTP', expectedDest: 'localhost:8080' },
      { port: 9000, name: 'Custom Port', expectedDest: 'localhost:9000' }
    ]

    const portResults: PortInfo[] = []
    for (const { port, expectedDest } of commonPorts) {
      try {
        const testUrl = `${window.location.protocol}//${window.location.hostname}:${port}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        
        try {
          const response = await fetch(testUrl, { 
            signal: controller.signal,
            mode: 'no-cors'
          })
          clearTimeout(timeoutId)
          
          portResults.push({
            port,
            status: 'open',
            expectedDestination: expectedDest,
            actualDestination: testUrl,
            secure: testUrl.startsWith('https')
          })
        } catch (fetchError) {
          clearTimeout(timeoutId)
          portResults.push({
            port,
            status: 'unknown',
            expectedDestination: expectedDest,
            secure: false
          })
        }
      } catch (error) {
        portResults.push({
          port,
          status: 'blocked',
          expectedDestination: expectedDest,
          secure: false
        })
      }
    }

    setPorts(portResults)
    addCheck('Port Scan Complete', 'success', `Scanned ${commonPorts.length} ports`, '')

    const successCount = newChecks.filter(c => c.status === 'success').length
    const errorCount = newChecks.filter(c => c.status === 'error').length
    const warningCount = newChecks.filter(c => c.status === 'warning').length

    setLastScanResults({ successCount, errorCount })

    if (!silent && notificationsEnabled) {
      if (errorCount > 0) {
        toast.error(`Network scan found ${errorCount} error(s)`, {
          description: 'Check the diagnostics panel for details'
        })
      } else if (warningCount > 0) {
        toast.warning(`Network scan found ${warningCount} warning(s)`)
      } else {
        toast.success('All network checks passed successfully')
      }
    }

    setIsScanning(false)
  }, [notificationsEnabled])

  useEffect(() => {
    runDiagnostics(true)
  }, [])

  useEffect(() => {
    if (autoMonitor) {
      const interval = setInterval(() => {
        runDiagnostics(true)
      }, 60000)

      toast.info('Auto-monitoring enabled', {
        description: 'Network will be checked every minute'
      })

      return () => clearInterval(interval)
    }
  }, [autoMonitor, runDiagnostics])

  const exportDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      checks,
      ports,
      systemInfo,
      summary: lastScanResults
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `network-diagnostics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Diagnostics exported successfully')
  }

  const getStatusIcon = (status: NetworkCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle weight="fill" className="text-green-500" size={20} />
      case 'warning':
        return <Warning weight="fill" className="text-amber-500" size={20} />
      case 'error':
        return <XCircle weight="fill" className="text-red-500" size={20} />
      default:
        return <ArrowClockwise className="animate-spin text-blue-500" size={20} />
    }
  }

  const getPortStatusColor = (status: PortInfo['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-500'
      case 'blocked':
        return 'bg-red-500'
      case 'redirected':
        return 'bg-amber-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GlobeHemisphereWest size={32} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Network Diagnostics</h2>
            <p className="text-muted-foreground">Monitor connections, ports, and security</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDiagnostics} disabled={checks.length === 0}>
            <DownloadSimple size={16} />
            Export Report
          </Button>
          <Button onClick={() => runDiagnostics(false)} disabled={isScanning}>
            <ArrowClockwise className={isScanning ? 'animate-spin' : ''} size={16} />
            {isScanning ? 'Scanning...' : 'Refresh Scan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowClockwise size={24} className="text-primary" />
                <div>
                  <Label htmlFor="auto-monitor" className="text-base font-semibold">
                    Auto-Monitor
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Scan every minute
                  </p>
                </div>
              </div>
              <Switch
                id="auto-monitor"
                checked={autoMonitor}
                onCheckedChange={(checked) => setAutoMonitor(checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notificationsEnabled ? (
                  <Bell size={24} className="text-primary" />
                ) : (
                  <BellSlash size={24} className="text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="notifications" className="text-base font-semibold">
                    Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Alert on issues
                  </p>
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={(checked) => setNotificationsEnabled(checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {lastScanResults && (
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{lastScanResults.successCount}</p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{lastScanResults.errorCount}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Last scan</p>
                <p className="text-sm font-semibold">
                  {checks.length > 0 ? new Date(checks[checks.length - 1].timestamp).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="checks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">Connection Checks</TabsTrigger>
          <TabsTrigger value="ports">Port Status</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Connection Tests</CardTitle>
              <CardDescription>
                Real-time checks of your network connectivity and API access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {checks.map((check, index) => (
                    <motion.div
                      key={`${check.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Alert className="relative">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(check.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold">{check.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {new Date(check.timestamp).toLocaleTimeString()}
                              </Badge>
                            </div>
                            <AlertDescription>
                              <p className="mb-1">{check.message}</p>
                              {check.details && (
                                <code className="text-xs bg-muted px-2 py-1 rounded block mt-2">
                                  {check.details}
                                </code>
                              )}
                              {check.quickFixes && check.quickFixes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Wrench size={16} className="text-primary" />
                                    <span className="text-sm font-semibold text-foreground">
                                      Quick Fixes
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {check.quickFixes.map((fix) => (
                                      <Button
                                        key={fix.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={fix.action}
                                        className="w-full justify-start text-left h-auto py-3"
                                      >
                                        <div className="flex items-start gap-3 w-full">
                                          {fix.icon && (
                                            <div className="mt-0.5 text-primary">
                                              {fix.icon}
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm">
                                              {fix.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                              {fix.description}
                                            </div>
                                          </div>
                                          {copiedText === fix.title && (
                                            <Check size={16} className="text-green-500 flex-shrink-0" />
                                          )}
                                        </div>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck size={24} weight="duotone" className="text-primary" />
                Port Security Status
              </CardTitle>
              <CardDescription>
                Monitor which ports are accessible and verify no unauthorized redirections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ports.map((portInfo) => (
                  <Card key={portInfo.port}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getPortStatusColor(portInfo.status)}`} />
                          <div>
                            <p className="font-semibold text-lg">Port {portInfo.port}</p>
                            <p className="text-sm text-muted-foreground">
                              Expected: {portInfo.expectedDestination}
                            </p>
                            {portInfo.actualDestination && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Actual: {portInfo.actualDestination}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={portInfo.status === 'open' ? 'default' : 'destructive'}>
                            {portInfo.status.toUpperCase()}
                          </Badge>
                          {portInfo.secure && (
                            <Badge variant="outline" className="gap-1">
                              <ShieldCheck size={14} />
                              Secure
                            </Badge>
                          )}
                        </div>
                      </div>
                      {portInfo.status === 'redirected' && (
                        <Alert className="mt-4">
                          <Warning size={16} />
                          <AlertDescription>
                            This port may be redirected to an unexpected destination. 
                            Verify this is intentional.
                          </AlertDescription>
                        </Alert>
                      )}
                      {portInfo.status === 'blocked' && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <Wrench size={16} className="text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              Quick Fixes
                            </span>
                          </div>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                copyToClipboard(
                                  `Check if port ${portInfo.port} is in use:\n\nWindows: netstat -ano | findstr :${portInfo.port}\nMac/Linux: lsof -i :${portInfo.port}`,
                                  'Port check command'
                                )
                              }}
                              className="w-full justify-start text-left h-auto py-3"
                            >
                              <div className="flex items-start gap-3 w-full">
                                <Copy size={16} className="mt-0.5 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm">
                                    Copy Port Check Command
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Check if port {portInfo.port} is already in use
                                  </div>
                                </div>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast.info('Firewall Check', {
                                  description: `Verify port ${portInfo.port} is allowed in your firewall settings`
                                })
                              }}
                              className="w-full justify-start text-left h-auto py-3"
                            >
                              <div className="flex items-start gap-3 w-full">
                                <ShieldCheck size={16} className="mt-0.5 text-primary" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm">
                                    Check Firewall Settings
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    Ensure port {portInfo.port} is not blocked by firewall
                                  </div>
                                </div>
                              </div>
                            </Button>
                          </div>
                        </div>
                      )}
                      {portInfo.status === 'unknown' && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              toast.info(`Retrying port ${portInfo.port}...`)
                              await runDiagnostics(false)
                            }}
                            className="w-full justify-start text-left h-auto py-3"
                          >
                            <div className="flex items-start gap-3 w-full">
                              <ArrowClockwise size={16} className="mt-0.5 text-primary" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm">
                                  Retry Connection
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Test port {portInfo.port} again
                                </div>
                              </div>
                            </div>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={24} weight="duotone" className="text-primary" />
                System Information
              </CardTitle>
              <CardDescription>
                Current environment and browser details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemInfo ? (
                <div className="space-y-4">
                  {Object.entries(systemInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1 pb-3 border-b last:border-0">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-mono text-sm break-all">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No system information available</p>
              )}
            </CardContent>
          </Card>

          <Alert>
            <ShieldCheck size={16} />
            <AlertDescription>
              <strong>Security Recommendation:</strong> Review the port status regularly to ensure
              no unauthorized redirections are occurring. All connections should point to your
              intended destinations only.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
