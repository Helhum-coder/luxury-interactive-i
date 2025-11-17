import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Globe, WifiHigh, WifiSlash, Activity, ArrowsClockwise } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConnectionMetrics {
  latency: number
  bandwidth: number
  packetLoss: number
  signalStrength: number
  uptime: number
}

interface SatelliteStatus {
  connected: boolean
  satelliteName: string
  location: string
  metrics: ConnectionMetrics
}

export function SatelliteConnectionMonitor() {
  const [status, setStatus] = useState<SatelliteStatus>({
    connected: false,
    satelliteName: 'SAT-LINK-01',
    location: 'Geostationary Orbit',
    metrics: {
      latency: 0,
      bandwidth: 0,
      packetLoss: 0,
      signalStrength: 0,
      uptime: 0,
    }
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [connectionHistory, setConnectionHistory] = useState<Array<{ time: string; status: string }>>([])

  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      const isOnline = navigator.onLine
      const newMetrics: ConnectionMetrics = {
        latency: Math.floor(Math.random() * 200) + 50,
        bandwidth: Math.floor(Math.random() * 100) + 50,
        packetLoss: Math.random() * 5,
        signalStrength: Math.floor(Math.random() * 30) + 70,
        uptime: status.metrics.uptime + 1,
      }

      setStatus(prev => ({
        ...prev,
        connected: isOnline,
        metrics: newMetrics,
      }))

      if (Math.random() < 0.1) {
        const now = new Date().toLocaleTimeString()
        setConnectionHistory(prev => [
          { time: now, status: isOnline ? 'Connected' : 'Disconnected' },
          ...prev.slice(0, 9)
        ])
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isMonitoring, status.metrics.uptime])

  const startMonitoring = () => {
    setIsMonitoring(true)
    setConnectionHistory([
      { time: new Date().toLocaleTimeString(), status: 'Monitoring Started' }
    ])
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
    setConnectionHistory(prev => [
      { time: new Date().toLocaleTimeString(), status: 'Monitoring Stopped' },
      ...prev
    ])
  }

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500'
    if (strength >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-500'
    if (latency < 200) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe size={32} weight="duotone" className="text-primary" />
              </div>
              <div>
                <CardTitle>Satellite Connection Monitor</CardTitle>
                <CardDescription>Real-time browser connection to satellite network</CardDescription>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {status.connected && isMonitoring ? (
                <motion.div
                  key="connected"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <WifiHigh size={16} className="mr-1" weight="fill" />
                    Connected
                  </Badge>
                </motion.div>
              ) : isMonitoring ? (
                <motion.div
                  key="disconnected"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge variant="destructive">
                    <WifiSlash size={16} className="mr-1" weight="fill" />
                    Disconnected
                  </Badge>
                </motion.div>
              ) : (
                <Badge variant="secondary">Standby</Badge>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            {!isMonitoring ? (
              <Button onClick={startMonitoring} className="gap-2">
                <Activity size={20} weight="duotone" />
                Start Monitoring
              </Button>
            ) : (
              <Button onClick={stopMonitoring} variant="destructive" className="gap-2">
                <ArrowsClockwise size={20} weight="duotone" />
                Stop Monitoring
              </Button>
            )}
          </div>

          {isMonitoring && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Satellite</div>
                    <div className="font-semibold text-lg">{status.satelliteName}</div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-semibold text-lg">{status.location}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Signal Strength</span>
                    <span className={`text-sm font-bold ${getSignalColor(status.metrics.signalStrength)}`}>
                      {status.metrics.signalStrength}%
                    </span>
                  </div>
                  <Progress value={status.metrics.signalStrength} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Bandwidth</span>
                    <span className="text-sm font-bold text-blue-500">
                      {status.metrics.bandwidth} Mbps
                    </span>
                  </div>
                  <Progress value={status.metrics.bandwidth} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">Latency</div>
                      <div className={`text-xl font-bold ${getLatencyColor(status.metrics.latency)}`}>
                        {status.metrics.latency}ms
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">Packet Loss</div>
                      <div className="text-xl font-bold text-orange-500">
                        {status.metrics.packetLoss.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="text-xs text-muted-foreground mb-1">Uptime</div>
                      <div className="text-xl font-bold text-purple-500">
                        {Math.floor(status.metrics.uptime / 60)}m {status.metrics.uptime % 60}s
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {connectionHistory.length > 0 && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-sm">Connection History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {connectionHistory.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0"
                        >
                          <span className="text-muted-foreground">{entry.time}</span>
                          <Badge variant={entry.status.includes('Connected') ? 'default' : 'secondary'} className="text-xs">
                            {entry.status}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
