import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, List } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import type { Document } from '@/lib/documents'

interface DocumentViewerProps {
  document: Document
  onBack: () => void
}

export function DocumentViewer({ document, onBack }: DocumentViewerProps) {
  const [htmlContent, setHtmlContent] = useState('')
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])
  const [showToc, setShowToc] = useState(false)

  useEffect(() => {
    const parseMarkdown = async () => {
      marked.setOptions({
        breaks: true,
        gfm: true,
      })

      const tokens = marked.lexer(document.content)
      const extractedHeadings: Array<{ id: string; text: string; level: number }> = []

      tokens.forEach((token, index) => {
        if (token.type === 'heading' && token.depth <= 3) {
          const id = `heading-${index}`
          extractedHeadings.push({
            id,
            text: token.text,
            level: token.depth,
          })
        }
      })

      setHeadings(extractedHeadings)

      const renderer = new marked.Renderer()
      let headingIndex = 0

      renderer.heading = ({ text, depth }) => {
        const id = `heading-${headingIndex++}`
        return `<h${depth} id="${id}">${text}</h${depth}>`
      }

      marked.setOptions({ renderer })

      const html = await marked.parse(document.content)
      setHtmlContent(html)
    }

    parseMarkdown()
  }, [document.content])

  const scrollToHeading = (id: string) => {
    const element = window.document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setShowToc(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card/50 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft size={20} weight="bold" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-2xl tracking-tight text-foreground truncate">
                {document.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {document.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {document.fileName}
                </span>
              </div>
            </div>
          </div>
          {headings.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowToc(!showToc)}
              className="shrink-0"
            >
              <List size={18} weight="bold" className="mr-2" />
              Contents
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </ScrollArea>

        {showToc && headings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 w-64 bg-card border-2 border-border rounded-lg shadow-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Table of Contents</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowToc(false)}
              >
                ✕
              </Button>
            </div>
            <Separator className="mb-3" />
            <ScrollArea className="h-96">
              <div className="space-y-1">
                {headings.map((heading) => (
                  <button
                    key={heading.id}
                    onClick={() => scrollToHeading(heading.id)}
                    className="block w-full text-left text-sm py-1.5 px-2 hover:bg-muted rounded transition-colors"
                    style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                  >
                    {heading.text}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </div>
    </div>
  )
}
