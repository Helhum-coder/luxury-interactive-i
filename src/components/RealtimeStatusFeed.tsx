import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useWebSocketStatus } from '@/hooks/use-websocket-status'
import { 
  WifiHigh, 
  WifiSlash, 
  CheckCircle, 
  Warning, 
  XCircle, 
  Info,
  Clock,
  Trash,
  Activity
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface RealtimeStatusFeedProps {
  maxHeight?: string
  showConnectionStatus?: boolean
  filterSource?: string
}

export function RealtimeStatusFeed({ 
  maxHeight = '600px', 
  showConnectionStatus = true,
  filterSource 
}: RealtimeStatusFeedProps) {
  const { updates, connectionStatus, clearUpdates, isConnected } = useWebSocketStatus()

  const filteredUpdates = filterSource 
    ? updates.filter(u => u.source === filterSource)
    : updates

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'warning':
        return <Warning size={20} weight="fill" className="text-amber-500" />
      case 'error':
        return <XCircle size={20} weight="fill" className="text-red-500" />
      case 'info':
        return <Info size={20} weight="fill" className="text-blue-500" />
      case 'pending':
        return <Clock size={20} weight="fill" className="text-gray-500 animate-pulse" />
      default:
        return <Info size={20} className="text-muted-foreground" />
    }
  }

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30'
      case 'error':
        return 'bg-red-500/10 border-red-500/30'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30'
      case 'pending':
        return 'bg-gray-500/10 border-gray-500/30'
      default:
        return 'bg-muted/10 border-border'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg">
            <Activity size={24} weight="duotone" className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Real-time Status Feed</h3>
            <p className="text-sm text-muted-foreground">
              Live updates from all monitoring tools
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showConnectionStatus && (
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <WifiHigh size={20} weight="fill" className="text-green-500" />
                  <div className="text-sm">
                    <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-700">
                      Connected
                    </Badge>
                    {connectionStatus.latency && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {connectionStatus.latency}ms
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <WifiSlash size={20} weight="fill" className="text-red-500" />
                  <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-700">
                    Disconnected
                  </Badge>
                </>
              )}
            </div>
          )}
          {filteredUpdates.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearUpdates}
              className="gap-2"
            >
              <Trash size={16} />
              Clear
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="pr-4" style={{ maxHeight }}>
        <AnimatePresence mode="popLayout">
          {filteredUpdates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="p-4 bg-muted rounded-full mb-3">
                <Activity size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No status updates yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Updates will appear here in real-time
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredUpdates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(update.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getStatusIcon(update.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {update.source}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {update.message}
                      </p>
                      {update.details && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono overflow-x-auto">
                          {typeof update.details === 'string' 
                            ? update.details 
                            : JSON.stringify(update.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </Card>
  )
}
