export interface ServiceEndpoint {
  id: string
  name: string
  category: 'documentation' | 'platform' | 'integration' | 'pipeline'
  url: string
  status: 'online' | 'offline' | 'degraded' | 'checking'
  lastChecked?: Date
  responseTime?: number
  error?: string
  apiVersion?: string
}

export interface PipelineStatus {
  id: string
  name: string
  platform: string
  status: 'running' | 'success' | 'failed' | 'pending' | 'cancelled'
  stage?: string
  progress?: number
  startTime?: Date
  endTime?: Date
  url?: string
  logs?: string[]
}

export const DEVELOPER_SERVICES: ServiceEndpoint[] = [
  {
    id: 'firebase-console',
    name: 'Firebase Console',
    category: 'platform',
    url: 'https://console.firebase.google.com',
    status: 'checking'
  },
  {
    id: 'firebase-api',
    name: 'Firebase API',
    category: 'platform',
    url: 'https://firebase.googleapis.com',
    status: 'checking'
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud',
    category: 'platform',
    url: 'https://console.cloud.google.com',
    status: 'checking'
  },
  {
    id: 'atlassian-jira',
    name: 'Atlassian Jira',
    category: 'integration',
    url: 'https://api.atlassian.com',
    status: 'checking'
  },
  {
    id: 'gitlens',
    name: 'GitLens / GitKraken',
    category: 'integration',
    url: 'https://gitkraken.dev',
    status: 'checking'
  },
  {
    id: 'vscode-docs',
    name: 'VS Code Documentation',
    category: 'documentation',
    url: 'https://vscode.dev',
    status: 'checking'
  },
  {
    id: 'vscode-api',
    name: 'VS Code API',
    category: 'documentation',
    url: 'https://code.visualstudio.com/api',
    status: 'checking'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'platform',
    url: 'https://vercel.com/api',
    status: 'checking'
  },
  {
    id: 'github-api',
    name: 'GitHub API',
    category: 'platform',
    url: 'https://api.github.com',
    status: 'checking'
  },
  {
    id: 'github-docs',
    name: 'GitHub Docs',
    category: 'documentation',
    url: 'https://docs.github.com',
    status: 'checking'
  },
  {
    id: 'copilot-docs',
    name: 'GitHub Copilot Docs',
    category: 'documentation',
    url: 'https://docs.github.com/copilot',
    status: 'checking'
  },
  {
    id: 'linear',
    name: 'Linear API',
    category: 'integration',
    url: 'https://api.linear.app',
    status: 'checking'
  },
  {
    id: 'npm',
    name: 'NPM Registry',
    category: 'platform',
    url: 'https://registry.npmjs.org',
    status: 'checking'
  },
  {
    id: 'docker-hub',
    name: 'Docker Hub',
    category: 'platform',
    url: 'https://hub.docker.com',
    status: 'checking'
  }
]

export class ConnectivityMonitor {
  private services: Map<string, ServiceEndpoint> = new Map()
  private checkInterval: number | null = null
  private listeners: Set<(services: ServiceEndpoint[]) => void> = new Set()

  constructor() {
    DEVELOPER_SERVICES.forEach(service => {
      this.services.set(service.id, { ...service })
    })
  }

  async checkService(serviceId: string): Promise<ServiceEndpoint> {
    const service = this.services.get(serviceId)
    if (!service) {
      throw new Error(`Service ${serviceId} not found`)
    }

    service.status = 'checking'
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(service.url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })

      clearTimeout(timeout)
      const responseTime = Date.now() - startTime

      service.status = 'online'
      service.responseTime = responseTime
      service.lastChecked = new Date()
      service.error = undefined

      if (response.headers.get('x-api-version')) {
        service.apiVersion = response.headers.get('x-api-version') || undefined
      }

    } catch (error) {
      service.status = 'offline'
      service.lastChecked = new Date()
      service.error = error instanceof Error ? error.message : 'Unknown error'
      service.responseTime = undefined
    }

    this.services.set(serviceId, service)
    this.notifyListeners()
    return service
  }

  async checkAll(): Promise<ServiceEndpoint[]> {
    const checks = Array.from(this.services.keys()).map(id => 
      this.checkService(id)
    )
    return Promise.all(checks)
  }

  startMonitoring(intervalMs: number = 60000) {
    if (this.checkInterval) {
      this.stopMonitoring()
    }

    this.checkAll()
    this.checkInterval = window.setInterval(() => {
      this.checkAll()
    }, intervalMs)
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  subscribe(listener: (services: ServiceEndpoint[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    const services = Array.from(this.services.values())
    this.listeners.forEach(listener => listener(services))
  }

  getServices(): ServiceEndpoint[] {
    return Array.from(this.services.values())
  }

  getServicesByCategory(category: ServiceEndpoint['category']): ServiceEndpoint[] {
    return this.getServices().filter(s => s.category === category)
  }

  getServiceStatus(serviceId: string): ServiceEndpoint | undefined {
    return this.services.get(serviceId)
  }
}

export class PipelineMonitor {
  private pipelines: Map<string, PipelineStatus> = new Map()
  private listeners: Set<(pipelines: PipelineStatus[]) => void> = new Set()
  private checkInterval: number | null = null

  async checkGitHubActions(owner: string, repo: string, token: string): Promise<PipelineStatus[]> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      const pipelines: PipelineStatus[] = data.workflow_runs.map((run: any) => ({
        id: `github-${run.id}`,
        name: run.name || 'Workflow',
        platform: 'GitHub Actions',
        status: run.status === 'completed' 
          ? (run.conclusion === 'success' ? 'success' : 'failed')
          : run.status === 'in_progress' ? 'running' : 'pending',
        stage: run.status,
        startTime: new Date(run.created_at),
        endTime: run.updated_at ? new Date(run.updated_at) : undefined,
        url: run.html_url
      }))

      pipelines.forEach(p => this.pipelines.set(p.id, p))
      this.notifyListeners()
      return pipelines

    } catch (error) {
      console.error('Failed to check GitHub Actions:', error)
      return []
    }
  }

  async checkVercelDeployments(token: string, projectId?: string): Promise<PipelineStatus[]> {
    try {
      const url = projectId 
        ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=10`
        : `https://api.vercel.com/v6/deployments?limit=10`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.status}`)
      }

      const data = await response.json()
      const pipelines: PipelineStatus[] = data.deployments.map((deployment: any) => ({
        id: `vercel-${deployment.uid}`,
        name: deployment.name || 'Deployment',
        platform: 'Vercel',
        status: deployment.state === 'READY' ? 'success' 
          : deployment.state === 'ERROR' ? 'failed'
          : deployment.state === 'BUILDING' ? 'running'
          : 'pending',
        startTime: new Date(deployment.created),
        endTime: deployment.ready ? new Date(deployment.ready) : undefined,
        url: deployment.url ? `https://${deployment.url}` : undefined
      }))

      pipelines.forEach(p => this.pipelines.set(p.id, p))
      this.notifyListeners()
      return pipelines

    } catch (error) {
      console.error('Failed to check Vercel deployments:', error)
      return []
    }
  }

  async checkFirebaseHosting(projectId: string): Promise<PipelineStatus[]> {
    try {
      const response = await fetch(
        `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=10`
      )

      if (!response.ok) {
        throw new Error(`Firebase API error: ${response.status}`)
      }

      const data = await response.json()
      const pipelines: PipelineStatus[] = (data.releases || []).map((release: any) => ({
        id: `firebase-${release.name}`,
        name: release.version?.name || 'Release',
        platform: 'Firebase Hosting',
        status: release.releaseTime ? 'success' : 'running',
        startTime: release.releaseTime ? new Date(release.releaseTime) : new Date(),
        url: `https://${projectId}.web.app`
      }))

      pipelines.forEach(p => this.pipelines.set(p.id, p))
      this.notifyListeners()
      return pipelines

    } catch (error) {
      console.error('Failed to check Firebase Hosting:', error)
      return []
    }
  }

  subscribe(listener: (pipelines: PipelineStatus[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    const pipelines = Array.from(this.pipelines.values())
    this.listeners.forEach(listener => listener(pipelines))
  }

  getPipelines(): PipelineStatus[] {
    return Array.from(this.pipelines.values())
      .sort((a, b) => {
        const aTime = a.startTime?.getTime() || 0
        const bTime = b.startTime?.getTime() || 0
        return bTime - aTime
      })
  }

  getPipelinesByPlatform(platform: string): PipelineStatus[] {
    return this.getPipelines().filter(p => p.platform === platform)
  }

  startMonitoring(config: {
    github?: { owner: string; repo: string; token: string }
    vercel?: { token: string; projectId?: string }
    firebase?: { projectId: string }
  }, intervalMs: number = 30000) {
    if (this.checkInterval) {
      this.stopMonitoring()
    }

    const check = async () => {
      const promises: Promise<any>[] = []
      
      if (config.github) {
        promises.push(this.checkGitHubActions(
          config.github.owner,
          config.github.repo,
          config.github.token
        ))
      }

      if (config.vercel) {
        promises.push(this.checkVercelDeployments(
          config.vercel.token,
          config.vercel.projectId
        ))
      }

      if (config.firebase) {
        promises.push(this.checkFirebaseHosting(config.firebase.projectId))
      }

      await Promise.allSettled(promises)
    }

    check()
    this.checkInterval = window.setInterval(check, intervalMs)
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
}
