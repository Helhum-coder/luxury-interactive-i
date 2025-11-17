import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  GitPullRequest, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Tag,
  Calendar,
  ArrowRight,
  LinkSimple,
  CircleNotch,
  FunnelSimple,
  ArrowsClockwise,
  ListChecks,
  Sparkle
} from '@phosphor-icons/react'
import { githubAPI } from '@/lib/github-api'
import { createLinearClient, LinearIssue } from '@/lib/linear-api'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

interface GitHubPR {
  id: number
  number: number
  title: string
  state: 'open' | 'closed' | 'merged'
  user: {
    login: string
    avatar_url: string
  }
  created_at: string
  updated_at: string
  html_url: string
  draft: boolean
  labels: Array<{ name: string; color: string }>
  assignees: Array<{ login: string; avatar_url: string }>
  reviewers: Array<{ login: string; avatar_url: string }>
  merged_at?: string
  closed_at?: string
  head: {
    ref: string
  }
  base: {
    ref: string
  }
}

type ItemType = 'all' | 'prs' | 'issues'
type StatusFilter = 'all' | 'open' | 'closed' | 'in-progress'

export default function UnifiedDashboard() {
  const [githubToken, setGithubToken] = useKV<string>('github-token', '')
  const [linearToken, setLinearToken] = useKV<string>('linear-token', '')
  const [selectedRepo, setSelectedRepo] = useKV<string>('unified-selected-repo', '')
  const [selectedTeam, setSelectedTeam] = useKV<string>('unified-selected-team', '')
  
  const [pullRequests, setPullRequests] = useState<GitHubPR[]>([])
  const [linearIssues, setLinearIssues] = useState<LinearIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [itemFilter, setItemFilter] = useState<ItemType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [tokenInput, setTokenInput] = useState({
    github: '',
    linear: ''
  })

  const isConfigured = !!githubToken && !!linearToken

  const fetchPullRequests = async () => {
    if (!githubToken || !selectedRepo) return

    try {
      const [owner, repo] = selectedRepo.split('/')
      githubAPI.setAccessToken(githubToken)
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch pull requests')
      
      const prs = await response.json()
      setPullRequests(prs)
    } catch (error) {
      console.error('Error fetching PRs:', error)
      toast.error('Failed to fetch pull requests')
    }
  }

  const fetchLinearIssues = async () => {
    if (!linearToken) return

    try {
      const client = createLinearClient(linearToken)
      const issues = await client.getIssues(selectedTeam || undefined, 50)
      setLinearIssues(issues)
    } catch (error) {
      console.error('Error fetching Linear issues:', error)
      toast.error('Failed to fetch Linear issues')
    }
  }

  const refreshData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchPullRequests(),
        fetchLinearIssues()
      ])
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConfigured) {
      refreshData()
    }
  }, [githubToken, linearToken, selectedRepo, selectedTeam])

  const handleSaveTokens = () => {
    if (tokenInput.github) {
      setGithubToken(tokenInput.github)
    }
    if (tokenInput.linear) {
      setLinearToken(tokenInput.linear)
    }
    toast.success('API tokens saved successfully')
  }

  const getStatusBadgeVariant = (state: string, type: 'pr' | 'issue') => {
    if (type === 'pr') {
      if (state === 'open') return 'default'
      if (state === 'merged') return 'default'
      return 'secondary'
    } else {
      const stateType = state.toLowerCase()
      if (stateType.includes('backlog')) return 'secondary'
      if (stateType.includes('todo')) return 'outline'
      if (stateType.includes('progress')) return 'default'
      if (stateType.includes('done') || stateType.includes('completed')) return 'default'
      return 'outline'
    }
  }

  const getStatusColor = (state: string, type: 'pr' | 'issue') => {
    if (type === 'pr') {
      if (state === 'open') return 'text-accent'
      if (state === 'merged') return 'text-accent'
      return 'text-muted-foreground'
    } else {
      const stateType = state.toLowerCase()
      if (stateType.includes('progress')) return 'text-accent'
      if (stateType.includes('done') || stateType.includes('completed')) return 'text-accent'
      return 'text-muted-foreground'
    }
  }

  const filterItems = <T extends GitHubPR | LinearIssue>(items: T[], type: 'pr' | 'issue'): T[] => {
    return items.filter(item => {
      const matchesSearch = searchQuery === '' || (
        type === 'pr' 
          ? (item as GitHubPR).title.toLowerCase().includes(searchQuery.toLowerCase())
          : (item as LinearIssue).title.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (!matchesSearch) return false

      if (statusFilter === 'all') return true

      if (type === 'pr') {
        const pr = item as GitHubPR
        if (statusFilter === 'open') return pr.state === 'open'
        if (statusFilter === 'closed') return pr.state === 'closed' || pr.state === 'merged'
      } else {
        const issue = item as LinearIssue
        const stateType = issue.state.type.toLowerCase()
        if (statusFilter === 'open') return stateType === 'backlog' || stateType === 'unstarted'
        if (statusFilter === 'in-progress') return stateType === 'started'
        if (statusFilter === 'closed') return stateType === 'completed' || stateType === 'canceled'
      }

      return true
    })
  }

  const filteredPRs = filterItems(pullRequests, 'pr')
  const filteredIssues = filterItems(linearIssues, 'issue')

  const stats = {
    totalPRs: pullRequests.length,
    openPRs: pullRequests.filter(pr => pr.state === 'open').length,
    mergedPRs: pullRequests.filter(pr => pr.state === 'merged').length,
    totalIssues: linearIssues.length,
    openIssues: linearIssues.filter(issue => issue.state.type === 'backlog' || issue.state.type === 'unstarted').length,
    inProgressIssues: linearIssues.filter(issue => issue.state.type === 'started').length,
    completedIssues: linearIssues.filter(issue => issue.state.type === 'completed').length
  }

  if (!isConfigured) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-card via-background to-card">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-accent/30 console-glow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Sparkle size={48} weight="fill" className="text-accent" />
              </div>
              <CardTitle className="font-orbitron text-3xl uppercase tracking-wider text-glow">
                Unified Dashboard Setup
              </CardTitle>
              <CardDescription className="text-lg">
                Connect GitHub and Linear to view PRs and issues together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-orbitron tracking-wide text-muted-foreground uppercase">
                  GitHub Personal Access Token
                </label>
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={tokenInput.github}
                  onChange={(e) => setTokenInput(prev => ({ ...prev, github: e.target.value }))}
                  className="border-accent/30 focus:border-accent"
                />
                <p className="text-xs text-muted-foreground">
                  Required scopes: repo, read:user
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-orbitron tracking-wide text-muted-foreground uppercase">
                  Linear API Key
                </label>
                <Input
                  type="password"
                  placeholder="lin_api_xxxxxxxxxxxx"
                  value={tokenInput.linear}
                  onChange={(e) => setTokenInput(prev => ({ ...prev, linear: e.target.value }))}
                  className="border-accent/30 focus:border-accent"
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from Linear Settings → API
                </p>
              </div>

              <Button
                onClick={handleSaveTokens}
                className="w-full font-orbitron tracking-wide"
                size="lg"
                disabled={!tokenInput.github || !tokenInput.linear}
              >
                <CheckCircle size={20} weight="fill" className="mr-2" />
                Connect Services
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-card/30 to-background">
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <GitPullRequest size={32} weight="fill" className="text-accent" />
              <div>
                <h2 className="font-orbitron text-2xl font-bold tracking-wider uppercase text-glow">
                  Unified Dashboard
                </h2>
                <p className="text-sm text-muted-foreground">
                  GitHub PRs + Linear Issues
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Repository (owner/repo)"
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-56 border-accent/30 text-sm"
              />
              <Input
                placeholder="Linear Team ID (optional)"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-48 border-accent/30 text-sm"
              />
            </div>
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 border-accent/30"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              disabled={loading}
              className="border-accent/50"
            >
              <ArrowsClockwise 
                size={18} 
                weight="bold" 
                className={loading ? 'animate-spin' : ''}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-border/50 bg-card/30">
        <Card className="border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Open PRs</p>
                <p className="text-2xl font-bold text-accent font-mono">{stats.openPRs}</p>
              </div>
              <GitPullRequest size={24} weight="fill" className="text-accent/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Merged PRs</p>
                <p className="text-2xl font-bold text-accent font-mono">{stats.mergedPRs}</p>
              </div>
              <CheckCircle size={24} weight="fill" className="text-accent/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</p>
                <p className="text-2xl font-bold text-accent font-mono">{stats.inProgressIssues}</p>
              </div>
              <Clock size={24} weight="fill" className="text-accent/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-accent font-mono">{stats.completedIssues}</p>
              </div>
              <ListChecks size={24} weight="fill" className="text-accent/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger 
              value="all" 
              onClick={() => setItemFilter('all')}
              className="font-orbitron"
            >
              All Items ({filteredPRs.length + filteredIssues.length})
            </TabsTrigger>
            <TabsTrigger 
              value="prs" 
              onClick={() => setItemFilter('prs')}
              className="font-orbitron"
            >
              <GitPullRequest size={16} weight="fill" className="mr-2" />
              Pull Requests ({filteredPRs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="issues" 
              onClick={() => setItemFilter('issues')}
              className="font-orbitron"
            >
              <ListChecks size={16} weight="fill" className="mr-2" />
              Linear Issues ({filteredIssues.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 my-4">
            <FunnelSimple size={18} className="text-muted-foreground" />
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="font-orbitron text-xs"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('open')}
              className="font-orbitron text-xs"
            >
              Open
            </Button>
            <Button
              variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('in-progress')}
              className="font-orbitron text-xs"
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('closed')}
              className="font-orbitron text-xs"
            >
              Closed
            </Button>
          </div>

          <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full scrollbar-luxury">
              <div className="space-y-3 pr-4">
                <AnimatePresence mode="popLayout">
                  {filteredPRs.map((pr) => (
                    <motion.div
                      key={`pr-${pr.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                    >
                      <Card className="border-accent/20 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <GitPullRequest 
                              size={24} 
                              weight="fill" 
                              className={getStatusColor(pr.state, 'pr')}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <a
                                    href={pr.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-semibold hover:text-accent transition-colors inline-flex items-center gap-2"
                                  >
                                    {pr.title}
                                    <LinkSimple size={14} />
                                  </a>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="font-mono">
                                      #{pr.number}
                                    </Badge>
                                    <Badge variant={getStatusBadgeVariant(pr.state, 'pr')}>
                                      {pr.state.toUpperCase()}
                                    </Badge>
                                    {pr.draft && (
                                      <Badge variant="secondary">DRAFT</Badge>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Users size={12} />
                                      {pr.user.login}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar size={12} />
                                      {format(new Date(pr.created_at), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 text-xs">
                                    <Badge variant="outline" className="font-mono text-[10px]">
                                      {pr.head.ref} <ArrowRight size={10} className="mx-1" /> {pr.base.ref}
                                    </Badge>
                                  </div>
                                  {pr.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {pr.labels.slice(0, 3).map(label => (
                                        <Badge 
                                          key={label.name} 
                                          variant="secondary"
                                          className="text-[10px]"
                                          style={{ 
                                            backgroundColor: `#${label.color}20`,
                                            borderColor: `#${label.color}`
                                          }}
                                        >
                                          <Tag size={10} className="mr-1" />
                                          {label.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {filteredIssues.map((issue) => (
                    <motion.div
                      key={`issue-${issue.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                    >
                      <Card className="border-accent/20 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <ListChecks 
                              size={24} 
                              weight="fill" 
                              className={getStatusColor(issue.state.type, 'issue')}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <a
                                    href={issue.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-semibold hover:text-accent transition-colors inline-flex items-center gap-2"
                                  >
                                    {issue.title}
                                    <LinkSimple size={14} />
                                  </a>
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="font-mono">
                                      {issue.identifier}
                                    </Badge>
                                    <Badge variant={getStatusBadgeVariant(issue.state.name, 'issue')}>
                                      {issue.state.name.toUpperCase()}
                                    </Badge>
                                    <Badge 
                                      variant="secondary"
                                      className={
                                        issue.priority === 1 ? 'border-destructive/50 text-destructive' :
                                        issue.priority === 2 ? 'border-yellow-500/50 text-yellow-500' :
                                        ''
                                      }
                                    >
                                      P{issue.priority}
                                    </Badge>
                                    {issue.assignee && (
                                      <span className="flex items-center gap-1">
                                        <Users size={12} />
                                        {issue.assignee.name}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Calendar size={12} />
                                      {format(new Date(issue.createdAt), 'MMM d, yyyy')}
                                    </span>
                                  </div>
                                  {issue.description && (
                                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                      {issue.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredPRs.length === 0 && filteredIssues.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <CircleNotch size={48} className="text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {!selectedRepo 
                        ? 'Enter a GitHub repository above (e.g., "octocat/Hello-World")' 
                        : 'No items found matching your filters'}
                    </p>
                    {!selectedRepo && (
                      <p className="text-xs text-muted-foreground/70">
                        Repository format: owner/repo-name
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="prs" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full scrollbar-luxury">
              <div className="space-y-3 pr-4">
                {filteredPRs.map((pr) => (
                  <Card key={pr.id} className="border-accent/20 hover:border-accent/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <GitPullRequest 
                          size={24} 
                          weight="fill" 
                          className={getStatusColor(pr.state, 'pr')}
                        />
                        <div className="flex-1">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-semibold hover:text-accent transition-colors inline-flex items-center gap-2"
                          >
                            {pr.title}
                            <LinkSimple size={14} />
                          </a>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline">#{pr.number}</Badge>
                            <Badge variant={getStatusBadgeVariant(pr.state, 'pr')}>
                              {pr.state.toUpperCase()}
                            </Badge>
                            <span>{pr.user.login}</span>
                            <span>•</span>
                            <span>{format(new Date(pr.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="issues" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full scrollbar-luxury">
              <div className="space-y-3 pr-4">
                {filteredIssues.map((issue) => (
                  <Card key={issue.id} className="border-accent/20 hover:border-accent/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <ListChecks 
                          size={24} 
                          weight="fill" 
                          className={getStatusColor(issue.state.type, 'issue')}
                        />
                        <div className="flex-1">
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base font-semibold hover:text-accent transition-colors inline-flex items-center gap-2"
                          >
                            {issue.title}
                            <LinkSimple size={14} />
                          </a>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline">{issue.identifier}</Badge>
                            <Badge variant={getStatusBadgeVariant(issue.state.name, 'issue')}>
                              {issue.state.name}
                            </Badge>
                            <Badge variant="secondary">P{issue.priority}</Badge>
                            {issue.assignee && <span>{issue.assignee.name}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
