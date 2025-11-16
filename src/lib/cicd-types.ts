export type PipelineStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped'
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
export type DeploymentStage = 'build' | 'test' | 'lint' | 'security' | 'deploy' | 'verify'

export interface TestSuite {
  id: string
  name: string
  type: 'unit' | 'integration' | 'e2e' | 'security' | 'performance'
  status: TestStatus
  duration?: number
  coverage?: number
  passed: number
  failed: number
  skipped: number
  error?: string
}

export interface PipelineStage {
  id: string
  name: string
  type: DeploymentStage
  status: PipelineStatus
  startTime?: number
  endTime?: number
  duration?: number
  logs: string[]
  tests?: TestSuite[]
  artifacts?: string[]
}

export interface PipelineRun {
  id: string
  name: string
  branch: string
  commit: string
  commitMessage: string
  author: string
  status: PipelineStatus
  stages: PipelineStage[]
  startTime: number
  endTime?: number
  duration?: number
  environment: string
  trigger: 'manual' | 'push' | 'pull_request' | 'schedule' | 'webhook'
}

export interface PipelineTemplate {
  id: string
  name: string
  description: string
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'custom'
  stages: {
    name: string
    type: DeploymentStage
    enabled: boolean
    commands: string[]
    environment?: Record<string, string>
  }[]
  triggers: {
    push: boolean
    pullRequest: boolean
    schedule?: string
    manual: boolean
  }
  environment: string
  requiresApproval: boolean
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    channels: ('email' | 'webhook' | 'console')[]
  }
  createdAt: number
  updatedAt: number
}

export interface TestConfiguration {
  id: string
  name: string
  framework: 'vitest' | 'jest' | 'playwright' | 'cypress' | 'custom'
  enabled: boolean
  coverage: {
    enabled: boolean
    threshold: number
  }
  timeout: number
  retries: number
  parallel: boolean
  files: string[]
}

export interface DeploymentConfig {
  id: string
  environment: string
  platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'firebase' | 'custom'
  autoPublish: boolean
  requiresTests: boolean
  requiresApproval: boolean
  rollbackOnFailure: boolean
  healthChecks: {
    enabled: boolean
    url?: string
    timeout: number
  }
}
