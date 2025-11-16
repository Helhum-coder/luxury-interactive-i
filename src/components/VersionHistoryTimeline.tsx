import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GitCommit, 
  GitBranch, 
  Clock, 
  User, 
  FileText,
  ArrowRight,
  GitMerge,
  Tag,
  CalendarBlank,
  FunnelSimple,
  MagnifyingGlass,
  Download,
  ArrowsClockwise,
  CheckCircle,
  WarningCircle,
  Info
} from '@phosphor-icons/react'
import { githubAPI } from '@/lib/github-api'
import { GitHubCommit, GitHubRepository, GitHubBranch } from '@/lib/types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import * as d3 from 'd3'

interface CommitNode {
  sha: string
  message: string
  author: string
  authorAvatar: string | null
  date: Date
  branch: string
  filesChanged?: number
  additions?: number
  deletions?: number
  parents?: string[]
  tags?: string[]
  htmlUrl: string
}

interface TimelineStats {
  totalCommits: number
  totalAuthors: number
  totalBranches: number
  dateRange: { start: Date; end: Date } | null
  mostActiveAuthor: string | null
  averageCommitsPerDay: number
}

export default function VersionHistoryTimeline() {
  const [selectedRepo, setSelectedRepo] = useKV<string | null>('timeline-selected-repo', null)
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [commits, setCommits] = useKV<CommitNode[]>('timeline-commits', [])
  const [repositories, setRepositories] = useKV<GitHubRepository[]>('user-repositories', [])
  const [branches, setBranches] = useState<GitHubBranch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'graph' | 'list'>('timeline')
  const timelineRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<SVGSVGElement>(null)

  const isAuthenticated = githubAPI.getAccessToken() !== null

  useEffect(() => {
    if (isAuthenticated && (repositories || []).length === 0) {
      loadRepositories()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedRepo && isAuthenticated) {
      loadBranches()
      loadCommits()
    }
  }, [selectedRepo])

  useEffect(() => {
    const filtered = getFilteredCommits()
    if (viewMode === 'graph' && filtered.length > 0) {
      renderCommitGraph()
    }
  }, [viewMode, commits, selectedBranch, filterAuthor, searchQuery, timeRange])

  const loadRepositories = async () => {
    try {
      setIsLoading(true)
      const repos = await githubAPI.listRepositories('updated')
      setRepositories(() => repos)
      
      if (repos.length > 0 && !selectedRepo) {
        setSelectedRepo(() => repos[0].full_name)
      }
      
      toast.success('Repositories loaded', { 
        description: `Found ${repos.length} repositories` 
      })
    } catch (error) {
      toast.error('Failed to load repositories', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadBranches = async () => {
    if (!selectedRepo) return

    try {
      const [owner, repo] = selectedRepo.split('/')
      const branchList = await githubAPI.listBranches(owner, repo)
      setBranches(branchList)
    } catch (error) {
      console.error('Failed to load branches:', error)
    }
  }

  const loadCommits = async () => {
    if (!selectedRepo) return

    try {
      setIsLoading(true)
      const [owner, repo] = selectedRepo.split('/')
      
      const branchesToFetch = selectedBranch === 'all' 
        ? branches.slice(0, 5).map(b => b.name)
        : [selectedBranch]

      const allCommits: CommitNode[] = []
      
      for (const branch of branchesToFetch.length > 0 ? branchesToFetch : ['main', 'master']) {
        try {
          const branchCommits = await githubAPI.listCommits(owner, repo, branch, 50)
          
          const processedCommits = branchCommits.map(commit => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            authorAvatar: commit.author?.avatar_url || null,
            date: new Date(commit.commit.author.date),
            branch: branch,
            htmlUrl: commit.html_url,
            parents: []
          }))
          
          allCommits.push(...processedCommits)
        } catch (error) {
          console.log(`Could not fetch commits for branch ${branch}`)
        }
      }

      const uniqueCommits = Array.from(
        new Map(allCommits.map(c => [c.sha, c])).values()
      ).sort((a, b) => b.date.getTime() - a.date.getTime())

      setCommits(() => uniqueCommits)
      
      toast.success('Commit history loaded', { 
        description: `${uniqueCommits.length} commits across ${branchesToFetch.length} branch(es)` 
      })
    } catch (error) {
      toast.error('Failed to load commits', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredCommits = () => {
    return (commits || []).filter(commit => {
      if (selectedBranch !== 'all' && commit.branch !== selectedBranch) return false
      if (filterAuthor !== 'all' && commit.author !== filterAuthor) return false
      if (searchQuery && !commit.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
      
      if (timeRange !== 'all') {
        const now = new Date()
        const commitDate = commit.date
        const daysDiff = Math.floor((now.getTime() - commitDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (timeRange === '7d' && daysDiff > 7) return false
        if (timeRange === '30d' && daysDiff > 30) return false
        if (timeRange === '90d' && daysDiff > 90) return false
      }
      
      return true
    })
  }

  const filteredCommits = getFilteredCommits()

  const stats: TimelineStats = (() => {
    const dateRange = filteredCommits.length > 0 ? {
      start: new Date(Math.min(...filteredCommits.map(c => c.date.getTime()))),
      end: new Date(Math.max(...filteredCommits.map(c => c.date.getTime())))
    } : null

    return {
      totalCommits: filteredCommits.length,
      totalAuthors: new Set(filteredCommits.map(c => c.author)).size,
      totalBranches: new Set(filteredCommits.map(c => c.branch)).size,
      dateRange,
      mostActiveAuthor: filteredCommits.length > 0 
        ? Object.entries(
            filteredCommits.reduce((acc, c) => {
              acc[c.author] = (acc[c.author] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1])[0][0]
        : null,
      averageCommitsPerDay: filteredCommits.length > 0 && dateRange
        ? filteredCommits.length / Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)))
        : 0
    }
  })()

  const uniqueAuthors = Array.from(new Set((commits || []).map(c => c.author))).sort()

  const renderCommitGraph = () => {
    if (!graphRef.current || filteredCommits.length === 0) return

    const svg = d3.select(graphRef.current)
    svg.selectAll('*').remove()

    const width = graphRef.current.clientWidth
    const height = Math.max(600, filteredCommits.length * 40)
    
    svg.attr('width', width).attr('height', height)

    const g = svg.append('g').attr('transform', 'translate(60, 40)')

    const xScale = d3.scaleTime()
      .domain([
        d3.min(filteredCommits, d => d.date) || new Date(),
        d3.max(filteredCommits, d => d.date) || new Date()
      ])
      .range([0, width - 120])

    const yScale = d3.scaleLinear()
      .domain([0, filteredCommits.length - 1])
      .range([0, height - 80])

    const branchColors = d3.scaleOrdinal(d3.schemeCategory10)

    filteredCommits.forEach((commit, i) => {
      const x = xScale(commit.date)
      const y = yScale(i)

      if (i > 0) {
        g.append('line')
          .attr('x1', xScale(filteredCommits[i - 1].date))
          .attr('y1', yScale(i - 1))
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', branchColors(commit.branch))
          .attr('stroke-width', 2)
          .attr('opacity', 0.6)
      }

      const commitGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .style('cursor', 'pointer')

      commitGroup.append('circle')
        .attr('r', 6)
        .attr('fill', branchColors(commit.branch))
        .attr('stroke', 'oklch(0.85 0.18 90)')
        .attr('stroke-width', 2)

      commitGroup.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .attr('fill', 'oklch(0.85 0.18 90)')
        .attr('font-size', '12px')
        .attr('font-family', 'Source Code Pro, monospace')
        .text(commit.message.substring(0, 60) + (commit.message.length > 60 ? '...' : ''))

      commitGroup.append('title')
        .text(`${commit.message}\n${commit.author} - ${commit.date.toLocaleString()}`)
    })

    const xAxis = d3.axisBottom(xScale).ticks(10)
    g.append('g')
      .attr('transform', `translate(0, ${height - 80})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'oklch(0.708 0 0)')
      .attr('font-family', 'Source Code Pro, monospace')
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="p-8 max-w-md text-center border-2 border-border/50 console-glow bg-card/80">
          <Info size={48} weight="fill" className="mx-auto mb-4 text-accent" />
          <h3 className="font-orbitron text-xl mb-2 text-accent-foreground">
            GitHub Authentication Required
          </h3>
          <p className="text-muted-foreground mb-4">
            Connect to GitHub in the GIT INTEGRATION tab to view version history timeline
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card/30">
      <div className="border-b-2 border-border/50 p-6 luxury-gradient">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GitCommit size={32} weight="fill" className="text-accent" />
            <div>
              <h2 className="font-orbitron text-2xl font-bold tracking-wide text-glow uppercase">
                Version History Timeline
              </h2>
              <p className="text-muted-foreground text-sm">
                Visualize commits across branches and time
              </p>
            </div>
          </div>
          <Button
            onClick={loadCommits}
            disabled={!selectedRepo || isLoading}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-orbitron"
          >
            <ArrowsClockwise size={18} weight="fill" className={cn(isLoading && 'animate-spin')} />
            REFRESH
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/60 border-accent/30">
            <div className="flex items-center gap-2 mb-1">
              <GitCommit size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Commits</span>
            </div>
            <p className="text-2xl font-bold text-accent font-mono">{stats.totalCommits}</p>
          </Card>

          <Card className="p-4 bg-card/60 border-accent/30">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Authors</span>
            </div>
            <p className="text-2xl font-bold text-accent font-mono">{stats.totalAuthors}</p>
          </Card>

          <Card className="p-4 bg-card/60 border-accent/30">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Branches</span>
            </div>
            <p className="text-2xl font-bold text-accent font-mono">{stats.totalBranches}</p>
          </Card>

          <Card className="p-4 bg-card/60 border-accent/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg/Day</span>
            </div>
            <p className="text-2xl font-bold text-accent font-mono">
              {stats.averageCommitsPerDay.toFixed(1)}
            </p>
          </Card>
        </div>
      </div>

      <div className="border-b border-border/50 p-4 bg-card/20">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedRepo || ''} onValueChange={(val) => setSelectedRepo(() => val)}>
              <SelectTrigger className="font-mono bg-card/60 border-border/50">
                <SelectValue placeholder="Select repository..." />
              </SelectTrigger>
              <SelectContent>
                {(repositories || []).map(repo => (
                  <SelectItem key={repo.id} value={repo.full_name} className="font-mono">
                    {repo.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="font-mono bg-card/60 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch.name} value={branch.name} className="font-mono">
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <Select value={filterAuthor} onValueChange={setFilterAuthor}>
              <SelectTrigger className="font-mono bg-card/60 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {uniqueAuthors.map(author => (
                  <SelectItem key={author} value={author} className="font-mono">
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[120px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="font-mono bg-card/60 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlass 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commits..."
                className="pl-10 font-mono bg-card/60 border-border/50"
              />
            </div>
          </div>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col">
        <div className="border-b border-border/50 px-4 bg-card/20">
          <TabsList className="bg-transparent">
            <TabsTrigger value="timeline" className="font-orbitron">
              <Clock size={16} className="mr-2" />
              TIMELINE
            </TabsTrigger>
            <TabsTrigger value="graph" className="font-orbitron">
              <GitMerge size={16} className="mr-2" />
              GRAPH
            </TabsTrigger>
            <TabsTrigger value="list" className="font-orbitron">
              <FileText size={16} className="mr-2" />
              LIST
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timeline" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-6" ref={timelineRef}>
              {filteredCommits.length === 0 ? (
                <div className="text-center py-12">
                  <GitCommit size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No commits found matching filters</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/50 to-transparent" />
                  
                  <AnimatePresence>
                    {filteredCommits.map((commit, index) => (
                      <motion.div
                        key={commit.sha}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="relative pl-20 pb-8 group"
                      >
                        <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-accent border-4 border-card console-glow-active group-hover:scale-125 transition-transform" />
                        
                        <Card className="p-4 border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:border-accent/50 console-glow">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {commit.authorAvatar && (
                                <img 
                                  src={commit.authorAvatar} 
                                  alt={commit.author}
                                  className="w-10 h-10 rounded-full border-2 border-accent/50"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">
                                  {commit.message.split('\n')[0]}
                                </h4>
                                {commit.message.split('\n').length > 1 && (
                                  <p className="text-sm text-muted-foreground">
                                    {commit.message.split('\n').slice(1).join(' ').substring(0, 100)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs border-accent/50 text-accent shrink-0">
                              {commit.branch}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User size={14} />
                              <span className="font-mono">{commit.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              <span>{formatDate(commit.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GitCommit size={14} />
                              <span className="font-mono text-xs">{commit.sha.substring(0, 7)}</span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs font-mono border-accent/30 hover:border-accent hover:bg-accent/10"
                              onClick={() => window.open(commit.htmlUrl, '_blank')}
                            >
                              View on GitHub
                              <ArrowRight size={12} className="ml-1" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="graph" className="flex-1 m-0 overflow-auto">
          <div className="p-6">
            {filteredCommits.length === 0 ? (
              <div className="text-center py-12">
                <GitMerge size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No commits to visualize</p>
              </div>
            ) : (
              <div className="bg-card/30 border border-border/50 rounded-lg p-4">
                <svg ref={graphRef} className="w-full" />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              {filteredCommits.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No commits found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCommits.map((commit, index) => (
                    <motion.div
                      key={commit.sha}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                    >
                      <Card className="p-3 border-border/50 bg-card/60 hover:bg-card/80 transition-all hover:border-accent/30">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {commit.authorAvatar && (
                              <img 
                                src={commit.authorAvatar} 
                                alt={commit.author}
                                className="w-8 h-8 rounded-full border border-accent/50 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{commit.message.split('\n')[0]}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="font-mono">{commit.author}</span>
                                <span>•</span>
                                <span>{formatDate(commit.date)}</span>
                                <span>•</span>
                                <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs border-accent/50 shrink-0">
                            {commit.branch}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
