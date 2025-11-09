import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Terminal, Play, Trash, Copy } from '@phosphor-icons/react'
import { ConsoleType, ConsoleMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface ConsoleProps {
  id: ConsoleType
  title: string
  icon: React.ReactNode
  isActive: boolean
  messages: ConsoleMessage[]
  onExecute: (command: string) => void
  onClear: () => void
  onActivate: () => void
}

export default function Console({ 
  id, 
  title, 
  icon, 
  isActive, 
  messages, 
  onExecute, 
  onClear,
  onActivate 
}: ConsoleProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleExecute = () => {
    if (input.trim()) {
      onExecute(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleExecute()
    }
  }

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-destructive'
      case 'success': return 'text-accent'
      case 'info': return 'text-secondary'
      case 'input': return 'text-foreground'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "h-full flex flex-col border-2 transition-all duration-300 overflow-hidden",
          isActive 
            ? "border-accent console-glow-active bg-card/95" 
            : "border-border/50 console-glow bg-card/70 hover:border-border"
        )}
        onClick={onActivate}
      >
        <div className="p-4 border-b border-border/50 luxury-gradient flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-accent">
              {icon}
            </div>
            <h3 className="font-orbitron font-semibold text-lg tracking-wide text-foreground">
              {title}
            </h3>
            <Badge variant="outline" className="border-accent/50 text-accent text-xs">
              {isActive ? 'ACTIVE' : 'STANDBY'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-accent/20 hover:text-accent"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(messages.map(m => m.content).join('\n'))
              }}
            >
              <Copy size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4 scrollbar-luxury">
          <div ref={scrollRef} className="space-y-2 font-mono text-sm">
            {messages.length === 0 ? (
              <div className="text-muted-foreground italic text-center py-8">
                Console ready. Awaiting commands...
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cn("leading-relaxed", getMessageColor(msg.type))}>
                  <span className="text-accent/70 text-xs mr-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.type === 'input' && <span className="text-secondary mr-2">{'>'}</span>}
                  <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-background/50">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command... (Ctrl+Enter to execute)"
              className="min-h-[60px] resize-none bg-background/80 border-input focus:border-accent focus:ring-accent/50 font-mono text-sm"
            />
            <Button 
              onClick={handleExecute}
              className="gold-gradient hover:brightness-110 transition-all"
              size="lg"
            >
              <Play size={20} weight="fill" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
