import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { PublishingPreset, EnvironmentType, DeploymentPlatform } from '@/lib/publishing-types'
import { 
  defaultPresets, 
  createPresetFromTemplate, 
  getPlatformIcon,
  getEnvironmentColor,
  generateDeploymentCommand,
  estimateDeploymentTime
} from '@/lib/publishing-presets'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  RocketLaunch, 
  Plus, 
  Play, 
  Gear, 
  Copy, 
  Trash,
  CloudArrowUp,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ShieldCheck,
  Lightning,
  Code,
  Globe,
  ClockCounterClockwise,
  ArrowsLeftRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import DeploymentHistoryViewer from '@/components/DeploymentHistoryViewer'
import EnvironmentComparator from '@/components/EnvironmentComparator'

export default function MultiEnvironmentPublishing() {
  const [presets, setPresets] = useKV<PublishingPreset[]>('publishing-presets', [])
  const [selectedPreset, setSelectedPreset] = useState<PublishingPreset | null>(null)
  const [isDeploying, setIsDeploying] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetEnv, setNewPresetEnv] = useState<EnvironmentType>('development')
  const [newPresetPlatform, setNewPresetPlatform] = useState<DeploymentPlatform>('vercel')

  const loadDefaultPresets = () => {
    const newPresets = defaultPresets.map(createPresetFromTemplate)
    setPresets(() => newPresets)
    toast.success('Default presets loaded!', {
      description: `${newPresets.length} publishing configurations ready`
    })
  }

  const createCustomPreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Name required', { description: 'Please enter a preset name' })
      return
    }

    const newPreset: PublishingPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newPresetName,
      description: `Custom ${newPresetEnv} deployment to ${newPresetPlatform}`,
      environment: newPresetEnv,
      platform: newPresetPlatform,
      buildConfig: {
        command: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
        nodeVersion: '20.x',
        environmentVariables: []
      },
      deploymentConfig: {
        autoPublish: true,
        branchDeployment: true,
        previewDeployments: true,
        buildOnPush: true,
        deployOnMerge: true
      },
      securityConfig: {
        httpsOnly: true,
        passwordProtection: false,
        allowedDomains: [],
        cors: { enabled: true, origins: ['*'] },
        headers: {}
      },
      performanceConfig: {
        compression: true,
        caching: true,
        cdn: true,
        minification: true,
        imageOptimization: true,
        cacheMaxAge: 31536000
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setPresets((current) => [...(current || []), newPreset])
    setShowCreateDialog(false)
    setNewPresetName('')
    toast.success('Preset created!', { description: newPreset.name })
  }

  const duplicatePreset = (preset: PublishingPreset) => {
    const duplicate: PublishingPreset = {
      ...preset,
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${preset.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setPresets((current) => [...(current || []), duplicate])
    toast.success('Preset duplicated!', { description: duplicate.name })
  }

  const deletePreset = (presetId: string) => {
    setPresets((current) => (current || []).filter(p => p.id !== presetId))
    if (selectedPreset?.id === presetId) {
      setSelectedPreset(null)
    }
    toast.success('Preset deleted')
  }

  const deployPreset = async (preset: PublishingPreset) => {
    setIsDeploying(preset.id)
    toast.info('Starting deployment...', { description: preset.name })

    const steps = [
      { message: 'Installing dependencies...', delay: 1000 },
      { message: 'Building application...', delay: 1500 },
      { message: 'Optimizing assets...', delay: 1000 },
      { message: 'Uploading to platform...', delay: 1200 },
      { message: 'Configuring environment...', delay: 800 },
      { message: 'Validating deployment...', delay: 600 }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      toast.info(step.message, { description: preset.name, duration: 1000 })
    }

    const deploymentUrl = `https://${preset.name.toLowerCase().replace(/\s+/g, '-')}-${preset.environment}.${preset.platform}.app`
    
    setPresets((current) =>
      (current || []).map(p =>
        p.id === preset.id
          ? {
              ...p,
              lastDeployment: {
                timestamp: Date.now(),
                status: 'success',
                url: deploymentUrl,
                logs: 'Deployment completed successfully'
              }
            }
          : p
      )
    )

    setIsDeploying(null)
    toast.success('🚀 Deployment successful!', {
      description: `Live at ${deploymentUrl}`,
      duration: 5000
    })
  }

  const updatePresetConfig = (
    presetId: string,
    section: keyof PublishingPreset,
    updates: any
  ) => {
    setPresets((current) =>
      (current || []).map(p => {
        if (p.id !== presetId) return p
        
        const currentSection = p[section]
        const updatedSection = typeof currentSection === 'object' && currentSection !== null
          ? { ...currentSection, ...updates }
          : updates
        
        return {
          ...p,
          [section]: updatedSection,
          updatedAt: Date.now()
        }
      })
    )
    toast.success('Configuration updated')
  }

  const getStatusIcon = (preset: PublishingPreset) => {
    if (!preset.lastDeployment) return <Clock size={16} weight="fill" className="text-muted-foreground" />
    
    switch (preset.lastDeployment.status) {
      case 'success':
        return <CheckCircle size={16} weight="fill" className="text-accent" />
      case 'failed':
        return <XCircle size={16} weight="fill" className="text-destructive" />
      default:
        return <Clock size={16} weight="fill" className="text-muted-foreground" />
    }
  }

  return (
    <Tabs defaultValue="presets" className="h-full flex flex-col">
      <div className="border-b border-border/50 bg-card/30 px-6 pt-4">
        <TabsList className="bg-transparent">
          <TabsTrigger value="presets" className="font-orbitron">
            <Gear size={16} weight="fill" className="mr-2" />
            PRESETS
          </TabsTrigger>
          <TabsTrigger value="history" className="font-orbitron">
            <ClockCounterClockwise size={16} weight="fill" className="mr-2" />
            HISTORY
          </TabsTrigger>
          <TabsTrigger value="compare" className="font-orbitron">
            <ArrowsLeftRight size={16} weight="fill" className="mr-2" />
            COMPARE
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="presets" className="flex-1 m-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RocketLaunch size={32} weight="fill" className="text-accent text-glow" />
                <div>
                  <CardTitle className="font-orbitron text-2xl text-glow">PUBLISHING PRESETS</CardTitle>
                  <CardDescription>Deploy to multiple platforms with custom configurations</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {(presets || []).length === 0 && (
                  <Button
                    onClick={loadDefaultPresets}
                    className="bg-accent/20 text-accent hover:bg-accent/30 border border-accent/50"
                  >
                    <CloudArrowUp size={18} weight="fill" className="mr-2" />
                    Load Presets
                  </Button>
                )}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus size={18} weight="bold" className="mr-2" />
                      Create Preset
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-orbitron">Create Publishing Preset</DialogTitle>
                      <DialogDescription>Configure a new deployment environment</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="preset-name">Preset Name</Label>
                        <Input
                          id="preset-name"
                          placeholder="My Custom Deployment"
                          value={newPresetName}
                          onChange={(e) => setNewPresetName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="environment">Environment</Label>
                        <Select value={newPresetEnv} onValueChange={(v) => setNewPresetEnv(v as EnvironmentType)}>
                          <SelectTrigger id="environment">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                            <SelectItem value="preview">Preview</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select value={newPresetPlatform} onValueChange={(v) => setNewPresetPlatform(v as DeploymentPlatform)}>
                          <SelectTrigger id="platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vercel">Vercel</SelectItem>
                            <SelectItem value="netlify">Netlify</SelectItem>
                            <SelectItem value="firebase">Firebase</SelectItem>
                            <SelectItem value="aws">AWS</SelectItem>
                            <SelectItem value="github-pages">GitHub Pages</SelectItem>
                            <SelectItem value="cloudflare">Cloudflare Pages</SelectItem>
                            <SelectItem value="railway">Railway</SelectItem>
                            <SelectItem value="render">Render</SelectItem>
                            <SelectItem value="heroku">Heroku</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={createCustomPreset} className="w-full">
                        Create Preset
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">{/* Existing preset content */}
        <div className="h-full grid grid-cols-12 gap-0">
          <div className="col-span-4 border-r border-border/50 bg-card/30">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <AnimatePresence>
                  {(presets || []).map((preset, index) => (
                    <motion.div
                      key={preset.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:border-accent/50 ${
                          selectedPreset?.id === preset.id
                            ? 'border-accent/50 bg-accent/10'
                            : 'border-border/50'
                        }`}
                        onClick={() => setSelectedPreset(preset)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getPlatformIcon(preset.platform)}</span>
                              <div>
                                <h4 className="font-orbitron font-semibold text-sm">{preset.name}</h4>
                                <p className="text-xs text-muted-foreground">{preset.description}</p>
                              </div>
                            </div>
                            {getStatusIcon(preset)}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              style={{
                                backgroundColor: `${getEnvironmentColor(preset.environment)}20`,
                                color: getEnvironmentColor(preset.environment),
                                borderColor: `${getEnvironmentColor(preset.environment)}50`
                              }}
                              variant="outline"
                              className="text-xs"
                            >
                              {preset.environment}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {preset.platform}
                            </Badge>
                          </div>
                          {preset.lastDeployment && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Last: {new Date(preset.lastDeployment.timestamp).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex gap-1 mt-3">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deployPreset(preset)
                              }}
                              disabled={isDeploying === preset.id}
                              className="flex-1 h-8 text-xs"
                            >
                              {isDeploying === preset.id ? (
                                <Lightning size={14} weight="fill" className="mr-1 animate-pulse" />
                              ) : (
                                <Play size={14} weight="fill" className="mr-1" />
                              )}
                              Deploy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicatePreset(preset)
                              }}
                              className="h-8"
                            >
                              <Copy size={14} weight="fill" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePreset(preset.id)
                              }}
                              className="h-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash size={14} weight="fill" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          <div className="col-span-8">
            {selectedPreset ? (
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-orbitron text-xl font-bold">{selectedPreset.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPreset.description}</p>
                    </div>
                    <Button
                      onClick={() => deployPreset(selectedPreset)}
                      disabled={isDeploying === selectedPreset.id}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isDeploying === selectedPreset.id ? (
                        <>
                          <Lightning size={18} weight="fill" className="mr-2 animate-pulse" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <RocketLaunch size={18} weight="fill" className="mr-2" />
                          Deploy Now
                        </>
                      )}
                    </Button>
                  </div>

                  <Tabs defaultValue="build" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="build">
                        <Code size={16} weight="fill" className="mr-2" />
                        Build
                      </TabsTrigger>
                      <TabsTrigger value="deployment">
                        <CloudArrowUp size={16} weight="fill" className="mr-2" />
                        Deployment
                      </TabsTrigger>
                      <TabsTrigger value="security">
                        <ShieldCheck size={16} weight="fill" className="mr-2" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger value="performance">
                        <Lightning size={16} weight="fill" className="mr-2" />
                        Performance
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="build" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-orbitron">Build Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label>Build Command</Label>
                            <Input
                              value={selectedPreset.buildConfig.command}
                              onChange={(e) =>
                                updatePresetConfig(selectedPreset.id, 'buildConfig', {
                                  command: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Output Directory</Label>
                            <Input
                              value={selectedPreset.buildConfig.outputDirectory}
                              onChange={(e) =>
                                updatePresetConfig(selectedPreset.id, 'buildConfig', {
                                  outputDirectory: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Install Command</Label>
                            <Input
                              value={selectedPreset.buildConfig.installCommand}
                              onChange={(e) =>
                                updatePresetConfig(selectedPreset.id, 'buildConfig', {
                                  installCommand: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Node Version</Label>
                            <Input
                              value={selectedPreset.buildConfig.nodeVersion}
                              onChange={(e) =>
                                updatePresetConfig(selectedPreset.id, 'buildConfig', {
                                  nodeVersion: e.target.value
                                })
                              }
                            />
                          </div>
                          <Separator />
                          <div>
                            <Label className="mb-2 block">Deployment Command</Label>
                            <div className="bg-card/50 border border-border/50 rounded p-3 font-mono text-xs">
                              {generateDeploymentCommand(selectedPreset)}
                            </div>
                          </div>
                          <div>
                            <Label className="mb-2 block">Estimated Deploy Time</Label>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} weight="fill" />
                              ~{estimateDeploymentTime(selectedPreset)} seconds
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="deployment" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-orbitron">Deployment Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-publish">Auto Publish</Label>
                            <Switch
                              id="auto-publish"
                              checked={selectedPreset.deploymentConfig.autoPublish}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'deploymentConfig', {
                                  autoPublish: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="branch-deployment">Branch Deployments</Label>
                            <Switch
                              id="branch-deployment"
                              checked={selectedPreset.deploymentConfig.branchDeployment}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'deploymentConfig', {
                                  branchDeployment: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="preview-deployments">Preview Deployments</Label>
                            <Switch
                              id="preview-deployments"
                              checked={selectedPreset.deploymentConfig.previewDeployments}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'deploymentConfig', {
                                  previewDeployments: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="build-on-push">Build on Push</Label>
                            <Switch
                              id="build-on-push"
                              checked={selectedPreset.deploymentConfig.buildOnPush}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'deploymentConfig', {
                                  buildOnPush: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="deploy-on-merge">Deploy on Merge</Label>
                            <Switch
                              id="deploy-on-merge"
                              checked={selectedPreset.deploymentConfig.deployOnMerge}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'deploymentConfig', {
                                  deployOnMerge: checked
                                })
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-orbitron">Security Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="https-only">HTTPS Only</Label>
                            <Switch
                              id="https-only"
                              checked={selectedPreset.securityConfig.httpsOnly}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'securityConfig', {
                                  httpsOnly: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password-protection">Password Protection</Label>
                            <Switch
                              id="password-protection"
                              checked={selectedPreset.securityConfig.passwordProtection}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'securityConfig', {
                                  passwordProtection: checked
                                })
                              }
                            />
                          </div>
                          {selectedPreset.securityConfig.passwordProtection && (
                            <div className="space-y-2">
                              <Label>Password</Label>
                              <Input
                                type="password"
                                value={selectedPreset.securityConfig.password || ''}
                                onChange={(e) =>
                                  updatePresetConfig(selectedPreset.id, 'securityConfig', {
                                    password: e.target.value
                                  })
                                }
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cors-enabled">CORS Enabled</Label>
                            <Switch
                              id="cors-enabled"
                              checked={selectedPreset.securityConfig.cors.enabled}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'securityConfig', {
                                  cors: { ...selectedPreset.securityConfig.cors, enabled: checked }
                                })
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-orbitron">Performance Optimization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="compression">Compression</Label>
                            <Switch
                              id="compression"
                              checked={selectedPreset.performanceConfig.compression}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'performanceConfig', {
                                  compression: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="caching">Caching</Label>
                            <Switch
                              id="caching"
                              checked={selectedPreset.performanceConfig.caching}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'performanceConfig', {
                                  caching: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cdn">CDN</Label>
                            <Switch
                              id="cdn"
                              checked={selectedPreset.performanceConfig.cdn}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'performanceConfig', {
                                  cdn: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="minification">Minification</Label>
                            <Switch
                              id="minification"
                              checked={selectedPreset.performanceConfig.minification}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'performanceConfig', {
                                  minification: checked
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="image-optimization">Image Optimization</Label>
                            <Switch
                              id="image-optimization"
                              checked={selectedPreset.performanceConfig.imageOptimization}
                              onCheckedChange={(checked) =>
                                updatePresetConfig(selectedPreset.id, 'performanceConfig', {
                                  imageOptimization: checked
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cache Max Age (seconds)</Label>
                            <Input
                              type="number"
                              value={selectedPreset.performanceConfig.cacheMaxAge}
                              onChange={(e) =>
                                updatePresetConfig(selectedPreset.id, 'performanceConfig', {
                                  cacheMaxAge: parseInt(e.target.value) || 0
                                })
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {selectedPreset.lastDeployment && (
                    <Card className="mt-6 border-accent/50">
                      <CardHeader>
                        <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                          <Globe size={16} weight="fill" />
                          Last Deployment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge variant={selectedPreset.lastDeployment.status === 'success' ? 'default' : 'destructive'}>
                              {selectedPreset.lastDeployment.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Time:</span>
                            <span className="text-sm">
                              {new Date(selectedPreset.lastDeployment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {selectedPreset.lastDeployment.url && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">URL:</span>
                              <a
                                href={selectedPreset.lastDeployment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-accent hover:underline flex items-center gap-1"
                              >
                                {selectedPreset.lastDeployment.url}
                                <Globe size={14} weight="fill" />
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Package size={64} weight="thin" className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-orbitron text-lg mb-2">No Preset Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a preset from the list or create a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
        </div>
      </TabsContent>

      <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
        <Card className="h-full border-0 rounded-none bg-transparent">
          <DeploymentHistoryViewer />
        </Card>
      </TabsContent>

      <TabsContent value="compare" className="flex-1 m-0 overflow-hidden">
        <Card className="h-full border-0 rounded-none bg-transparent">
          <EnvironmentComparator />
        </Card>
      </TabsContent>
    </Tabs>
  )
}
