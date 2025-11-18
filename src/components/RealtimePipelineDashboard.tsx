import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Activity,
  GitBranch,
  Fire,
  CloudArrowUp,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  X
} from '@phosphor-icons/react'
import { useRealtimeMonitor } from '@/hooks/use-websocket-status'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface Pipeline {
  id: string
  name: string
  platform: 'GitHub Actions' | 'Vercel' | 'Firebase'
  status: 'running' | 'success' | 'failed' | 'pending'
  startTime: number
  duration?: number
  branch?: string
  commit?: string
  logs?: string[]
}

interface RealtimePipelineDashboardProps {
  onClose: () => void
}

export function RealtimePipelineDashboard({ onClose }: RealtimePipelineDashboardProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const { reportSuccess, reportError, reportInfo, reportPending } = useRealtimeMonitor('Pipeline Monitor')

  useEffect(() => {
    reportInfo('Pipeline dashboard initialized')
    startMonitoring()

    return () => {
      reportInfo('Pipeline monitoring stopped')
    }
  }, [])

  const startMonitoring = () => {
    const initialPipelines: Pipeline[] = [
      {
        id: 'gh-1',
        name: 'CI/CD Workflow',
        platform: 'GitHub Actions',
        status: 'running',
        startTime: Date.now() - 45000,
        branch: 'main',
        commit: 'abc123d',
        logs: ['Installing dependencies...', 'Running tests...']
      },
      {
        id: 'vercel-1',
        name: 'Production Deployment',
        platform: 'Vercel',
        status: 'success',
        startTime: Date.now() - 120000,
        duration: 58000,
        branch: 'main',
        commit: 'def456e'
      },
      {
        id: 'firebase-1',
        name: 'Hosting Deploy',
        platform: 'Firebase',
        status: 'pending',
        startTime: Date.now(),
        branch: 'develop',
        commit: 'ghi789f'
      }
    ]

    setPipelines(initialPipelines)
    reportPending('Monitoring 3 active pipelines')

    const interval = setInterval(() => {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.status === 'running') {
          const shouldComplete = Math.random() > 0.7
          if (shouldComplete) {
            const success = Math.random() > 0.3
            const newStatus = success ? 'success' : 'failed'
            const duration = Date.now() - pipeline.startTime
            
            if (success) {
              reportSuccess(`${pipeline.name} completed successfully`, {
                platform: pipeline.platform,
                duration: `${Math.floor(duration / 1000)}s`
              })
            } else {
              reportError(`${pipeline.name} failed`, {
                platform: pipeline.platform,
                duration: `${Math.floor(duration / 1000)}s`
              })
            }
            
            return { ...pipeline, status: newStatus, duration }
          }
          
          return {
            ...pipeline,
            logs: [
              ...(pipeline.logs || []),
              `Step ${(pipeline.logs?.length || 0) + 1} executing...`
            ]
          }
        }
        
        if (pipeline.status === 'pending') {
          const shouldStart = Math.random() > 0.6
          if (shouldStart) {
            reportInfo(`${pipeline.name} started`, {
              platform: pipeline.platform
            })
            return { 
              ...pipeline, 
              status: 'running',
              startTime: Date.now(),
              logs: ['Initializing build...']
            }
          }
        }
        
        return pipeline
      }))
    }, 3000)

    return () => clearInterval(interval)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'GitHub Actions':
        return <GitBranch size={20} weight="duotone" className="text-gray-700" />
      case 'Vercel':
        return <CloudArrowUp size={20} weight="duotone" className="text-black" />
      case 'Firebase':
        return <Fire size={20} weight="duotone" className="text-orange-500" />
      default:
        return <Activity size={20} />
    }
  }

  const getStatusBadge = (status: Pipeline['status']) => {
    switch (status) {
      case 'running':
        return (
          <Badge className="bg-blue-500/10 border-blue-500/30 text-blue-700">
            <Clock size={14} className="mr-1 animate-spin" weight="fill" />
            Running
          </Badge>
        )
      case 'success':
        return (
          <Badge className="bg-green-500/10 border-green-500/30 text-green-700">
            <CheckCircle size={14} className="mr-1" weight="fill" />
            Success
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-500/10 border-red-500/30 text-red-700">
            <XCircle size={14} className="mr-1" weight="fill" />
            Failed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-gray-500/10 border-gray-500/30 text-gray-700">
            <Clock size={14} className="mr-1" weight="fill" />
            Pending
          </Badge>
        )
    }
  }

  const activePipelines = pipelines.filter(p => p.status === 'running' || p.status === 'pending').length

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
              <Activity size={32} weight="duotone" className="text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-3xl tracking-tight">
                Real-time Pipeline Monitor
              </h1>
              <p className="text-muted-foreground mt-1">
                Live status updates from GitHub Actions, Vercel, and Firebase
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {activePipelines} active
            </Badge>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {pipelines.map((pipeline) => (
              <motion.div
                key={pipeline.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getPlatformIcon(pipeline.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                          {getStatusBadge(pipeline.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GitBranch size={14} />
                            {pipeline.branch}
                          </span>
                          <span className="font-mono">{pipeline.commit}</span>
                          <Badge variant="outline" className="text-xs">
                            {pipeline.platform}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {pipeline.status === 'running' && (
                        <div className="text-muted-foreground">
                          Running for {formatDistanceToNow(pipeline.startTime)}
                        </div>
                      )}
                      {pipeline.duration && (
                        <div className="text-muted-foreground">
                          Completed in {Math.floor(pipeline.duration / 1000)}s
                        </div>
                      )}
                    </div>
                  </div>

                  {pipeline.logs && pipeline.logs.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <PlayCircle size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium">Logs</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1">
                          <AnimatePresence>
                            {pipeline.logs.map((log, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-muted-foreground"
                              >
                                {log}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
