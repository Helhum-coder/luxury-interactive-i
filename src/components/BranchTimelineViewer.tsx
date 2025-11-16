import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  GitBranch, 
  ArrowsClockwise, 
  Warning,
  CheckCircle,
  ArrowClockwise,
  Cube
} from '@phosphor-icons/react'
import CommitTimeline, { TimelineBranch, TimelineCommit } from './CommitTimeline'
import { githubAPI } from '@/lib/github-api'
import { GitHubRepository, GitHubCommit } from '@/lib/types'
import { generateMockTimelineData } from '@/lib/mock-timeline-data'

export default function BranchTimelineViewer() {
  const [githubToken] = useKV<string>('github-token', '')
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [branches, setBranches] = useState<TimelineBranch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [maxCommits, setMaxCommits] = useState<number>(30)
  const [demoMode, setDemoMode] = useState(false)

  const branchColors = [
    'oklch(0.85 0.18 90)',
    'oklch(0.75 0.15 85)',
    'oklch(0.35 0.15 300)',
    'oklch(0.65 0.20 180)',
    'oklch(0.70 0.18 270)',
    'oklch(0.60 0.22 350)',
    'oklch(0.80 0.16 120)',
    'oklch(0.55 0.22 25)',
  ]

  useEffect(() => {
    if (githubToken) {
      githubAPI.setAccessToken(githubToken)
      loadRepositories()
    }
  }, [githubToken])

  const loadRepositories = async () => {
    try {
      setIsLoading(true)
      setError('')
      const repos = await githubAPI.listRepositories('updated')
      setRepositories(repos)
      
      if (repos.length > 0 && !selectedRepo) {
        setSelectedRepo(`${repos[0].full_name}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
      toast.error('Failed to load repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBranchesAndCommits = async () => {
    if (!selectedRepo || !githubToken) return

    try {
      setIsLoading(true)
      setError('')
      
      const [owner, repo] = selectedRepo.split('/')
      
      const ghBranches = await githubAPI.listBranches(owner, repo)
      
      const timelineBranches: TimelineBranch[] = []
      
      for (let i = 0; i < Math.min(ghBranches.length, 8); i++) {
        const branch = ghBranches[i]
        const commits = await githubAPI.listCommits(owner, repo, branch.name, maxCommits)
        
        const timelineCommits: TimelineCommit[] = commits.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          authorAvatar: commit.author?.avatar_url,
          date: new Date(commit.commit.author.date),
          branch: branch.name,
          parents: [],
          isMerge: commit.commit.message.toLowerCase().includes('merge'),
          tags: []
        }))

        timelineBranches.push({
          name: branch.name,
          color: branchColors[i % branchColors.length],
          commits: timelineCommits,
        })
      }

      const sortedBranches = timelineBranches.sort((a, b) => {
        if (a.name === 'main' || a.name === 'master') return -1
        if (b.name === 'main' || b.name === 'master') return 1
        return 0
      })

      setBranches(sortedBranches)
      toast.success('Timeline loaded!', { 
        description: `${sortedBranches.length} branches with commit history` 
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branch timeline')
      toast.error('Failed to load branch timeline')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedRepo && githubToken) {
      loadBranchesAndCommits()
    }
  }, [selectedRepo, maxCommits])

  const handleCommitClick = (commit: TimelineCommit) => {
    toast.info('Commit selected', {
      description: `${commit.sha.substring(0, 7)} - ${commit.message.substring(0, 50)}...`
    })
  }

  const handleRefresh = () => {
    if (demoMode) {
      loadDemoData()
    } else if (selectedRepo) {
      loadBranchesAndCommits()
    } else {
      loadRepositories()
    }
  }

  const loadDemoData = () => {
    setIsLoading(true)
    setTimeout(() => {
      const mockData = generateMockTimelineData()
      setBranches(mockData)
      setDemoMode(true)
      setError('')
      setIsLoading(false)
      toast.success('Demo data loaded!', {
        description: `${mockData.length} mock branches with commit history`
      })
    }, 500)
  }

  if (!githubToken && !demoMode) {
    return (
      <Card className="h-full flex items-center justify-center border-2 border-border/50 bg-card/50">
        <CardContent className="text-center py-12">
          <div className="p-4 rounded-full luxury-gradient inline-block mb-4">
            <Warning size={48} weight="fill" className="text-accent" />
          </div>
          <CardTitle className="font-orbitron text-xl mb-2">
            GitHub Token Required
          </CardTitle>
          <p className="text-muted-foreground mb-4 font-mono text-sm">
            Please configure your GitHub token in the Git Integration tab
          </p>
          <Button
            onClick={loadDemoData}
            className="luxury-gradient font-orbitron"
          >
            <CheckCircle size={18} weight="fill" className="mr-2" />
            VIEW DEMO TIMELINE
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6">
      <Card className="border-2 border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg luxury-gradient">
                <GitBranch size={24} weight="fill" className="text-accent" />
              </div>
              <div>
                <CardTitle className="font-orbitron text-xl tracking-wider">
                  BRANCH TIMELINE VIEWER
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  Visualize commit history across branches
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {demoMode && (
                <Badge variant="outline" className="border-accent/50 text-accent font-orbitron">
                  DEMO MODE
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-accent/50 hover:bg-accent/20 font-orbitron"
              >
                <ArrowsClockwise size={16} weight="fill" className={isLoading ? 'animate-spin' : ''} />
                REFRESH
              </Button>
              {demoMode && githubToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDemoMode(false)
                    setBranches([])
                    loadRepositories()
                  }}
                  className="border-accent/50 hover:bg-accent/20 font-orbitron"
                >
                  USE REAL DATA
                </Button>
              )}
              {!demoMode && !githubToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDemoData}
                  className="border-accent/50 hover:bg-accent/20 font-orbitron"
                >
                  DEMO MODE
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!demoMode && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground font-mono mb-2 block">
                    Repository
                  </label>
                  <Select value={selectedRepo} onValueChange={setSelectedRepo} disabled={isLoading}>
                    <SelectTrigger className="bg-background/50 border-border/50 font-mono">
                      <SelectValue placeholder="Select a repository..." />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map(repo => (
                        <SelectItem key={repo.id} value={repo.full_name} className="font-mono">
                          <div className="flex items-center gap-2">
                            <Cube size={14} />
                            {repo.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-mono mb-2 block">
                    Max Commits per Branch
                  </label>
                  <Select 
                    value={maxCommits.toString()} 
                    onValueChange={(val) => setMaxCommits(parseInt(val))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-background/50 border-border/50 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 commits</SelectItem>
                      <SelectItem value="20">20 commits</SelectItem>
                      <SelectItem value="30">30 commits</SelectItem>
                      <SelectItem value="50">50 commits</SelectItem>
                      <SelectItem value="100">100 commits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/50">
              <Warning size={16} weight="fill" />
              <AlertDescription className="font-mono text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {branches.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">Branches:</span>
              {branches.map((branch, i) => (
                <Badge 
                  key={i}
                  variant="outline"
                  className="font-mono"
                  style={{ 
                    borderColor: branch.color,
                    color: branch.color,
                    backgroundColor: `${branch.color}20`
                  }}
                >
                  <GitBranch size={12} weight="fill" className="mr-1" />
                  {branch.name} ({branch.commits.length})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="flex-1 border-2 border-border/50 bg-card/50">
          <CardContent className="h-full flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <ArrowClockwise size={48} weight="fill" className="text-accent animate-spin mx-auto" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-64 mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-4 w-56 mx-auto" />
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                Loading branch timeline...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : branches.length > 0 ? (
        <CommitTimeline 
          branches={branches}
          maxCommits={maxCommits}
          onCommitClick={handleCommitClick}
          className="flex-1"
        />
      ) : (
        <Card className="flex-1 border-2 border-border/50 bg-card/50">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="p-4 rounded-full bg-muted/30 inline-block mb-4">
                <GitBranch size={48} className="text-muted-foreground" />
              </div>
              <CardTitle className="font-orbitron text-lg mb-2 text-muted-foreground">
                No Timeline Data
              </CardTitle>
              <p className="text-muted-foreground font-mono text-sm">
                Select a repository to view branch timeline
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
