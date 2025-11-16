import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  GitBranch,
  LinkSimple,
  Eye,
  EyeSlash,
  Plugs,
  ListChecks,
  User,
  Buildings,
  Folder
} from '@phosphor-icons/react'
import { apiManager } from '@/lib/api-manager'
import { createLinearClient, LinearIssue, LinearTeam } from '@/lib/linear-api'

export default function APIIntegrationManager() {
  const [githubToken, setGithubToken] = useState('')
  const [linearKey, setLinearKey] = useState('')
  const [showGithubToken, setShowGithubToken] = useState(false)
  const [showLinearKey, setShowLinearKey] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  const [linearConnected, setLinearConnected] = useState(false)
  const [testing, setTesting] = useState(false)
  const [githubUser, setGithubUser] = useState<any>(null)
  const [githubRepos, setGithubRepos] = useState<any[]>([])
  const [linearTeams, setLinearTeams] = useState<LinearTeam[]>([])
  const [linearIssues, setLinearIssues] = useState<LinearIssue[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [loadingLinear, setLoadingLinear] = useState(false)

  const [storedGithubToken] = useKV<string>('secure-github-token', '')
  const [storedLinearKey] = useKV<string>('secure-linear-key', '')

  useEffect(() => {
    if (storedGithubToken) {
      apiManager.setGitHubToken(storedGithubToken)
      setGithubConnected(true)
      loadGitHubData()
    }
    if (storedLinearKey) {
      apiManager.setLinearKey(storedLinearKey)
      setLinearConnected(true)
      loadLinearData()
    }
  }, [storedGithubToken, storedLinearKey])

  const loadGitHubData = async () => {
    try {
      const result = await apiManager.testGitHubConnection()
      if (result.success && result.user) {
        setGithubUser(result.user)
      }
    } catch (error) {
      console.error('Failed to load GitHub data:', error)
    }
  }

  const loadLinearData = async () => {
    if (!apiManager.hasLinearCredentials()) return
    
    try {
      const client = createLinearClient(apiManager.getLinearKey()!)
      const teams = await client.getTeams()
      setLinearTeams(teams)
    } catch (error) {
      console.error('Failed to load Linear data:', error)
    }
  }

  const handleConnectGitHub = async () => {
    if (!githubToken.trim()) {
      toast.error('Please enter a GitHub token')
      return
    }

    setTesting(true)
    try {
      apiManager.setGitHubToken(githubToken.trim())
      const result = await apiManager.testGitHubConnection()

      if (result.success) {
        setGithubConnected(true)
        setGithubUser(result.user)
        toast.success('GitHub connected successfully!', {
          description: `Welcome, ${result.user?.name || result.user?.login}!`
        })
        setGithubToken('')
      } else {
        toast.error('Failed to connect to GitHub', {
          description: result.error
        })
      }
    } catch (error) {
      toast.error('Connection failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleConnectLinear = async () => {
    if (!linearKey.trim()) {
      toast.error('Please enter a Linear API key')
      return
    }

    setTesting(true)
    try {
      apiManager.setLinearKey(linearKey.trim())
      const client = createLinearClient(linearKey.trim())
      const viewer = await client.getViewer()

      if (viewer) {
        setLinearConnected(true)
        toast.success('Linear connected successfully!', {
          description: `Welcome, ${viewer.viewer.name}!`
        })
        setLinearKey('')
        await loadLinearData()
      }
    } catch (error) {
      toast.error('Connection failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTesting(false)
    }
  }

  const handleLoadRepos = async () => {
    setLoadingRepos(true)
    try {
      const repos = await apiManager.getGitHubRepositories()
      setGithubRepos(repos)
      toast.success(`Loaded ${repos.length} repositories`)
    } catch (error) {
      toast.error('Failed to load repositories', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingRepos(false)
    }
  }

  const handleLoadIssues = async (teamId: string) => {
    if (!apiManager.hasLinearCredentials()) return

    setLoadingLinear(true)
    setSelectedTeam(teamId)
    try {
      const client = createLinearClient(apiManager.getLinearKey()!)
      const issues = await client.getIssues(teamId, 50)
      setLinearIssues(issues)
      toast.success(`Loaded ${issues.length} issues`)
    } catch (error) {
      toast.error('Failed to load issues', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoadingLinear(false)
    }
  }

  const handleTestOctocat = async () => {
    try {
      const octocat = await apiManager.getGitHubOctocat()
      console.log('Octocat response:', octocat)
      toast.success('Octocat API test successful!', {
        description: 'Check console for the ASCII art'
      })
    } catch (error) {
      toast.error('Octocat API test failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return (
    <div className="h-full flex flex-col bg-card/30">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plugs size={32} weight="fill" className="text-accent" />
            <div>
              <CardTitle className="font-orbitron text-2xl tracking-wide">
                API INTEGRATION CENTER
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Connect with GitHub and Linear for seamless workflow integration
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {githubConnected && (
              <Badge variant="outline" className="border-accent/50 text-accent">
                <CheckCircle size={14} weight="fill" className="mr-1" />
                GitHub
              </Badge>
            )}
            {linearConnected && (
              <Badge variant="outline" className="border-accent/50 text-accent">
                <CheckCircle size={14} weight="fill" className="mr-1" />
                Linear
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="p-6">
          <Tabs defaultValue="github" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="github" className="font-orbitron">
                <GitBranch size={18} weight="fill" className="mr-2" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="linear" className="font-orbitron">
                <LinkSimple size={18} weight="fill" className="mr-2" />
                Linear
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github" className="space-y-6">
              {!githubConnected ? (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Connect GitHub</CardTitle>
                    <CardDescription>
                      Enter your GitHub Personal Access Token to connect
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Key size={18} weight="fill" />
                      <AlertDescription>
                        Create a token at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-accent underline">github.com/settings/tokens</a>
                        <br />
                        Required scopes: repo, user, read:org
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="github-token"
                            type={showGithubToken ? 'text' : 'password'}
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                            className="font-mono"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7"
                            onClick={() => setShowGithubToken(!showGithubToken)}
                          >
                            {showGithubToken ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                        <Button onClick={handleConnectGitHub} disabled={testing}>
                          {testing ? 'Testing...' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-accent/50 bg-accent/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle size={24} weight="fill" className="text-accent" />
                          GitHub Connected
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGithubConnected(false)
                            setGithubUser(null)
                            setGithubRepos([])
                            apiManager.clearCredentials()
                            toast.info('GitHub disconnected')
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </CardHeader>
                    {githubUser && (
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <img
                            src={githubUser.avatar_url}
                            alt={githubUser.login}
                            className="w-16 h-16 rounded-full border-2 border-accent"
                          />
                          <div>
                            <h3 className="font-bold text-lg">{githubUser.name || githubUser.login}</h3>
                            <p className="text-sm text-muted-foreground">@{githubUser.login}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{githubUser.public_repos} repos</span>
                              <span>{githubUser.followers} followers</span>
                              <span>{githubUser.following} following</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  <div className="flex gap-2">
                    <Button onClick={handleLoadRepos} disabled={loadingRepos} className="flex-1">
                      <Folder size={18} weight="fill" className="mr-2" />
                      {loadingRepos ? 'Loading...' : 'Load Repositories'}
                    </Button>
                    <Button onClick={handleTestOctocat} variant="outline">
                      Test Octocat API
                    </Button>
                  </div>

                  {githubRepos.length > 0 && (
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Your Repositories ({githubRepos.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {githubRepos.map((repo) => (
                              <Card key={repo.id} className="p-4 border-border/30">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-sm">{repo.name}</h4>
                                    {repo.description && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {repo.description}
                                      </p>
                                    )}
                                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                      <span>⭐ {repo.stargazers_count}</span>
                                      <span>🔀 {repo.forks_count}</span>
                                      <span>🐛 {repo.open_issues_count}</span>
                                    </div>
                                  </div>
                                  {repo.private && (
                                    <Badge variant="secondary" className="text-xs">Private</Badge>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="linear" className="space-y-6">
              {!linearConnected ? (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Connect Linear</CardTitle>
                    <CardDescription>
                      Enter your Linear API key to connect
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Key size={18} weight="fill" />
                      <AlertDescription>
                        Create an API key at: <a href="https://linear.app/settings/api" target="_blank" rel="noopener noreferrer" className="text-accent underline">linear.app/settings/api</a>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="linear-key">Linear API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="linear-key"
                            type={showLinearKey ? 'text' : 'password'}
                            value={linearKey}
                            onChange={(e) => setLinearKey(e.target.value)}
                            placeholder="lin_api_xxxxxxxxxxxxxxxxxxxx"
                            className="font-mono"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 h-7 w-7"
                            onClick={() => setShowLinearKey(!showLinearKey)}
                          >
                            {showLinearKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                        <Button onClick={handleConnectLinear} disabled={testing}>
                          {testing ? 'Testing...' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-accent/50 bg-accent/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle size={24} weight="fill" className="text-accent" />
                          Linear Connected
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLinearConnected(false)
                            setLinearTeams([])
                            setLinearIssues([])
                            apiManager.clearCredentials()
                            toast.info('Linear disconnected')
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>

                  {linearTeams.length > 0 && (
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Buildings size={20} weight="fill" />
                          Your Teams ({linearTeams.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {linearTeams.map((team) => (
                            <Button
                              key={team.id}
                              variant={selectedTeam === team.id ? 'default' : 'outline'}
                              className="justify-start"
                              onClick={() => handleLoadIssues(team.id)}
                            >
                              <Badge variant="secondary" className="mr-2 font-mono">
                                {team.key}
                              </Badge>
                              {team.name}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {linearIssues.length > 0 && (
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ListChecks size={20} weight="fill" />
                          Issues ({linearIssues.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-96">
                          <div className="space-y-3">
                            {linearIssues.map((issue) => (
                              <Card key={issue.id} className="p-4 border-border/30">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {issue.identifier}
                                      </Badge>
                                      <Badge 
                                        variant={
                                          issue.state.type === 'completed' ? 'default' :
                                          issue.state.type === 'started' ? 'secondary' :
                                          'outline'
                                        }
                                        className="text-xs"
                                      >
                                        {issue.state.name}
                                      </Badge>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      P{issue.priority}
                                    </Badge>
                                  </div>
                                  <h4 className="font-bold text-sm">{issue.title}</h4>
                                  {issue.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {issue.description}
                                    </p>
                                  )}
                                  {issue.assignee && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <User size={12} weight="fill" />
                                      {issue.assignee.name}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </ScrollArea>
    </div>
  )
}
