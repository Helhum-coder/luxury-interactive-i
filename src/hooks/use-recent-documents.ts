import { useKV } from '@github/spark/hooks'
import type { Document } from '@/lib/documents'

export function useRecentDocuments() {
  const [recentDocs, setRecentDocs] = useKV<string[]>('recent-documents', [])

  const addToRecent = (document: Document) => {
    setRecentDocs((current) => {
      const existing = current || []
      const filtered = existing.filter(id => id !== document.id)
      return [document.id, ...filtered].slice(0, 5)
    })
  }

  const clearRecent = () => {
    setRecentDocs([])
  }

  return { recentDocs, addToRecent, clearRecent }
}
