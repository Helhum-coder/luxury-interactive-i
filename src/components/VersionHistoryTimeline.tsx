import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  GitBranch, 
  GitCommit, 
  Tag, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Package,
  FileCode,
  Database,
  X,
  MagnifyingGlass,
  Download,
  ArrowsClockwise,
  Warning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { format } from 'date-fns'

interface DeploymentChange {
  id: string
  type: 'feature' | 'fix' | 'breaking' | 'chore' | 'docs'
  description: string
  author: string
  commitHash?: string
}

interface Deployment {
  id: string
  version: string
  environment: 'production' | 'staging' | 'development'
  status: 'success' | 'failed' | 'pending' | 'rolled-back'
  timestamp: number
  branch: string
  commitHash: string
  changes: DeploymentChange[]
  author: string
  buildTime?: number
  deploymentUrl?: string
  tags?: string[]
}

interface VersionHistoryTimelineProps {
  onClose: () => void
}

export function VersionHistoryTimeline({ onClose }: VersionHistoryTimelineProps) {
  const [deployments, setDeployments] = useKV<Deployment[]>('deployment-history', [])
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [expandedDeployment, setExpandedDeployment] = useState<string | null>(null)

  useEffect(() => {
    if (!deployments || deployments.length === 0) {
      generateSampleDeployments()
    }
  }, [])

  useEffect(() => {
    if (!deployments) {
      setFilteredDeployments([])
      return
    }

    let filtered = [...deployments]

    if (selectedEnvironment !== 'all') {
      filtered = filtered.filter(d => d.environment === selectedEnvironment)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(d => d.status === selectedStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d => 
        d.version.toLowerCase().includes(query) ||
        d.branch.toLowerCase().includes(query) ||
        d.author.toLowerCase().includes(query) ||
        d.changes.some(c => c.description.toLowerCase().includes(query))
      )
    }

    setFilteredDeployments(filtered)
  }, [deployments, selectedEnvironment, selectedStatus, searchQuery])

  const generateSampleDeployments = () => {
    const now = Date.now()
    const sampleDeployments: Deployment[] = [
      {
        id: '1',
        version: 'v2.4.1',
        environment: 'production',
        status: 'success',
        timestamp: now - 2 * 60 * 60 * 1000,
        branch: 'main',
        commitHash: 'a3f2c9d',
        author: 'sarah.dev',
        buildTime: 245,
        deploymentUrl: 'https://app.example.com',
        tags: ['hotfix', 'security'],
        changes: [
          {
            id: 'c1',
            type: 'fix',
            description: 'Fixed critical security vulnerability in auth module',
            author: 'sarah.dev',
            commitHash: 'a3f2c9d'
          },
          {
            id: 'c2',
            type: 'fix',
            description: 'Resolved memory leak in WebSocket connections',
            author: 'sarah.dev',
            commitHash: 'b4e1a2c'
          }
        ]
      },
      {
        id: '2',
        version: 'v2.4.0',
        environment: 'production',
        status: 'success',
        timestamp: now - 24 * 60 * 60 * 1000,
        branch: 'main',
        commitHash: 'e7d9b4a',
        author: 'mike.prod',
        buildTime: 312,
        deploymentUrl: 'https://app.example.com',
        tags: ['feature-release'],
        changes: [
          {
            id: 'c3',
            type: 'feature',
            description: 'Added real-time collaboration features',
            author: 'mike.prod',
            commitHash: 'e7d9b4a'
          },
          {
            id: 'c4',
            type: 'feature',
            description: 'Implemented new dashboard analytics widget',
            author: 'lisa.ui',
            commitHash: 'f1c8e3b'
          },
          {
            id: 'c5',
            type: 'breaking',
            description: 'Updated API endpoints to v3 (deprecated v2)',
            author: 'mike.prod',
            commitHash: 'g2d7f4c'
          },
          {
            id: 'c6',
            type: 'chore',
            description: 'Updated dependencies and security patches',
            author: 'mike.prod',
            commitHash: 'h3e6g5d'
          }
        ]
      },
      {
        id: '3',
        version: 'v2.3.2',
        environment: 'staging',
        status: 'success',
        timestamp: now - 3 * 60 * 60 * 1000,
        branch: 'develop',
        commitHash: 'i4f7h6e',
        author: 'alex.test',
        buildTime: 198,
        deploymentUrl: 'https://staging.example.com',
        tags: ['testing'],
        changes: [
          {
            id: 'c7',
            type: 'feature',
            description: 'Testing new notification system',
            author: 'alex.test',
            commitHash: 'i4f7h6e'
          }
        ]
      },
      {
        id: '4',
        version: 'v2.3.1',
        environment: 'production',
        status: 'rolled-back',
        timestamp: now - 2 * 24 * 60 * 60 * 1000,
        branch: 'main',
        commitHash: 'j5g8i7f',
        author: 'mike.prod',
        buildTime: 289,
        deploymentUrl: 'https://app.example.com',
        tags: ['rolled-back'],
        changes: [
          {
            id: 'c8',
            type: 'fix',
            description: 'Attempted database migration (caused issues)',
            author: 'mike.prod',
            commitHash: 'j5g8i7f'
          }
        ]
      },
      {
        id: '5',
        version: 'v2.3.0',
        environment: 'production',
        status: 'success',
        timestamp: now - 7 * 24 * 60 * 60 * 1000,
        branch: 'main',
        commitHash: 'k6h9j8g',
        author: 'sarah.dev',
        buildTime: 267,
        deploymentUrl: 'https://app.example.com',
        tags: ['major-release'],
        changes: [
          {
            id: 'c9',
            type: 'feature',
            description: 'Launched new user onboarding flow',
            author: 'lisa.ui',
            commitHash: 'k6h9j8g'
          },
          {
            id: 'c10',
            type: 'feature',
            description: 'Added multi-language support (EN, ES, FR)',
            author: 'sarah.dev',
            commitHash: 'l7i0k9h'
          },
          {
            id: 'c11',
            type: 'docs',
            description: 'Updated API documentation',
            author: 'mike.prod',
            commitHash: 'm8j1l0i'
          }
        ]
      },
      {
        id: '6',
        version: 'v2.2.5',
        environment: 'development',
        status: 'pending',
        timestamp: now - 30 * 60 * 1000,
        branch: 'feature/new-ui',
        commitHash: 'n9k2m1j',
        author: 'lisa.ui',
        buildTime: 156,
        deploymentUrl: 'https://dev.example.com',
        tags: ['wip'],
        changes: [
          {
            id: 'c12',
            type: 'feature',
            description: 'Redesigning main dashboard UI',
            author: 'lisa.ui',
            commitHash: 'n9k2m1j'
          }
        ]
      },
      {
        id: '7',
        version: 'v2.2.4',
        environment: 'staging',
        status: 'failed',
        timestamp: now - 5 * 60 * 60 * 1000,
        branch: 'develop',
        commitHash: 'o0l3n2k',
        author: 'alex.test',
        buildTime: 45,
        deploymentUrl: 'https://staging.example.com',
        tags: ['failed'],
        changes: [
          {
            id: 'c13',
            type: 'chore',
            description: 'Database schema update',
            author: 'alex.test',
            commitHash: 'o0l3n2k'
          }
        ]
      }
    ]

    setDeployments(sampleDeployments)
  }

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} weight="fill" className="text-green-600" />
      case 'failed':
        return <XCircle size={20} weight="fill" className="text-red-600" />
      case 'pending':
        return <Clock size={20} weight="fill" className="text-yellow-600" />
      case 'rolled-back':
        return <ArrowsClockwise size={20} weight="fill" className="text-orange-600" />
    }
  }

  const getStatusBadge = (status: Deployment['status']) => {
    const variants: Record<Deployment['status'], string> = {
      success: 'bg-green-100 text-green-700 border-green-300',
      failed: 'bg-red-100 text-red-700 border-red-300',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'rolled-back': 'bg-orange-100 text-orange-700 border-orange-300'
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getEnvironmentBadge = (env: Deployment['environment']) => {
    const variants: Record<Deployment['environment'], string> = {
      production: 'bg-purple-100 text-purple-700 border-purple-300',
      staging: 'bg-blue-100 text-blue-700 border-blue-300',
      development: 'bg-gray-100 text-gray-700 border-gray-300'
    }

    return (
      <Badge variant="outline" className={variants[env]}>
        {env}
      </Badge>
    )
  }

  const getChangeTypeIcon = (type: DeploymentChange['type']) => {
    switch (type) {
      case 'feature':
        return <Package size={16} className="text-blue-600" />
      case 'fix':
        return <CheckCircle size={16} className="text-green-600" />
      case 'breaking':
        return <Warning size={16} className="text-red-600" />
      case 'chore':
        return <FileCode size={16} className="text-gray-600" />
      case 'docs':
        return <Database size={16} className="text-purple-600" />
    }
  }

  const getChangeTypeBadge = (type: DeploymentChange['type']) => {
    const variants: Record<DeploymentChange['type'], string> = {
      feature: 'bg-blue-100 text-blue-700',
      fix: 'bg-green-100 text-green-700',
      breaking: 'bg-red-100 text-red-700',
      chore: 'bg-gray-100 text-gray-700',
      docs: 'bg-purple-100 text-purple-700'
    }

    return (
      <Badge variant="secondary" className={`${variants[type]} text-xs`}>
        {type}
      </Badge>
    )
  }

  const exportTimeline = () => {
    const dataStr = JSON.stringify(filteredDeployments, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `deployment-history-${format(new Date(), 'yyyy-MM-dd')}.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                <GitCommit size={32} weight="duotone" className="text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Version History Timeline</h1>
                <p className="text-muted-foreground mt-1">
                  Track all deployments and changes across environments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportTimeline} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button onClick={onClose} variant="ghost" size="icon">
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search versions, branches, authors, changes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="rolled-back">Rolled Back</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Deployments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deployments?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {deployments?.filter(d => d.status === 'success').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {deployments?.filter(d => d.status === 'failed').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {deployments?.filter(d => d.environment === 'production').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-transparent" />

            <AnimatePresence>
              {filteredDeployments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="inline-flex p-6 bg-muted rounded-full mb-4">
                    <MagnifyingGlass size={48} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No deployments found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search criteria
                  </p>
                </motion.div>
              ) : (
                filteredDeployments.map((deployment, index) => (
                  <motion.div
                    key={deployment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative mb-8 pl-20"
                  >
                    <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-background border-4 border-purple-500 shadow-lg" />

                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-2xl font-bold">{deployment.version}</CardTitle>
                              {getStatusIcon(deployment.status)}
                              {getStatusBadge(deployment.status)}
                              {getEnvironmentBadge(deployment.environment)}
                            </div>
                            <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {format(new Date(deployment.timestamp), 'PPpp')}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitBranch size={14} />
                                {deployment.branch}
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {deployment.author}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-xs">
                                <GitCommit size={14} />
                                {deployment.commitHash}
                              </span>
                              {deployment.buildTime && (
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {deployment.buildTime}s
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedDeployment(
                              expandedDeployment === deployment.id ? null : deployment.id
                            )}
                          >
                            {expandedDeployment === deployment.id ? 'Collapse' : 'Expand'}
                          </Button>
                        </div>
                        {deployment.tags && deployment.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {deployment.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag size={12} className="mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>

                      <AnimatePresence>
                        {expandedDeployment === deployment.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent>
                              <Separator className="mb-4" />
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <ArrowRight size={16} />
                                Changes ({deployment.changes.length})
                              </h4>
                              <div className="space-y-3">
                                {deployment.changes.map(change => (
                                  <div
                                    key={change.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                  >
                                    <div className="mt-0.5">
                                      {getChangeTypeIcon(change.type)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        {getChangeTypeBadge(change.type)}
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {change.commitHash}
                                        </span>
                                      </div>
                                      <p className="text-sm">{change.description}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        by {change.author}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {deployment.deploymentUrl && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <a
                                    href={deployment.deploymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    View Deployment <ArrowRight size={14} />
                                  </a>
                                </div>
                              )}
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
