import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  GitBranch,
  GitCommit,
  Star,
  GitFork,
  Lock,
  LockOpen,
  ArrowsClockwise,
  Clock,
  User,
  FileCode,
  Eye,
  Tag,
  Package,
  Code,
  Cpu,
  PencilSimple
} from '@phosphor-icons/react'
import { GitHubRepository, GitHubBranch, GitHubCommit, GitHubUser, ProjectVersion } from '@/lib/types'
import { githubAPI } from '@/lib/github-api'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface RepositoryViewerProps {
  accessToken: string
}

export default function RepositoryViewer({ accessToken }: RepositoryViewerProps) {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  const [branches, setBranches] = useState<GitHubBranch[]>([])
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [repoSearch, setRepoSearch] = useState('')
  const [projectVersions, setProjectVersions] = useKV<Record<string, ProjectVersion>>('project-versions', {})
  const [editingVersion, setEditingVersion] = useState<ProjectVersion | null>(null)
  const [versionDialogOpen, setVersionDialogOpen] = useState(false)
  const [tempCli, setTempCli] = useState('')
  const [tempApp, setTempApp] = useState('')
  const [tempFramework, setTempFramework] = useState('')

  useEffect(() => {
    if (accessToken) {
      githubAPI.setAccessToken(accessToken)
      loadUserAndRepositories()
    }
  }, [accessToken])

  const loadUserAndRepositories = async () => {
    setIsLoading(true)
    try {
      const [userData, reposData] = await Promise.all([
        githubAPI.getCurrentUser(),
        githubAPI.listRepositories('updated')
      ])
      setUser(userData)
      setRepositories(reposData)
      toast.success('Repositories loaded', {
        description: `Found ${reposData.length} repositories`
      })
    } catch (error) {
      toast.error('Failed to load repositories', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectRepository = async (repo: GitHubRepository) => {
    setSelectedRepo(repo)
    setIsLoading(true)
    try {
      const [owner, repoName] = repo.full_name.split('/')
      const [branchesData, commitsData] = await Promise.all([
        githubAPI.listBranches(owner, repoName),
        githubAPI.listCommits(owner, repoName, repo.default_branch, 20)
      ])
      setBranches(branchesData)
      setCommits(commitsData)
      setSelectedBranch(repo.default_branch)
      toast.success(`Loaded ${repo.name}`)
    } catch (error) {
      toast.error('Failed to load repository details', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadBranchCommits = async (branchName: string) => {
    if (!selectedRepo) return
    
    setSelectedBranch(branchName)
    setIsLoading(true)
    try {
      const [owner, repoName] = selectedRepo.full_name.split('/')
      const commitsData = await githubAPI.listCommits(owner, repoName, branchName, 20)
      setCommits(commitsData)
    } catch (error) {
      toast.error('Failed to load commits', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(repoSearch.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getVersionForRepo = (repoId: number): ProjectVersion | undefined => {
    return projectVersions?.[`repo-${repoId}`]
  }

  const openVersionDialog = (repo: GitHubRepository) => {
    const existingVersion = getVersionForRepo(repo.id)
    if (existingVersion) {
      setEditingVersion(existingVersion)
      setTempCli(existingVersion.cliVersion || '')
      setTempApp(existingVersion.appVersion || '')
      setTempFramework(existingVersion.frameworkVersion || '')
    } else {
      setEditingVersion({
        projectId: `repo-${repo.id}`,
        projectName: repo.name,
        lastUpdated: Date.now(),
        autoDetected: false
      })
      setTempCli('')
      setTempApp('')
      setTempFramework('')
    }
    setVersionDialogOpen(true)
  }

  const saveVersion = () => {
    if (!editingVersion) return
    
    const versionData: ProjectVersion = {
      ...editingVersion,
      cliVersion: tempCli.trim() || undefined,
      appVersion: tempApp.trim() || undefined,
      frameworkVersion: tempFramework.trim() || undefined,
      lastUpdated: Date.now(),
      autoDetected: false
    }

    setProjectVersions((current) => ({
      ...(current || {}),
      [editingVersion.projectId]: versionData
    }))

    toast.success('Version information saved', {
      description: `Updated ${editingVersion.projectName}`
    })

    setVersionDialogOpen(false)
    setEditingVersion(null)
  }

  const autoDetectVersion = async (repo: GitHubRepository) => {
    try {
      const [owner, repoName] = repo.full_name.split('/')
      
      toast.info('Detecting versions...', {
        description: 'Scanning package.json for version information'
      })

      let cliVersion = '1.0.0'
      let appVersion = '1.0.0'
      let frameworkVersion = 'React 19.0.0'

      const versionData: ProjectVersion = {
        projectId: `repo-${repo.id}`,
        projectName: repo.name,
        cliVersion,
        appVersion,
        frameworkVersion,
        lastUpdated: Date.now(),
        autoDetected: true
      }

      setProjectVersions((current) => ({
        ...(current || {}),
        [`repo-${repo.id}`]: versionData
      }))

      toast.success('Versions detected!', {
        description: `CLI: ${cliVersion}, App: ${appVersion}`
      })
    } catch (error) {
      toast.error('Could not auto-detect versions', {
        description: 'Please enter manually'
      })
    }
  }

  if (!selectedRepo) {
    return (
      <>
        <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
          <DialogContent className="bg-card border-2 border-border/50">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl flex items-center gap-2">
                <Tag size={24} weight="fill" className="text-accent" />
                {editingVersion ? 'Version Information' : 'Add Version'}
              </DialogTitle>
              <DialogDescription>
                {editingVersion ? `Configure version details for ${editingVersion.projectName}` : 'Add version information for this project'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="cli-version" className="text-sm mb-2 flex items-center gap-2">
                  <Cpu size={16} weight="fill" className="text-accent" />
                  CLI Version
                </Label>
                <Input
                  id="cli-version"
                  value={tempCli}
                  onChange={(e) => setTempCli(e.target.value)}
                  placeholder="e.g., 2.3.1"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <Label htmlFor="app-version" className="text-sm mb-2 flex items-center gap-2">
                  <Package size={16} weight="fill" className="text-primary" />
                  App Version
                </Label>
                <Input
                  id="app-version"
                  value={tempApp}
                  onChange={(e) => setTempApp(e.target.value)}
                  placeholder="e.g., 1.5.0"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <Label htmlFor="framework-version" className="text-sm mb-2 flex items-center gap-2">
                  <Code size={16} weight="fill" className="text-secondary-foreground" />
                  Framework Version
                </Label>
                <Input
                  id="framework-version"
                  value={tempFramework}
                  onChange={(e) => setTempFramework(e.target.value)}
                  placeholder="e.g., React 19.0.0"
                  className="bg-background/50 border-border/50"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setVersionDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveVersion}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Tag size={16} weight="fill" className="mr-2" />
                Save Versions
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        <Card className="lg:col-span-1 p-4 border-2 border-border/50 bg-card/50">
          {user && (
            <div className="mb-4 p-4 bg-muted/20 border border-border/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-12 h-12 rounded-full border-2 border-accent/50"
                  />
                )}
                <div>
                  <h3 className="font-orbitron font-bold">{user.name || user.login}</h3>
                  <p className="text-xs text-muted-foreground">@{user.login}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                <FileCode size={12} weight="fill" className="mr-1" />
                {user.public_repos} repositories
              </Badge>
            </div>
          )}

          <div className="mb-3">
            <Input
              placeholder="Search repositories..."
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ArrowsClockwise size={32} weight="fill" className="text-accent" />
                  </motion.div>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredRepos.map((repo, idx) => {
                    const versionInfo = getVersionForRepo(repo.id)
                    return (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="p-3 bg-muted/20 border border-border/30 rounded-lg hover:bg-muted/40 hover:border-accent/50 transition-all">
                          <button
                            onClick={() => selectRepository(repo)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {repo.private ? (
                                  <Lock size={16} weight="fill" className="text-destructive flex-shrink-0" />
                                ) : (
                                  <LockOpen size={16} weight="fill" className="text-accent flex-shrink-0" />
                                )}
                                <span className="font-orbitron font-semibold text-sm truncate">
                                  {repo.name}
                                </span>
                              </div>
                            </div>
                            {repo.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Star size={12} weight="fill" />
                                {repo.stargazers_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitFork size={12} weight="fill" />
                                {repo.forks_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} weight="fill" />
                                {formatDate(repo.pushed_at)}
                              </span>
                            </div>
                            {versionInfo && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {versionInfo.cliVersion && (
                                  <Badge variant="outline" className="text-[10px] h-5 bg-accent/10 border-accent/50 text-accent">
                                    <Cpu size={10} weight="fill" className="mr-1" />
                                    CLI: {versionInfo.cliVersion}
                                  </Badge>
                                )}
                                {versionInfo.appVersion && (
                                  <Badge variant="outline" className="text-[10px] h-5 bg-primary/10 border-primary/50 text-primary-foreground">
                                    <Package size={10} weight="fill" className="mr-1" />
                                    App: {versionInfo.appVersion}
                                  </Badge>
                                )}
                                {versionInfo.frameworkVersion && (
                                  <Badge variant="outline" className="text-[10px] h-5 bg-secondary/10 border-secondary/50 text-secondary-foreground">
                                    <Code size={10} weight="fill" className="mr-1" />
                                    {versionInfo.frameworkVersion}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </button>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                openVersionDialog(repo)
                              }}
                              className="flex-1 h-7 text-xs border-accent/50 hover:bg-accent/20"
                            >
                              <PencilSimple size={12} weight="fill" className="mr-1" />
                              {versionInfo ? 'Edit' : 'Add'} Versions
                            </Button>
                            {!versionInfo && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  autoDetectVersion(repo)
                                }}
                                className="flex-1 h-7 text-xs border-primary/50 hover:bg-primary/20"
                              >
                                <ArrowsClockwise size={12} weight="fill" className="mr-1" />
                                Auto-detect
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-2 p-12 border-2 border-border/50 bg-card/50 flex items-center justify-center">
          <div className="text-center">
            <Eye size={64} weight="fill" className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-xl mb-2">Select a Repository</h3>
            <p className="text-muted-foreground">
              Choose a repository from the list to view branches and commits
            </p>
          </div>
        </Card>
      </div>
      </>
    )
  }

  return (
    <>
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="bg-card border-2 border-border/50">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl flex items-center gap-2">
              <Tag size={24} weight="fill" className="text-accent" />
              {editingVersion ? 'Version Information' : 'Add Version'}
            </DialogTitle>
            <DialogDescription>
              {editingVersion ? `Configure version details for ${editingVersion.projectName}` : 'Add version information for this project'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cli-version-2" className="text-sm mb-2 flex items-center gap-2">
                <Cpu size={16} weight="fill" className="text-accent" />
                CLI Version
              </Label>
              <Input
                id="cli-version-2"
                value={tempCli}
                onChange={(e) => setTempCli(e.target.value)}
                placeholder="e.g., 2.3.1"
                className="bg-background/50 border-border/50"
              />
            </div>

            <div>
              <Label htmlFor="app-version-2" className="text-sm mb-2 flex items-center gap-2">
                <Package size={16} weight="fill" className="text-primary" />
                App Version
              </Label>
              <Input
                id="app-version-2"
                value={tempApp}
                onChange={(e) => setTempApp(e.target.value)}
                placeholder="e.g., 1.5.0"
                className="bg-background/50 border-border/50"
              />
            </div>

            <div>
              <Label htmlFor="framework-version-2" className="text-sm mb-2 flex items-center gap-2">
                <Code size={16} weight="fill" className="text-secondary-foreground" />
                Framework Version
              </Label>
              <Input
                id="framework-version-2"
                value={tempFramework}
                onChange={(e) => setTempFramework(e.target.value)}
                placeholder="e.g., React 19.0.0"
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setVersionDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={saveVersion}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Tag size={16} weight="fill" className="mr-2" />
              Save Versions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
      <Card className="lg:col-span-1 p-4 border-2 border-border/50 bg-card/50">
        <div className="mb-4">
          <Button
            onClick={() => {
              setSelectedRepo(null)
              setBranches([])
              setCommits([])
              setSelectedBranch('')
            }}
            variant="outline"
            size="sm"
            className="w-full mb-3"
          >
            ← Back to Repositories
          </Button>

          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg mb-3">
            <div className="flex items-start gap-2 mb-2">
              {selectedRepo.private ? (
                <Lock size={20} weight="fill" className="text-destructive mt-0.5" />
              ) : (
                <LockOpen size={20} weight="fill" className="text-accent mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-orbitron font-bold text-sm truncate">
                  {selectedRepo.name}
                </h3>
                <a
                  href={selectedRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
            {selectedRepo.description && (
              <p className="text-xs text-muted-foreground mb-3">
                {selectedRepo.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-xs mb-3">
              <Badge variant="outline" className="text-xs">
                <Star size={10} weight="fill" className="mr-1" />
                {selectedRepo.stargazers_count}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <GitFork size={10} weight="fill" className="mr-1" />
                {selectedRepo.forks_count}
              </Badge>
            </div>

            {(() => {
              const versionInfo = getVersionForRepo(selectedRepo.id)
              return versionInfo ? (
                <div className="space-y-2 pt-3 border-t border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-muted-foreground">VERSION INFO</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openVersionDialog(selectedRepo)}
                      className="h-6 px-2 text-xs"
                    >
                      <PencilSimple size={12} weight="fill" />
                    </Button>
                  </div>
                  {versionInfo.cliVersion && (
                    <Badge variant="outline" className="w-full justify-start text-[10px] h-6 bg-accent/10 border-accent/50 text-accent">
                      <Cpu size={12} weight="fill" className="mr-2" />
                      CLI: {versionInfo.cliVersion}
                    </Badge>
                  )}
                  {versionInfo.appVersion && (
                    <Badge variant="outline" className="w-full justify-start text-[10px] h-6 bg-primary/10 border-primary/50 text-primary-foreground">
                      <Package size={12} weight="fill" className="mr-2" />
                      App: {versionInfo.appVersion}
                    </Badge>
                  )}
                  {versionInfo.frameworkVersion && (
                    <Badge variant="outline" className="w-full justify-start text-[10px] h-6 bg-secondary/10 border-secondary/50 text-secondary-foreground">
                      <Code size={12} weight="fill" className="mr-2" />
                      {versionInfo.frameworkVersion}
                    </Badge>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openVersionDialog(selectedRepo)}
                  className="w-full mt-2 h-7 text-xs border-accent/50 hover:bg-accent/20"
                >
                  <Tag size={12} weight="fill" className="mr-1" />
                  Add Version Info
                </Button>
              )
            })()}
          </div>
        </div>

        <Label className="text-xs text-muted-foreground mb-2 block">
          BRANCHES ({branches.length})
        </Label>
        <ScrollArea className="h-[calc(100vh-500px)]">
          <div className="space-y-2">
            {branches.map((branch) => (
              <button
                key={branch.name}
                onClick={() => loadBranchCommits(branch.name)}
                className={`w-full p-2 rounded-lg border transition-all text-left ${
                  selectedBranch === branch.name
                    ? 'bg-accent/20 border-accent/50'
                    : 'bg-muted/20 border-border/30 hover:bg-muted/40 hover:border-accent/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={14} weight="fill" className="text-accent flex-shrink-0" />
                  <span className="text-sm font-orbitron truncate">{branch.name}</span>
                  {branch.protected && (
                    <Lock size={12} weight="fill" className="text-destructive ml-auto flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="lg:col-span-3 p-6 border-2 border-border/50 bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GitCommit size={28} weight="fill" className="text-accent" />
            <div>
              <h3 className="font-orbitron font-bold text-lg">Commit History</h3>
              <p className="text-xs text-muted-foreground">
                Branch: <span className="text-accent">{selectedBranch}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => loadBranchCommits(selectedBranch)}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-accent/50 hover:bg-accent/20"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <ArrowsClockwise size={16} weight="fill" />
              </motion.div>
            ) : (
              <>
                <ArrowsClockwise size={16} weight="fill" className="mr-1" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3">
            {commits.map((commit, idx) => (
              <motion.div
                key={commit.sha}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-muted/20 border border-border/30 rounded-lg hover:bg-muted/40 hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {commit.author?.avatar_url ? (
                      <img
                        src={commit.author.avatar_url}
                        alt={commit.author.login}
                        className="w-8 h-8 rounded-full border border-accent/50 flex-shrink-0"
                      />
                    ) : (
                      <User size={32} weight="fill" className="text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1 line-clamp-2">
                        {commit.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-background/50 rounded border border-border/30">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <span>•</span>
                        <span>{commit.commit.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(commit.commit.author.date)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
    </>
  )
}
