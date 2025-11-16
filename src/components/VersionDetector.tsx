import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Info,
  Cpu,
  Code,
  GitBranch,
  Clock,
  Sparkle
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  detectLocalVersion,
  detectVersionsFromGitHub,
  VersionInfo,
  getVersionStatus,
  cleanVersion
} from '@/lib/version-detector'

interface RepositoryVersions {
  owner: string
  repo: string
  branch: string
  versions: VersionInfo
}

export default function VersionDetector() {
  const [localVersions, setLocalVersions] = useState<VersionInfo | null>(null)
  const [repoVersions, setRepoVersions] = useKV<RepositoryVersions[]>('repository-versions', [])
  const [isDetecting, setIsDetecting] = useState(false)
  const [githubToken] = useKV<string | null>('github-access-token', null)
  const [autoDetect, setAutoDetect] = useKV<boolean>('version-auto-detect', true)
  const [lastDetection, setLastDetection] = useKV<number>('version-last-detection', 0)

  useEffect(() => {
    if (autoDetect) {
      detectAllVersions()
    }
  }, [])

  const detectAllVersions = async () => {
    setIsDetecting(true)
    
    try {
      const local = await detectLocalVersion()
      setLocalVersions(local)
      setLastDetection(Date.now())
      toast.success('Versions detected successfully', {
        description: `Found ${local.dependencies.length} packages`
      })
    } catch (error) {
      console.error('Error detecting versions:', error)
      toast.error('Failed to detect versions', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsDetecting(false)
    }
  }

  const detectRepoVersion = async (owner: string, repo: string, branch: string) => {
    if (!githubToken) {
      toast.error('GitHub authentication required', {
        description: 'Please authenticate with GitHub first'
      })
      return
    }

    setIsDetecting(true)
    
    try {
      const versions = await detectVersionsFromGitHub(owner, repo, branch, githubToken)
      
      setRepoVersions((current) => {
        const repos = current || []
        const existing = repos.find(
          (rv) => rv.owner === owner && rv.repo === repo && rv.branch === branch
        )
        
        if (existing) {
          return repos.map((rv) =>
            rv.owner === owner && rv.repo === repo && rv.branch === branch
              ? { ...rv, versions }
              : rv
          )
        }
        
        return [...repos, { owner, repo, branch, versions }]
      })
      
      toast.success(`Detected versions for ${owner}/${repo}`, {
        description: `v${versions.appVersion} on ${branch}`
      })
    } catch (error) {
      console.error('Error detecting repo version:', error)
      toast.error('Failed to detect repository versions', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsDetecting(false)
    }
  }

  const getStatusBadge = (type: string) => {
    return (
      <Badge variant="outline" className="border-accent/50 text-accent">
        <CheckCircle size={14} weight="fill" className="mr-1" />
        Up to date
      </Badge>
    )
  }

  const getCLIIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'vite':
        return <Sparkle size={18} weight="fill" className="text-accent" />
      case 'typescript':
        return <Code size={18} weight="fill" className="text-blue-400" />
      case 'react':
        return <Code size={18} weight="fill" className="text-cyan-400" />
      default:
        return <Package size={18} weight="fill" className="text-muted-foreground" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border/50 bg-card/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={32} weight="fill" className="text-accent" />
            <div>
              <CardTitle className="font-orbitron text-2xl tracking-wide text-glow">
                VERSION DETECTOR
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Automatic version detection from package.json
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastDetection && lastDetection > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                Last: {new Date(lastDetection).toLocaleTimeString()}
              </div>
            )}
            <Button
              onClick={detectAllVersions}
              disabled={isDetecting}
              className="bg-primary hover:bg-primary/80 font-orbitron"
            >
              {isDetecting ? (
                <ArrowsClockwise size={18} weight="fill" className="mr-2 animate-spin" />
              ) : (
                <ArrowsClockwise size={18} weight="fill" className="mr-2" />
              )}
              DETECT
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 overflow-hidden">
        <Tabs defaultValue="local" className="h-full flex flex-col">
          <TabsList className="bg-card/50 border border-border/50 mb-4">
            <TabsTrigger value="local" className="font-orbitron">
              <Cpu size={16} weight="fill" className="mr-2" />
              LOCAL PROJECT
            </TabsTrigger>
            <TabsTrigger value="repositories" className="font-orbitron">
              <GitBranch size={16} weight="fill" className="mr-2" />
              REPOSITORIES
            </TabsTrigger>
            <TabsTrigger value="cli" className="font-orbitron">
              <Code size={16} weight="fill" className="mr-2" />
              CLI TOOLS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full scrollbar-luxury">
              {localVersions ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-2 border-border/50 console-glow bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-orbitron text-lg">
                          Application Version
                        </CardTitle>
                        <Badge variant="outline" className="border-accent text-accent font-mono text-lg px-4 py-1">
                          v{localVersions.appVersion}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="border-2 border-border/50 console-glow bg-card/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-orbitron text-lg">
                        Dependencies ({localVersions.dependencies.filter(d => d.type === 'dependency').length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {localVersions.dependencies
                          .filter(d => d.type === 'dependency')
                          .slice(0, 20)
                          .map((dep) => (
                            <motion.div
                              key={dep.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-2 rounded border border-border/30 hover:bg-accent/5 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Package size={16} className="text-muted-foreground" />
                                <span className="font-mono text-sm">{dep.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {dep.version}
                                </Badge>
                                {getStatusBadge('dependency')}
                              </div>
                            </motion.div>
                          ))}
                      </div>
                      {localVersions.dependencies.filter(d => d.type === 'dependency').length > 20 && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          + {localVersions.dependencies.filter(d => d.type === 'dependency').length - 20} more dependencies
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-border/50 console-glow bg-card/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-orbitron text-lg">
                        Dev Dependencies ({localVersions.dependencies.filter(d => d.type === 'devDependency').length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {localVersions.dependencies
                          .filter(d => d.type === 'devDependency')
                          .slice(0, 15)
                          .map((dep) => (
                            <motion.div
                              key={dep.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-2 rounded border border-border/30 hover:bg-accent/5 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Code size={16} className="text-muted-foreground" />
                                <span className="font-mono text-sm">{dep.name}</span>
                              </div>
                              <Badge variant="outline" className="font-mono text-xs">
                                {dep.version}
                              </Badge>
                            </motion.div>
                          ))}
                      </div>
                      {localVersions.dependencies.filter(d => d.type === 'devDependency').length > 15 && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          + {localVersions.dependencies.filter(d => d.type === 'devDependency').length - 15} more dev dependencies
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="border-2 border-border/50 console-glow bg-card/50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Info size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center mb-4">
                      No version information detected yet
                    </p>
                    <Button onClick={detectAllVersions} disabled={isDetecting}>
                      <ArrowsClockwise size={18} weight="fill" className="mr-2" />
                      Detect Versions
                    </Button>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="repositories" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full scrollbar-luxury">
              <div className="space-y-4">
                {repoVersions && repoVersions.length > 0 ? (
                  repoVersions.map((repo) => (
                    <motion.div
                      key={`${repo.owner}-${repo.repo}-${repo.branch}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-2 border-border/50 console-glow bg-card/50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="font-orbitron">
                                {repo.owner}/{repo.repo}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <GitBranch size={14} />
                                <span className="text-sm text-muted-foreground">{repo.branch}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="border-accent text-accent font-mono text-lg px-4 py-1">
                              v{repo.versions.appVersion}
                            </Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <Card className="border-2 border-border/50 console-glow bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Info size={48} className="text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        No repository versions detected
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cli" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full scrollbar-luxury">
              {localVersions?.cliVersions && Object.keys(localVersions.cliVersions).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(localVersions.cliVersions).map(([name, version]) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className="border-2 border-border/50 console-glow bg-card/50 hover:bg-accent/5 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            {getCLIIcon(name)}
                            <h3 className="font-orbitron text-lg uppercase">{name}</h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                              v{version}
                            </Badge>
                            <CheckCircle size={20} weight="fill" className="text-accent" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-border/50 console-glow bg-card/50">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Info size={48} className="text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No CLI tool versions detected
                    </p>
                  </CardContent>
                </Card>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </div>
  )
}
