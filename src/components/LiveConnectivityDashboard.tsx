import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowLeft,
  Lightning,
  Globe,
  FileText,
  Plug,
  Activity,
  PlayCircle,
  CheckSquare,
  XSquare,
  MinusCircle,
  ArrowClockwise
} from '@phosphor-icons/react'
import { ConnectivityMonitor, PipelineMonitor, ServiceEndpoint, PipelineStatus } from '@/lib/connectivity-monitor'
import { motion, AnimatePresence } from 'framer-motion'

interface LiveConnectivityDashboardProps {
  onClose: () => void
}

export function LiveConnectivityDashboard({ onClose }: LiveConnectivityDashboardProps) {
  const [services, setServices] = useState<ServiceEndpoint[]>([])
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [connectivityMonitor] = useState(() => new ConnectivityMonitor())
  const [pipelineMonitor] = useState(() => new PipelineMonitor())

  useEffect(() => {
    const unsubscribeConnectivity = connectivityMonitor.subscribe(setServices)
    const unsubscribePipelines = pipelineMonitor.subscribe(setPipelines)

    connectivityMonitor.checkAll()

    return () => {
      unsubscribeConnectivity()
      unsubscribePipelines()
      connectivityMonitor.stopMonitoring()
      pipelineMonitor.stopMonitoring()
    }
  }, [connectivityMonitor, pipelineMonitor])

  const handleStartMonitoring = () => {
    connectivityMonitor.startMonitoring(60000)
    setIsMonitoring(true)
  }

  const handleStopMonitoring = () => {
    connectivityMonitor.stopMonitoring()
    pipelineMonitor.stopMonitoring()
    setIsMonitoring(false)
  }

  const handleRefresh = () => {
    connectivityMonitor.checkAll()
  }

  const getStatusIcon = (status: ServiceEndpoint['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle size={20} weight="fill" className="text-green-600" />
      case 'offline':
        return <XCircle size={20} weight="fill" className="text-red-600" />
      case 'degraded':
        return <MinusCircle size={20} weight="fill" className="text-yellow-600" />
      case 'checking':
        return <Clock size={20} weight="fill" className="text-blue-600 animate-pulse" />
    }
  }

  const getPipelineStatusIcon = (status: PipelineStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckSquare size={20} weight="fill" className="text-green-600" />
      case 'failed':
        return <XSquare size={20} weight="fill" className="text-red-600" />
      case 'running':
        return <PlayCircle size={20} weight="fill" className="text-blue-600 animate-pulse" />
      case 'pending':
        return <Clock size={20} weight="fill" className="text-yellow-600" />
      case 'cancelled':
        return <MinusCircle size={20} weight="fill" className="text-gray-600" />
    }
  }

  const getCategoryIcon = (category: ServiceEndpoint['category']) => {
    switch (category) {
      case 'documentation':
        return <FileText size={20} weight="duotone" />
      case 'platform':
        return <Globe size={20} weight="duotone" />
      case 'integration':
        return <Plug size={20} weight="duotone" />
      case 'pipeline':
        return <Activity size={20} weight="duotone" />
    }
  }

  const onlineCount = services.filter(s => s.status === 'online').length
  const offlineCount = services.filter(s => s.status === 'offline').length
  const degradedCount = services.filter(s => s.status === 'degraded').length

  const runningPipelines = pipelines.filter(p => p.status === 'running').length
  const successPipelines = pipelines.filter(p => p.status === 'success').length
  const failedPipelines = pipelines.filter(p => p.status === 'failed').length

  const documentationServices = services.filter(s => s.category === 'documentation')
  const platformServices = services.filter(s => s.category === 'platform')
  const integrationServices = services.filter(s => s.category === 'integration')

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Live Connectivity Monitor</h1>
              <p className="text-muted-foreground mt-1">
                Real-time status of developer frameworks and CI/CD pipelines
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isMonitoring}
            >
              <ArrowClockwise size={18} className={isMonitoring ? 'animate-spin' : ''} />
              <span className="ml-2">Refresh</span>
            </Button>
            {isMonitoring ? (
              <Button variant="destructive" onClick={handleStopMonitoring}>
                Stop Monitoring
              </Button>
            ) : (
              <Button onClick={handleStartMonitoring}>
                <Activity size={18} />
                <span className="ml-2">Start Live Monitoring</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Online Services</p>
                <p className="text-3xl font-bold text-green-600">{onlineCount}</p>
              </div>
              <CheckCircle size={32} weight="duotone" className="text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Offline Services</p>
                <p className="text-3xl font-bold text-red-600">{offlineCount}</p>
              </div>
              <XCircle size={32} weight="duotone" className="text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Pipelines</p>
                <p className="text-3xl font-bold text-blue-600">{runningPipelines}</p>
              </div>
              <Activity size={32} weight="duotone" className="text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Services</p>
                <p className="text-3xl font-bold">{services.length}</p>
              </div>
              <Globe size={32} weight="duotone" className="text-primary" />
            </div>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lightning size={24} weight="duotone" className="text-primary" />
                  All Services Status
                </h2>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {services.map((service) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {getCategoryIcon(service.category)}
                                <div className="flex-1">
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-sm text-muted-foreground">{service.url}</p>
                                  {service.lastChecked && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Last checked: {service.lastChecked.toLocaleTimeString()}
                                    </p>
                                  )}
                                  {service.responseTime && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Response: {service.responseTime}ms
                                    </p>
                                  )}
                                  {service.error && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Error: {service.error}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {service.apiVersion && (
                                  <Badge variant="outline">{service.apiVersion}</Badge>
                                )}
                                {getStatusIcon(service.status)}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Activity size={24} weight="duotone" className="text-blue-600" />
                  Recent Pipelines
                </h2>
                <ScrollArea className="h-[500px]">
                  {pipelines.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No pipeline data available
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Configure GitHub, Vercel, or Firebase tokens to monitor pipelines
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pipelines.map((pipeline) => (
                        <Card key={pipeline.id} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getPipelineStatusIcon(pipeline.status)}
                              <div>
                                <p className="font-medium">{pipeline.name}</p>
                                <p className="text-sm text-muted-foreground">{pipeline.platform}</p>
                              </div>
                            </div>
                            <Badge 
                              variant={
                                pipeline.status === 'success' ? 'default' :
                                pipeline.status === 'failed' ? 'destructive' :
                                pipeline.status === 'running' ? 'secondary' : 'outline'
                              }
                            >
                              {pipeline.status}
                            </Badge>
                          </div>
                          {pipeline.stage && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Stage: {pipeline.stage}
                            </p>
                          )}
                          {pipeline.startTime && (
                            <p className="text-xs text-muted-foreground">
                              Started: {pipeline.startTime.toLocaleString()}
                            </p>
                          )}
                          {pipeline.url && (
                            <a 
                              href={pipeline.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline mt-2 inline-block"
                            >
                              View Pipeline →
                            </a>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentation">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Documentation Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentationServices.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={24} weight="duotone" className="text-primary" />
                        <p className="font-medium">{service.name}</p>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.url}</p>
                    {service.lastChecked && (
                      <p className="text-xs text-muted-foreground">
                        Last checked: {service.lastChecked.toLocaleTimeString()}
                      </p>
                    )}
                    {service.responseTime && (
                      <p className="text-xs text-green-600">
                        Response time: {service.responseTime}ms
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="platforms">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Platform Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platformServices.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe size={24} weight="duotone" className="text-blue-600" />
                        <p className="font-medium">{service.name}</p>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.url}</p>
                    {service.lastChecked && (
                      <p className="text-xs text-muted-foreground">
                        Last checked: {service.lastChecked.toLocaleTimeString()}
                      </p>
                    )}
                    {service.responseTime && (
                      <p className="text-xs text-green-600">
                        Response time: {service.responseTime}ms
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Integration Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationServices.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Plug size={24} weight="duotone" className="text-purple-600" />
                        <p className="font-medium">{service.name}</p>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.url}</p>
                    {service.lastChecked && (
                      <p className="text-xs text-muted-foreground">
                        Last checked: {service.lastChecked.toLocaleTimeString()}
                      </p>
                    )}
                    {service.responseTime && (
                      <p className="text-xs text-green-600">
                        Response time: {service.responseTime}ms
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pipelines">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">CI/CD Pipeline Status</h2>
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{successPipelines}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{runningPipelines}</p>
                  <p className="text-sm text-muted-foreground">Running</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{failedPipelines}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
              
              <Separator className="my-6" />

              <ScrollArea className="h-[400px]">
                {pipelines.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No pipeline data available
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configure API tokens to monitor your CI/CD pipelines
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pipelines.map((pipeline) => (
                      <Card key={pipeline.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getPipelineStatusIcon(pipeline.status)}
                            <div>
                              <p className="font-semibold">{pipeline.name}</p>
                              <p className="text-sm text-muted-foreground">{pipeline.platform}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              pipeline.status === 'success' ? 'default' :
                              pipeline.status === 'failed' ? 'destructive' :
                              pipeline.status === 'running' ? 'secondary' : 'outline'
                            }
                          >
                            {pipeline.status}
                          </Badge>
                        </div>
                        
                        {pipeline.stage && (
                          <div className="mb-2">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Stage:</span> {pipeline.stage}
                            </p>
                          </div>
                        )}

                        {pipeline.progress !== undefined && (
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{pipeline.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${pipeline.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                          {pipeline.startTime && (
                            <p>Started: {pipeline.startTime.toLocaleString()}</p>
                          )}
                          {pipeline.url && (
                            <a 
                              href={pipeline.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Details →
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
