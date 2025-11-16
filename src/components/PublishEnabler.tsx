import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import MultiEnvironmentPublishing from '@/components/MultiEnvironmentPublishing'

export default function PublishEnabler() {
  const [publishUnlocked, setPublishUnlocked] = useKV<boolean>('publish-unlocked', false)

  useEffect(() => {
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
  }, [publishUnlocked, setPublishUnlocked])

  return <MultiEnvironmentPublishing />
}
