import { useKV } from '@github/spark/hooks'
import { DeploymentHistory } from '@/lib/publishing-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  ClockCounterClockwise,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Trash
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function DeploymentHistoryViewer() {
  const [history, setHistory] = useKV<DeploymentHistory[]>('deployment-history', [])

  const clearHistory = () => {
    setHistory(() => [])
    toast.success('History cleared')
  }

  const getStatusColor = (status: DeploymentHistory['status']) => {
    switch (status) {
      case 'success':
        return 'text-accent'
      case 'failed':
        return 'text-destructive'
      case 'pending':
        return 'text-muted-foreground'
      case 'cancelled':
        return 'text-muted-foreground'
    }
  }

  const getStatusIcon = (status: DeploymentHistory['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} weight="fill" className="text-accent" />
      case 'failed':
        return <XCircle size={16} weight="fill" className="text-destructive" />
      case 'pending':
        return <Clock size={16} weight="fill" className="text-muted-foreground animate-pulse" />
      case 'cancelled':
        return <XCircle size={16} weight="fill" className="text-muted-foreground" />
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClockCounterClockwise size={32} weight="fill" className="text-accent text-glow" />
            <div>
              <CardTitle className="font-orbitron text-2xl text-glow">DEPLOYMENT HISTORY</CardTitle>
              <CardDescription>Track all deployment activities and results</CardDescription>
            </div>
          </div>
          {(history || []).length > 0 && (
            <Button
              variant="outline"
              onClick={clearHistory}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash size={18} weight="fill" className="mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {(history || []).length === 0 ? (
              <div className="text-center py-12">
                <ClockCounterClockwise size={64} weight="thin" className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-orbitron text-lg mb-2">No Deployments Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your deployment history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {(history || []).map((deployment, index) => (
                    <motion.div
                      key={deployment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-border/50 hover:border-accent/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(deployment.status)}
                              <div>
                                <h4 className="font-orbitron font-semibold">
                                  {deployment.presetName}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {deployment.platform} • {deployment.environment}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={getStatusColor(deployment.status)}
                            >
                              {deployment.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Started</p>
                              <p className="text-sm font-mono">
                                {new Date(deployment.startTime).toLocaleString()}
                              </p>
                            </div>
                            {deployment.endTime && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                <p className="text-sm font-mono">
                                  {formatDuration(deployment.duration)}
                                </p>
                              </div>
                            )}
                          </div>

                          {deployment.commit && (
                            <div className="bg-card/50 border border-border/50 rounded p-3 mb-4">
                              <p className="text-xs text-muted-foreground mb-1">Commit</p>
                              <p className="text-sm font-mono">
                                {deployment.commit.hash.substring(0, 7)} - {deployment.commit.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                by {deployment.commit.author}
                              </p>
                            </div>
                          )}

                          {deployment.url && (
                            <div className="flex items-center gap-2">
                              <a
                                href={deployment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline text-sm flex items-center gap-1"
                              >
                                {deployment.url}
                                <ArrowRight size={14} weight="bold" />
                              </a>
                            </div>
                          )}

                          {deployment.errors && deployment.errors.length > 0 && (
                            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/50 rounded">
                              <p className="text-xs font-semibold text-destructive mb-2">Errors:</p>
                              {deployment.errors.map((error, i) => (
                                <p key={i} className="text-xs font-mono text-destructive/80">
                                  {error}
                                </p>
                              ))}
                            </div>
                          )}

                          {(deployment.buildLogs.length > 0 || deployment.deployLogs.length > 0) && (
                            <details className="mt-4">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View Logs
                              </summary>
                              <div className="mt-2 space-y-2">
                                {deployment.buildLogs.length > 0 && (
                                  <div className="bg-card/50 border border-border/50 rounded p-3">
                                    <p className="text-xs font-semibold mb-2">Build Logs:</p>
                                    {deployment.buildLogs.map((log, i) => (
                                      <p key={i} className="text-xs font-mono text-muted-foreground">
                                        {log}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {deployment.deployLogs.length > 0 && (
                                  <div className="bg-card/50 border border-border/50 rounded p-3">
                                    <p className="text-xs font-semibold mb-2">Deploy Logs:</p>
                                    {deployment.deployLogs.map((log, i) => (
                                      <p key={i} className="text-xs font-mono text-muted-foreground">
                                        {log}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  )
}
