export interface WebhookPortConfig {
  webhookId: string
  port: number
  securedPort: boolean
  autoSecured: boolean
  securedAt?: number
  securedBy?: string
}

export interface PortSecurityEvent {
  id: string
  timestamp: number
  eventType: 'port-secured' | 'port-blocked' | 'port-released' | 'unauthorized-access-blocked'
  port: number
  webhookId?: string
  triggeredBy: string
  reason: string
  metadata?: any
}

export const WEBHOOK_PORT_RANGES = {
  development: { start: 3000, end: 3999 },
  staging: { start: 4000, end: 4999 },
  production: { start: 5000, end: 5999 },
  webhooks: { start: 8000, end: 8999 },
  custom: { start: 9000, end: 9999 }
}

export function extractPortFromWebhook(webhookUrl: string): number | null {
  try {
    const url = new URL(webhookUrl)
    return parseInt(url.port) || null
  } catch {
    return null
  }
}

export function generateWebhookPort(type: keyof typeof WEBHOOK_PORT_RANGES = 'webhooks'): number {
  const range = WEBHOOK_PORT_RANGES[type]
  return Math.floor(Math.random() * (range.end - range.start + 1)) + range.start
}

export function detectWebhookPortRequirements(webhookConfig: any): number[] {
  const ports: number[] = []
  
  if (webhookConfig.url) {
    const port = extractPortFromWebhook(webhookConfig.url)
    if (port) ports.push(port)
  }
  
  if (webhookConfig.events?.includes('workflow_run')) {
    ports.push(generateWebhookPort('webhooks'))
  }
  
  if (webhookConfig.events?.includes('deployment')) {
    ports.push(generateWebhookPort('production'))
  }
  
  return [...new Set(ports)]
}

export function validatePortSecurity(port: number, securedPorts: any[]): {
  isSecured: boolean
  needsApproval: boolean
  config: any | null
} {
  const config = securedPorts.find(p => p.port === port)
  
  if (!config) {
    return {
      isSecured: false,
      needsApproval: true,
      config: null
    }
  }
  
  return {
    isSecured: config.status === 'active',
    needsApproval: config.requiresApproval,
    config
  }
}

export function shouldAutoSecurePort(port: number, webhookConfig: any): boolean {
  if (port >= WEBHOOK_PORT_RANGES.webhooks.start && port <= WEBHOOK_PORT_RANGES.webhooks.end) {
    return true
  }
  
  if (webhookConfig.auto_sync) {
    return true
  }
  
  if (webhookConfig.events?.includes('deployment') || webhookConfig.events?.includes('workflow_run')) {
    return true
  }
  
  return false
}

export function createPortSecurityPayload(
  port: number,
  webhookConfig: any,
  user: any
): any {
  return {
    port,
    name: `Webhook Port ${port}`,
    description: `Auto-secured for webhook: ${webhookConfig.repository || 'Repository Events'}`,
    visibility: 'private' as const,
    status: 'active' as const,
    approvedBy: user?.login || 'System',
    approvedAt: Date.now(),
    requiresApproval: true,
    allowedIPs: [],
    createdAt: Date.now(),
    lastModified: Date.now(),
    webhookId: webhookConfig.id,
    autoSecured: true
  }
}

export function detectThirdPartyAccess(accessLog: any): {
  isThirdParty: boolean
  shouldBlock: boolean
  reason: string
} {
  const trustedSources = [
    'github.com',
    'githubusercontent.com',
    'github.dev',
    'vscode.dev',
    'codespaces.github.com'
  ]
  
  if (accessLog.source && !trustedSources.some(src => accessLog.source.includes(src))) {
    return {
      isThirdParty: true,
      shouldBlock: true,
      reason: 'Untrusted source attempting port access'
    }
  }
  
  if (accessLog.unauthorized) {
    return {
      isThirdParty: true,
      shouldBlock: true,
      reason: 'Unauthorized access attempt detected'
    }
  }
  
  return {
    isThirdParty: false,
    shouldBlock: false,
    reason: ''
  }
}
