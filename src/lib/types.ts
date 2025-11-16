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
  status: 'active' | 'synced' | 'conflict' | 'ahead' | 'behind' | 'syncing'
  lastCommit?: string
  deploymentTarget?: string
  commitsAhead?: number
  commitsBehind?: number
  lastSyncTime?: number
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
  status: 'operational' | 'warning' | 'error' | 'unknown' | 'syncing'
  branch: string
  url?: string
  lastSync?: number
  syncFrequency?: number
  autoSync?: boolean
}

export interface SyncEvent {
  id: string
  timestamp: number
  type: 'sync' | 'push' | 'pull' | 'merge' | 'conflict-detected' | 'conflict-resolved'
  branch: string
  status: 'started' | 'in-progress' | 'success' | 'failed'
  message: string
  details?: any
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  private: boolean
  default_branch: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
}

export interface ProjectVersion {
  projectId: string
  projectName: string
  cliVersion?: string
  appVersion?: string
  frameworkVersion?: string
  lastUpdated: number
  autoDetected: boolean
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
  author: {
    login: string
    avatar_url: string
  } | null
}

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  email: string | null
  bio: string | null
  public_repos: number
}

export interface WebhookEvent {
  id: string
  timestamp: number
  event_type: 'push' | 'pull_request' | 'create' | 'delete' | 'release' | 'issues' | 'workflow_run' | 'deployment'
  repository: string
  branch: string
  actor: string
  payload: any
  processed: boolean
  auto_synced: boolean
}

export interface WebhookConfig {
  id: string
  repository: string
  events: string[]
  active: boolean
  auto_sync: boolean
  created_at: number
  last_delivery?: number
  delivery_count: number
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  timestamp: number
  event_type: string
  status: 'success' | 'failed' | 'pending'
  response_time_ms: number
  payload_size: number
}

export interface CommitComparison {
  baseCommit: GitHubCommit
  headCommit: GitHubCommit
  files: CommitFileChange[]
  stats: CommitStats
  ahead_by: number
  behind_by: number
  merge_base_commit?: string
}

export interface CommitFileChange {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed'
  additions: number
  deletions: number
  changes: number
  patch?: string
  previous_filename?: string
  blob_url?: string
  raw_url?: string
}

export interface CommitStats {
  total_additions: number
  total_deletions: number
  total_changes: number
  files_changed: number
  commits_count: number
}

export interface CommitDiff {
  hunks: DiffHunk[]
  language?: string
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

export interface DiffLine {
  type: 'context' | 'addition' | 'deletion'
  content: string
  oldLineNumber?: number
  newLineNumber?: number
}
