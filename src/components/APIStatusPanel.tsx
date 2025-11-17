import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react'

interface APIStatus {
  name: string
  version: string
  status: 'active' | 'warning' | 'error'
  endpoint: string
  lastUpdated: string
}

export default function APIStatusPanel() {
  const apiStatuses: APIStatus[] = [
    {
      name: 'GitHub REST API',
      version: 'v2022-11-28',
      status: 'active',
      endpoint: 'https://api.github.com',
      lastUpdated: 'Latest Stable'
    },
    {
      name: 'GitHub GraphQL API',
      version: 'v4',
      status: 'active',
      endpoint: 'https://api.github.com/graphql',
      lastUpdated: 'Latest'
    },
    {
      name: 'Linear GraphQL API',
      version: 'Latest',
      status: 'active',
      endpoint: 'https://api.linear.app/graphql',
      lastUpdated: 'Current'
    },
    {
      name: 'Webhook Event System',
      version: '1.0',
      status: 'active',
      endpoint: 'Real-time Event Processing',
      lastUpdated: 'Enhanced'
    },
    {
      name: 'Image Optimization',
      version: '1.0',
      status: 'active',
      endpoint: 'High-Quality Rendering',
      lastUpdated: 'Enhanced'
    }
  ]

  const getStatusIcon = (status: APIStatus['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'warning':
        return <Warning size={20} weight="fill" className="text-yellow-500" />
      case 'error':
        return <XCircle size={20} weight="fill" className="text-red-500" />
    }
  }

  const getStatusBadge = (status: APIStatus['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-500/50 text-green-500">Active</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">Warning</Badge>
      case 'error':
        return <Badge variant="outline" className="border-red-500/50 text-red-500">Error</Badge>
    }
  }

  return (
    <Card className="border-2 border-accent/50 bg-card/50">
      <CardHeader className="border-b border-border/50 luxury-gradient">
        <CardTitle className="font-orbitron text-lg tracking-wide">
          API Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {apiStatuses.map((api) => (
            <div
              key={api.name}
              className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(api.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{api.name}</h4>
                    <Badge variant="outline" className="font-mono text-xs">
                      {api.version}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {api.endpoint}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(api.status)}
                <span className="text-xs text-muted-foreground">
                  {api.lastUpdated}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg border border-accent/30 bg-accent/5">
          <h4 className="font-orbitron font-semibold text-sm mb-2 text-accent">
            Recent Enhancements
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              Updated GitHub API to v2022-11-28 (latest stable version)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              Enhanced image rendering with optimization utilities
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              Improved visual quality with high-resolution support
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              Added fallback mechanisms for better reliability
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} weight="fill" className="text-accent" />
              Enhanced error handling across all integrations
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
