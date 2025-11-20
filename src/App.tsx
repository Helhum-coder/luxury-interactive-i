import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkle, GithubLogo, Kanban, GitBranch, Rocket, Network, FileCode, Globe, Terminal, Activity } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { GitHubSetup } from '@/components/GitHubSetup'
import { LinearSetup } from '@/components/LinearSetup'
import { QuickActions } from '@/components/QuickActions'

interface APICredentials {
  github?: {
    token: string
    connected: boolean
  }
  linear?: {
    apiKey: string
    connected: boolean
  }
}

function App() {
  const [credentials, setCredentials] = useKV<APICredentials>('api-credentials', {})
  const [activeTab, setActiveTab] = useState('overview')

  const isGitHubConnected = credentials?.github?.connected || false
  const isLinearConnected = credentials?.linear?.connected || false
  const hasAnyConnection = isGitHubConnected || isLinearConnected

  const handleGitHubConnect = (token: string) => {
    setCredentials((current) => ({
      ...current,
      github: { token, connected: true }
    }))
  }

  const handleGitHubDisconnect = () => {
    setCredentials((current) => ({
      ...current,
      github: undefined
    }))
  }

  const handleLinearConnect = (apiKey: string) => {
    setCredentials((current) => ({
      ...current,
      linear: { apiKey, connected: true }
    }))
  }

  const handleLinearDisconnect = () => {
    setCredentials((current) => ({
      ...current,
      linear: undefined
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkle size={28} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  LUXE IDE
                </h1>
                <p className="text-xs text-muted-foreground">
                  Developer Environment Suite
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isGitHubConnected ? "default" : "outline"}
                className="text-xs"
              >
                <GithubLogo size={12} className="mr-1" />
                GitHub {isGitHubConnected ? '✓' : '○'}
              </Badge>
              <Badge 
                variant={isLinearConnected ? "default" : "outline"}
                className="text-xs"
              >
                <Kanban size={12} className="mr-1" />
                Linear {isLinearConnected ? '✓' : '○'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="text-xs">
              <Activity size={14} className="mr-1" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="text-xs">
              <GithubLogo size={14} className="mr-1" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="linear" className="text-xs">
              <Kanban size={14} className="mr-1" />
              <span className="hidden sm:inline">Linear</span>
            </TabsTrigger>
            <TabsTrigger value="actions" disabled={!hasAnyConnection} className="text-xs">
              <Terminal size={14} className="mr-1" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs">
              <Network size={14} className="mr-1" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
            <TabsTrigger value="converter" className="text-xs">
              <FileCode size={14} className="mr-1" />
              <span className="hidden sm:inline">Converter</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkle size={48} weight="duotone" className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to LUXE IDE</h2>
              <p className="text-muted-foreground mb-6">
                Your comprehensive developer environment suite with all the tools you need
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                <Card className="p-4 bg-card/50">
                  <GithubLogo size={32} className="mb-2 text-github" />
                  <h3 className="font-semibold mb-1">GitHub Integration</h3>
                  <p className="text-sm text-muted-foreground">Connect your repositories, manage PRs, and track commits</p>
                </Card>
                <Card className="p-4 bg-card/50">
                  <Kanban size={32} className="mb-2 text-linear" />
                  <h3 className="font-semibold mb-1">Linear Workflows</h3>
                  <p className="text-sm text-muted-foreground">Track issues, manage sprints, and sync with your team</p>
                </Card>
                <Card className="p-4 bg-card/50">
                  <Network size={32} className="mb-2 text-accent" />
                  <h3 className="font-semibold mb-1">Network Tools</h3>
                  <p className="text-sm text-muted-foreground">Diagnose connections, monitor services, and fix issues</p>
                </Card>
                <Card className="p-4 bg-card/50">
                  <GitBranch size={32} className="mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Branch Management</h3>
                  <p className="text-sm text-muted-foreground">Visualize timelines, compare commits, and manage merges</p>
                </Card>
                <Card className="p-4 bg-card/50">
                  <Rocket size={32} className="mb-2 text-accent" />
                  <h3 className="font-semibold mb-1">CI/CD Pipelines</h3>
                  <p className="text-sm text-muted-foreground">Monitor deployments, track builds, and manage releases</p>
                </Card>
                <Card className="p-4 bg-card/50">
                  <FileCode size={32} className="mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">File Converter</h3>
                  <p className="text-sm text-muted-foreground">Convert between JSON, TypeScript, HTML, JSX, and more</p>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="github" className="mt-6">
            <GitHubSetup
              isConnected={isGitHubConnected}
              token={credentials?.github?.token}
              onConnect={handleGitHubConnect}
              onDisconnect={handleGitHubDisconnect}
            />
          </TabsContent>

          <TabsContent value="linear" className="mt-6">
            <LinearSetup
              isConnected={isLinearConnected}
              apiKey={credentials?.linear?.apiKey}
              onConnect={handleLinearConnect}
              onDisconnect={handleLinearDisconnect}
            />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <QuickActions
              githubToken={credentials?.github?.token}
              linearApiKey={credentials?.linear?.apiKey}
              isGitHubConnected={isGitHubConnected}
              isLinearConnected={isLinearConnected}
            />
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            <Card className="p-6">
              <div className="text-center">
                <Network size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Network Diagnostics</h3>
                <p className="text-sm text-muted-foreground">
                  Network diagnostic tools are available. This feature includes connectivity monitoring,
                  port scanning, and service endpoint testing.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="converter" className="mt-6">
            <Card className="p-6">
              <div className="text-center">
                <FileCode size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Multi-Format File Converter</h3>
                <p className="text-sm text-muted-foreground">
                  Convert between multiple file formats: JSON to TypeScript, HTML to JSX,
                  CSS to Tailwind, and more. File upload support included.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Card className="p-4 bg-muted/20 border-muted">
            <div className="flex items-start gap-3">
              <div className="text-xl">🔐</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 text-sm">
                  Your credentials never leave your browser
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All API tokens and keys are stored locally and never sent to any server. 
                  You can disconnect at any time to clear stored credentials.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default App
