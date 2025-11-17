import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GithubLogo, Key, CheckCircle, Warning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface GitHubAuthProps {
  onAuthenticated: (token: string) => void
  isAuthenticated: boolean
  onLogout: () => void
}

export default function GitHubAuth({ onAuthenticated, isAuthenticated, onLogout }: GitHubAuthProps) {
  const [token, setToken] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthenticate = async () => {
    if (!token.trim()) {
      setError('Please enter a GitHub personal access token')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      if (!response.ok) {
        throw new Error('Invalid token or insufficient permissions')
      }

      const user = await response.json()
      onAuthenticated(token)
      setToken('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsValidating(false)
    }
  }

  if (isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="p-4 border border-accent/30 bg-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} weight="fill" className="text-accent" />
              <div>
                <p className="font-orbitron font-semibold text-sm">GitHub Connected</p>
                <p className="text-xs text-muted-foreground">Live repository access enabled</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="border-destructive/50 hover:bg-destructive/20"
            >
              Disconnect
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card className="p-6 border-2 border-border/50 bg-card/50">
      <div className="flex items-center gap-3 mb-4">
        <GithubLogo size={32} weight="fill" className="text-foreground" />
        <div>
          <h3 className="font-orbitron font-bold text-lg">GitHub Authentication</h3>
          <p className="text-xs text-muted-foreground">Connect to fetch real repository data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="github-token" className="text-sm mb-2 block">
            Personal Access Token
          </Label>
          <Input
            id="github-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="bg-background/50 border-border/50 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Create a token at{' '}
            <a
              href="https://github.com/settings/tokens/new?scopes=repo,read:user"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub Settings
            </a>
            {' '}with <code className="text-xs bg-muted px-1 py-0.5 rounded">repo</code> scope
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="py-3">
            <Warning size={18} weight="fill" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAuthenticate}
          disabled={isValidating || !token.trim()}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isValidating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Key size={18} weight="fill" />
              </motion.div>
              Validating...
            </>
          ) : (
            <>
              <GithubLogo size={18} weight="fill" className="mr-2" />
              Connect to GitHub
            </>
          )}
        </Button>

        <div className="p-3 bg-muted/20 border border-border/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Privacy Notice:</strong> Your token is stored locally and never sent to any third-party servers. 
            It's only used to communicate directly with GitHub's API.
          </p>
        </div>
      </div>
    </Card>
  )
}
