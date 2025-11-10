import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Warning,
  CheckCircle,
  XCircle,
  ArrowsClockwise,
  Database,
  Globe,
  FileCode,
  Lightning,
  Sparkle,
  Clock,
  Activity,
  Broadcast
} from '@phosphor-icons/react'
import { GitBranch as GitBranchType, GitConflict, IntegrationStatus, SyncEvent } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function GitIntegrationManager() {
  const [autoSync, setAutoSync] = useKV<boolean>('git-auto-sync', false)
  const [syncInterval, setSyncInterval] = useKV<number>('git-sync-interval', 30000)
  const [isLiveSyncing, setIsLiveSyncing] = useState(false)
  
  const [branches, setBranches] = useKV<GitBranchType[]>('git-branches', [
    {
      name: 'master',
      type: 'master',
      purpose: 'Live server deployment and production hosting',
      integrations: ['Live Server', 'Firebase Hosting'],
      status: 'active',
      deploymentTarget: 'https://your-live-server.com',
      commitsAhead: 0,
      commitsBehind: 3,
      lastSyncTime: Date.now() - 300000
    },
    {
      name: 'main',
      type: 'main',
      purpose: 'Workflow automation, CI/CD pipelines, Firebase config',
      integrations: ['GitHub Actions', 'Firebase Functions', 'VS Code'],
      status: 'active',
      deploymentTarget: 'https://console.firebase.google.com',
      commitsAhead: 3,
      commitsBehind: 0,
      lastSyncTime: Date.now() - 120000
    }
  ])

  const [conflicts, setConflicts] = useKV<GitConflict[]>('git-conflicts', [])
  
  const [integrations, setIntegrations] = useKV<IntegrationStatus[]>('integrations', [
    {
      name: 'Firebase Console',
      type: 'firebase',
      status: 'operational',
      branch: 'main',
      url: 'https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview',
      lastSync: Date.now() - 3600000,
      syncFrequency: 60000,
      autoSync: true
    },
    {
      name: 'Live Server',
      type: 'live-server',
      status: 'operational',
      branch: 'master',
      lastSync: Date.now() - 7200000,
      syncFrequency: 30000,
      autoSync: true
    },
    {
      name: 'GitHub Workflows',
      type: 'workflow',
      status: 'operational',
      branch: 'main',
      url: 'https://github.com/your-repo/actions',
      lastSync: Date.now() - 1800000,
      syncFrequency: 45000,
      autoSync: true
    },
    {
      name: 'VS Code Integration',
      type: 'vscode',
      status: 'operational',
      branch: 'main',
      url: 'https://vscode.dev/github/microsoft/vscode-docs',
      lastSync: Date.now() - 900000,
      syncFrequency: 90000,
      autoSync: true
    }
  ])

  const [syncEvents, setSyncEvents] = useKV<SyncEvent[]>('sync-events', [])
  const [commandInput, setCommandInput] = useState('')
  const [commandHistory, setCommandHistory] = useKV<string[]>('command-history', [])

  const addSyncEvent = useCallback((
    type: SyncEvent['type'],
    branch: string,
    status: SyncEvent['status'],
    message: string,
    details?: any
  ) => {
    const event: SyncEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      branch,
      status,
      message,
      details
    }
    
    setSyncEvents((current) => [event, ...(current || [])].slice(0, 100))
  }, [setSyncEvents])

  const performBranchSync = useCallback(async (branchName: string) => {
    addSyncEvent('sync', branchName, 'started', `Starting sync for ${branchName}`)
    
    setBranches((current) => 
      (current || []).map(branch => 
        branch.name === branchName 
          ? { ...branch, status: 'syncing' as const }
          : branch
      )
    )

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000))

    const shouldHaveConflict = Math.random() > 0.7
    
    if (shouldHaveConflict) {
      addSyncEvent('conflict-detected', branchName, 'failed', 
        `Conflict detected during sync of ${branchName}`)
      
      setBranches((current) => 
        (current || []).map(branch => 
          branch.name === branchName 
            ? { ...branch, status: 'conflict' as const, lastSyncTime: Date.now() }
            : branch
        )
      )
      
      toast.warning(`Conflict detected in ${branchName}`, {
        description: 'Check conflicts tab for resolution strategies'
      })
    } else {
      const newCommitsAhead = Math.floor(Math.random() * 3)
      const newCommitsBehind = Math.floor(Math.random() * 2)
      
      addSyncEvent('sync', branchName, 'success', 
        `Successfully synced ${branchName} - ${newCommitsAhead} ahead, ${newCommitsBehind} behind`)
      
      setBranches((current) => 
        (current || []).map(branch => 
          branch.name === branchName 
            ? { 
                ...branch, 
                status: newCommitsAhead === 0 && newCommitsBehind === 0 ? 'synced' as const : 
                        newCommitsAhead > 0 ? 'ahead' as const : 'behind' as const,
                commitsAhead: newCommitsAhead,
                commitsBehind: newCommitsBehind,
                lastSyncTime: Date.now(),
                lastCommit: `Synced at ${new Date().toLocaleTimeString()}`
              }
            : branch
        )
      )
      
      toast.success(`${branchName} synced successfully`, {
        description: `${newCommitsAhead} commits ahead, ${newCommitsBehind} commits behind`
      })
    }
  }, [addSyncEvent, setBranches])

  const performIntegrationSync = useCallback(async (integrationName: string) => {
    setIntegrations((current) => 
      (current || []).map(integration => 
        integration.name === integrationName 
          ? { ...integration, status: 'syncing' as const }
          : integration
      )
    )

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500))

    const shouldSucceed = Math.random() > 0.15
    
    setIntegrations((current) => 
      (current || []).map(integration => 
        integration.name === integrationName 
          ? { 
              ...integration, 
              status: shouldSucceed ? 'operational' as const : 'warning' as const,
              lastSync: Date.now()
            }
          : integration
      )
    )

    if (!shouldSucceed) {
      toast.warning(`${integrationName} sync completed with warnings`)
    }
  }, [setIntegrations])

  useEffect(() => {
    if (!autoSync || !isLiveSyncing) return

    const syncAllBranches = async () => {
      const branchList = branches || []
      for (const branch of branchList) {
        if (branch.status !== 'syncing') {
          await performBranchSync(branch.name)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    const syncAllIntegrations = async () => {
      const integrationList = integrations || []
      for (const integration of integrationList) {
        if (integration.autoSync && integration.status !== 'syncing') {
          await performIntegrationSync(integration.name)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }

    const syncTimer = setInterval(() => {
      syncAllBranches()
      syncAllIntegrations()
    }, syncInterval)

    syncAllBranches()
    syncAllIntegrations()

    return () => clearInterval(syncTimer)
  }, [autoSync, isLiveSyncing, syncInterval, branches, integrations, performBranchSync, performIntegrationSync])

  const toggleAutoSync = (enabled: boolean) => {
    setAutoSync(() => enabled)
    setIsLiveSyncing(enabled)
    
    if (enabled) {
      addSyncEvent('sync', 'all', 'started', 'Real-time synchronization enabled')
      toast.success('Real-time sync enabled', {
        description: `Syncing every ${(syncInterval || 30000) / 1000} seconds`
      })
    } else {
      addSyncEvent('sync', 'all', 'success', 'Real-time synchronization disabled')
      toast.info('Real-time sync disabled')
    }
  }

  const detectConflicts = () => {
    toast.info('Scanning for conflicts...')
    
    setTimeout(() => {
      const newConflicts: GitConflict[] = [
        {
          id: `conflict-${Date.now()}-1`,
          type: 'merge',
          branches: ['master', 'main'],
          files: ['.github/workflows/firebase.yml', 'firebase.json'],
          description: 'Workflow configurations differ between master and main branches',
          severity: 'medium',
          resolutionStrategy: [
            'Keep workflows in main branch only',
            'Merge main into master to sync configurations',
            'Use branch-specific workflow triggers'
          ]
        },
        {
          id: `conflict-${Date.now()}-2`,
          type: 'deployment',
          branches: ['master'],
          files: ['firebase.json', '.firebaserc'],
          description: 'Firebase deployment target may be pointing to wrong branch',
          severity: 'high',
          resolutionStrategy: [
            'Update firebase.json hosting target',
            'Deploy to specific branch: firebase deploy --only hosting:master',
            'Check .firebaserc project configuration'
          ]
        }
      ]

      setConflicts((current) => [...newConflicts, ...(current || [])])
      toast.success(`Found ${newConflicts.length} potential conflicts`)
    }, 1500)
  }

  const resolveConflict = (conflictId: string, strategyIndex: number) => {
    const conflict = conflicts?.find(c => c.id === conflictId)
    if (!conflict) return

    const strategy = conflict.resolutionStrategy[strategyIndex]
    toast.info(`Applying resolution: ${strategy}`)

    setTimeout(() => {
      setConflicts((current) => (current || []).filter(c => c.id !== conflictId))
      toast.success('Conflict resolved!')
    }, 1000)
  }

  const syncBranches = () => {
    toast.info('Synchronizing branches...')
    
    setTimeout(() => {
      setBranches((current) => 
        (current || []).map(branch => ({
          ...branch,
          status: 'synced' as const,
          lastCommit: `Synced at ${new Date().toLocaleTimeString()}`
        }))
      )
      toast.success('Branches synchronized successfully!')
    }, 2000)
  }

  const executeCommand = (command: string) => {
    if (!command.trim()) return

    setCommandHistory((current) => [command, ...(current || [])].slice(0, 50))
    setCommandInput('')

    const cmd = command.trim().toLowerCase()

    if (cmd === 'status') {
      toast.info('Checking system status...')
      setTimeout(() => {
        toast.success('All integrations operational')
      }, 1000)
    } else if (cmd === 'sync') {
      syncBranches()
    } else if (cmd === 'detect conflicts') {
      detectConflicts()
    } else if (cmd.startsWith('merge')) {
      const parts = cmd.split(' ')
      if (parts.length >= 3) {
        toast.info(`Simulating merge: ${parts[1]} → ${parts[2]}`)
        setTimeout(() => {
          toast.success('Merge completed successfully')
        }, 1500)
      }
    } else if (cmd === 'help') {
      toast.info('Available commands: status, sync, detect conflicts, merge <from> <to>, deploy <branch>, help')
    } else {
      toast.info(`Executing: ${command}`)
      setTimeout(() => {
        toast.success('Command completed')
      }, 1000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'synced':
      case 'active':
        return 'text-accent'
      case 'warning':
      case 'ahead':
      case 'behind':
        return 'text-secondary'
      case 'syncing':
        return 'text-primary'
      case 'error':
      case 'conflict':
      case 'critical':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
      case 'synced':
      case 'active':
        return <CheckCircle size={20} weight="fill" className="text-accent" />
      case 'warning':
      case 'ahead':
      case 'behind':
        return <Warning size={20} weight="fill" className="text-secondary" />
      case 'syncing':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <ArrowsClockwise size={20} weight="fill" className="text-primary" />
          </motion.div>
        )
      case 'error':
      case 'conflict':
      case 'critical':
        return <XCircle size={20} weight="fill" className="text-destructive" />
      default:
        return <ArrowsClockwise size={20} weight="fill" className="text-muted-foreground" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-accent/20 text-accent border-accent/30'
      case 'medium':
        return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'high':
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30'
    }
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isLiveSyncing ? [0, 360] : 0 }}
              transition={{ duration: 2, repeat: isLiveSyncing ? Infinity : 0, ease: "linear" }}
            >
              <GitBranch size={32} weight="fill" className={isLiveSyncing ? "text-accent" : "text-primary"} />
            </motion.div>
            <div>
              <h2 className="font-orbitron font-bold text-2xl text-glow uppercase">
                Git Integration Manager
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  Hybrid Repository System · Live Conflict Resolution
                </p>
                {isLiveSyncing && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge className="bg-accent/20 text-accent border-accent/50">
                      <Broadcast size={12} weight="fill" className="mr-1" />
                      LIVE
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={syncBranches}
              variant="outline"
              className="border-accent/50 hover:bg-accent/20"
              disabled={isLiveSyncing}
            >
              <ArrowsClockwise size={18} weight="fill" />
              Sync All
            </Button>
            <Button
              onClick={detectConflicts}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Sparkle size={18} weight="fill" />
              Detect Conflicts
            </Button>
          </div>
        </div>

        <Card className="p-4 border border-border/50 bg-card/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity size={20} weight="fill" className={isLiveSyncing ? "text-accent" : "text-muted-foreground"} />
                <Label htmlFor="auto-sync" className="font-orbitron text-sm cursor-pointer">
                  Real-Time Synchronization
                </Label>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync || false}
                onCheckedChange={toggleAutoSync}
                className="data-[state=checked]:bg-accent"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock size={16} weight="fill" className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Interval: {((syncInterval || 30000) / 1000)}s
                </span>
              </div>
              {isLiveSyncing && (
                <Badge variant="outline" className="border-accent/50 text-accent">
                  <Activity size={12} weight="fill" className="mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>
          
          {isLiveSyncing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-border/30"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Last sync: {syncEvents?.[0] ? new Date(syncEvents[0].timestamp).toLocaleTimeString() : 'Never'}
                </span>
                <span className="text-muted-foreground">
                  {syncEvents?.filter(e => e.status === 'success').length || 0} successful syncs
                </span>
              </div>
            </motion.div>
          )}
        </Card>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-card/50 w-full justify-start">
          <TabsTrigger value="overview" className="font-orbitron">
            <Database size={16} weight="fill" className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="live-sync" className="font-orbitron">
            <Broadcast size={16} weight="fill" className="mr-2" />
            Live Sync
            {isLiveSyncing && (
              <Badge className="ml-2 bg-accent/20 text-accent text-[10px] h-4 px-1">
                ON
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="branches" className="font-orbitron">
            <GitBranch size={16} weight="fill" className="mr-2" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="font-orbitron">
            <Warning size={16} weight="fill" className="mr-2" />
            Conflicts ({conflicts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="integrations" className="font-orbitron">
            <Globe size={16} weight="fill" className="mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="commands" className="font-orbitron">
            <FileCode size={16} weight="fill" className="mr-2" />
            Commands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 mt-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6 border-2 border-border/50 console-glow bg-card/50">
              <h3 className="font-orbitron font-semibold text-lg mb-4 text-accent">
                System Architecture
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <GitBranch size={24} weight="fill" className="text-accent" />
                    <span className="font-orbitron font-bold">HYBRID SYSTEM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your repository is a living, distributed deployment system with multiple active integration points.
                  </p>
                </div>

                <div className="space-y-2">
                  {branches?.map((branch) => (
                    <div
                      key={branch.name}
                      className="p-3 bg-card border border-border/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GitCommit size={18} weight="fill" className="text-accent" />
                          <span className="font-orbitron font-semibold">{branch.name}</span>
                          <Badge className={getSeverityColor(branch.type === 'master' ? 'high' : 'medium')}>
                            {branch.type}
                          </Badge>
                        </div>
                        {getStatusIcon(branch.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{branch.purpose}</p>
                      <div className="flex flex-wrap gap-1">
                        {branch.integrations.map((integration) => (
                          <Badge key={integration} variant="outline" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-border/50 console-glow bg-card/50">
              <h3 className="font-orbitron font-semibold text-lg mb-4 text-accent">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={() => executeCommand('sync')}
                  className="w-full justify-start bg-primary/20 hover:bg-primary/30 text-foreground border border-primary/30"
                >
                  <ArrowsClockwise size={18} weight="fill" className="mr-2" />
                  Sync master ← main (Merge workflows)
                </Button>
                <Button
                  onClick={() => executeCommand('merge main master')}
                  className="w-full justify-start bg-secondary/20 hover:bg-secondary/30 text-foreground border border-secondary/30"
                >
                  <GitMerge size={18} weight="fill" className="mr-2" />
                  Merge main into master
                </Button>
                <Button
                  onClick={() => executeCommand('deploy master')}
                  className="w-full justify-start bg-accent/20 hover:bg-accent/30 text-foreground border border-accent/30"
                >
                  <Lightning size={18} weight="fill" className="mr-2" />
                  Deploy to Firebase (master)
                </Button>
                <Button
                  onClick={() => window.open('https://console.firebase.google.com/u/0/project/device-streaming-f6c287f6/overview', '_blank')}
                  className="w-full justify-start bg-card hover:bg-card/80 text-foreground border border-border/50"
                >
                  <Globe size={18} weight="fill" className="mr-2" />
                  Open Firebase Console
                </Button>
              </div>

              <div className="mt-6 p-4 bg-muted/20 border border-border/30 rounded-lg">
                <h4 className="font-orbitron font-semibold text-sm mb-2">Understanding Your System</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  This is NOT a standard git repository. It's a hybrid deployment system where both master and main branches serve live infrastructure.
                </p>
                <Button
                  onClick={() => window.open('/GIT_INTEGRATION_GUIDE.md', '_blank')}
                  variant="outline"
                  className="w-full text-xs border-accent/50 hover:bg-accent/20"
                >
                  <FileCode size={16} weight="fill" className="mr-2" />
                  Read Full Integration Guide
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live-sync" className="flex-1 mt-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {branches?.map((branch) => (
              <Card key={branch.name} className="p-4 border-2 border-border/50 console-glow bg-card/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch size={20} weight="fill" className="text-accent" />
                    <span className="font-orbitron font-bold">{branch.name}</span>
                  </div>
                  {branch.status === 'syncing' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <ArrowsClockwise size={18} weight="fill" className="text-accent" />
                    </motion.div>
                  )}
                  {branch.status !== 'syncing' && getStatusIcon(branch.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-orbitron text-xs ${getStatusColor(branch.status)}`}>
                      {branch.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {(branch.commitsAhead !== undefined || branch.commitsBehind !== undefined) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commits:</span>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline" className="border-accent/50">
                          ↑ {branch.commitsAhead || 0}
                        </Badge>
                        <Badge variant="outline" className="border-destructive/50">
                          ↓ {branch.commitsBehind || 0}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {branch.lastSyncTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Sync:</span>
                      <span className="text-xs">
                        {Math.floor((Date.now() - branch.lastSyncTime) / 1000)}s ago
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => performBranchSync(branch.name)}
                  disabled={branch.status === 'syncing'}
                  size="sm"
                  className="w-full mt-3 bg-accent/20 hover:bg-accent/30 text-foreground border border-accent/50"
                >
                  <ArrowsClockwise size={14} weight="fill" className="mr-1" />
                  Sync Now
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-6 border-2 border-border/50 console-glow bg-card/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-semibold text-lg text-accent">
                Sync Activity Stream
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSyncEvents(() => [])}
                className="border-destructive/50 hover:bg-destructive/20"
              >
                Clear History
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <AnimatePresence>
                {syncEvents && syncEvents.length > 0 ? (
                  <div className="space-y-2">
                    {syncEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 bg-muted/20 border border-border/30 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 flex-1">
                            {event.status === 'success' && <CheckCircle size={18} weight="fill" className="text-accent mt-0.5" />}
                            {event.status === 'failed' && <XCircle size={18} weight="fill" className="text-destructive mt-0.5" />}
                            {event.status === 'in-progress' && <ArrowsClockwise size={18} weight="fill" className="text-secondary mt-0.5" />}
                            {event.status === 'started' && <Activity size={18} weight="fill" className="text-muted-foreground mt-0.5" />}
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {event.type}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] h-5">
                                  <GitBranch size={10} weight="fill" className="mr-1" />
                                  {event.branch}
                                </Badge>
                              </div>
                              <p className="text-sm">{event.message}</p>
                            </div>
                          </div>
                          
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <Activity size={48} weight="fill" className="text-muted-foreground mb-3" />
                    <h4 className="font-orbitron font-semibold mb-2">No Sync Activity</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enable real-time synchronization to see live updates
                    </p>
                    {!isLiveSyncing && (
                      <Button
                        onClick={() => toggleAutoSync(true)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Broadcast size={16} weight="fill" className="mr-2" />
                        Enable Live Sync
                      </Button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="flex-1 mt-4 overflow-auto">
          <div className="grid grid-cols-1 gap-4">
            {branches?.map((branch) => (
              <Card key={branch.name} className="p-6 border-2 border-border/50 console-glow bg-card/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <GitBranch size={28} weight="fill" className="text-accent" />
                    <div>
                      <h3 className="font-orbitron font-bold text-xl">{branch.name}</h3>
                      <p className="text-xs text-muted-foreground">{branch.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(branch.status)}
                    <span className={`font-orbitron text-sm ${getStatusColor(branch.status)}`}>
                      {branch.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Integrations</Label>
                    <div className="flex flex-wrap gap-2">
                      {branch.integrations.map((integration) => (
                        <Badge key={integration} className="bg-primary/20 text-primary-foreground border-primary/30">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Sync Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {(branch.commitsAhead !== undefined && branch.commitsAhead > 0) && (
                        <Badge variant="outline" className="border-accent/50 text-accent">
                          {branch.commitsAhead} commits ahead
                        </Badge>
                      )}
                      {(branch.commitsBehind !== undefined && branch.commitsBehind > 0) && (
                        <Badge variant="outline" className="border-destructive/50 text-destructive">
                          {branch.commitsBehind} commits behind
                        </Badge>
                      )}
                      {branch.lastSyncTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock size={10} weight="fill" className="mr-1" />
                          {Math.floor((Date.now() - branch.lastSyncTime) / 60000)}m ago
                        </Badge>
                      )}
                    </div>
                  </div>

                  {branch.deploymentTarget && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Deployment Target</Label>
                      <a
                        href={branch.deploymentTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline flex items-center gap-1"
                      >
                        <Globe size={14} weight="fill" />
                        {branch.deploymentTarget}
                      </a>
                    </div>
                  )}
                </div>

                {branch.lastCommit && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <Label className="text-xs text-muted-foreground">Last Activity</Label>
                    <p className="text-sm mt-1">{branch.lastCommit}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="flex-1 mt-4 overflow-auto">
          <ScrollArea className="h-full">
            <AnimatePresence>
              {conflicts && conflicts.length > 0 ? (
                <div className="space-y-4">
                  {conflicts.map((conflict, idx) => (
                    <motion.div
                      key={conflict.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-6 border-2 border-destructive/30 console-glow-active bg-card/50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <Warning size={28} weight="fill" className="text-destructive mt-1" />
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-orbitron font-bold text-lg">
                                  {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict
                                </h3>
                                <Badge className={getSeverityColor(conflict.severity)}>
                                  {conflict.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{conflict.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground mb-2 block">Affected Branches</Label>
                          <div className="flex flex-wrap gap-2">
                            {conflict.branches.map((branch) => (
                              <Badge key={branch} variant="outline">
                                <GitBranch size={12} weight="fill" className="mr-1" />
                                {branch}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground mb-2 block">Affected Files</Label>
                          <div className="flex flex-wrap gap-2">
                            {conflict.files.map((file) => (
                              <Badge key={file} variant="outline" className="text-xs">
                                <FileCode size={12} weight="fill" className="mr-1" />
                                {file}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-3 block">Resolution Strategies</Label>
                          <div className="space-y-2">
                            {conflict.resolutionStrategy.map((strategy, strategyIdx) => (
                              <div
                                key={strategyIdx}
                                className="flex items-center justify-between p-3 bg-muted/20 border border-border/30 rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <span className="text-sm">{strategy}</span>
                                <Button
                                  size="sm"
                                  onClick={() => resolveConflict(conflict.id, strategyIdx)}
                                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                >
                                  <CheckCircle size={14} weight="fill" className="mr-1" />
                                  Apply
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-12 border-2 border-border/50 bg-card/50 text-center">
                  <CheckCircle size={64} weight="fill" className="text-accent mx-auto mb-4" />
                  <h3 className="font-orbitron font-bold text-xl mb-2">No Conflicts Detected</h3>
                  <p className="text-muted-foreground mb-6">
                    Your repository is in sync. All branches are clean.
                  </p>
                  <Button
                    onClick={detectConflicts}
                    variant="outline"
                    className="border-accent/50 hover:bg-accent/20"
                  >
                    <Sparkle size={18} weight="fill" className="mr-2" />
                    Scan for Conflicts
                  </Button>
                </Card>
              )}
            </AnimatePresence>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="integrations" className="flex-1 mt-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations?.map((integration) => (
              <Card key={integration.name} className="p-6 border-2 border-border/50 console-glow bg-card/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {integration.type === 'firebase' && <Database size={28} weight="fill" className="text-accent" />}
                    {integration.type === 'live-server' && <Globe size={28} weight="fill" className="text-accent" />}
                    {integration.type === 'workflow' && <GitPullRequest size={28} weight="fill" className="text-accent" />}
                    {integration.type === 'vscode' && <FileCode size={28} weight="fill" className="text-accent" />}
                    <div>
                      <h3 className="font-orbitron font-bold text-lg">{integration.name}</h3>
                      <p className="text-xs text-muted-foreground">Branch: {integration.branch}</p>
                    </div>
                  </div>
                  {getStatusIcon(integration.status)}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-orbitron font-semibold ${getStatusColor(integration.status)}`}>
                        {integration.status.toUpperCase()}
                      </p>
                      {integration.status === 'syncing' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <ArrowsClockwise size={14} weight="fill" className="text-accent" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {integration.autoSync !== undefined && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Auto-Sync</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={integration.autoSync ? "default" : "outline"} className="text-xs">
                          {integration.autoSync ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {integration.syncFrequency && integration.autoSync && (
                          <span className="text-xs text-muted-foreground">
                            Every {integration.syncFrequency / 1000}s
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {integration.lastSync && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Last Sync</Label>
                      <p className="text-sm">
                        {new Date(integration.lastSync).toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({Math.floor((Date.now() - integration.lastSync) / 60000)}m ago)
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => performIntegrationSync(integration.name)}
                      disabled={integration.status === 'syncing'}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-accent/50 hover:bg-accent/20"
                    >
                      <ArrowsClockwise size={14} weight="fill" className="mr-1" />
                      Sync Now
                    </Button>
                    
                    {integration.url && (
                      <Button
                        onClick={() => window.open(integration.url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-primary/50 hover:bg-primary/20"
                      >
                        <Globe size={14} weight="fill" className="mr-1" />
                        Open
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commands" className="flex-1 mt-4 overflow-hidden flex flex-col">
          <Card className="flex-1 border-2 border-border/50 console-glow bg-card/50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/30">
              <h3 className="font-orbitron font-semibold text-lg text-accent">Command Interface</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Execute git operations and integration commands
              </p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2 mb-4">
                {commandHistory?.slice(0, 20).map((cmd, idx) => (
                  <div key={idx} className="p-2 bg-muted/20 border border-border/30 rounded font-mono text-sm">
                    <span className="text-accent">$</span> {cmd}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/30">
              <div className="flex gap-2">
                <Input
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeCommand(commandInput)
                    }
                  }}
                  placeholder="Type command... (try: status, sync, help)"
                  className="flex-1 bg-background/50 border-border/50 font-mono"
                />
                <Button
                  onClick={() => executeCommand(commandInput)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Lightning size={18} weight="fill" />
                  Execute
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommandInput('status')}
                  className="text-xs"
                >
                  status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommandInput('sync')}
                  className="text-xs"
                >
                  sync
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommandInput('detect conflicts')}
                  className="text-xs"
                >
                  detect conflicts
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommandInput('merge main master')}
                  className="text-xs"
                >
                  merge main master
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCommandInput('help')}
                  className="text-xs"
                >
                  help
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
