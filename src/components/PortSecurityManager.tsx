import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import QuickPortSetup from '@/components/QuickPortSetup'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  LockKey,
  ShieldCheck,
  ShieldWarning,
  Plus,
  Trash,
  Eye,
  EyeSlash,
  Check,
  X,
  Bell,
  CheckCircle,
  WarningCircle,
  Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface PortConfig {
  id: string
  port: number
  name: string
  description: string
  visibility: 'private' | 'public' | 'organization'
  status: 'active' | 'blocked' | 'pending'
  approvedBy: string
  approvedAt: number
  requiresApproval: boolean
  allowedIPs: string[]
  createdAt: number
  lastModified: number
}

interface PortAccessRequest {
  id: string
  port: number
  requestedBy: string
  requestedAt: number
  reason: string
  status: 'pending' | 'approved' | 'denied'
  ipAddress: string
}

interface SecurityLog {
  id: string
  timestamp: number
  type: 'approved' | 'denied' | 'blocked' | 'modified' | 'created' | 'deleted'
  port: number
  description: string
  performedBy: string
}

export default function PortSecurityManager() {
  const [ports, setPorts] = useKV<PortConfig[]>('secure-ports', [])
  const [accessRequests, setAccessRequests] = useKV<PortAccessRequest[]>('port-access-requests', [])
  const [securityLogs, setSecurityLogs] = useKV<SecurityLog[]>('port-security-logs', [])
  const [masterPassword, setMasterPassword] = useKV<string>('port-master-password', '')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(true)
  const [newPortDialog, setNewPortDialog] = useState(false)
  const [selectedPort, setSelectedPort] = useState<PortConfig | null>(null)
  const [autoBlockThirdParty, setAutoBlockThirdParty] = useKV<boolean>('auto-block-third-party', true)
  const [notifyOnAccess, setNotifyOnAccess] = useKV<boolean>('notify-on-access', true)
  const [user, setUser] = useState<any>(null)
  const [showQuickSetup, setShowQuickSetup] = useState(false)

  const [newPort, setNewPort] = useState<{
    port: number
    name: string
    description: string
    visibility: 'private' | 'public' | 'organization'
    requiresApproval: boolean
    allowedIPs: string[]
  }>({
    port: 0,
    name: '',
    description: '',
    visibility: 'private',
    requiresApproval: true,
    allowedIPs: []
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await window.spark.user()
        setUser(userInfo)
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (!masterPassword) {
      const defaultPassword = `luxe-${Date.now()}-${Math.random().toString(36).substring(7)}`
      setMasterPassword(() => defaultPassword)
      addSecurityLog('created', 0, 'Master password system initialized', 'System')
      toast.success('Security Initialized', {
        description: 'Your master password has been generated. Please save it securely.'
      })
    }
  }, [masterPassword, setMasterPassword])

  const addSecurityLog = (
    type: SecurityLog['type'],
    port: number,
    description: string,
    performedBy: string
  ) => {
    const log: SecurityLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      port,
      description,
      performedBy
    }
    setSecurityLogs((current) => [log, ...(current || [])].slice(0, 100))
  }

  const handleAuthenticate = () => {
    if (passwordInput === masterPassword) {
      setIsAuthenticated(true)
      setShowPasswordDialog(false)
      addSecurityLog('approved', 0, 'Administrator authenticated', user?.login || 'Owner')
      toast.success('Access Granted', { description: 'Welcome to Port Security Manager' })
    } else {
      addSecurityLog('denied', 0, 'Failed authentication attempt', 'Unknown')
      toast.error('Access Denied', { description: 'Incorrect master password' })
    }
  }

  const handleCreatePort = () => {
    if (newPort.port < 1 || newPort.port > 65535) {
      toast.error('Invalid Port', { description: 'Port must be between 1 and 65535' })
      return
    }

    if ((ports || []).some(p => p.port === newPort.port)) {
      toast.error('Port Exists', { description: 'This port is already configured' })
      return
    }

    const portConfig: PortConfig = {
      id: `port-${Date.now()}-${Math.random()}`,
      port: newPort.port,
      name: newPort.name || `Port ${newPort.port}`,
      description: newPort.description,
      visibility: newPort.visibility,
      status: 'active',
      approvedBy: user?.login || 'Owner',
      approvedAt: Date.now(),
      requiresApproval: newPort.requiresApproval,
      allowedIPs: newPort.allowedIPs,
      createdAt: Date.now(),
      lastModified: Date.now()
    }

    setPorts((current) => [...(current || []), portConfig])
    addSecurityLog('created', newPort.port, `Port ${newPort.port} created and secured`, user?.login || 'Owner')
    
    setNewPortDialog(false)
    setNewPort({
      port: 0,
      name: '',
      description: '',
      visibility: 'private',
      requiresApproval: true,
      allowedIPs: []
    })

    toast.success('Port Secured', {
      description: `Port ${newPort.port} is now under your exclusive control`
    })
  }

  const handleQuickSetup = (quickPorts: Array<{
    port: number
    name: string
    description: string
    visibility: 'private' | 'public' | 'organization'
  }>) => {
    const newPorts = quickPorts
      .filter(qp => !(ports || []).some(p => p.port === qp.port))
      .map(qp => ({
        id: `port-${Date.now()}-${Math.random()}`,
        port: qp.port,
        name: qp.name,
        description: qp.description,
        visibility: qp.visibility,
        status: 'active' as const,
        approvedBy: user?.login || 'Owner',
        approvedAt: Date.now(),
        requiresApproval: true,
        allowedIPs: [],
        createdAt: Date.now(),
        lastModified: Date.now()
      }))

    setPorts((current) => [...(current || []), ...newPorts])
    
    newPorts.forEach(port => {
      addSecurityLog('created', port.port, `Port ${port.port} secured via Quick Setup`, user?.login || 'Owner')
    })

    setShowQuickSetup(false)
    
    toast.success('Bulk Port Security Applied', {
      description: `${newPorts.length} ports now secured`
    })
  }

  const handleBlockPort = (port: PortConfig) => {
    setPorts((current) =>
      (current || []).map(p =>
        p.id === port.id
          ? { ...p, status: 'blocked', lastModified: Date.now() }
          : p
      )
    )
    addSecurityLog('blocked', port.port, `Port ${port.port} blocked by owner`, user?.login || 'Owner')
    toast.warning('Port Blocked', { description: `Port ${port.port} is now blocked` })
  }

  const handleUnblockPort = (port: PortConfig) => {
    setPorts((current) =>
      (current || []).map(p =>
        p.id === port.id
          ? { ...p, status: 'active', lastModified: Date.now() }
          : p
      )
    )
    addSecurityLog('approved', port.port, `Port ${port.port} unblocked by owner`, user?.login || 'Owner')
    toast.success('Port Unblocked', { description: `Port ${port.port} is now active` })
  }

  const handleDeletePort = (port: PortConfig) => {
    setPorts((current) => (current || []).filter(p => p.id !== port.id))
    addSecurityLog('deleted', port.port, `Port ${port.port} removed from configuration`, user?.login || 'Owner')
    toast.success('Port Removed', { description: `Port ${port.port} configuration deleted` })
  }

  const handleChangePassword = () => {
    const newPassword = prompt('Enter new master password:')
    if (newPassword && newPassword.length >= 8) {
      setMasterPassword(() => newPassword)
      addSecurityLog('modified', 0, 'Master password changed', user?.login || 'Owner')
      toast.success('Password Updated', { description: 'Your master password has been changed' })
    } else if (newPassword) {
      toast.error('Invalid Password', { description: 'Password must be at least 8 characters' })
    }
  }

  const handleApproveRequest = (request: PortAccessRequest) => {
    setAccessRequests((current) =>
      (current || []).map(r =>
        r.id === request.id ? { ...r, status: 'approved' as const } : r
      )
    )
    addSecurityLog('approved', request.port, `Access request approved for ${request.requestedBy}`, user?.login || 'Owner')
    toast.success('Request Approved', { description: `Access granted to port ${request.port}` })
  }

  const handleDenyRequest = (request: PortAccessRequest) => {
    setAccessRequests((current) =>
      (current || []).map(r =>
        r.id === request.id ? { ...r, status: 'denied' as const } : r
      )
    )
    addSecurityLog('denied', request.port, `Access request denied for ${request.requestedBy}`, user?.login || 'Owner')
    toast.error('Request Denied', { description: `Access denied to port ${request.port}` })
  }

  const getStatusIcon = (status: PortConfig['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} weight="fill" className="text-accent" />
      case 'blocked':
        return <WarningCircle size={20} weight="fill" className="text-destructive" />
      case 'pending':
        return <Info size={20} weight="fill" className="text-muted-foreground" />
    }
  }

  const getLogIcon = (type: SecurityLog['type']) => {
    switch (type) {
      case 'approved':
        return <CheckCircle size={16} weight="fill" className="text-accent" />
      case 'denied':
      case 'blocked':
        return <WarningCircle size={16} weight="fill" className="text-destructive" />
      case 'created':
        return <Plus size={16} weight="bold" className="text-accent" />
      case 'modified':
        return <Info size={16} weight="fill" className="text-muted-foreground" />
      case 'deleted':
        return <Trash size={16} weight="fill" className="text-destructive" />
    }
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="luxury-gradient border-accent/50">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-2xl text-glow flex items-center gap-2">
              <LockKey size={32} weight="fill" className="text-accent" />
              PORT SECURITY ACCESS
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your master password to access port configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-orbitron">Master Password</Label>
              <Input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                placeholder="Enter master password"
                className="font-mono"
              />
            </div>
            <Alert className="border-accent/50 bg-accent/10">
              <ShieldCheck size={16} weight="fill" />
              <AlertTitle className="font-orbitron">Security Notice</AlertTitle>
              <AlertDescription className="text-xs">
                Only the repository owner can access port configurations. All access attempts are logged.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAuthenticate}
              className="luxury-gradient font-orbitron w-full"
            >
              <LockKey size={18} weight="fill" className="mr-2" />
              AUTHENTICATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card/30">
      <div className="luxury-gradient p-6 border-b-2 border-accent/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheck size={48} weight="fill" className="text-accent text-glow" />
            <div>
              <h2 className="font-orbitron text-3xl font-bold text-glow">PORT SECURITY MANAGER</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Exclusive Owner Control - Third Party Protected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-accent/50 text-accent font-mono">
              {user?.login || 'OWNER'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangePassword}
              className="border-accent/50 hover:bg-accent/20 font-orbitron"
            >
              <LockKey size={16} weight="fill" className="mr-2" />
              CHANGE PASSWORD
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-accent/30 console-glow bg-card/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-orbitron text-xl flex items-center gap-2">
                      <ShieldCheck size={24} weight="fill" className="text-accent" />
                      SECURED PORTS
                    </CardTitle>
                    <CardDescription>
                      Ports under your exclusive control - {(ports || []).length} configured
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setNewPortDialog(true)}
                    className="luxury-gradient font-orbitron"
                  >
                    <Plus size={18} weight="bold" className="mr-2" />
                    ADD PORT
                  </Button>
                  <Button
                    onClick={() => setShowQuickSetup(true)}
                    variant="outline"
                    className="border-accent/50 hover:bg-accent/20 font-orbitron ml-2"
                  >
                    <ShieldCheck size={18} weight="fill" className="mr-2" />
                    QUICK SETUP
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {(ports || []).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <ShieldWarning size={48} weight="fill" className="mx-auto mb-4 opacity-50" />
                        <p className="font-orbitron">No ports configured</p>
                        <p className="text-sm">Add ports to secure them under your control</p>
                      </div>
                    ) : (
                      (ports || []).map((port) => (
                        <motion.div
                          key={port.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="border-2 border-border/50 rounded-lg p-4 bg-background/50 hover:border-accent/50 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(port.status)}
                                <span className="font-orbitron text-lg font-bold text-accent">
                                  PORT {port.port}
                                </span>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {port.visibility}
                                </Badge>
                                <Badge
                                  variant={port.status === 'active' ? 'default' : 'destructive'}
                                  className="font-mono text-xs"
                                >
                                  {port.status}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{port.name}</p>
                              <p className="text-xs text-muted-foreground mb-2">{port.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Approved by: {port.approvedBy}</span>
                                <span>•</span>
                                <span>{new Date(port.approvedAt).toLocaleString()}</span>
                              </div>
                              {port.allowedIPs.length > 0 && (
                                <div className="mt-2 text-xs">
                                  <span className="text-muted-foreground">Allowed IPs: </span>
                                  <span className="font-mono text-accent">{port.allowedIPs.join(', ')}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              {port.status === 'active' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBlockPort(port)}
                                  className="border-destructive/50 text-destructive hover:bg-destructive/20"
                                >
                                  <EyeSlash size={14} weight="fill" className="mr-1" />
                                  BLOCK
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnblockPort(port)}
                                  className="border-accent/50 text-accent hover:bg-accent/20"
                                >
                                  <Eye size={14} weight="fill" className="mr-1" />
                                  UNBLOCK
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePort(port)}
                                className="border-destructive/50 text-destructive hover:bg-destructive/20"
                              >
                                <Trash size={14} weight="fill" className="mr-1" />
                                REMOVE
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {(accessRequests || []).filter(r => r.status === 'pending').length > 0 && (
              <Card className="border-2 border-destructive/30 console-glow bg-card/50">
                <CardHeader>
                  <CardTitle className="font-orbitron text-xl flex items-center gap-2">
                    <Bell size={24} weight="fill" className="text-destructive" />
                    PENDING ACCESS REQUESTS
                  </CardTitle>
                  <CardDescription>
                    Third-party access requests requiring your approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(accessRequests || [])
                      .filter(r => r.status === 'pending')
                      .map((request) => (
                        <div
                          key={request.id}
                          className="border-2 border-destructive/30 rounded-lg p-4 bg-destructive/5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-orbitron font-bold text-destructive">
                                PORT {request.port}
                              </p>
                              <p className="text-sm">Requested by: {request.requestedBy}</p>
                              <p className="text-xs text-muted-foreground">IP: {request.ipAddress}</p>
                              <p className="text-xs mt-2">{request.reason}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRequest(request)}
                                className="bg-accent hover:bg-accent/80"
                              >
                                <Check size={14} weight="bold" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDenyRequest(request)}
                              >
                                <X size={14} weight="bold" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="font-orbitron text-lg">SECURITY SETTINGS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-orbitron text-sm">Auto-Block Third Party</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically block unauthorized access
                    </p>
                  </div>
                  <Switch
                    checked={autoBlockThirdParty}
                    onCheckedChange={(checked) => {
                      setAutoBlockThirdParty(() => checked)
                      addSecurityLog('modified', 0, `Auto-block ${checked ? 'enabled' : 'disabled'}`, user?.login || 'Owner')
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-orbitron text-sm">Access Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Notify on all access attempts
                    </p>
                  </div>
                  <Switch
                    checked={notifyOnAccess}
                    onCheckedChange={(checked) => {
                      setNotifyOnAccess(() => checked)
                      addSecurityLog('modified', 0, `Notifications ${checked ? 'enabled' : 'disabled'}`, user?.login || 'Owner')
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="font-orbitron text-lg">SECURITY LOG</CardTitle>
                <CardDescription>Recent security events</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {(securityLogs || []).length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        No security events
                      </p>
                    ) : (
                      (securityLogs || []).map((log) => (
                        <div
                          key={log.id}
                          className="border border-border/30 rounded p-3 text-xs bg-background/30"
                        >
                          <div className="flex items-start gap-2">
                            {getLogIcon(log.type)}
                            <div className="flex-1">
                              <p className="font-medium">{log.description}</p>
                              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                <span>{log.performedBy}</span>
                                <span>•</span>
                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={newPortDialog} onOpenChange={setNewPortDialog}>
        <DialogContent className="luxury-gradient border-accent/50">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl">ADD SECURE PORT</DialogTitle>
            <DialogDescription>
              Configure a new port under your exclusive control
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="port-number" className="font-orbitron">Port Number</Label>
              <Input
                id="port-number"
                type="number"
                min="1"
                max="65535"
                value={newPort.port || ''}
                onChange={(e) => setNewPort({ ...newPort, port: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 3000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port-name" className="font-orbitron">Name</Label>
              <Input
                id="port-name"
                value={newPort.name}
                onChange={(e) => setNewPort({ ...newPort, name: e.target.value })}
                placeholder="e.g., Development Server"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port-description" className="font-orbitron">Description</Label>
              <Input
                id="port-description"
                value={newPort.description}
                onChange={(e) => setNewPort({ ...newPort, description: e.target.value })}
                placeholder="Purpose of this port"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-orbitron">Visibility</Label>
              <div className="flex gap-2">
                {(['private', 'public', 'organization'] as const).map((vis) => (
                  <Button
                    key={vis}
                    size="sm"
                    variant={newPort.visibility === vis ? 'default' : 'outline'}
                    onClick={() => setNewPort({ ...newPort, visibility: vis as 'private' | 'public' | 'organization' })}
                    className="flex-1"
                  >
                    {vis.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="requires-approval" className="font-orbitron">Requires Approval</Label>
              <Switch
                id="requires-approval"
                checked={newPort.requiresApproval}
                onCheckedChange={(checked) => setNewPort({ ...newPort, requiresApproval: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewPortDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePort} className="luxury-gradient font-orbitron">
              <ShieldCheck size={16} weight="fill" className="mr-2" />
              SECURE PORT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuickSetup} onOpenChange={setShowQuickSetup}>
        <DialogContent className="luxury-gradient border-accent/50 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl">QUICK PORT SETUP</DialogTitle>
            <DialogDescription>
              Secure multiple common ports at once
            </DialogDescription>
          </DialogHeader>
          <QuickPortSetup onPortsSelected={handleQuickSetup} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

