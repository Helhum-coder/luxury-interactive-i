import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  GithubLogo, 
  CheckCircle, 
  Warning, 
  Eye, 
  EyeSlash, 
  Plug,
  ArrowSquareOut
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface GitHubSetupProps {
  isConnected: boolean
  token?: string
  onConnect: (token: string) => void
  onDisconnect: () => void
}

export function GitHubSetup({ isConnected, token, onConnect, onDisconnect }: GitHubSetupProps) {
  const [inputToken, setInputToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    const cleanToken = inputToken.trim()
    
    if (!cleanToken) {
      setError('Please enter a token')
      return
    }

    if (cleanToken.length < 20) {
      setError('Token appears to be incomplete')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid token. Please check and try again.')
        } else if (response.status === 403) {
          throw new Error('Token needs repo, user, and read:org scopes.')
        }
        throw new Error('Connection failed. Please try again.')
      }

      const userData = await response.json()
      onConnect(cleanToken)
      setInputToken('')
      toast.success(`Connected as ${userData.login}!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    onDisconnect()
    setInputToken('')
    setError('')
    toast.success('GitHub disconnected')
  }

  const handleTestConnection = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const response = await fetch('https://api.github.com/octocat', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error('Connection test failed')
      }

      const octocat = await response.text()
      console.log('Octocat says:\n' + octocat)
      toast.success('Connection test successful! Check console for Octocat.')
    } catch (err) {
      toast.error('Connection test failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-6 transition-all duration-300 ${isConnected ? 'border-accent shadow-lg shadow-accent/10' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-github/10 rounded-lg">
            <GithubLogo size={24} weight="duotone" className="text-[var(--github)]" />
          </div>
          <div className="flex-1">
            <h2 className="text-[24px] font-semibold text-foreground">GitHub</h2>
            <p className="text-sm text-muted-foreground">Connect your GitHub account</p>
          </div>
          <AnimatePresence mode="wait">
            {isConnected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
                  <CheckCircle size={16} weight="fill" className="text-accent" />
                  <span className="text-sm font-medium text-accent">Connected</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="mb-6" />

        {!isConnected ? (
          <div className="space-y-6">
            <Accordion type="single" collapsible defaultValue="instructions">
              <AccordionItem value="instructions" className="border-none">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3 px-4 bg-muted/40 rounded-lg">
                  📖 Setup Instructions
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-4">
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">1.</span>
                      <div>
                        Visit{' '}
                        <a
                          href="https://github.com/settings/tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-accent inline-flex items-center gap-1 underline underline-offset-2"
                        >
                          GitHub Token Settings
                          <ArrowSquareOut size={14} />
                        </a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">2.</span>
                      <span>Click "Generate new token (classic)"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">3.</span>
                      <span>Select scopes: <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">repo</code>, <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">user</code>, <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">read:org</code></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">4.</span>
                      <span>Generate and copy the token</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-foreground">5.</span>
                      <span>Paste it below and click Connect</span>
                    </li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-3">
              <Label htmlFor="github-token" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Personal Access Token
              </Label>
              <div className="relative">
                <Input
                  id="github-token"
                  type={showToken ? "text" : "password"}
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="pr-10 font-mono text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleConnect()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showToken ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <Warning size={18} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Connecting...
                </>
              ) : (
                <>
                  <Plug size={18} className="mr-2" />
                  Connect GitHub
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center gap-2 text-accent mb-2">
                <CheckCircle size={20} weight="fill" />
                <span className="font-semibold">Successfully Connected</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your GitHub account is connected and ready to use.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleTestConnection}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                Test Connection
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
