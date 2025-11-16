export type EnvironmentType = 'development' | 'staging' | 'production' | 'preview' | 'testing' | 'custom'

export type DeploymentPlatform = 'vercel' | 'netlify' | 'firebase' | 'aws' | 'github-pages' | 'heroku' | 'railway' | 'render' | 'cloudflare' | 'custom'

export type BuildCommand = 'npm run build' | 'yarn build' | 'pnpm build' | 'vite build' | 'next build' | 'custom'

export interface EnvironmentVariable {
  key: string
  value: string
  secret: boolean
  required: boolean
}

export interface BuildConfiguration {
  command: BuildCommand
  customCommand?: string
  outputDirectory: string
  installCommand: string
  nodeVersion: string
  environmentVariables: EnvironmentVariable[]
}

export interface DeploymentConfiguration {
  autoPublish: boolean
  branchDeployment: boolean
  previewDeployments: boolean
  buildOnPush: boolean
  deployOnMerge: boolean
}

export interface SecurityConfiguration {
  httpsOnly: boolean
  passwordProtection: boolean
  password?: string
  allowedDomains: string[]
  cors: {
    enabled: boolean
    origins: string[]
  }
  headers: Record<string, string>
}

export interface PerformanceConfiguration {
  compression: boolean
  caching: boolean
  cdn: boolean
  minification: boolean
  imageOptimization: boolean
  cacheMaxAge: number
}

export interface PublishingPreset {
  id: string
  name: string
  description: string
  environment: EnvironmentType
  platform: DeploymentPlatform
  customPlatformUrl?: string
  buildConfig: BuildConfiguration
  deploymentConfig: DeploymentConfiguration
  securityConfig: SecurityConfiguration
  performanceConfig: PerformanceConfiguration
  createdAt: number
  updatedAt: number
  lastDeployment?: {
    timestamp: number
    status: 'success' | 'failed' | 'pending'
    url?: string
    logs?: string
  }
}

export interface DeploymentHistory {
  id: string
  presetId: string
  presetName: string
  environment: EnvironmentType
  platform: DeploymentPlatform
  status: 'success' | 'failed' | 'pending' | 'cancelled'
  startTime: number
  endTime?: number
  duration?: number
  url?: string
  buildLogs: string[]
  deployLogs: string[]
  errors?: string[]
  commit?: {
    hash: string
    message: string
    author: string
  }
}

export interface EnvironmentComparison {
  presetId: string
  name: string
  environment: EnvironmentType
  status: 'active' | 'inactive' | 'deployed' | 'failed'
  url?: string
  lastDeployed?: number
  buildTime?: number
  size?: number
}
