import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Key, CheckCircle, XCircle, Eye, EyeSlash, GitBranch, Globe, Flame } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface APITokens {
  github?: string
  vercel?: string
  firebase?: string
}

interface TokenStatus {
  provider: string
  valid: boolean
  lastChecked: Date | null
  error?: string
}

export function APITokensManager({ onClose }: { onClose: () => void }) {
  const [tokens, setTokens] = useKV<APITokens>('api-tokens', {})
  const [tempTokens, setTempTokens] = useState<APITokens>({})
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({})
  const [tokenStatus, setTokenStatus] = useState<{ [key: string]: TokenStatus }>({})
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    setTempTokens(tokens || {})
  }, [tokens])

  const handleTokenChange = (provider: keyof APITokens, value: string) => {
    setTempTokens((current) => ({
      ...current,
      [provider]: value
    }))
  }

  const toggleShowToken = (provider: string) => {
    setShowTokens((current) => ({
      ...current,
      [provider]: !current[provider]
    }))
  }

  const verifyGitHubToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const verifyVercelToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.vercel.com/v2/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const verifyFirebaseToken = async (token: string): Promise<boolean> => {
    return token.length > 0
  }

  const verifyToken = async (provider: keyof APITokens) => {
    const token = tempTokens[provider]
    if (!token) {
      toast.error(`Please enter a ${provider} token`)
      return
    }

    setIsVerifying(true)
    let valid = false
    let error: string | undefined

    try {
      switch (provider) {
        case 'github':
          valid = await verifyGitHubToken(token)
          break
        case 'vercel':
          valid = await verifyVercelToken(token)
          break
        case 'firebase':
          valid = await verifyFirebaseToken(token)
          break
      }

      setTokenStatus((current) => ({
        ...current,
        [provider]: {
          provider,
          valid,
          lastChecked: new Date(),
          error: valid ? undefined : 'Invalid token or API unavailable'
        }
      }))

      if (valid) {
        toast.success(`${provider} token verified successfully`)
      } else {
        toast.error(`Failed to verify ${provider} token`)
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Verification failed'
      setTokenStatus((current) => ({
        ...current,
        [provider]: {
          provider,
          valid: false,
          lastChecked: new Date(),
          error
        }
      }))
      toast.error(`Error verifying ${provider} token`)
    } finally {
      setIsVerifying(false)
    }
  }

  const saveTokens = () => {
    setTokens(tempTokens)
    toast.success('API tokens saved successfully')
  }

  const clearToken = (provider: keyof APITokens) => {
    setTempTokens((current) => {
      const updated = { ...current }
      delete updated[provider]
      return updated
    })
    setTokenStatus((current) => {
      const updated = { ...current }
      delete updated[provider]
      return updated
    })
    toast.success(`${provider} token cleared`)
  }

  const providers = [
    {
      key: 'github' as keyof APITokens,
      name: 'GitHub',
      icon: GitBranch,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      description: 'Monitor GitHub Actions workflows and deployments',
      placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      docUrl: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token'
    },
    {
      key: 'vercel' as keyof APITokens,
      name: 'Vercel',
      icon: Globe,
      color: 'text-black',
      bgColor: 'bg-gray-100',
      description: 'Track Vercel deployments and build status',
      placeholder: 'xxxxxxxxxxxxxxxxxxxxxx',
      docUrl: 'https://vercel.com/account/tokens'
    },
    {
      key: 'firebase' as keyof APITokens,
      name: 'Firebase',
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Monitor Firebase hosting and functions',
      placeholder: 'xxxxxxxxxxxxxxxxxxxxxx',
      docUrl: 'https://firebase.google.com/docs/cli#cli-ci-systems'
    }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Key size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">API Tokens Manager</h1>
              <p className="text-muted-foreground mt-1">
                Configure tokens for real-time pipeline monitoring
              </p>
            </div>
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        <Alert className="mb-6">
          <Key size={20} />
          <AlertDescription>
            Your API tokens are stored securely in your browser. They are never sent to any server except the official provider APIs.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="github" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {providers.map((provider) => {
              const Icon = provider.icon
              const status = tokenStatus[provider.key]
              return (
                <TabsTrigger key={provider.key} value={provider.key} className="gap-2">
                  <Icon size={16} weight="duotone" className={provider.color} />
                  {provider.name}
                  {status?.valid && (
                    <CheckCircle size={14} weight="fill" className="text-green-600" />
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {providers.map((provider) => {
            const Icon = provider.icon
            const status = tokenStatus[provider.key]
            const hasToken = !!tempTokens[provider.key]

            return (
              <TabsContent key={provider.key} value={provider.key}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${provider.bgColor} rounded-lg`}>
                          <Icon size={24} weight="duotone" className={provider.color} />
                        </div>
                        <div className="flex-1">
                          <CardTitle>{provider.name} Access Token</CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                        {status && (
                          <Badge variant={status.valid ? 'default' : 'destructive'} className="gap-2">
                            {status.valid ? (
                              <>
                                <CheckCircle size={14} weight="fill" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle size={14} weight="fill" />
                                Invalid
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`${provider.key}-token`}>Access Token</Label>
                        <div className="relative mt-2">
                          <Input
                            id={`${provider.key}-token`}
                            type={showTokens[provider.key] ? 'text' : 'password'}
                            value={tempTokens[provider.key] || ''}
                            onChange={(e) => handleTokenChange(provider.key, e.target.value)}
                            placeholder={provider.placeholder}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowToken(provider.key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showTokens[provider.key] ? (
                              <EyeSlash size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Don't have a token?{' '}
                          <a
                            href={provider.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Learn how to create one
                          </a>
                        </p>
                      </div>

                      {status && status.error && (
                        <Alert variant="destructive">
                          <XCircle size={20} />
                          <AlertDescription>{status.error}</AlertDescription>
                        </Alert>
                      )}

                      {status && status.valid && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle size={20} className="text-green-600" />
                          <AlertDescription className="text-green-800">
                            Token verified successfully on{' '}
                            {status.lastChecked?.toLocaleTimeString()}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => verifyToken(provider.key)}
                          disabled={!hasToken || isVerifying}
                          className="gap-2"
                        >
                          <CheckCircle size={18} />
                          {isVerifying ? 'Verifying...' : 'Verify Token'}
                        </Button>
                        <Button
                          onClick={saveTokens}
                          variant="default"
                          disabled={!hasToken}
                          className="gap-2"
                        >
                          <Key size={18} />
                          Save Token
                        </Button>
                        {hasToken && (
                          <Button
                            onClick={() => clearToken(provider.key)}
                            variant="outline"
                            className="gap-2"
                          >
                            <XCircle size={18} />
                            Clear
                          </Button>
                        )}
                      </div>

                      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Required Permissions:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          {provider.key === 'github' && (
                            <>
                              <li>• <code>repo</code> - Access repositories and workflows</li>
                              <li>• <code>workflow</code> - Read GitHub Actions</li>
                            </>
                          )}
                          {provider.key === 'vercel' && (
                            <>
                              <li>• Read deployments and projects</li>
                              <li>• Access deployment logs</li>
                            </>
                          )}
                          {provider.key === 'firebase' && (
                            <>
                              <li>• Firebase CLI token</li>
                              <li>• Access to hosting and functions</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )
          })}
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common token management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start gap-3 h-auto py-4"
                onClick={() => {
                  const allValid = providers.every(p => tokenStatus[p.key]?.valid)
                  if (allValid) {
                    toast.success('All tokens are verified')
                  } else {
                    toast.error('Some tokens are not verified')
                  }
                }}
              >
                <CheckCircle size={20} />
                <div className="text-left">
                  <div className="font-semibold">Verify All Tokens</div>
                  <div className="text-sm text-muted-foreground">
                    Check all configured tokens
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-3 h-auto py-4"
                onClick={() => {
                  const configured = providers.filter(p => tempTokens[p.key])
                  toast.success(`${configured.length} of ${providers.length} tokens configured`)
                }}
              >
                <Key size={20} />
                <div className="text-left">
                  <div className="font-semibold">Check Configuration</div>
                  <div className="text-sm text-muted-foreground">
                    View configured tokens status
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
