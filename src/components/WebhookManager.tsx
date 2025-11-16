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
import {
  Bell,
  BellRinging,
  CheckCircle,
  XCircle,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Lightning,
  Activity,
  Code,
  Broadcast,
  PlayCircle,
  PauseCircle,
  Trash,
  Plus,
  ArrowsClockwise,
  Warning,
  Rocket
} from '@phosphor-icons/react'
import { WebhookEvent, WebhookConfig, WebhookDelivery, GitBranch as GitBranchType } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface WebhookManagerProps {
  onTriggerSync?: (branch: string) => void
  branches?: GitBranchType[]
  onNotification?: (type: string, title: string, message: string, options?: any) => void
}

export default function WebhookManager({ onTriggerSync, branches, onNotification }: WebhookManagerProps) {
  const [webhookConfigs, setWebhookConfigs] = useKV<WebhookConfig[]>('webhook-configs', [])
  const [webhookEvents, setWebhookEvents] = useKV<WebhookEvent[]>('webhook-events', [])
  const [webhookDeliveries, setWebhookDeliveries] = useKV<WebhookDelivery[]>('webhook-deliveries', [])
  
  const [isMonitoring, setIsMonitoring] = useKV<boolean>('webhook-monitoring', false)
  const [selectedRepository, setSelectedRepository] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['push', 'pull_request'])
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [showConfigDialog, setShowConfigDialog] = useState(false)

  const availableEvents = [
    { value: 'push', label: 'Push Events', icon: <GitCommit size={16} weight="fill" /> },
    { value: 'pull_request', label: 'Pull Requests', icon: <GitPullRequest size={16} weight="fill" /> },
    { value: 'create', label: 'Branch/Tag Created', icon: <GitBranch size={16} weight="fill" /> },
    { value: 'delete', label: 'Branch/Tag Deleted', icon: <Trash size={16} weight="fill" /> },
    { value: 'release', label: 'Releases', icon: <Rocket size={16} weight="fill" /> },
    { value: 'workflow_run', label: 'Workflow Runs', icon: <PlayCircle size={16} weight="fill" /> },
    { value: 'deployment', label: 'Deployments', icon: <Lightning size={16} weight="fill" /> }
  ]

  const simulateWebhookEvent = useCallback((type: WebhookEvent['event_type']) => {
    const repositories = ['microsoft/vscode-docs', 'your-org/device-streaming', 'your-org/main-repo']
    const actors = ['github-actions[bot]', 'you', 'teammate-user']
    const branchNames = branches?.map(b => b.name) || ['master', 'main', 'develop']

    const event: WebhookEvent = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      event_type: type,
      repository: repositories[Math.floor(Math.random() * repositories.length)],
      branch: branchNames[Math.floor(Math.random() * branchNames.length)],
      actor: actors[Math.floor(Math.random() * actors.length)],
      payload: {
        ref: `refs/heads/${branchNames[Math.floor(Math.random() * branchNames.length)]}`,
        commits: type === 'push' ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
          id: Math.random().toString(36).substr(2, 9),
          message: `Update files - commit ${i + 1}`,
          author: { name: actors[Math.floor(Math.random() * actors.length)] }
        })) : undefined,
        pull_request: type === 'pull_request' ? {
          number: Math.floor(Math.random() * 100) + 1,
          title: 'Feature: Add new functionality',
          state: 'open'
        } : undefined
      },
      processed: false,
      auto_synced: false
    }

    setWebhookEvents((current) => [event, ...(current || [])].slice(0, 100))

    if (onNotification) {
      onNotification('webhook', `${type} Event`, `${event.actor} triggered ${type} on ${event.branch}`, {
        category: 'Webhook',
        priority: 'medium',
        source: 'Webhook',
        metadata: event
      })
    }

    const delivery: WebhookDelivery = {
      id: `delivery-${Date.now()}`,
      webhook_id: webhookConfigs?.[0]?.id || 'default',
      timestamp: Date.now(),
      event_type: type,
      status: 'success',
      response_time_ms: Math.floor(Math.random() * 200) + 50,
      payload_size: Math.floor(Math.random() * 5000) + 1000
    }

    setWebhookDeliveries((current) => [delivery, ...(current || [])].slice(0, 100))

    return event
  }, [branches, setWebhookEvents, setWebhookDeliveries, webhookConfigs])

  const processWebhookEvent = useCallback(async (event: WebhookEvent) => {
    const config = webhookConfigs?.find(c => 
      c.repository === event.repository || c.repository === '*'
    )

    if (!config || !config.active) {
      return
    }

    if (!config.events.includes(event.event_type)) {
      return
    }

    setWebhookEvents((current) =>
      (current || []).map(e =>
        e.id === event.id ? { ...e, processed: true } : e
      )
    )

    if (config.auto_sync) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      setWebhookEvents((current) =>
        (current || []).map(e =>
          e.id === event.id ? { ...e, auto_synced: true } : e
        )
      )

      if (onTriggerSync) {
        onTriggerSync(event.branch)
      }

      if (onNotification) {
        onNotification('sync', 'Auto-Sync Triggered', `Synchronizing ${event.branch}`, {
          category: 'Git',
          priority: 'high',
          source: 'Webhook',
          actionable: true,
          actions: [
            { label: 'View Branch', type: 'primary', action: 'view-branch' },
            { label: 'Cancel Sync', type: 'danger', action: 'cancel-sync' }
          ]
        })
      }

      toast.success(`Auto-sync triggered for ${event.branch}`, {
        description: `${event.event_type} event from ${event.actor}`
      })
    }

    if (onNotification) {
      onNotification('info', 'Webhook Processed', `${event.event_type} from ${event.repository}`, {
        category: 'Webhook',
        priority: 'low',
        source: 'Webhook'
      })
    }

    toast.info(`Webhook processed: ${event.event_type}`, {
      description: `${event.repository} · ${event.branch}`
    })
  }, [webhookConfigs, setWebhookEvents, onTriggerSync])

  useEffect(() => {
    if (!isMonitoring) return

    const monitoringInterval = setInterval(() => {
      const eventTypes: WebhookEvent['event_type'][] = ['push', 'pull_request', 'workflow_run']
      const shouldSimulate = Math.random() > 0.7

      if (shouldSimulate) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
        const event = simulateWebhookEvent(eventType)
        
        setTimeout(() => {
          processWebhookEvent(event)
        }, 500)
      }
    }, 8000)

    return () => clearInterval(monitoringInterval)
  }, [isMonitoring, simulateWebhookEvent, processWebhookEvent])

  const createWebhookConfig = () => {
    if (!selectedRepository.trim()) {
      toast.error('Please enter a repository name')
      return
    }

    const newConfig: WebhookConfig = {
      id: `webhook-config-${Date.now()}`,
      repository: selectedRepository,
      events: selectedEvents,
      active: true,
      auto_sync: autoSyncEnabled,
      created_at: Date.now(),
      delivery_count: 0
    }

    setWebhookConfigs((current) => [newConfig, ...(current || [])])
    
    if (onNotification) {
      onNotification('success', 'Webhook Configured', `Now monitoring ${selectedRepository} for ${selectedEvents.length} event types`, {
        category: 'System',
        priority: 'medium',
        source: 'System'
      })
    }
    
    toast.success('Webhook configured!', {
      description: `Listening to ${selectedEvents.length} event types`
    })

    setSelectedRepository('')
    setSelectedEvents(['push', 'pull_request'])
    setShowConfigDialog(false)
  }

  const toggleWebhook = (id: string) => {
    setWebhookConfigs((current) =>
      (current || []).map(config =>
        config.id === id ? { ...config, active: !config.active } : config
      )
    )
  }

  const deleteWebhook = (id: string) => {
    setWebhookConfigs((current) =>
      (current || []).filter(config => config.id !== id)
    )
    toast.info('Webhook configuration removed')
  }

  const toggleMonitoring = (enabled: boolean) => {
    setIsMonitoring(() => enabled)
    
    if (enabled) {
      if (onNotification) {
        onNotification('success', 'Monitoring Started', 'Real-time webhook monitoring is now active', {
          category: 'System',
          priority: 'high',
          source: 'System'
        })
      }
      toast.success('Webhook monitoring started', {
        description: 'Real-time events will trigger automatic syncs'
      })
    } else {
      if (onNotification) {
        onNotification('info', 'Monitoring Paused', 'Webhook monitoring has been paused', {
          category: 'System',
          priority: 'low',
          source: 'System'
        })
      }
      toast.info('Webhook monitoring paused')
    }
  }

  const manualTriggerEvent = (type: WebhookEvent['event_type']) => {
    const event = simulateWebhookEvent(type)
    
    setTimeout(() => {
      processWebhookEvent(event)
    }, 500)

    toast.info(`Simulating ${type} event...`)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'push':
        return <GitCommit size={18} weight="fill" className="text-accent" />
      case 'pull_request':
        return <GitPullRequest size={18} weight="fill" className="text-secondary" />
      case 'create':
        return <GitBranch size={18} weight="fill" className="text-primary" />
      case 'delete':
        return <Trash size={18} weight="fill" className="text-destructive" />
      case 'release':
        return <Rocket size={18} weight="fill" className="text-accent" />
      case 'workflow_run':
        return <PlayCircle size={18} weight="fill" className="text-primary" />
      case 'deployment':
        return <Lightning size={18} weight="fill" className="text-accent" />
      default:
        return <Activity size={18} weight="fill" className="text-muted-foreground" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'push':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'pull_request':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'workflow_run':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'delete':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30'
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <Card className="p-4 border-2 border-border/50 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={isMonitoring ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: isMonitoring ? Infinity : 0 }}
              >
                {isMonitoring ? (
                  <BellRinging size={24} weight="fill" className="text-accent" />
                ) : (
                  <Bell size={24} weight="fill" className="text-muted-foreground" />
                )}
              </motion.div>
              <div>
                <Label className="font-orbitron text-sm">Webhook Monitoring</Label>
                <p className="text-xs text-muted-foreground">
                  {isMonitoring ? 'Live event tracking enabled' : 'Monitoring paused'}
                </p>
              </div>
            </div>
            <Switch
              checked={isMonitoring || false}
              onCheckedChange={toggleMonitoring}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfigDialog(!showConfigDialog)}
              size="sm"
              variant="outline"
              className="border-accent/50 hover:bg-accent/20"
            >
              <Plus size={16} weight="fill" />
              New Webhook
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showConfigDialog && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border/30"
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Repository (or * for all)</Label>
                  <Input
                    value={selectedRepository}
                    onChange={(e) => setSelectedRepository(e.target.value)}
                    placeholder="owner/repo or *"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-2 block">Events to Monitor</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableEvents.map((event) => (
                      <div key={event.value} className="flex items-center gap-2">
                        <Checkbox
                          id={event.value}
                          checked={selectedEvents.includes(event.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEvents([...selectedEvents, event.value])
                            } else {
                              setSelectedEvents(selectedEvents.filter(e => e !== event.value))
                            }
                          }}
                        />
                        <Label htmlFor={event.value} className="text-xs flex items-center gap-1 cursor-pointer">
                          {event.icon}
                          {event.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="auto-sync"
                    checked={autoSyncEnabled}
                    onCheckedChange={(checked) => setAutoSyncEnabled(!!checked)}
                  />
                  <Label htmlFor="auto-sync" className="text-xs cursor-pointer">
                    Automatically trigger sync on events
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={createWebhookConfig}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Plus size={16} weight="fill" />
                    Create Webhook
                  </Button>
                  <Button
                    onClick={() => setShowConfigDialog(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
        <Card className="border-2 border-border/50 console-glow bg-card/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-semibold text-lg">Webhook Configurations</h3>
              <Badge variant="outline">{webhookConfigs?.length || 0} active</Badge>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              <AnimatePresence>
                {webhookConfigs && webhookConfigs.length > 0 ? (
                  webhookConfigs.map((config, idx) => (
                    <motion.div
                      key={config.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className={`p-4 border ${config.active ? 'border-accent/30 bg-accent/5' : 'border-border/30 bg-muted/20'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-2">
                            <Broadcast size={20} weight="fill" className={config.active ? 'text-accent' : 'text-muted-foreground'} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-orbitron font-semibold text-sm">
                                  {config.repository}
                                </span>
                                <Badge className={`text-[10px] ${config.active ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                                  {config.active ? 'ACTIVE' : 'PAUSED'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {config.events.length} event types · {config.delivery_count} deliveries
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleWebhook(config.id)}
                              className="h-7 w-7 p-0"
                            >
                              {config.active ? (
                                <PauseCircle size={16} weight="fill" />
                              ) : (
                                <PlayCircle size={16} weight="fill" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteWebhook(config.id)}
                              className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                            >
                              <Trash size={16} weight="fill" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {config.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-[10px]">
                              {event}
                            </Badge>
                          ))}
                        </div>

                        {config.auto_sync && (
                          <div className="mt-2 pt-2 border-t border-border/30">
                            <div className="flex items-center gap-1 text-xs text-accent">
                              <ArrowsClockwise size={12} weight="fill" />
                              Auto-sync enabled
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Bell size={48} weight="fill" className="text-muted-foreground mb-3" />
                    <h4 className="font-orbitron font-semibold mb-2">No Webhooks Configured</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a webhook to start monitoring repository events
                    </p>
                    <Button
                      onClick={() => setShowConfigDialog(true)}
                      size="sm"
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Plus size={16} weight="fill" />
                      Create First Webhook
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>

        <Card className="border-2 border-border/50 console-glow bg-card/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-semibold text-lg">Recent Events</h3>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {webhookEvents?.filter(e => !e.processed).length || 0} pending
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setWebhookEvents(() => [])}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => manualTriggerEvent('push')}
                className="text-xs bg-accent/20 hover:bg-accent/30 border border-accent/50"
              >
                <GitCommit size={14} weight="fill" />
                Simulate Push
              </Button>
              <Button
                size="sm"
                onClick={() => manualTriggerEvent('pull_request')}
                className="text-xs bg-secondary/20 hover:bg-secondary/30 border border-secondary/50"
              >
                <GitPullRequest size={14} weight="fill" />
                Simulate PR
              </Button>
              <Button
                size="sm"
                onClick={() => manualTriggerEvent('workflow_run')}
                className="text-xs bg-primary/20 hover:bg-primary/30 border border-primary/50"
              >
                <PlayCircle size={14} weight="fill" />
                Simulate Workflow
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              <AnimatePresence>
                {webhookEvents && webhookEvents.length > 0 ? (
                  webhookEvents.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Card className={`p-3 border ${event.processed ? 'border-border/30 bg-card' : 'border-accent/30 bg-accent/5'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 flex-1">
                            {getEventIcon(event.event_type)}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`text-[10px] ${getEventColor(event.event_type)}`}>
                                  {event.event_type}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  <GitBranch size={10} weight="fill" className="mr-1" />
                                  {event.branch}
                                </Badge>
                              </div>
                              
                              <p className="text-xs mb-1">
                                <span className="font-semibold">{event.actor}</span>
                                {' · '}
                                {event.repository}
                              </p>
                              
                              {event.payload.commits && (
                                <p className="text-xs text-muted-foreground">
                                  {event.payload.commits.length} commit{event.payload.commits.length !== 1 ? 's' : ''}
                                </p>
                              )}
                              
                              {event.payload.pull_request && (
                                <p className="text-xs text-muted-foreground">
                                  PR #{event.payload.pull_request.number}: {event.payload.pull_request.title}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-2">
                                {event.processed ? (
                                  <Badge className="text-[10px] bg-accent/20 text-accent border-accent/30">
                                    <CheckCircle size={10} weight="fill" className="mr-1" />
                                    Processed
                                  </Badge>
                                ) : (
                                  <Badge className="text-[10px] bg-muted text-muted-foreground">
                                    <Warning size={10} weight="fill" className="mr-1" />
                                    Pending
                                  </Badge>
                                )}
                                
                                {event.auto_synced && (
                                  <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">
                                    <ArrowsClockwise size={10} weight="fill" className="mr-1" />
                                    Auto-synced
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity size={48} weight="fill" className="text-muted-foreground mb-3" />
                    <h4 className="font-orbitron font-semibold mb-2">No Events Yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isMonitoring 
                        ? 'Waiting for repository events...' 
                        : 'Enable monitoring to receive real-time events'}
                    </p>
                    {!isMonitoring && (
                      <Button
                        onClick={() => toggleMonitoring(true)}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                      >
                        <BellRinging size={16} weight="fill" />
                        Start Monitoring
                      </Button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>
      </div>

      <Card className="p-4 border-2 border-border/50 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Events</p>
              <p className="font-orbitron font-bold text-xl">{webhookEvents?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Processed</p>
              <p className="font-orbitron font-bold text-xl text-accent">
                {webhookEvents?.filter(e => e.processed).length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Auto-synced</p>
              <p className="font-orbitron font-bold text-xl text-primary">
                {webhookEvents?.filter(e => e.auto_synced).length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Response</p>
              <p className="font-orbitron font-bold text-xl">
                {webhookDeliveries?.length 
                  ? Math.floor(webhookDeliveries.reduce((acc, d) => acc + d.response_time_ms, 0) / webhookDeliveries.length)
                  : 0}ms
              </p>
            </div>
          </div>
          
          {isMonitoring && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground">Monitoring Active</span>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}
