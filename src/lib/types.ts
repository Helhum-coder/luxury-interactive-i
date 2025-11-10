export type ConsoleType = 'system' | 'development' | 'analytics' | 'marketing' | 'control'

export interface ConsoleMessage {
  id: string
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'warning'
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
  chartConfig?: any
}

export interface Campaign {
  id: string
  name: string
  description: string
  channel: string
  tactics: string[]
  expectedROI: string
}

export interface MarketingStrategy {
  id: string
  projectName: string
  targetAudience: string
  channels: string[]
  campaigns: Campaign[]
  budgetAllocation: string
  timeline: string
  kpis: string[]
  timestamp: number
}

export interface GitBranch {
  name: string
  type: 'master' | 'main' | 'feature' | 'other'
  purpose: string
  integrations: string[]
  status: 'active' | 'synced' | 'conflict' | 'ahead' | 'behind'
  lastCommit?: string
  deploymentTarget?: string
}

export interface GitConflict {
  id: string
  type: 'merge' | 'rebase' | 'deployment' | 'workflow'
  branches: string[]
  files: string[]
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolutionStrategy: string[]
}

export interface IntegrationStatus {
  name: string
  type: 'firebase' | 'github' | 'live-server' | 'workflow' | 'vscode'
  status: 'operational' | 'warning' | 'error' | 'unknown'
  branch: string
  url?: string
  lastSync?: number
}
