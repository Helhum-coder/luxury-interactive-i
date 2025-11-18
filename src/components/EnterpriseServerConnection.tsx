import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  HardDrives, 
  CheckCircle, 
  XCircle, 
  Lightning, 
  Lock,
  ArrowLeft,
  CloudArrowUp,
  Database,
  Shield,
  Timer,
  Warning,
  Key,
  Clock
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ConnectionConfig {
  serverUrl: string
  port: string
  protocol: 'http' | 'https'
  apiEndpoint: string
  authMethod: 'basic' | 'token' | 'oauth' | 'certificate'
  username?: string
  password?: string
  apiToken?: string
  timeout: number
  retryAttempts: number
  useProxy: boolean
  proxyUrl?: string
  enableSSL: boolean
  sslCertificate?: string
}

interface ConnectionStatus {
  connected: boolean
  lastChecked?: number
  responseTime?: number
  serverVersion?: string
  error?: string
}

interface EnterpriseServerConnectionProps {
  onClose: () => void
}

export function EnterpriseServerConnection({ onClose }: EnterpriseServerConnectionProps) {
  const [config, setConfig] = useKV<ConnectionConfig>('enterprise-server-config', {
    serverUrl: '',
    port: '443',
    protocol: 'https',
    apiEndpoint: '/api/v1',
    authMethod: 'token',
    timeout: 30000,
    retryAttempts: 3,
    useProxy: false,
    enableSSL: true
  })

  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false
  })

  const [testing, setTesting] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState('connection')

  const testConnection = async () => {
    if (!config || !config.serverUrl) {
      toast.error('Please enter a server URL')
      return
    }

    setTesting(true)
    const startTime = Date.now()

    try {
      const fullUrl = `${config.protocol}://${config.serverUrl}:${config.port}${config.apiEndpoint}/health`
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (config.authMethod === 'token' && config.apiToken) {
        headers['Authorization'] = `Bearer ${config.apiToken}`
      } else if (config.authMethod === 'basic' && config.username && config.password) {
        const credentials = btoa(`${config.username}:${config.password}`)
        headers['Authorization'] = `Basic ${credentials}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout)

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (response.ok) {
        const data = await response.json()
        setStatus({
          connected: true,
          lastChecked: Date.now(),
          responseTime,
          serverVersion: data.version || 'Unknown',
          error: undefined
        })
        toast.success(`Connected successfully! Response time: ${responseTime}ms`)
      } else {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setStatus({
        connected: false,
        lastChecked: Date.now(),
        error: errorMessage
      })
      toast.error(`Connection failed: ${errorMessage}`)
    } finally {
      setTesting(false)
    }
  }

  const connect = async () => {
    setConnecting(true)
    await testConnection()
    setConnecting(false)
  }

  const disconnect = () => {
    setStatus({
      connected: false,
      lastChecked: Date.now()
    })
    toast.info('Disconnected from enterprise server')
  }

  const updateConfig = (updates: Partial<ConnectionConfig>) => {
    setConfig((current) => {
      const base: ConnectionConfig = current || {
        serverUrl: '',
        port: '443',
        protocol: 'https',
        apiEndpoint: '/api/v1',
        authMethod: 'token',
        timeout: 30000,
        retryAttempts: 3,
        useProxy: false,
        enableSSL: true
      }
      return { ...base, ...updates }
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (status.connected) {
        testConnection()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [status.connected])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl">
                <HardDrives size={32} weight="duotone" className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Enterprise Server Connection</h1>
                <p className="text-muted-foreground mt-1">
                  Configure and manage your enterprise server connections
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {status.connected ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20 gap-2">
                    <CheckCircle size={16} weight="fill" />
                    Connected
                  </Badge>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge variant="secondary" className="gap-2">
                    <XCircle size={16} weight="fill" />
                    Disconnected
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {status.lastChecked && (
          <Alert className="mb-6">
            <Clock size={16} />
            <AlertDescription>
              Last checked: {new Date(status.lastChecked).toLocaleString()}
              {status.responseTime && ` • Response time: ${status.responseTime}ms`}
              {status.serverVersion && ` • Server version: ${status.serverVersion}`}
            </AlertDescription>
          </Alert>
        )}

        {status.error && (
          <Alert variant="destructive" className="mb-6">
            <Warning size={16} />
            <AlertDescription>
              {status.error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrives size={20} />
                  Server Configuration
                </CardTitle>
                <CardDescription>
                  Configure your enterprise server connection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protocol">Protocol</Label>
                    <Select
                      value={config?.protocol || 'https'}
                      onValueChange={(value: 'http' | 'https') => updateConfig({ protocol: value })}
                    >
                      <SelectTrigger id="protocol">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="https">HTTPS (Secure)</SelectItem>
                        <SelectItem value="http">HTTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={config?.port || '443'}
                      onChange={(e) => updateConfig({ port: e.target.value })}
                      placeholder="443"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverUrl">Server URL</Label>
                  <Input
                    id="serverUrl"
                    value={config?.serverUrl || ''}
                    onChange={(e) => updateConfig({ serverUrl: e.target.value })}
                    placeholder="enterprise.company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <Input
                    id="apiEndpoint"
                    value={config?.apiEndpoint || '/api/v1'}
                    onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
                    placeholder="/api/v1"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Enable SSL Certificate Validation</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify SSL certificates for secure connections
                    </p>
                  </div>
                  <Switch
                    checked={config?.enableSSL ?? true}
                    onCheckedChange={(checked) => updateConfig({ enableSSL: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={20} />
                  Authentication Settings
                </CardTitle>
                <CardDescription>
                  Configure authentication method and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="authMethod">Authentication Method</Label>
                  <Select
                    value={config?.authMethod || 'token'}
                    onValueChange={(value: any) => updateConfig({ authMethod: value })}
                  >
                    <SelectTrigger id="authMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="token">API Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="certificate">Client Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config?.authMethod === 'token' && (
                  <div className="space-y-2">
                    <Label htmlFor="apiToken">API Token</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        id="apiToken"
                        type="password"
                        value={config?.apiToken || ''}
                        onChange={(e) => updateConfig({ apiToken: e.target.value })}
                        placeholder="Enter your API token"
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                {config?.authMethod === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={config?.username || ''}
                        onChange={(e) => updateConfig({ username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={config?.password || ''}
                        onChange={(e) => updateConfig({ password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                )}

                {config?.authMethod === 'certificate' && (
                  <div className="space-y-2">
                    <Label htmlFor="certificate">SSL Certificate</Label>
                    <textarea
                      id="certificate"
                      className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background font-mono text-sm"
                      value={config?.sslCertificate || ''}
                      onChange={(e) => updateConfig({ sslCertificate: e.target.value })}
                      placeholder="Paste your certificate here (PEM format)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  Advanced Configuration
                </CardTitle>
                <CardDescription>
                  Fine-tune connection parameters and proxy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Connection Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={config?.timeout || 30000}
                      onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) })}
                      placeholder="30000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retryAttempts">Retry Attempts</Label>
                    <Input
                      id="retryAttempts"
                      type="number"
                      value={config?.retryAttempts || 3}
                      onChange={(e) => updateConfig({ retryAttempts: parseInt(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Use Proxy Server</Label>
                    <p className="text-sm text-muted-foreground">
                      Route connections through a proxy
                    </p>
                  </div>
                  <Switch
                    checked={config?.useProxy ?? false}
                    onCheckedChange={(checked) => updateConfig({ useProxy: checked })}
                  />
                </div>

                {config?.useProxy && (
                  <div className="space-y-2">
                    <Label htmlFor="proxyUrl">Proxy URL</Label>
                    <Input
                      id="proxyUrl"
                      value={config?.proxyUrl || ''}
                      onChange={(e) => updateConfig({ proxyUrl: e.target.value })}
                      placeholder="http://proxy.company.com:8080"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer size={20} />
                  Connection Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time connection status and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      {status.connected ? (
                        <>
                          <CheckCircle size={20} weight="fill" className="text-green-600" />
                          <span className="font-semibold text-green-700">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} weight="fill" className="text-muted-foreground" />
                          <span className="font-semibold">Disconnected</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Response Time</div>
                    <div className="font-semibold text-lg">
                      {status.responseTime ? `${status.responseTime}ms` : '—'}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Server Version</div>
                    <div className="font-semibold text-lg">
                      {status.serverVersion || '—'}
                    </div>
                  </div>
                </div>

                {status.lastChecked && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Last Health Check</div>
                    <div className="font-semibold">
                      {new Date(status.lastChecked).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {status.connected 
                    ? 'Your enterprise server is connected and operational'
                    : 'Configure your settings and test the connection'
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={testing || !config?.serverUrl}
                >
                  <Lightning size={16} />
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
                
                {status.connected ? (
                  <Button
                    variant="destructive"
                    onClick={disconnect}
                  >
                    <Database size={16} />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={connect}
                    disabled={connecting || !config?.serverUrl}
                  >
                    <CloudArrowUp size={16} />
                    {connecting ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
