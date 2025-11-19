import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightning } from '@phosphor-icons/react'
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
  const [activeTab, setActiveTab] = useState('github')

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
      <div className="max-w-5xl mx-auto px-6 py-12 md:px-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Lightning size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-foreground leading-none">
                API Quick Start
              </h1>
              <p className="text-muted-foreground mt-2 text-[15px]">
                Connect your APIs in 30 seconds or less
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <Badge 
              variant={isGitHubConnected ? "default" : "secondary"}
              className="text-sm px-3 py-1"
            >
              GitHub {isGitHubConnected ? '✓' : '○'}
            </Badge>
            <Badge 
              variant={isLinearConnected ? "default" : "secondary"}
              className="text-sm px-3 py-1"
            >
              Linear {isLinearConnected ? '✓' : '○'}
            </Badge>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 gap-2">
              <TabsTrigger value="github">
                GitHub
              </TabsTrigger>
              <TabsTrigger value="linear">
                Linear
              </TabsTrigger>
              <TabsTrigger value="actions" disabled={!hasAnyConnection}>
                Quick Actions
              </TabsTrigger>
            </TabsList>

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
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mt-8 p-6 bg-muted/30 border-muted">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔐</div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 text-[15px]">
                  Your credentials never leave your browser
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
