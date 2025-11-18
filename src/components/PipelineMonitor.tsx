import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  GitBranch, 
  Globe, 
  Flame, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowClockwise,
  Lightning,
  Warning,
  Circle,
  Heartbeat
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRealtimeMonitor } from '@/hooks/use-websocket-status'
import { RealtimeStatusFeed } from '@/components/RealtimeStatusFeed'

interface APITokens {
  github?: string
  vercel?: string
  firebase?: string
}

interface WorkflowRun {
  id: string
  name: string
  status: 'queued' | 'in_progress' | 'completed'
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped'
  branch: string
  commit: string
  triggeredBy: string
  createdAt: Date
  updatedAt: Date
  duration?: number
  url: string
}

interface VercelDeployment {
  id: string
  name: string
  status: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
  url: string
  branch: string
  commit: string
  creator: string
  createdAt: Date
  buildTime?: number
}

interface FirebaseDeployment {
  id: string
  projectId: string
  status: 'pending' | 'running' | 'success' | 'failed'
  type: 'hosting' | 'functions' | 'both'
  version: string
  createdAt: Date
  message?: string
}

interface PipelineMonitorProps {
  onClose: () => void
}

interface APIError {
  provider: string
  message: string
  timestamp: Date
  type: 'timeout' | 'network' | 'auth' | 'unknown'
}

export function PipelineMonitor({ onClose }: PipelineMonitorProps) {
  const [tokens] = useKV<APITokens>('api-tokens', {})
  const [githubWorkflows, setGithubWorkflows] = useState<WorkflowRun[]>([])
  const [vercelDeployments, setVercelDeployments] = useState<VercelDeployment[]>([])
  const [firebaseDeployments, setFirebaseDeployments] = useState<FirebaseDeployment[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [errors, setErrors] = useState<APIError[]>([])
  const { reportSuccess, reportError, reportWarning, reportInfo } = useRealtimeMonitor('Pipeline Monitor')

  const addError = (provider: string, message: string, type: APIError['type']) => {
    setErrors((current) => [
      {
        provider,
        message,
        timestamp: new Date(),
        type
      },
      ...current.slice(0, 4)
    ])
    reportError(`${provider}: ${message}`, { type })
  }

  const fetchGitHubWorkflows = async () => {
    if (!tokens?.github) return

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=1', {
        headers: {
          'Authorization': `token ${tokens.github}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401) {
          addError('GitHub', 'Invalid or expired token', 'auth')
          toast.error('GitHub: Invalid token')
        } else {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
        }
        return
      }

      const repos = await response.json()
      if (repos.length === 0) {
        setGithubWorkflows([])
        return
      }

      const repo = repos[0]
      const workflowResponse = await fetch(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/actions/runs?per_page=10`,
        {
          headers: {
            'Authorization': `token ${tokens.github}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (workflowResponse.ok) {
        const data = await workflowResponse.json()
        const runs: WorkflowRun[] = data.workflow_runs?.map((run: any) => ({
          id: run.id.toString(),
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          branch: run.head_branch,
          commit: run.head_sha.substring(0, 7),
          triggeredBy: run.actor.login,
          createdAt: new Date(run.created_at),
          updatedAt: new Date(run.updated_at),
          duration: run.conclusion ? Math.floor((new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000) : undefined,
          url: run.html_url
        })) || []
        setGithubWorkflows(runs)
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          addError('GitHub', 'Request timed out after 10 seconds', 'timeout')
          toast.error('GitHub API request timed out')
        } else {
          addError('GitHub', error.message, 'network')
          toast.error(`GitHub API error: ${error.message}`)
        }
      }
      console.error('Failed to fetch GitHub workflows:', error)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const fetchVercelDeployments = async () => {
    if (!tokens?.vercel) return

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch('https://api.vercel.com/v6/deployments?limit=10', {
        headers: {
          'Authorization': `Bearer ${tokens.vercel}`
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          addError('Vercel', 'Invalid or expired token', 'auth')
          toast.error('Vercel: Invalid token')
        } else {
          throw new Error(`Vercel API error: ${response.status} ${response.statusText}`)
        }
        return
      }

      const data = await response.json()
      const deployments: VercelDeployment[] = data.deployments?.map((dep: any) => ({
        id: dep.uid,
        name: dep.name,
        status: dep.state,
        url: `https://${dep.url}`,
        branch: dep.meta?.githubCommitRef || 'main',
        commit: dep.meta?.githubCommitSha?.substring(0, 7) || 'unknown',
        creator: dep.creator?.username || 'unknown',
        createdAt: new Date(dep.created),
        buildTime: dep.buildingAt && dep.ready ? Math.floor((dep.ready - dep.buildingAt) / 1000) : undefined
      })) || []
      setVercelDeployments(deployments)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          addError('Vercel', 'Request timed out after 10 seconds', 'timeout')
          toast.error('Vercel API request timed out')
        } else {
          addError('Vercel', error.message, 'network')
          toast.error(`Vercel API error: ${error.message}`)
        }
      }
      console.error('Failed to fetch Vercel deployments:', error)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  const generateMockFirebaseData = () => {
    const statuses: FirebaseDeployment['status'][] = ['success', 'running', 'pending', 'failed']
    const types: FirebaseDeployment['type'][] = ['hosting', 'functions', 'both']
    
    const deployments: FirebaseDeployment[] = Array.from({ length: 5 }, (_, i) => ({
      id: `firebase-${Date.now()}-${i}`,
      projectId: 'my-project',
      status: statuses[i % statuses.length],
      type: types[i % types.length],
      version: `v${Math.floor(Math.random() * 100)}.${Math.floor(Math.random() * 10)}`,
      createdAt: new Date(Date.now() - i * 3600000),
      message: i === 3 ? 'Deployment failed: Build error' : undefined
    }))
    
    setFirebaseDeployments(deployments)
  }

  const refreshAll = async () => {
    setIsRefreshing(true)
    setErrors([])
    reportInfo('Refreshing pipeline data...')
    try {
      await Promise.all([
        fetchGitHubWorkflows(),
        fetchVercelDeployments(),
        generateMockFirebaseData()
      ])
      setLastRefresh(new Date())
      if (errors.length === 0) {
        toast.success('Pipeline data refreshed successfully')
        reportSuccess('All pipeline data refreshed successfully')
      }
    } catch (error) {
      toast.error('Failed to refresh some data')
      reportError('Failed to refresh pipeline data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const testConnections = async () => {
    setIsRefreshing(true)
    setErrors([])
    toast.info('Testing API connections...')
    reportInfo('Starting API connection tests...')

    const tests: Promise<void>[] = []

    if (tokens?.github) {
      tests.push(
        (async () => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          try {
            const response = await fetch('https://api.github.com/user', {
              headers: {
                'Authorization': `token ${tokens.github}`,
                'Accept': 'application/vnd.github.v3+json'
              },
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            if (response.ok) {
              toast.success('GitHub API: Connected ✓')
              reportSuccess('GitHub API connection successful')
            } else {
              addError('GitHub', `Connection test failed: ${response.status}`, 'network')
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              addError('GitHub', 'Connection test timed out', 'timeout')
            }
          }
        })()
      )
    }

    if (tokens?.vercel) {
      tests.push(
        (async () => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          try {
            const response = await fetch('https://api.vercel.com/v2/user', {
              headers: {
                'Authorization': `Bearer ${tokens.vercel}`
              },
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            if (response.ok) {
              toast.success('Vercel API: Connected ✓')
            } else {
              addError('Vercel', `Connection test failed: ${response.status}`, 'network')
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              addError('Vercel', 'Connection test timed out', 'timeout')
            }
          }
        })()
      )
    }

    await Promise.all(tests)
    setIsRefreshing(false)
  }

  useEffect(() => {
    refreshAll()
  }, [tokens])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshAll()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, tokens])

  const getStatusIcon = (status: string, conclusion?: string) => {
    if (status === 'in_progress' || status === 'BUILDING' || status === 'running') {
      return <Clock size={16} weight="fill" className="text-blue-600 animate-pulse" />
    }
    if (status === 'queued' || status === 'pending') {
      return <Circle size={16} weight="fill" className="text-gray-400" />
    }
    if (conclusion === 'success' || status === 'READY' || status === 'success' || status === 'completed') {
      return <CheckCircle size={16} weight="fill" className="text-green-600" />
    }
    if (conclusion === 'failure' || status === 'ERROR' || status === 'failed') {
      return <XCircle size={16} weight="fill" className="text-red-600" />
    }
    if (conclusion === 'cancelled' || status === 'CANCELED') {
      return <Warning size={16} weight="fill" className="text-orange-600" />
    }
    return <Circle size={16} weight="fill" className="text-gray-400" />
  }

  const getStatusBadge = (status: string, conclusion?: string) => {
    if (status === 'in_progress' || status === 'BUILDING' || status === 'running') {
      return <Badge variant="outline" className="border-blue-600 text-blue-600">Running</Badge>
    }
    if (status === 'queued' || status === 'pending') {
      return <Badge variant="outline" className="border-gray-400 text-gray-600">Queued</Badge>
    }
    if (conclusion === 'success' || status === 'READY' || status === 'success') {
      return <Badge variant="outline" className="border-green-600 text-green-600">Success</Badge>
    }
    if (conclusion === 'failure' || status === 'ERROR' || status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>
    }
    if (conclusion === 'cancelled' || status === 'CANCELED') {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">Cancelled</Badge>
    }
    return <Badge variant="secondary">Unknown</Badge>
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const hasAnyToken = !!(tokens?.github || tokens?.vercel || tokens?.firebase)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
              <Lightning size={32} weight="duotone" className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pipeline Monitor</h1>
              <p className="text-muted-foreground mt-1">
                Real-time monitoring for GitHub Actions, Vercel, and Firebase
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={testConnections}
                disabled={isRefreshing || !hasAnyToken}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Heartbeat size={16} />
                Test Connections
              </Button>
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="gap-2"
              >
                <ArrowClockwise size={16} className={autoRefresh ? 'animate-spin' : ''} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={refreshAll}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowClockwise size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </Button>
            </div>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>

        {lastRefresh && (
          <div className="mb-6 text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        )}

        {!hasAnyToken && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Warning size={24} className="text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">No API tokens configured</p>
                  <p className="text-sm text-orange-700">
                    Please configure your API tokens in the API Tokens Manager to start monitoring pipelines.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {errors.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <XCircle size={20} />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {error.provider}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {error.type}
                        </Badge>
                        <span className="text-xs text-red-600">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-red-700">{error.message}</p>
                      {error.type === 'timeout' && (
                        <p className="text-xs text-red-600 mt-1">
                          💡 Try checking your firewall, network connectivity, or server status
                        </p>
                      )}
                      {error.type === 'auth' && (
                        <p className="text-xs text-red-600 mt-1">
                          💡 Verify your token is correct and has the required permissions
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="github" className="gap-2">
              <GitBranch size={16} weight="duotone" />
              GitHub Actions
              {githubWorkflows.length > 0 && (
                <Badge variant="secondary" className="ml-2">{githubWorkflows.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="vercel" className="gap-2">
              <Globe size={16} weight="duotone" />
              Vercel
              {vercelDeployments.length > 0 && (
                <Badge variant="secondary" className="ml-2">{vercelDeployments.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="firebase" className="gap-2">
              <Flame size={16} weight="duotone" />
              Firebase
              {firebaseDeployments.length > 0 && (
                <Badge variant="secondary" className="ml-2">{firebaseDeployments.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch size={24} weight="duotone" />
                  GitHub Actions Workflows
                </CardTitle>
                <CardDescription>
                  Recent workflow runs from your repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!tokens?.github ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                    <p>GitHub token not configured</p>
                  </div>
                ) : githubWorkflows.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No workflow runs found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {githubWorkflows.map((run, index) => (
                        <motion.div
                          key={run.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  {getStatusIcon(run.status, run.conclusion)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold truncate">{run.name}</h3>
                                      {getStatusBadge(run.status, run.conclusion)}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <code className="bg-muted px-1 rounded">{run.branch}</code>
                                        </span>
                                        <span>@{run.commit}</span>
                                        <span>by {run.triggeredBy}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span>{run.createdAt.toLocaleString()}</span>
                                        {run.duration && (
                                          <span>Duration: {formatDuration(run.duration)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(run.url, '_blank')}
                                >
                                  View
                                </Button>
                              </div>
                              {run.status === 'in_progress' && (
                                <Progress value={65} className="mt-3" />
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vercel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={24} weight="duotone" />
                  Vercel Deployments
                </CardTitle>
                <CardDescription>
                  Recent deployments and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!tokens?.vercel ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Vercel token not configured</p>
                  </div>
                ) : vercelDeployments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No deployments found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {vercelDeployments.map((dep, index) => (
                        <motion.div
                          key={dep.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  {getStatusIcon(dep.status)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold truncate">{dep.name}</h3>
                                      {getStatusBadge(dep.status)}
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <code className="bg-muted px-1 rounded">{dep.branch}</code>
                                        </span>
                                        <span>@{dep.commit}</span>
                                        <span>by {dep.creator}</span>
                                      </div>
                                      <div className="flex items-center gap-4">
                                        <span>{dep.createdAt.toLocaleString()}</span>
                                        {dep.buildTime && (
                                          <span>Build: {formatDuration(dep.buildTime)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(dep.url, '_blank')}
                                >
                                  Visit
                                </Button>
                              </div>
                              {dep.status === 'BUILDING' && (
                                <Progress value={45} className="mt-3" />
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="firebase">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame size={24} weight="duotone" />
                  Firebase Deployments
                </CardTitle>
                <CardDescription>
                  Hosting and functions deployment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {firebaseDeployments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Flame size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No deployments found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {firebaseDeployments.map((dep, index) => (
                        <motion.div
                          key={dep.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(dep.status)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{dep.projectId}</h3>
                                    {getStatusBadge(dep.status)}
                                    <Badge variant="outline">{dep.type}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-4">
                                      <span>Version: {dep.version}</span>
                                      <span>{dep.createdAt.toLocaleString()}</span>
                                    </div>
                                    {dep.message && (
                                      <p className="text-red-600">{dep.message}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {dep.status === 'running' && (
                                <Progress value={55} className="mt-3" />
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {githubWorkflows.filter(w => w.status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Vercel Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vercelDeployments.filter(d => d.status === 'BUILDING').length}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {githubWorkflows.length > 0 
                  ? Math.round((githubWorkflows.filter(w => w.conclusion === 'success').length / githubWorkflows.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Last 10 runs</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <RealtimeStatusFeed filterSource="Pipeline Monitor" maxHeight="400px" />
        </div>

        {errors.some(e => e.type === 'timeout') && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Heartbeat size={20} />
                Troubleshooting Timeout Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-semibold">If you're experiencing timeouts, try these steps:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check if the API services (GitHub, Vercel) are operational</li>
                  <li>Verify your network connection is stable</li>
                  <li>Check if your firewall is blocking API requests</li>
                  <li>Ensure your tokens haven't expired</li>
                  <li>Try disabling VPN or proxy if enabled</li>
                  <li>Check your browser's console for CORS or network errors</li>
                </ul>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={testConnections}
                    disabled={isRefreshing}
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-white"
                  >
                    <Heartbeat size={16} />
                    Re-test Connections
                  </Button>
                  <Button
                    onClick={() => setErrors([])}
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-white"
                  >
                    <XCircle size={16} />
                    Clear Errors
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
