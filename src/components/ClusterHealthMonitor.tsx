import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CloudArrowUp, 
  CheckCircle, 
  Warning, 
  XCircle, 
  Circle,
  Cpu,
  HardDrive,
  Network,
  Activity,
  Pause,
  Play,
  ArrowClockwise,
  Bell,
  Lightning,
  Database,
  ChartLine
} from '@phosphor-icons/react'
import { ClusterSimulator } from '@/lib/cluster-simulator'
import { ClusterNode, ClusterAlert, ClusterEvent } from '@/lib/cluster-types'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import { toast } from 'sonner'

const ClusterHealthMonitor = () => {
  const [simulator] = useState(() => new ClusterSimulator())
  const [nodes, setNodes] = useState<ClusterNode[]>([])
  const [alerts, setAlerts] = useState<ClusterAlert[]>([])
  const [events, setEvents] = useState<ClusterEvent[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null)
  
  const topologyRef = useRef<SVGSVGElement>(null)
  const cpuHistoryRef = useRef<SVGSVGElement>(null)
  const memoryHistoryRef = useRef<SVGSVGElement>(null)
  const networkRef = useRef<SVGSVGElement>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const updateData = () => {
    setNodes(simulator.getNodes())
    setAlerts(simulator.getAlerts())
    setEvents(simulator.getEvents())
  }

  const drawTopology = () => {
    if (!topologyRef.current) return

    const svg = d3.select(topologyRef.current)
    svg.selectAll('*').remove()

    const width = topologyRef.current.clientWidth
    const height = topologyRef.current.clientHeight
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    const g = svg.append('g')

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      const statusColors = {
        healthy: 'oklch(0.72 0.15 145)',
        warning: 'oklch(0.85 0.18 90)',
        critical: 'oklch(0.62 0.22 25)',
        offline: 'oklch(0.40 0.05 270)'
      }

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', node.type === 'master' ? 20 : 15)
        .attr('fill', statusColors[node.status])
        .attr('stroke', 'oklch(0.98 0.008 85)')
        .attr('stroke-width', 2)
        .attr('opacity', 0.9)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedNode(node))
        .append('title')
        .text(`${node.name}\nStatus: ${node.status}\nCPU: ${node.cpu.toFixed(1)}%\nMemory: ${node.memory.toFixed(1)}%`)

      g.append('text')
        .attr('x', x)
        .attr('y', y + (node.type === 'master' ? 35 : 30))
        .attr('text-anchor', 'middle')
        .attr('fill', 'oklch(0.85 0.18 90)')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(node.name.split('-')[0].toUpperCase())
    })

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, nodes.length); j++) {
        const angle1 = (i / nodes.length) * 2 * Math.PI - Math.PI / 2
        const angle2 = (j / nodes.length) * 2 * Math.PI - Math.PI / 2
        const x1 = centerX + radius * Math.cos(angle1)
        const y1 = centerY + radius * Math.sin(angle1)
        const x2 = centerX + radius * Math.cos(angle2)
        const y2 = centerY + radius * Math.sin(angle2)

        g.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', 'oklch(0.35 0.15 300)')
          .attr('stroke-width', 1)
          .attr('opacity', 0.2)
      }
    }
  }

  const drawMetricsHistory = () => {
    if (!cpuHistoryRef.current || !memoryHistoryRef.current) return

    const history = simulator.getMetricsHistory()
    if (history.length < 2) return

    const drawChart = (svgRef: SVGSVGElement, dataKey: 'usedCpu' | 'usedMemory', color: string) => {
      const svg = d3.select(svgRef)
      svg.selectAll('*').remove()

      const width = svgRef.clientWidth
      const height = svgRef.clientHeight
      const margin = { top: 10, right: 10, bottom: 20, left: 35 }

      const x = d3.scaleLinear()
        .domain([0, history.length - 1])
        .range([margin.left, width - margin.right])

      const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top])

      const line = d3.line<typeof history[0]>()
        .x((_, i) => x(i))
        .y(d => y(d[dataKey]))
        .curve(d3.curveMonotoneX)

      const area = d3.area<typeof history[0]>()
        .x((_, i) => x(i))
        .y0(height - margin.bottom)
        .y1(d => y(d[dataKey]))
        .curve(d3.curveMonotoneX)

      svg.append('defs')
        .append('linearGradient')
        .attr('id', `gradient-${dataKey}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color, opacity: 0.4 },
          { offset: '100%', color, opacity: 0.05 }
        ])
        .enter()
        .append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity)

      svg.append('path')
        .datum(history)
        .attr('fill', `url(#gradient-${dataKey})`)
        .attr('d', area)

      svg.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line)

      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(() => ''))
        .attr('color', 'oklch(0.556 0 0)')

      svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
        .attr('color', 'oklch(0.556 0 0)')
        .style('font-size', '10px')
    }

    drawChart(cpuHistoryRef.current, 'usedCpu', 'oklch(0.85 0.18 90)')
    drawChart(memoryHistoryRef.current, 'usedMemory', 'oklch(0.72 0.15 145)')
  }

  const drawNetworkGraph = () => {
    if (!networkRef.current || nodes.length === 0) return

    const svg = d3.select(networkRef.current)
    svg.selectAll('*').remove()

    const width = networkRef.current.clientWidth
    const height = networkRef.current.clientHeight

    const flows = simulator.getNetworkFlows()
    const maxBandwidth = Math.max(...flows.map(f => f.bandwidth), 1)

    const nodeMap = new Map(nodes.map(n => [n.id, n]))

    const simulation = d3.forceSimulation(nodes as any)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    const g = svg.append('g')

    const links = g.selectAll('line')
      .data(flows)
      .enter()
      .append('line')
      .attr('stroke', 'oklch(0.35 0.15 300)')
      .attr('stroke-width', d => 1 + (d.bandwidth / maxBandwidth) * 3)
      .attr('opacity', 0.3)

    const nodeElements = g.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 12)
      .attr('fill', 'oklch(0.85 0.18 90)')
      .attr('stroke', 'oklch(0.98 0.008 85)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    simulation.on('tick', () => {
      links
        .attr('x1', d => {
          const node = nodeMap.get(d.source)
          return (node as any)?.x || 0
        })
        .attr('y1', d => {
          const node = nodeMap.get(d.source)
          return (node as any)?.y || 0
        })
        .attr('x2', d => {
          const node = nodeMap.get(d.target)
          return (node as any)?.x || 0
        })
        .attr('y2', d => {
          const node = nodeMap.get(d.target)
          return (node as any)?.y || 0
        })

      nodeElements
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
    })
  }

  const getStatusIcon = (status: ClusterNode['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle weight="fill" className="text-green-500" />
      case 'warning': return <Warning weight="fill" className="text-yellow-500" />
      case 'critical': return <XCircle weight="fill" className="text-red-500" />
      case 'offline': return <Circle weight="fill" className="text-gray-500" />
    }
  }

  const getAlertIcon = (severity: ClusterAlert['severity']) => {
    switch (severity) {
      case 'info': return <Activity weight="fill" className="text-blue-400" />
      case 'warning': return <Warning weight="fill" className="text-yellow-500" />
      case 'critical': return <Lightning weight="fill" className="text-red-500" />
    }
  }

  useEffect(() => {
    updateData()
    
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        simulator.updateSimulation()
        updateData()
      }, 2000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  useEffect(() => {
    if (nodes.length > 0) {
      drawTopology()
      drawMetricsHistory()
      drawNetworkGraph()
    }
  }, [nodes])

  const metrics = simulator.getCurrentMetrics()

  return (
    <div className="h-full flex flex-col p-6 gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudArrowUp size={32} weight="fill" className="text-accent" />
          <div>
            <h2 className="font-orbitron text-2xl font-bold text-glow">CLUSTER HEALTH MONITOR</h2>
            <p className="text-sm text-muted-foreground">Real-time Infrastructure Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="border-accent/50"
          >
            {isRunning ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
            {isRunning ? 'PAUSE' : 'RESUME'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              simulator.updateSimulation()
              updateData()
              toast.success('Data refreshed')
            }}
            className="border-accent/50"
          >
            <ArrowClockwise size={16} weight="fill" />
            REFRESH
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              simulator.clearAcknowledgedAlerts()
              updateData()
              toast.success('Acknowledged alerts cleared')
            }}
            className="border-accent/50"
          >
            <Bell size={16} weight="fill" />
            CLEAR ALERTS
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <CheckCircle size={18} weight="fill" className="text-green-500" />
              NODES STATUS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Healthy</span>
                <Badge variant="outline" className="border-green-500/50 text-green-500">
                  {metrics.healthyNodes}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Warning</span>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  {metrics.warningNodes}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Critical</span>
                <Badge variant="outline" className="border-red-500/50 text-red-500">
                  {metrics.criticalNodes}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Offline</span>
                <Badge variant="outline" className="border-gray-500/50 text-gray-500">
                  {metrics.offlineNodes}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <Cpu size={18} weight="fill" className="text-accent" />
              CPU USAGE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-glow">
                {metrics.usedCpu.toFixed(1)}%
              </div>
              <Progress value={metrics.usedCpu} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.usedCpu.toFixed(2)} / {metrics.totalCpu} cores
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <HardDrive size={18} weight="fill" className="text-accent" />
              MEMORY USAGE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-glow">
                {metrics.usedMemory.toFixed(1)}%
              </div>
              <Progress value={metrics.usedMemory} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {metrics.usedMemory.toFixed(2)} / {metrics.totalMemory} GB
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <Database size={18} weight="fill" className="text-accent" />
              POD STATUS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Running</span>
                <Badge variant="outline" className="border-green-500/50 text-green-500">
                  {metrics.runningPods}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Pending</span>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  {metrics.pendingPods}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Failed</span>
                <Badge variant="outline" className="border-red-500/50 text-red-500">
                  {metrics.failedPods}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        <Card className="border-border/50 bg-card/80 console-glow col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-orbitron">CLUSTER TOPOLOGY</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-60px)]">
            <svg ref={topologyRef} className="w-full h-full" />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 overflow-hidden">
          <Card className="border-border/50 bg-card/80 console-glow flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                <ChartLine size={18} weight="fill" />
                CPU HISTORY
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-50px)]">
              <svg ref={cpuHistoryRef} className="w-full h-full" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 console-glow flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                <ChartLine size={18} weight="fill" />
                MEMORY HISTORY
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-50px)]">
              <svg ref={memoryHistoryRef} className="w-full h-full" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 h-64">
        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <Network size={18} weight="fill" />
              NETWORK TOPOLOGY
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-50px)]">
            <svg ref={networkRef} className="w-full h-full" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <Bell size={18} weight="fill" />
              ACTIVE ALERTS ({alerts.filter(a => !a.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-50px)] p-0">
            <ScrollArea className="h-full px-4">
              <AnimatePresence>
                {alerts.filter(a => !a.acknowledged).slice(0, 10).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-2 py-2 border-b border-border/30 last:border-0"
                  >
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        simulator.acknowledgeAlert(alert.id)
                        updateData()
                      }}
                    >
                      <CheckCircle size={14} />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 console-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-orbitron flex items-center gap-2">
              <Activity size={18} weight="fill" />
              RECENT EVENTS
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-50px)] p-0">
            <ScrollArea className="h-full px-4">
              {events.slice(0, 15).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 py-2 border-b border-border/30 last:border-0"
                >
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] px-1 py-0 ${
                      event.type === 'error' ? 'border-red-500/50 text-red-500' :
                      event.type === 'warning' ? 'border-yellow-500/50 text-yellow-500' :
                      'border-accent/50 text-accent'
                    }`}
                  >
                    {event.type.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{event.message}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="border-accent/50 bg-card console-glow-active w-80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-orbitron flex items-center gap-2">
                  {getStatusIcon(selectedNode.status)}
                  {selectedNode.name.toUpperCase()}
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setSelectedNode(null)}
                >
                  <XCircle size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2">{selectedNode.type}</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Region:</span>
                  <span className="ml-2 font-mono">{selectedNode.region}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="ml-2 font-mono text-accent">{selectedNode.cpu.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="ml-2 font-mono text-accent">{selectedNode.memory.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Disk:</span>
                  <span className="ml-2 font-mono text-accent">{selectedNode.disk.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pods:</span>
                  <span className="ml-2 font-mono">{selectedNode.pods}/{selectedNode.maxPods}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                Uptime: {Math.floor(selectedNode.uptime / 86400000)}d {Math.floor((selectedNode.uptime % 86400000) / 3600000)}h
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default ClusterHealthMonitor
