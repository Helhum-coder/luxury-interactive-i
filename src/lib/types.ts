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
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'gauge' | 'metric' | 'status'
  title: string
  data: any
  position: { x: number; y: number; w: number; h: number }
  chartConfig?: {
    color?: string
    animate?: boolean
    showGrid?: boolean
    horizontal?: boolean
    innerRadius?: number
    showLabels?: boolean
    stacked?: boolean
    levels?: number
    min?: number
    max?: number
    unit?: string
  }
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
