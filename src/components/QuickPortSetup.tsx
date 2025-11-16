import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldPlus, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QuickSecurePort {
  port: number
  name: string
  description: string
  visibility: 'private' | 'public' | 'organization'
  recommended: boolean
}

const COMMON_PORTS: QuickSecurePort[] = [
  { port: 2222, name: 'SSH/Process Port', description: 'System process communication', visibility: 'private', recommended: true },
  { port: 3000, name: 'Development Server', description: 'React development server', visibility: 'private', recommended: true },
  { port: 4000, name: 'API Server', description: 'Backend API service', visibility: 'private', recommended: true },
  { port: 4173, name: 'Vite Preview', description: 'Vite production preview', visibility: 'private', recommended: true },
  { port: 5000, name: 'Application Server', description: 'Main application server', visibility: 'organization', recommended: true },
  { port: 5173, name: 'Vite Dev Server', description: 'Vite development server', visibility: 'private', recommended: true },
  { port: 8080, name: 'Web Server', description: 'Alternative web server', visibility: 'organization', recommended: false },
  { port: 8000, name: 'Python Server', description: 'Python development server', visibility: 'private', recommended: false },
  { port: 9000, name: 'Monitoring Service', description: 'System monitoring', visibility: 'private', recommended: true },
  { port: 13000, name: 'Admin Panel', description: 'Administrative interface', visibility: 'private', recommended: true },
]

interface QuickPortSetupProps {
  onPortsSelected: (ports: QuickSecurePort[]) => void
}

export default function QuickPortSetup({ onPortsSelected }: QuickPortSetupProps) {
  const [selectedPorts, setSelectedPorts] = useState<Set<number>>(
    new Set(COMMON_PORTS.filter(p => p.recommended).map(p => p.port))
  )

  const togglePort = (port: number) => {
    const newSelected = new Set(selectedPorts)
    if (newSelected.has(port)) {
      newSelected.delete(port)
    } else {
      newSelected.add(port)
    }
    setSelectedPorts(newSelected)
  }

  const handleSecureSelected = () => {
    const portsToSecure = COMMON_PORTS.filter(p => selectedPorts.has(p.port))
    onPortsSelected(portsToSecure)
    toast.success('Ports Secured!', {
      description: `${portsToSecure.length} ports are now under your control`
    })
  }

  const selectAll = () => {
    setSelectedPorts(new Set(COMMON_PORTS.map(p => p.port)))
  }

  const selectRecommended = () => {
    setSelectedPorts(new Set(COMMON_PORTS.filter(p => p.recommended).map(p => p.port)))
  }

  const clearAll = () => {
    setSelectedPorts(new Set())
  }

  return (
    <Card className="border-2 border-accent/30 console-glow bg-card/50">
      <CardHeader>
        <CardTitle className="font-orbitron text-xl flex items-center gap-2">
          <ShieldPlus size={24} weight="fill" className="text-accent" />
          QUICK PORT SETUP
        </CardTitle>
        <CardDescription>
          Secure commonly used ports with one click
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-accent/50 bg-accent/10">
          <Info size={16} weight="fill" />
          <AlertDescription className="text-xs">
            Select the ports you're currently using. Recommended ports are pre-selected based on your Codespace configuration.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={selectRecommended}
            className="border-accent/50 hover:bg-accent/20 font-mono text-xs"
          >
            Recommended
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={selectAll}
            className="border-accent/50 hover:bg-accent/20 font-mono text-xs"
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearAll}
            className="border-border/50 hover:bg-muted font-mono text-xs"
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-luxury">
          {COMMON_PORTS.map((port) => (
            <div
              key={port.port}
              onClick={() => togglePort(port.port)}
              className={`
                border-2 rounded-lg p-3 cursor-pointer transition-all
                ${selectedPorts.has(port.port)
                  ? 'border-accent bg-accent/20 console-glow'
                  : 'border-border/30 bg-background/30 hover:border-accent/50'
                }
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-accent">
                    {port.port}
                  </span>
                  {port.recommended && (
                    <Badge variant="outline" className="text-xs border-accent/50 text-accent">
                      Recommended
                    </Badge>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={selectedPorts.has(port.port)}
                  onChange={() => togglePort(port.port)}
                  className="w-4 h-4 rounded accent-accent cursor-pointer"
                />
              </div>
              <p className="text-sm font-medium mb-1">{port.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{port.description}</p>
              <Badge variant="secondary" className="text-xs font-mono">
                {port.visibility}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {selectedPorts.size} port{selectedPorts.size !== 1 ? 's' : ''} selected
          </p>
          <Button
            onClick={handleSecureSelected}
            disabled={selectedPorts.size === 0}
            className="luxury-gradient font-orbitron"
          >
            <ShieldPlus size={18} weight="fill" className="mr-2" />
            SECURE SELECTED PORTS
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
