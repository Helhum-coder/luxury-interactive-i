import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  GithubLogo, 
  Star, 
  GitFork, 
  Calendar,
  Kanban,
  CircleDashed,
  ListBullets
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface QuickActionsProps {
  githubToken?: string
  linearApiKey?: string
  isGitHubConnected: boolean
  isLinearConnected: boolean
}

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  html_url: string
}

interface LinearIssue {
  id: string
  title: string
  description: string | null
  state: { name: string }
  priority: number
  assignee: { name: string } | null
  url: string
}

interface LinearTeam {
  id: string
  name: string
  key: string
}

export function QuickActions({ 
  githubToken, 
  linearApiKey, 
  isGitHubConnected, 
  isLinearConnected 
}: QuickActionsProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [teams, setTeams] = useState<LinearTeam[]>([])
  const [selectedTeam, setSelectedTeam] = useState<LinearTeam | null>(null)
  const [issues, setIssues] = useState<LinearIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<'repos' | 'issues' | null>(null)

  const loadRepositories = async () => {
    if (!githubToken) return

    setIsLoading(true)
    setActiveView('repos')
    
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=20', {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load repositories')
      }

      const data = await response.json()
      setRepositories(data)
      toast.success(`Loaded ${data.length} repositories`)
    } catch (err) {
      toast.error('Failed to load repositories')
      setRepositories([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadTeams = async () => {
    if (!linearApiKey) return

    setIsLoading(true)
    setActiveView('issues')
    
    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': linearApiKey
        },
        body: JSON.stringify({
          query: `query { teams { nodes { id name key } } }`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load teams')
      }

      const data = await response.json()
      const teamsList = data.data?.teams?.nodes || []
      setTeams(teamsList)
      
      if (teamsList.length > 0) {
        setSelectedTeam(teamsList[0])
        loadIssuesForTeam(teamsList[0].id)
      } else {
        toast.info('No teams found')
      }
    } catch (err) {
      toast.error('Failed to load teams')
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadIssuesForTeam = async (teamId: string) => {
    if (!linearApiKey) return

    setIsLoading(true)
    
    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': linearApiKey
        },
        body: JSON.stringify({
          query: `query {
            team(id: "${teamId}") {
              issues(first: 20, orderBy: updatedAt) {
                nodes {
                  id
                  title
                  description
                  state { name }
                  priority
                  assignee { name }
                  url
                }
              }
            }
          }`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load issues')
      }

      const data = await response.json()
      const issuesList = data.data?.team?.issues?.nodes || []
      setIssues(issuesList)
      toast.success(`Loaded ${issuesList.length} issues`)
    } catch (err) {
      toast.error('Failed to load issues')
      setIssues([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date)
  }

  const getPriorityLabel = (priority: number) => {
    const labels = ['None', 'Urgent', 'High', 'Medium', 'Low']
    return labels[priority] || 'None'
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isGitHubConnected && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-github/10 rounded-lg">
                <GithubLogo size={24} weight="duotone" className="text-[var(--github)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[18px]">Load Repositories</h3>
                <p className="text-sm text-muted-foreground">View your GitHub repos</p>
              </div>
            </div>
            <Button 
              onClick={loadRepositories}
              disabled={isLoading}
              className="w-full"
            >
              <ListBullets size={18} className="mr-2" />
              {isLoading && activeView === 'repos' ? 'Loading...' : 'Load Repositories'}
            </Button>
          </Card>
        )}

        {isLinearConnected && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-linear/10 rounded-lg">
                <Kanban size={24} weight="duotone" className="text-[var(--linear)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[18px]">View Linear Issues</h3>
                <p className="text-sm text-muted-foreground">Browse your team's issues</p>
              </div>
            </div>
            <Button 
              onClick={loadTeams}
              disabled={isLoading}
              className="w-full"
            >
              <Kanban size={18} className="mr-2" />
              {isLoading && activeView === 'issues' ? 'Loading...' : 'Load Issues'}
            </Button>
          </Card>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'repos' && repositories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <GithubLogo size={20} weight="duotone" />
                <h3 className="font-semibold text-[18px]">Your Repositories</h3>
                <Badge variant="secondary" className="ml-auto">{repositories.length}</Badge>
              </div>
              <Separator className="mb-4" />
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {repositories.map((repo, index) => (
                    <motion.a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="block p-4 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all"
                    >
                      <div className="font-semibold text-foreground mb-1">
                        {repo.full_name}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star size={14} weight="fill" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork size={14} />
                          {repo.forks_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(repo.updated_at)}
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}

        {activeView === 'issues' && teams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Kanban size={20} weight="duotone" />
                <h3 className="font-semibold text-[18px]">Linear Issues</h3>
              </div>
              
              <div className="flex gap-2 mb-4 flex-wrap">
                {teams.map((team) => (
                  <Button
                    key={team.id}
                    variant={selectedTeam?.id === team.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedTeam(team)
                      loadIssuesForTeam(team.id)
                    }}
                  >
                    {team.name}
                  </Button>
                ))}
              </div>

              <Separator className="mb-4" />
              
              <ScrollArea className="h-[500px] pr-4">
                {issues.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CircleDashed size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No issues found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((issue, index) => (
                      <motion.a
                        key={issue.id}
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="block p-4 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="font-semibold text-foreground flex-1">
                            {issue.title}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {issue.state.name}
                          </Badge>
                        </div>
                        {issue.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {issue.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Priority: {getPriorityLabel(issue.priority)}</span>
                          {issue.assignee && (
                            <>
                              <span>•</span>
                              <span>Assigned to {issue.assignee.name}</span>
                            </>
                          )}
                        </div>
                      </motion.a>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
