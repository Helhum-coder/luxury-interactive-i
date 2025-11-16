import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GitCommit,
  GitDiff,
  FileCode,
  Plus,
  Minus,
  ArrowsLeftRight,
  Sparkle,
  Lightning,
  CheckCircle,
  XCircle,
  File,
  FilePlus,
  FileMinus,
  FileText,
  ArrowRight,
  ChartBar,
  Code,
  CircleNotch,
  MagnifyingGlass,
  Calendar,
  User,
  Hash
} from '@phosphor-icons/react'
import { githubAPI } from '@/lib/github-api'
import { GitHubRepository, GitHubCommit, CommitComparison, CommitFileChange } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function CommitComparisonTool() {
  const [githubToken] = useKV<string | null>('github-access-token', null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [baseCommit, setBaseCommit] = useState<string>('')
  const [headCommit, setHeadCommit] = useState<string>('')
  const [comparison, setComparison] = useState<CommitComparison | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [loadingCommits, setLoadingCommits] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [comparisonHistory, setComparisonHistory] = useKV<Array<{
    id: string
    repo: string
    base: string
    head: string
    timestamp: number
  }>>('comparison-history', [])

  useEffect(() => {
    if (githubToken) {
      githubAPI.setAccessToken(githubToken)
      loadRepositories()
    }
  }, [githubToken])

  useEffect(() => {
    if (selectedRepo) {
      loadCommits()
    }
  }, [selectedRepo])

  const loadRepositories = async () => {
    if (!githubToken) {
      toast.error('GitHub authentication required')
      return
    }

    setLoadingRepos(true)
    try {
      const repos = await githubAPI.listRepositories('updated')
      setRepositories(repos)
      toast.success(`Loaded ${repos.length} repositories`)
    } catch (error) {
      toast.error('Failed to load repositories')
      console.error(error)
    } finally {
      setLoadingRepos(false)
    }
  }

  const loadCommits = async () => {
    if (!selectedRepo) return

    setLoadingCommits(true)
    try {
      const [owner, repo] = selectedRepo.full_name.split('/')
      const commitList = await githubAPI.listCommits(owner, repo, undefined, 100)
      setCommits(commitList)
      
      if (commitList.length >= 2) {
        setHeadCommit(commitList[0].sha)
        setBaseCommit(commitList[1].sha)
      }
    } catch (error) {
      toast.error('Failed to load commits')
      console.error(error)
    } finally {
      setLoadingCommits(false)
    }
  }

  const compareCommits = async () => {
    if (!selectedRepo || !baseCommit || !headCommit) {
      toast.error('Please select repository and commits')
      return
    }

    setIsLoading(true)
    try {
      const [owner, repo] = selectedRepo.full_name.split('/')
      const result = await githubAPI.compareCommits(owner, repo, baseCommit, headCommit)

      const baseCommitDetails = await githubAPI.getCommit(owner, repo, baseCommit)
      const headCommitDetails = await githubAPI.getCommit(owner, repo, headCommit)

      const comparisonData: CommitComparison = {
        baseCommit: baseCommitDetails,
        headCommit: headCommitDetails,
        files: result.files.map(file => ({
          filename: file.filename,
          status: file.status as any,
          additions: file.additions,
          deletions: file.deletions,
          changes: file.changes,
          patch: file.patch,
          previous_filename: file.previous_filename,
          blob_url: file.blob_url,
          raw_url: file.raw_url
        })),
        stats: {
          total_additions: result.stats.additions,
          total_deletions: result.stats.deletions,
          total_changes: result.stats.total,
          files_changed: result.files.length,
          commits_count: result.commits.length
        },
        ahead_by: result.ahead_by,
        behind_by: result.behind_by,
        merge_base_commit: result.merge_base_commit?.sha
      }

      setComparison(comparisonData)

      const historyEntry = {
        id: `cmp-${Date.now()}`,
        repo: selectedRepo.full_name,
        base: baseCommit.substring(0, 7),
        head: headCommit.substring(0, 7),
        timestamp: Date.now()
      }
      setComparisonHistory(prev => [historyEntry, ...(prev || [])].slice(0, 20))

      toast.success('Comparison complete!', {
        description: `${result.files.length} files changed, ${result.commits.length} commits`
      })
    } catch (error) {
      toast.error('Failed to compare commits')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <FilePlus className="text-green-500" size={18} weight="fill" />
      case 'removed':
        return <FileMinus className="text-red-500" size={18} weight="fill" />
      case 'modified':
        return <FileText className="text-yellow-500" size={18} weight="fill" />
      case 'renamed':
        return <ArrowsLeftRight className="text-blue-500" size={18} weight="fill" />
      default:
        return <File className="text-muted-foreground" size={18} />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      added: { variant: 'outline', className: 'border-green-500/50 text-green-500' },
      removed: { variant: 'outline', className: 'border-red-500/50 text-red-500' },
      modified: { variant: 'outline', className: 'border-yellow-500/50 text-yellow-500' },
      renamed: { variant: 'outline', className: 'border-blue-500/50 text-blue-500' }
    }
    const config = variants[status] || { variant: 'outline', className: '' }
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const parseDiff = (patch: string | undefined) => {
    if (!patch) return []
    
    const lines = patch.split('\n')
    return lines.map((line, idx) => ({
      key: idx,
      type: line.startsWith('+') ? 'addition' : line.startsWith('-') ? 'deletion' : 'context',
      content: line
    }))
  }

  const filteredCommits = commits.filter(commit =>
    commit.sha.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    commit.commit.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!githubToken) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="p-8 max-w-md text-center border-border/50 bg-card/50">
          <GitDiff size={48} weight="fill" className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-orbitron font-bold mb-2">GitHub Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            Please authenticate with GitHub in the Git Integration tab to use commit comparison
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/50 luxury-gradient">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <GitDiff size={32} weight="fill" className="text-accent" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-glow">COMMIT COMPARISON</h2>
              <p className="text-sm text-muted-foreground">Analyze differences between commits</p>
            </div>
          </div>
          <Button
            onClick={loadRepositories}
            disabled={loadingRepos}
            variant="outline"
            className="border-accent/50 hover:bg-accent/20"
          >
            {loadingRepos ? (
              <CircleNotch size={18} className="animate-spin mr-2" />
            ) : (
              <Lightning size={18} weight="fill" className="mr-2" />
            )}
            Refresh Repos
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
          <Card className="border-border/50 bg-card/30 p-4 flex flex-col">
            <h3 className="text-lg font-orbitron font-bold mb-4 flex items-center gap-2">
              <Sparkle size={20} weight="fill" className="text-accent" />
              REPOSITORY & COMMITS
            </h3>

            <div className="space-y-4 flex-1 flex flex-col">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Repository</Label>
                <Select
                  value={selectedRepo?.full_name}
                  onValueChange={(value) => {
                    const repo = repositories.find(r => r.full_name === value)
                    setSelectedRepo(repo || null)
                    setComparison(null)
                  }}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select repository..." />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo) => (
                      <SelectItem key={repo.id} value={repo.full_name}>
                        {repo.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRepo && (
                <>
                  <div className="relative">
                    <MagnifyingGlass
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="Search commits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Base Commit (older)</Label>
                    <Select value={baseCommit} onValueChange={setBaseCommit}>
                      <SelectTrigger className="bg-background/50 border-border/50 font-mono text-xs">
                        <SelectValue placeholder="Select base commit..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCommits.map((commit) => (
                          <SelectItem key={commit.sha} value={commit.sha} className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-accent">{commit.sha.substring(0, 7)}</span>
                              <span className="text-muted-foreground truncate max-w-[200px]">
                                {commit.commit.message.split('\n')[0]}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-center py-2">
                    <ArrowRight size={24} weight="bold" className="text-accent" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Head Commit (newer)</Label>
                    <Select value={headCommit} onValueChange={setHeadCommit}>
                      <SelectTrigger className="bg-background/50 border-border/50 font-mono text-xs">
                        <SelectValue placeholder="Select head commit..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCommits.map((commit) => (
                          <SelectItem key={commit.sha} value={commit.sha} className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-accent">{commit.sha.substring(0, 7)}</span>
                              <span className="text-muted-foreground truncate max-w-[200px]">
                                {commit.commit.message.split('\n')[0]}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={compareCommits}
                    disabled={isLoading || !baseCommit || !headCommit}
                    className="w-full gold-gradient text-primary font-orbitron font-bold"
                  >
                    {isLoading ? (
                      <>
                        <CircleNotch size={18} className="animate-spin mr-2" />
                        COMPARING...
                      </>
                    ) : (
                      <>
                        <GitDiff size={18} weight="fill" className="mr-2" />
                        COMPARE COMMITS
                      </>
                    )}
                  </Button>
                </>
              )}

              {loadingCommits && (
                <div className="flex items-center justify-center py-8">
                  <CircleNotch size={32} className="animate-spin text-accent" />
                </div>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 border-border/50 bg-card/30 p-4 flex flex-col overflow-hidden">
            {comparison ? (
              <Tabs defaultValue="summary" className="h-full flex flex-col">
                <TabsList className="bg-background/50 mb-4">
                  <TabsTrigger value="summary">
                    <ChartBar size={16} weight="fill" className="mr-2" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    <File size={16} weight="fill" className="mr-2" />
                    Files ({comparison.files.length})
                  </TabsTrigger>
                  <TabsTrigger value="diff">
                    <Code size={16} weight="fill" className="mr-2" />
                    Diff View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 bg-background/30 border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash size={16} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">BASE COMMIT</span>
                          </div>
                          <div className="font-mono text-sm text-accent mb-2">
                            {comparison.baseCommit.sha.substring(0, 7)}
                          </div>
                          <div className="text-xs text-foreground mb-2">
                            {comparison.baseCommit.commit.message.split('\n')[0]}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User size={14} />
                            {comparison.baseCommit.commit.author.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar size={14} />
                            {new Date(comparison.baseCommit.commit.author.date).toLocaleDateString()}
                          </div>
                        </Card>

                        <Card className="p-4 bg-background/30 border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash size={16} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">HEAD COMMIT</span>
                          </div>
                          <div className="font-mono text-sm text-accent mb-2">
                            {comparison.headCommit.sha.substring(0, 7)}
                          </div>
                          <div className="text-xs text-foreground mb-2">
                            {comparison.headCommit.commit.message.split('\n')[0]}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User size={14} />
                            {comparison.headCommit.commit.author.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar size={14} />
                            {new Date(comparison.headCommit.commit.author.date).toLocaleDateString()}
                          </div>
                        </Card>
                      </div>

                      <Card className="p-4 bg-background/30 border-border/30">
                        <h4 className="text-sm font-orbitron font-bold mb-3 flex items-center gap-2">
                          <ChartBar size={18} weight="fill" className="text-accent" />
                          STATISTICS
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-green-500">
                              +{comparison.stats.total_additions}
                            </div>
                            <div className="text-xs text-muted-foreground">Additions</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-500">
                              -{comparison.stats.total_deletions}
                            </div>
                            <div className="text-xs text-muted-foreground">Deletions</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-accent">
                              {comparison.stats.files_changed}
                            </div>
                            <div className="text-xs text-muted-foreground">Files Changed</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-accent">
                              {comparison.stats.commits_count}
                            </div>
                            <div className="text-xs text-muted-foreground">Commits</div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-background rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${(comparison.stats.total_additions / (comparison.stats.total_additions + comparison.stats.total_deletions)) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-20 text-right">
                              {((comparison.stats.total_additions / (comparison.stats.total_additions + comparison.stats.total_deletions)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 bg-background/30 border-border/30">
                        <h4 className="text-sm font-orbitron font-bold mb-3">FILE CHANGES SUMMARY</h4>
                        <div className="space-y-2">
                          {['added', 'modified', 'removed', 'renamed'].map(status => {
                            const count = comparison.files.filter(f => f.status === status).length
                            if (count === 0) return null
                            return (
                              <div key={status} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status)}
                                  <span className="capitalize">{status}</span>
                                </div>
                                <Badge variant="outline" className="font-mono">
                                  {count}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="files" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 pr-4">
                      {comparison.files.map((file, idx) => (
                        <motion.div
                          key={file.filename}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                        >
                          <Card className="p-3 bg-background/30 border-border/30 hover:border-accent/50 transition-colors">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(file.status)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <code className="text-sm font-mono text-foreground truncate">
                                    {file.filename}
                                  </code>
                                  {getStatusBadge(file.status)}
                                </div>
                                {file.previous_filename && (
                                  <div className="text-xs text-muted-foreground mb-1">
                                    renamed from: {file.previous_filename}
                                  </div>
                                )}
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-green-500 flex items-center gap-1">
                                    <Plus size={12} weight="bold" />
                                    {file.additions}
                                  </span>
                                  <span className="text-red-500 flex items-center gap-1">
                                    <Minus size={12} weight="bold" />
                                    {file.deletions}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {file.changes} changes
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="diff" className="flex-1 overflow-hidden m-0">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                      {comparison.files.map((file) => (
                        <Card key={file.filename} className="bg-background/30 border-border/30 overflow-hidden">
                          <div className="p-3 bg-background/50 border-b border-border/30">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(file.status)}
                              <code className="text-sm font-mono text-foreground">
                                {file.filename}
                              </code>
                              {getStatusBadge(file.status)}
                            </div>
                          </div>
                          {file.patch ? (
                            <div className="font-mono text-xs">
                              {parseDiff(file.patch).map((line) => (
                                <div
                                  key={line.key}
                                  className={cn(
                                    'px-3 py-0.5 whitespace-pre',
                                    line.type === 'addition' && 'bg-green-500/10 text-green-500',
                                    line.type === 'deletion' && 'bg-red-500/10 text-red-500',
                                    line.type === 'context' && 'text-muted-foreground'
                                  )}
                                >
                                  {line.content}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              Binary file or no diff available
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <GitDiff size={64} weight="thin" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-orbitron font-bold mb-2">No Comparison Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a repository and two commits to compare
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
