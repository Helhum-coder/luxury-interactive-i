import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Package, CheckCircle, Warning, ArrowsClockwise } from '@phosphor-icons/react'
import { detectVersionsFromGitHub, VersionInfo } from '@/lib/version-detector'
import { toast } from 'sonner'

interface VersionBadgeProps {
  owner: string
  repo: string
  branch: string
  token?: string | null
  compact?: boolean
}

export default function VersionBadge({ 
  owner, 
  repo, 
  branch, 
  token,
  compact = false 
}: VersionBadgeProps) {
  const [version, setVersion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detectVersion = async () => {
    if (!token) {
      setError('Authentication required')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const info = await detectVersionsFromGitHub(owner, repo, branch, token)
      setVersion(info.appVersion)
      setVersionInfo(info)
      setError(null)
    } catch (err) {
      console.error('Error detecting version:', err)
      setError(err instanceof Error ? err.message : 'Failed to detect version')
      setVersion(null)
      setVersionInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && !version && !isLoading) {
      detectVersion()
    }
  }, [token, owner, repo, branch])

  if (error && !compact) {
    return (
      <Badge variant="outline" className="border-destructive/50 text-destructive">
        <Warning size={14} weight="fill" className="mr-1" />
        Version unavailable
      </Badge>
    )
  }

  if (!version && !isLoading) {
    if (compact) return null
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={detectVersion}
        disabled={!token}
        className="h-7 text-xs"
      >
        <Package size={14} className="mr-1" />
        Detect Version
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Badge variant="outline" className="border-muted">
        <ArrowsClockwise size={14} className="mr-1 animate-spin" />
        Detecting...
      </Badge>
    )
  }

  if (!versionInfo) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge 
          variant="outline" 
          className="border-accent/50 text-accent hover:bg-accent/10 cursor-pointer font-mono"
        >
          <Package size={14} weight="fill" className="mr-1" />
          v{version}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-2 border-border/50 bg-card/95 backdrop-blur">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-orbitron text-sm font-semibold">Version Details</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={detectVersion}
              disabled={isLoading}
              className="h-7 text-xs"
            >
              <ArrowsClockwise size={14} className={isLoading ? 'animate-spin' : ''} />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">App Version</span>
              <Badge variant="outline" className="font-mono">
                v{versionInfo.appVersion}
              </Badge>
            </div>

            {versionInfo.cliVersions.vite && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vite</span>
                <Badge variant="outline" className="font-mono text-xs">
                  v{versionInfo.cliVersions.vite}
                </Badge>
              </div>
            )}

            {versionInfo.cliVersions.typescript && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">TypeScript</span>
                <Badge variant="outline" className="font-mono text-xs">
                  v{versionInfo.cliVersions.typescript}
                </Badge>
              </div>
            )}

            {versionInfo.cliVersions.react && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">React</span>
                <Badge variant="outline" className="font-mono text-xs">
                  v{versionInfo.cliVersions.react}
                </Badge>
              </div>
            )}

            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Dependencies</span>
                <span className="font-mono text-xs">
                  {versionInfo.dependencies.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
              <CheckCircle size={12} weight="fill" className="text-accent" />
              Last detected: {new Date(versionInfo.lastDetected).toLocaleString()}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
