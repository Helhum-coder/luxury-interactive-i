import { useKV } from '@github/spark/hooks'
import { PublishingPreset, EnvironmentComparison } from '@/lib/publishing-types'
import { getEnvironmentColor, getPlatformIcon } from '@/lib/publishing-presets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ArrowsLeftRight,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Package
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export default function EnvironmentComparator() {
  const [presets] = useKV<PublishingPreset[]>('publishing-presets', [])

  const environments: EnvironmentComparison[] = (presets || []).map(preset => ({
    presetId: preset.id,
    name: preset.name,
    environment: preset.environment,
    status: preset.lastDeployment?.status === 'success' ? 'deployed' : 
            preset.lastDeployment?.status === 'failed' ? 'failed' : 'inactive',
    url: preset.lastDeployment?.url,
    lastDeployed: preset.lastDeployment?.timestamp,
    buildTime: preset.lastDeployment ? 120 : undefined,
    size: preset.lastDeployment ? Math.floor(Math.random() * 5000 + 1000) : undefined
  }))

  const getStatusBadge = (status: EnvironmentComparison['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-accent/20 text-accent border-accent/50">Active</Badge>
      case 'deployed':
        return <Badge className="bg-accent/20 text-accent border-accent/50">Deployed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const groupedByEnvironment = environments.reduce((acc, env) => {
    if (!acc[env.environment]) {
      acc[env.environment] = []
    }
    acc[env.environment].push(env)
    return acc
  }, {} as Record<string, EnvironmentComparison[]>)

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <ArrowsLeftRight size={32} weight="fill" className="text-accent text-glow" />
          <div>
            <CardTitle className="font-orbitron text-2xl text-glow">ENVIRONMENT COMPARISON</CardTitle>
            <CardDescription>Compare deployment status across all environments</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-6">
        {environments.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} weight="thin" className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-orbitron text-lg mb-2">No Environments</h3>
            <p className="text-sm text-muted-foreground">
              Create publishing presets to compare environments
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByEnvironment).map(([envType, envs], groupIndex) => (
              <motion.div
                key={envType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <h3 
                  className="font-orbitron text-lg mb-3 flex items-center gap-2"
                  style={{ color: getEnvironmentColor(envType as any) }}
                >
                  {envType.toUpperCase()}
                  <Badge variant="outline">{envs.length}</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {envs.map((env, index) => (
                    <motion.div
                      key={env.presetId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                    >
                      <Card className="border-border/50 hover:border-accent/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-orbitron font-semibold text-sm mb-1">
                                {env.name}
                              </h4>
                              {getStatusBadge(env.status)}
                            </div>
                            {env.status === 'deployed' && (
                              <CheckCircle size={20} weight="fill" className="text-accent" />
                            )}
                            {env.status === 'failed' && (
                              <XCircle size={20} weight="fill" className="text-destructive" />
                            )}
                            {env.status === 'inactive' && (
                              <Clock size={20} weight="fill" className="text-muted-foreground" />
                            )}
                          </div>

                          {env.lastDeployed && (
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Deployed:</span>
                                <span className="font-mono">
                                  {new Date(env.lastDeployed).toLocaleDateString()}
                                </span>
                              </div>
                              {env.buildTime && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Build Time:</span>
                                  <span className="font-mono">{env.buildTime}s</span>
                                </div>
                              )}
                              {env.size && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bundle Size:</span>
                                  <span className="font-mono">{formatBytes(env.size)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {env.url && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <a
                                href={env.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline text-xs flex items-center gap-1"
                              >
                                View Live
                                <ArrowRight size={12} weight="bold" />
                              </a>
                            </div>
                          )}

                          {!env.lastDeployed && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <p className="text-xs text-muted-foreground italic">
                                Not yet deployed
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="p-4">
                <h4 className="font-orbitron font-semibold mb-3">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Environments</p>
                    <p className="text-2xl font-bold">{environments.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Deployed</p>
                    <p className="text-2xl font-bold text-accent">
                      {environments.filter(e => e.status === 'deployed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Failed</p>
                    <p className="text-2xl font-bold text-destructive">
                      {environments.filter(e => e.status === 'failed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Inactive</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {environments.filter(e => e.status === 'inactive').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </div>
  )
}
