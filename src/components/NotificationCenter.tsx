import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bell,
  BellRinging,
  BellSlash,
  CheckCircle,
  XCircle,
  Warning,
  Info,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Lightning,
  Activity,
  Trash,
  FunnelSimple,
  SlidersHorizontal,
  Archive,
  Eye,
  EyeSlash,
  ArrowsClockwise,
  CloudArrowUp,
  BugBeetle,
  Rocket
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export interface NotificationAlert {
  id: string
  timestamp: number
  type: 'info' | 'success' | 'warning' | 'error' | 'webhook' | 'sync' | 'deployment'
  title: string
  message: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  archived: boolean
  source: string
  metadata?: any
  actionable: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: string
}

export interface NotificationFilter {
  types: string[]
  categories: string[]
  priorities: string[]
  sources: string[]
  read: 'all' | 'read' | 'unread'
  archived: boolean
  dateRange?: { from: number; to: number }
}

export interface NotificationRule {
  id: string
  name: string
  enabled: boolean
  conditions: {
    type?: string[]
    category?: string[]
    priority?: string[]
    source?: string[]
    keywords?: string[]
  }
  actions: {
    playSound?: boolean
    showToast?: boolean
    highlightColor?: string
    autoArchive?: boolean
    forwardTo?: string
  }
  created_at: number
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useKV<NotificationAlert[]>('notifications', [])
  const [rules, setRules] = useKV<NotificationRule[]>('notification-rules', [])
  const [filters, setFilters] = useState<NotificationFilter>({
    types: [],
    categories: [],
    priorities: [],
    sources: [],
    read: 'all',
    archived: false
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('notification-sound', true)
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useKV<boolean>('notification-auto-archive', false)

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: <Info size={16} weight="fill" />, color: 'text-blue-500' },
    { value: 'success', label: 'Success', icon: <CheckCircle size={16} weight="fill" />, color: 'text-accent' },
    { value: 'warning', label: 'Warning', icon: <Warning size={16} weight="fill" />, color: 'text-yellow-500' },
    { value: 'error', label: 'Error', icon: <XCircle size={16} weight="fill" />, color: 'text-destructive' },
    { value: 'webhook', label: 'Webhook', icon: <BellRinging size={16} weight="fill" />, color: 'text-primary' },
    { value: 'sync', label: 'Sync', icon: <ArrowsClockwise size={16} weight="fill" />, color: 'text-secondary' },
    { value: 'deployment', label: 'Deployment', icon: <Rocket size={16} weight="fill" />, color: 'text-accent' }
  ]

  const categories = ['Git', 'Deployment', 'Webhook', 'System', 'Security', 'Performance', 'User Action']
  const priorities = ['low', 'medium', 'high', 'critical']
  const sources = ['GitHub', 'Firebase', 'System', 'Webhook', 'Manual', 'Workflow']

  const createNotification = useCallback((
    type: NotificationAlert['type'],
    title: string,
    message: string,
    options?: Partial<NotificationAlert>
  ) => {
    const notification: NotificationAlert = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      title,
      message,
      category: options?.category || 'System',
      priority: options?.priority || 'medium',
      read: false,
      archived: false,
      source: options?.source || 'System',
      metadata: options?.metadata,
      actionable: options?.actionable || false,
      actions: options?.actions
    }

    setNotifications((current) => [notification, ...(current || [])].slice(0, 500))

    const matchingRules = rules?.filter(rule => {
      if (!rule.enabled) return false
      
      if (rule.conditions.type && !rule.conditions.type.includes(type)) return false
      if (rule.conditions.category && !rule.conditions.category.includes(notification.category)) return false
      if (rule.conditions.priority && !rule.conditions.priority.includes(notification.priority)) return false
      if (rule.conditions.source && !rule.conditions.source.includes(notification.source)) return false
      
      if (rule.conditions.keywords) {
        const text = `${title} ${message}`.toLowerCase()
        const hasKeyword = rule.conditions.keywords.some(keyword => text.includes(keyword.toLowerCase()))
        if (!hasKeyword) return false
      }
      
      return true
    })

    matchingRules?.forEach(rule => {
      if (rule.actions.playSound && soundEnabled) {
        playNotificationSound(notification.priority)
      }
      
      if (rule.actions.showToast) {
        const toastOptions = { description: message }
        switch (type) {
          case 'success':
            toast.success(title, toastOptions)
            break
          case 'error':
            toast.error(title, toastOptions)
            break
          case 'warning':
            toast.warning(title, toastOptions)
            break
          default:
            toast.info(title, toastOptions)
        }
      }
      
      if (rule.actions.autoArchive) {
        setTimeout(() => {
          archiveNotification(notification.id)
        }, 10000)
      }
    })

    return notification
  }, [rules, setNotifications, soundEnabled])

  const playNotificationSound = (priority: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (priority) {
      case 'critical':
        oscillator.frequency.value = 880
        gainNode.gain.value = 0.3
        break
      case 'high':
        oscillator.frequency.value = 660
        gainNode.gain.value = 0.2
        break
      default:
        oscillator.frequency.value = 440
        gainNode.gain.value = 0.1
    }

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes: NotificationAlert['type'][] = ['webhook', 'sync', 'deployment', 'success', 'warning']
      const shouldCreate = Math.random() > 0.85

      if (shouldCreate) {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        const messages = {
          webhook: ['New push event detected', 'Pull request opened', 'Branch created', 'Release published'],
          sync: ['Branch synchronized', 'Sync completed successfully', 'Sync conflict detected', 'Auto-sync triggered'],
          deployment: ['Deployed to production', 'Staging deployment complete', 'Build succeeded', 'Deploy failed'],
          success: ['Operation completed', 'Build successful', 'Tests passed', 'Merge completed'],
          warning: ['High memory usage', 'API rate limit approaching', 'Cache expiring soon', 'Stale branch detected']
        }

        const typeMessages = messages[type as keyof typeof messages] || messages.success
        const message = typeMessages[Math.floor(Math.random() * typeMessages.length)]

        createNotification(
          type,
          `${type.charAt(0).toUpperCase() + type.slice(1)} Event`,
          message,
          {
            category: ['Git', 'Deployment', 'System'][Math.floor(Math.random() * 3)],
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
            source: sources[Math.floor(Math.random() * sources.length)],
            actionable: Math.random() > 0.7,
            actions: Math.random() > 0.7 ? [
              { label: 'View Details', type: 'primary', action: 'view' },
              { label: 'Dismiss', type: 'secondary', action: 'dismiss' }
            ] : undefined
          }
        )
      }
    }, 12000)

    return () => clearInterval(interval)
  }, [createNotification, sources])

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      (current || []).map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications((current) =>
      (current || []).map(n => ({ ...n, read: true }))
    )
    toast.success('All notifications marked as read')
  }

  const archiveNotification = (id: string) => {
    setNotifications((current) =>
      (current || []).map(n => n.id === id ? { ...n, archived: true } : n)
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications((current) =>
      (current || []).filter(n => n.id !== id)
    )
  }

  const clearAllNotifications = () => {
    setNotifications(() => [])
    toast.info('All notifications cleared')
  }

  const getFilteredNotifications = () => {
    let filtered = notifications || []

    if (filters.types.length > 0) {
      filtered = filtered.filter(n => filters.types.includes(n.type))
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(n => filters.categories.includes(n.category))
    }

    if (filters.priorities.length > 0) {
      filtered = filtered.filter(n => filters.priorities.includes(n.priority))
    }

    if (filters.sources.length > 0) {
      filtered = filtered.filter(n => filters.sources.includes(n.source))
    }

    if (filters.read === 'read') {
      filtered = filtered.filter(n => n.read)
    } else if (filters.read === 'unread') {
      filtered = filtered.filter(n => !n.read)
    }

    if (!filters.archived) {
      filtered = filtered.filter(n => !n.archived)
    }

    return filtered
  }

  const getNotificationIcon = (type: string) => {
    const notifType = notificationTypes.find(t => t.value === type)
    return notifType ? notifType.icon : <Info size={16} weight="fill" />
  }

  const getNotificationColor = (type: string) => {
    const notifType = notificationTypes.find(t => t.value === type)
    return notifType ? notifType.color : 'text-muted-foreground'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/50'
      case 'high':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
      case 'low':
        return 'bg-green-500/20 text-green-500 border-green-500/50'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications?.filter(n => !n.read && !n.archived).length || 0

  return (
    <div className="h-full flex flex-col gap-4">
      <Card className="p-4 border-2 border-border/50 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={unreadCount > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: unreadCount > 0 ? Infinity : 0 }}
              >
                <BellRinging size={28} weight="fill" className={unreadCount > 0 ? 'text-accent' : 'text-muted-foreground'} />
              </motion.div>
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            
            <div>
              <h2 className="font-orbitron font-bold text-xl">Notification Center</h2>
              <p className="text-xs text-muted-foreground">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} · {unreadCount} unread
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-accent/20 border-accent' : ''}
            >
              <FunnelSimple size={16} weight="fill" />
              Filters
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRules(!showRules)}
              className={showRules ? 'bg-primary/20 border-primary' : ''}
            >
              <SlidersHorizontal size={16} weight="fill" />
              Rules
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle size={16} weight="fill" />
              Mark All Read
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllNotifications}
              className="hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash size={16} weight="fill" />
              Clear All
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/30"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs mb-2 block">Type</Label>
                  <div className="space-y-1">
                    {notificationTypes.map(type => (
                      <div key={type.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={filters.types.includes(type.value)}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              types: checked
                                ? [...filters.types, type.value]
                                : filters.types.filter(t => t !== type.value)
                            })
                          }}
                        />
                        <Label htmlFor={`type-${type.value}`} className="text-xs cursor-pointer flex items-center gap-1">
                          {type.icon}
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Priority</Label>
                  <div className="space-y-1">
                    {priorities.map(priority => (
                      <div key={priority} className="flex items-center gap-2">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={filters.priorities.includes(priority)}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              priorities: checked
                                ? [...filters.priorities, priority]
                                : filters.priorities.filter(p => p !== priority)
                            })
                          }}
                        />
                        <Label htmlFor={`priority-${priority}`} className="text-xs cursor-pointer capitalize">
                          {priority}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Category</Label>
                  <div className="space-y-1">
                    {categories.map(category => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            setFilters({
                              ...filters,
                              categories: checked
                                ? [...filters.categories, category]
                                : filters.categories.filter(c => c !== category)
                            })
                          }}
                        />
                        <Label htmlFor={`category-${category}`} className="text-xs cursor-pointer">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Options</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs mb-1 block">Read Status</Label>
                      <Select value={filters.read} onValueChange={(value: any) => setFilters({ ...filters, read: value })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="unread">Unread</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="show-archived"
                        checked={filters.archived}
                        onCheckedChange={(checked) => setFilters({ ...filters, archived: !!checked })}
                      />
                      <Label htmlFor="show-archived" className="text-xs cursor-pointer">
                        Show Archived
                      </Label>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setFilters({ types: [], categories: [], priorities: [], sources: [], read: 'all', archived: false })}
                      variant="outline"
                      className="w-full text-xs"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRules && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Global Settings</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-2">
                      <Bell size={18} weight="fill" className="text-accent" />
                      <div>
                        <Label className="text-xs block">Sound Notifications</Label>
                        <p className="text-[10px] text-muted-foreground">Play sound on alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={soundEnabled || false}
                      onCheckedChange={(checked) => setSoundEnabled(() => checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
                    <div className="flex items-center gap-2">
                      <Archive size={18} weight="fill" className="text-primary" />
                      <div>
                        <Label className="text-xs block">Auto Archive</Label>
                        <p className="text-[10px] text-muted-foreground">Archive old notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={autoArchiveEnabled || false}
                      onCheckedChange={(checked) => setAutoArchiveEnabled(() => checked)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="flex-1 border-2 border-border/50 console-glow bg-card/50 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <AnimatePresence>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <Card 
                      className={`p-4 border cursor-pointer transition-all ${
                        notification.read 
                          ? 'border-border/30 bg-card/50 opacity-70' 
                          : 'border-accent/30 bg-accent/5'
                      } ${notification.archived ? 'opacity-50' : ''}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-orbitron font-semibold text-sm mb-1">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                            </div>
                            
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px]">
                              {notification.category}
                            </Badge>
                            <Badge className={`text-[10px] ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {notification.source}
                            </Badge>
                            {notification.archived && (
                              <Badge className="text-[10px] bg-muted text-muted-foreground">
                                <Archive size={10} weight="fill" className="mr-1" />
                                Archived
                              </Badge>
                            )}
                          </div>

                          {notification.actionable && notification.actions && (
                            <div className="flex gap-2 mt-3">
                              {notification.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={action.type === 'primary' ? 'default' : 'outline'}
                                  className={`text-xs ${action.type === 'danger' ? 'hover:bg-destructive/20 hover:text-destructive' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toast.info(`Action: ${action.label}`)
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              archiveNotification(notification.id)
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Archive size={14} weight="fill" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash size={14} weight="fill" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell size={64} weight="fill" className="text-muted-foreground mb-4" />
                  <h3 className="font-orbitron font-semibold text-lg mb-2">No Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filters.types.length > 0 || filters.categories.length > 0
                      ? 'No notifications match your filters'
                      : 'All caught up! No new notifications.'}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
