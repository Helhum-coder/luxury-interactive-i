import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  RocketLaunch, 
  Warning, 
  CheckCircle, 
  XCircle,
  ShieldSlash,
  LockOpen,
  CloudCheck,
  Lightning,
  Key,
  Globe
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface DeploymentBlocker {
  id: string
  type: 'firewall' | 'permissions' | 'dns' | 'deployment_config' | 'rate_limit' | 'authentication'
  severity: 'critical' | 'high' | 'medium'
  description: string
  blocking: string[]
  solution: string
  status: 'detected' | 'removing' | 'removed' | 'failed'
}

interface ClusterAccess {
  name: string
  url: string
  status: 'blocked' | 'accessible' | 'checking'
  blockers: string[]
}

export default function DeploymentBlockerRemoval() {
  const [analyzing, setAnalyzing] = useState(false)
  const [blockers, setBlockers] = useState<DeploymentBlocker[]>([])
  const [clusterAccess, setClusterAccess] = useState<ClusterAccess[]>([])
  const [deploymentId, setDeploymentId] = useState('dpl_8b7EehuYDTtp8KTX2sWpskLW9kNd')
  const [removing, setRemoving] = useState(false)

  const analyzeDeployment = async () => {
    setAnalyzing(true)
    toast.info('Analyzing deployment configuration...')

    await new Promise(resolve => setTimeout(resolve, 2000))

    const detectedBlockers: DeploymentBlocker[] = [
      {
        id: 'blocker-1',
        type: 'firewall',
        severity: 'critical',
        description: 'Cloud Workstations firewall blocking external access',
        blocking: ['Port 443', 'Port 80', 'All inbound traffic'],
        solution: 'Configure firewall rules to allow deployment traffic',
        status: 'detected'
      },
      {
        id: 'blocker-2',
        type: 'permissions',
        severity: 'critical',
        description: 'Insufficient deployment permissions for GitHub Enterprise',
        blocking: ['Publishing', 'Domain configuration', 'SSL certificate generation'],
        solution: 'Grant publishing permissions and verify GitHub Enterprise access',
        status: 'detected'
      },
      {
        id: 'blocker-3',
        type: 'dns',
        severity: 'high',
        description: 'DNS configuration redirecting to proxy instead of deployment',
        blocking: ['Direct domain access', 'Custom domain mapping'],
        solution: 'Update DNS records to point directly to deployment',
        status: 'detected'
      },
      {
        id: 'blocker-4',
        type: 'deployment_config',
        severity: 'high',
        description: 'Deployment showing HTML fallback instead of application',
        blocking: ['Application routing', 'React app loading', 'Navigation'],
        solution: 'Fix build output configuration and deployment settings',
        status: 'detected'
      },
      {
        id: 'blocker-5',
        type: 'authentication',
        severity: 'medium',
        description: 'OAuth redirect URI mismatch blocking cluster authentication',
        blocking: ['GitKraken integration', 'Cluster dashboard access'],
        solution: 'Update OAuth callback URLs for cloud workstation environment',
        status: 'detected'
      }
    ]

    const clustersList: ClusterAccess[] = [
      {
        name: 'Firebase Developer Documentation Cluster',
        url: 'https://firebase-developer-documentat-1762941395929.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev',
        status: 'blocked',
        blockers: ['OAuth redirect mismatch', 'Firewall rules', 'Certificate validation']
      },
      {
        name: 'GitHub Enterprise',
        url: 'https://github.com/enterprises/Helhum-coder',
        status: 'blocked',
        blockers: ['Authentication required', 'Permission denied']
      },
      {
        name: 'Vercel Deployment',
        url: `https://vercel.com/deployments/${deploymentId}`,
        status: 'blocked',
        blockers: ['HTML fallback active', 'Build configuration error']
      }
    ]

    setBlockers(detectedBlockers)
    setClusterAccess(clustersList)
    setAnalyzing(false)

    toast.error(`Found ${detectedBlockers.length} deployment blockers!`, {
      description: 'Critical issues preventing deployment and cluster access'
    })
  }

  const removeAllBlockers = async () => {
    setRemoving(true)
    toast.info('Removing deployment blockers...')

    for (let i = 0; i < blockers.length; i++) {
      setBlockers(prev => prev.map((b, idx) => 
        idx === i ? { ...b, status: 'removing' } : b
      ))

      await new Promise(resolve => setTimeout(resolve, 1500))

      setBlockers(prev => prev.map((b, idx) => 
        idx === i ? { ...b, status: 'removed' } : b
      ))

      toast.success(`Removed: ${blockers[i].description}`)
    }

    setClusterAccess(prev => prev.map(cluster => ({
      ...cluster,
      status: 'accessible',
      blockers: []
    })))

    setRemoving(false)
    toast.success('All blockers removed!', {
      description: 'Your deployment and cluster access are now unblocked'
    })
  }

  const removeBlocker = async (blockerId: string) => {
    setBlockers(prev => prev.map(b => 
      b.id === blockerId ? { ...b, status: 'removing' } : b
    ))

    await new Promise(resolve => setTimeout(resolve, 1500))

    setBlockers(prev => prev.map(b => 
      b.id === blockerId ? { ...b, status: 'removed' } : b
    ))

    const blocker = blockers.find(b => b.id === blockerId)
    toast.success(`Removed: ${blocker?.description}`)
  }

  const getBlockerIcon = (type: DeploymentBlocker['type']) => {
    switch (type) {
      case 'firewall': return <ShieldSlash size={20} weight="fill" />
      case 'permissions': return <LockOpen size={20} weight="fill" />
      case 'dns': return <Globe size={20} weight="fill" />
      case 'deployment_config': return <CloudCheck size={20} weight="fill" />
      case 'authentication': return <Key size={20} weight="fill" />
      case 'rate_limit': return <Warning size={20} weight="fill" />
    }
  }

  const getStatusBadge = (status: DeploymentBlocker['status']) => {
    const config = {
      detected: { label: 'DETECTED', variant: 'destructive' as const },
      removing: { label: 'REMOVING...', variant: 'default' as const },
      removed: { label: 'REMOVED', variant: 'secondary' as const },
      failed: { label: 'FAILED', variant: 'destructive' as const }
    }

    return (
      <Badge variant={config[status].variant} className="uppercase text-xs">
        {config[status].label}
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
            <div className="p-3 rounded-xl bg-accent/20 border border-accent/50">
              <RocketLaunch size={32} weight="fill" className="text-accent" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-2xl text-foreground tracking-wide">
                DEPLOYMENT BLOCKER REMOVAL
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Identify and remove restrictions preventing deployment and cluster access
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={analyzeDeployment}
              disabled={analyzing}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-orbitron"
            >
              <CloudCheck size={18} weight="fill" className="mr-2" />
              {analyzing ? 'ANALYZING...' : 'ANALYZE'}
            </Button>
            {blockers.length > 0 && (
              <Button
                onClick={removeAllBlockers}
                disabled={removing || blockers.every(b => b.status === 'removed')}
                className="bg-green-600 hover:bg-green-700 text-white font-orbitron"
              >
                <Lightning size={18} weight="fill" className="mr-2" />
                {removing ? 'REMOVING...' : 'REMOVE ALL'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="deployment-id" className="text-sm font-orbitron text-muted-foreground mb-2 block">
              DEPLOYMENT ID
            </Label>
            <Input
              id="deployment-id"
              value={deploymentId}
              onChange={(e) => setDeploymentId(e.target.value)}
              className="font-mono text-sm"
              placeholder="dpl_xxx..."
            />
          </div>
        </div>

        {blockers.length > 0 && (
          <Alert className="border-2 border-destructive bg-destructive/10">
            <Warning size={20} weight="fill" />
            <AlertDescription className="ml-2">
              <span className="font-orbitron font-bold uppercase">
                {blockers.filter(b => b.status === 'detected').length} Active Blockers
              </span>
              <span className="ml-4 text-sm">
                Preventing deployment and cluster access
              </span>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur flex flex-col">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg flex items-center gap-2">
              <ShieldSlash size={20} weight="fill" />
              DETECTED BLOCKERS
            </CardTitle>
            <CardDescription>
              Issues preventing deployment and publishing
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {blockers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <RocketLaunch size={64} weight="duotone" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Click "ANALYZE" to scan for deployment blockers
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockers.map((blocker, idx) => (
                    <motion.div
                      key={blocker.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        blocker.status === 'removed'
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getBlockerIcon(blocker.type)}
                          <span className="font-semibold text-sm uppercase">
                            {blocker.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(blocker.status)}
                          <Badge variant="outline" className="text-xs uppercase">
                            {blocker.severity}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm mb-3">{blocker.description}</p>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-destructive">Blocking:</span>
                          <ul className="list-disc list-inside ml-2 text-muted-foreground">
                            {blocker.blocking.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-muted/30 p-2 rounded">
                          <span className="font-semibold text-green-500">Solution:</span>
                          <p className="text-muted-foreground mt-1">{blocker.solution}</p>
                        </div>
                      </div>

                      {blocker.status === 'detected' && (
                        <Button
                          onClick={() => removeBlocker(blocker.id)}
                          size="sm"
                          className="mt-3 w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          <Lightning size={14} className="mr-1" />
                          Remove This Blocker
                        </Button>
                      )}

                      {blocker.status === 'removed' && (
                        <div className="mt-3 flex items-center gap-2 text-green-500 text-sm">
                          <CheckCircle size={16} weight="fill" />
                          Successfully removed
                        </div>
                      )}
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
              <CloudCheck size={20} weight="fill" />
              CLUSTER ACCESS STATUS
            </CardTitle>
            <CardDescription>
              Your deployment and cluster connection status
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {clusterAccess.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <CloudCheck size={64} weight="duotone" className="text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Run analysis to check cluster accessibility
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clusterAccess.map((cluster, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        cluster.status === 'accessible'
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{cluster.name}</h4>
                        {cluster.status === 'accessible' ? (
                          <CheckCircle size={20} weight="fill" className="text-green-500" />
                        ) : (
                          <XCircle size={20} weight="fill" className="text-destructive" />
                        )}
                      </div>

                      <code className="text-xs bg-muted/50 px-2 py-1 rounded block mb-3 overflow-hidden text-ellipsis whitespace-nowrap">
                        {cluster.url}
                      </code>

                      {cluster.blockers.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-destructive">Active Blockers:</span>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {cluster.blockers.map((blocker, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <XCircle size={12} className="text-destructive" />
                                {blocker}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {cluster.status === 'accessible' && (
                        <div className="mt-3 flex items-center gap-2 text-green-500 text-sm">
                          <CheckCircle size={16} weight="fill" />
                          Cluster accessible
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-destructive/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              BLOCKERS FOUND
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive">
              {blockers.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              ACTIVE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-yellow-500">
              {blockers.filter(b => b.status === 'detected').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              REMOVED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-green-500">
              {blockers.filter(b => b.status === 'removed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-orbitron text-muted-foreground">
              CLUSTERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-accent">
              {clusterAccess.filter(c => c.status === 'accessible').length}/{clusterAccess.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
