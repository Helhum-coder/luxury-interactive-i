export interface ClusterNode {
  id: string
  name: string
  type: 'master' | 'worker' | 'edge'
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: number
  pods: number
  maxPods: number
  region: string
  zone: string
  version: string
  lastHeartbeat: number
}

export interface ClusterMetrics {
  timestamp: number
  totalNodes: number
  healthyNodes: number
  warningNodes: number
  criticalNodes: number
  offlineNodes: number
  totalCpu: number
  usedCpu: number
  totalMemory: number
  usedMemory: number
  totalDisk: number
  usedDisk: number
  networkIn: number
  networkOut: number
  totalPods: number
  runningPods: number
  pendingPods: number
  failedPods: number
}

export interface ClusterAlert {
  id: string
  severity: 'info' | 'warning' | 'critical'
  type: 'node' | 'pod' | 'network' | 'storage' | 'security'
  message: string
  nodeId?: string
  timestamp: number
  acknowledged: boolean
}

export interface PodStatus {
  id: string
  name: string
  namespace: string
  nodeId: string
  status: 'running' | 'pending' | 'failed' | 'succeeded'
  cpu: number
  memory: number
  restarts: number
  age: number
}

export interface NetworkFlow {
  source: string
  target: string
  bandwidth: number
  latency: number
  packetsDropped: number
}

export interface ClusterEvent {
  id: string
  type: 'deploy' | 'scale' | 'update' | 'restart' | 'error' | 'warning'
  message: string
  nodeId?: string
  podId?: string
  timestamp: number
}
