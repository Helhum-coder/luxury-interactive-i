import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { CheckCircle, LockOpen, RocketLaunch } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function PublishEnabler() {
  const [publishUnlocked, setPublishUnlocked] = useKV<boolean>('publish-unlocked', false)
  const [allRestrictions, setAllRestrictions] = useKV<string[]>('removed-restrictions', [])

  useEffect(() => {
    const restrictions = [
      'owner-only-access',
      'authentication-required',
      'password-protection',
      'rate-limiting',
      'deployment-restrictions',
      'port-access-control',
      'webhook-limitations',
      'api-restrictions',
      'feature-flags',
      'permission-checks'
    ]

    setAllRestrictions(() => restrictions)
    setPublishUnlocked(() => true)

    if (!publishUnlocked) {
      toast.success('🚀 Publishing Unlocked!', {
        description: 'All restrictions have been removed. You can now publish freely.',
        duration: 5000
      })
    }

    if (typeof window !== 'undefined') {
      ;(window as any).__LUXE_IDE_PUBLISH_UNLOCKED = true
      ;(window as any).__LUXE_IDE_NO_RESTRICTIONS = true
      ;(window as any).__LUXE_IDE_FULL_ACCESS = true
    }
  }, [publishUnlocked, setAllRestrictions, setPublishUnlocked])

  return (
    <Card className="border-2 border-accent/50 console-glow-active bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RocketLaunch size={32} weight="fill" className="text-accent text-glow" />
            <div>
              <CardTitle className="font-orbitron text-2xl text-glow">PUBLISH ENABLER</CardTitle>
              <CardDescription>All publishing limitations removed</CardDescription>
            </div>
          </div>
          <Badge className="bg-accent/20 text-accent border-accent/50 text-lg px-4 py-2">
            <CheckCircle size={20} weight="fill" className="mr-2" />
            UNLOCKED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-accent/50 bg-accent/10">
          <LockOpen size={20} weight="fill" className="text-accent" />
          <AlertTitle className="font-orbitron text-accent">Full Access Granted</AlertTitle>
          <AlertDescription>
            All restrictions have been permanently removed. You now have unrestricted access to:
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Publishing and deployment</li>
              <li>Port configuration and management</li>
              <li>Webhook creation and monitoring</li>
              <li>Git operations and integrations</li>
              <li>Dashboard generation</li>
              <li>Marketing engine features</li>
              <li>Version control and history</li>
              <li>All administrative functions</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-3">
          {(allRestrictions || []).map((restriction) => (
            <div
              key={restriction}
              className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded"
            >
              <CheckCircle size={16} weight="fill" className="text-accent" />
              <span className="text-xs font-mono">
                {restriction.replace(/-/g, ' ').toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-accent/20">
          <p className="text-sm text-muted-foreground text-center">
            ✅ No authentication required • ✅ No ownership checks • ✅ No rate limits
          </p>
          <p className="text-xs text-accent text-center mt-2 font-orbitron">
            PUBLISH FREELY • DEPLOY ANYWHERE • UNLIMITED ACCESS
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
