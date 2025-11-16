import { ClusterNode, ClusterMetrics, ClusterAlert, PodStatus, NetworkFlow, ClusterEvent } from './cluster-types'

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
const ZONES = ['a', 'b', 'c']
const NODE_NAMES = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta']

export class ClusterSimulator {
  private nodes: ClusterNode[] = []
  private pods: PodStatus[] = []
  private alerts: ClusterAlert[] = []
  private events: ClusterEvent[] = []
  private metricsHistory: ClusterMetrics[] = []
  
  constructor() {
    this.initializeCluster()
  }

  private initializeCluster() {
    for (let i = 0; i < 8; i++) {
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)]
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)]
      
      this.nodes.push({
        id: `node-${i + 1}`,
        name: `${NODE_NAMES[i]}-${region}${zone}`,
        type: i === 0 ? 'master' : i < 3 ? 'worker' : 'edge',
        status: 'healthy',
        cpu: Math.random() * 40 + 20,
        memory: Math.random() * 50 + 30,
        disk: Math.random() * 60 + 20,
        network: Math.random() * 100,
        uptime: Math.floor(Math.random() * 30 + 1) * 86400000,
        pods: Math.floor(Math.random() * 30 + 10),
        maxPods: 110,
        region,
        zone,
        version: 'v1.28.4',
        lastHeartbeat: Date.now()
      })
    }

    for (let i = 0; i < 45; i++) {
      const nodeId = this.nodes[Math.floor(Math.random() * this.nodes.length)].id
      this.pods.push({
        id: `pod-${i + 1}`,
        name: `app-${Math.floor(i / 5)}-${i % 5}`,
        namespace: ['default', 'production', 'staging', 'monitoring'][Math.floor(Math.random() * 4)],
        nodeId,
        status: Math.random() > 0.05 ? 'running' : Math.random() > 0.5 ? 'pending' : 'failed',
        cpu: Math.random() * 500,
        memory: Math.random() * 2048,
        restarts: Math.floor(Math.random() * 5),
        age: Math.floor(Math.random() * 7 + 1) * 86400000
      })
    }
  }

  public getNodes(): ClusterNode[] {
    return [...this.nodes]
  }

  public getPods(): PodStatus[] {
    return [...this.pods]
  }

  public getAlerts(): ClusterAlert[] {
    return [...this.alerts]
  }

  public getEvents(): ClusterEvent[] {
    return [...this.events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50)
  }

  public getCurrentMetrics(): ClusterMetrics {
    const healthyNodes = this.nodes.filter(n => n.status === 'healthy').length
    const warningNodes = this.nodes.filter(n => n.status === 'warning').length
    const criticalNodes = this.nodes.filter(n => n.status === 'critical').length
    const offlineNodes = this.nodes.filter(n => n.status === 'offline').length
    
    const runningPods = this.pods.filter(p => p.status === 'running').length
    const pendingPods = this.pods.filter(p => p.status === 'pending').length
    const failedPods = this.pods.filter(p => p.status === 'failed').length
    
    return {
      timestamp: Date.now(),
      totalNodes: this.nodes.length,
      healthyNodes,
      warningNodes,
      criticalNodes,
      offlineNodes,
      totalCpu: this.nodes.length * 8,
      usedCpu: this.nodes.reduce((sum, n) => sum + n.cpu, 0) / this.nodes.length,
      totalMemory: this.nodes.length * 32,
      usedMemory: this.nodes.reduce((sum, n) => sum + n.memory, 0) / this.nodes.length,
      totalDisk: this.nodes.length * 500,
      usedDisk: this.nodes.reduce((sum, n) => sum + n.disk, 0) / this.nodes.length,
      networkIn: this.nodes.reduce((sum, n) => sum + n.network * 0.6, 0),
      networkOut: this.nodes.reduce((sum, n) => sum + n.network * 0.4, 0),
      totalPods: this.pods.length,
      runningPods,
      pendingPods,
      failedPods
    }
  }

  public getMetricsHistory(): ClusterMetrics[] {
    return [...this.metricsHistory]
  }

  public getNetworkFlows(): NetworkFlow[] {
    const flows: NetworkFlow[] = []
    for (let i = 0; i < this.nodes.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 3, this.nodes.length); j++) {
        flows.push({
          source: this.nodes[i].id,
          target: this.nodes[j].id,
          bandwidth: Math.random() * 1000,
          latency: Math.random() * 10 + 1,
          packetsDropped: Math.floor(Math.random() * 100)
        })
      }
    }
    return flows
  }

  public updateSimulation() {
    this.nodes.forEach(node => {
      node.cpu = Math.max(5, Math.min(100, node.cpu + (Math.random() - 0.5) * 15))
      node.memory = Math.max(10, Math.min(95, node.memory + (Math.random() - 0.5) * 12))
      node.disk = Math.max(10, Math.min(90, node.disk + (Math.random() - 0.5) * 5))
      node.network = Math.max(0, Math.min(1000, node.network + (Math.random() - 0.5) * 100))
      node.lastHeartbeat = Date.now()
      
      if (node.cpu > 90 || node.memory > 90) {
        node.status = 'critical'
      } else if (node.cpu > 75 || node.memory > 80) {
        node.status = 'warning'
      } else if (Math.random() > 0.99) {
        node.status = 'offline'
      } else {
        node.status = 'healthy'
      }

      if (node.status === 'critical' && Math.random() > 0.9) {
        this.addAlert({
          id: `alert-${Date.now()}-${Math.random()}`,
          severity: 'critical',
          type: 'node',
          message: `Node ${node.name} is under heavy load (CPU: ${node.cpu.toFixed(1)}%, Memory: ${node.memory.toFixed(1)}%)`,
          nodeId: node.id,
          timestamp: Date.now(),
          acknowledged: false
        })
      }
    })

    this.pods.forEach(pod => {
      if (pod.status === 'pending' && Math.random() > 0.7) {
        pod.status = 'running'
        this.addEvent({
          id: `event-${Date.now()}-${Math.random()}`,
          type: 'deploy',
          message: `Pod ${pod.name} started successfully`,
          podId: pod.id,
          nodeId: pod.nodeId,
          timestamp: Date.now()
        })
      } else if (pod.status === 'running' && Math.random() > 0.995) {
        pod.status = 'failed'
        pod.restarts++
        this.addEvent({
          id: `event-${Date.now()}-${Math.random()}`,
          type: 'error',
          message: `Pod ${pod.name} crashed (restart #${pod.restarts})`,
          podId: pod.id,
          nodeId: pod.nodeId,
          timestamp: Date.now()
        })
        this.addAlert({
          id: `alert-${Date.now()}-${Math.random()}`,
          severity: 'warning',
          type: 'pod',
          message: `Pod ${pod.name} in namespace ${pod.namespace} has restarted ${pod.restarts} times`,
          timestamp: Date.now(),
          acknowledged: false
        })
      } else if (pod.status === 'failed' && Math.random() > 0.6) {
        pod.status = 'pending'
      }
      
      pod.cpu = Math.max(10, Math.min(2000, pod.cpu + (Math.random() - 0.5) * 100))
      pod.memory = Math.max(128, Math.min(4096, pod.memory + (Math.random() - 0.5) * 200))
    })

    const metrics = this.getCurrentMetrics()
    this.metricsHistory.push(metrics)
    if (this.metricsHistory.length > 60) {
      this.metricsHistory.shift()
    }

    if (Math.random() > 0.8) {
      const eventTypes: ClusterEvent['type'][] = ['deploy', 'scale', 'update']
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      this.addEvent({
        id: `event-${Date.now()}-${Math.random()}`,
        type,
        message: this.generateEventMessage(type),
        timestamp: Date.now()
      })
    }
  }

  private generateEventMessage(type: ClusterEvent['type']): string {
    const messages = {
      deploy: ['New service deployed to production', 'Database migration completed', 'API gateway updated'],
      scale: ['Cluster auto-scaled up by 2 nodes', 'Pod replicas increased to 10', 'Load balancer capacity expanded'],
      update: ['Kubernetes version updated', 'Security patches applied', 'Configuration synchronized']
    }
    return messages[type as keyof typeof messages]?.[Math.floor(Math.random() * 3)] || 'System event occurred'
  }

  private addAlert(alert: ClusterAlert) {
    this.alerts.unshift(alert)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }
  }

  private addEvent(event: ClusterEvent) {
    this.events.unshift(event)
    if (this.events.length > 200) {
      this.events = this.events.slice(0, 200)
    }
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
    }
  }

  public clearAcknowledgedAlerts() {
    this.alerts = this.alerts.filter(a => !a.acknowledged)
  }
}
