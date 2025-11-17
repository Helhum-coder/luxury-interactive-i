import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Document } from '@/lib/documents'

interface DocumentCardProps {
  document: Document
  onClick: () => void
}

export function DocumentCard({ document, onClick }: DocumentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className="p-5 cursor-pointer border-2 border-border hover:border-primary hover:shadow-lg transition-all duration-150"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText size={24} weight="duotone" className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 text-foreground truncate">
              {document.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {document.description}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {document.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {document.fileName}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
