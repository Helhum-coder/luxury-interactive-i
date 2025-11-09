export type ConsoleType = 'system' | 'development' | 'analytics' | 'marketing' | 'control'

export interface ConsoleMessage {
  id: string
  type: 'input' | 'output' | 'error' | 'success' | 'info'
  content: string
  timestamp: number
  consoleId: ConsoleType
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'status' | 'map'
  title: string
  data: any
  position: { x: number; y: number; w: number; h: number }
}

export interface Dashboard {
  id: string
  name: string
  widgets: DashboardWidget[]
  createdAt: number
}

export interface MarketingStrategy {
  id: string
  projectName: string
  targetAudience: string
  channels: string[]
  campaigns: Campaign[]
  budget: number
  timeline: string
  kpis: string[]
  generatedAt: number
}

export interface Campaign {
  id: string
  name: string
  description: string
  channel: string
  tactics: string[]
  expectedROI: string
}

export interface SystemStatus {
  cpu: number
  memory: number
  network: number
  status: 'online' | 'warning' | 'error'
}
