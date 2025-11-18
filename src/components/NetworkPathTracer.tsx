import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  MapTrifold, 
  Play, 
  Stop, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Warning,
  Clock,
  Globe,
  X
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Hop {
  number: number
  ip: string
  hostname?: string
  rtt: number
  status: 'success' | 'timeout' | 'failed'
  location?: string
}

interface PingResult {
  timestamp: Date
  rtt: number
  status: 'success' | 'timeout' | 'failed'
  ttl?: number
}

interface NetworkPathTracerProps {
  onClose: () => void
}

export function NetworkPathTracer({ onClose }: NetworkPathTracerProps) {
  const [targetHost, setTargetHost] = useState('')
  const [isTracing, setIsTracing] = useState(false)
  const [isPinging, setIsPinging] = useState(false)
  const [hops, setHops] = useState<Hop[]>([])
  const [pingResults, setPingResults] = useState<PingResult[]>([])
  const [currentHop, setCurrentHop] = useState(0)
  const [maxHops] = useState(30)
  const [pingCount, setPingCount] = useState(0)
  const [maxPings] = useState(10)

  const simulateTraceroute = async (host: string) => {
    setIsTracing(true)
    setHops([])
    setCurrentHop(0)

    const targetIP = host.includes('.') ? host : `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
    
    const commonRouters = [
      { prefix: '192.168.1', name: 'Local Gateway' },
      { prefix: '10.0.0', name: 'ISP Router' },
      { prefix: '172.16.0', name: 'Regional Hub' },
      { prefix: '203.0.113', name: 'Backbone Router' },
      { prefix: '198.51.100', name: 'Transit Network' },
    ]

    const totalHops = Math.min(5 + Math.floor(Math.random() * 8), maxHops)

    for (let i = 0; i < totalHops; i++) {
      if (!isTracing) break

      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))

      let ip: string
      let hostname: string | undefined
      let location: string | undefined
      
      if (i < commonRouters.length) {
        const router = commonRouters[i]
        ip = `${router.prefix}.${Math.floor(Math.random() * 256)}`
        hostname = `${router.name.toLowerCase().replace(/\s+/g, '-')}.example.net`
        location = ['New York, US', 'London, UK', 'Tokyo, JP', 'Singapore, SG', 'Frankfurt, DE'][i % 5]
      } else if (i === totalHops - 1) {
        ip = targetIP
        hostname = host
        location = 'Target Location'
      } else {
        ip = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
        hostname = `router-${i}.transit.net`
        location = ['Paris, FR', 'Amsterdam, NL', 'Chicago, US', 'Sydney, AU'][Math.floor(Math.random() * 4)]
      }

      const shouldTimeout = Math.random() < 0.15
      const shouldFail = !shouldTimeout && Math.random() < 0.05

      const hop: Hop = {
        number: i + 1,
        ip,
        hostname,
        rtt: shouldTimeout ? 0 : 10 + Math.random() * 150 + (i * 5),
        status: shouldTimeout ? 'timeout' : shouldFail ? 'failed' : 'success',
        location
      }

      setHops(prev => [...prev, hop])
      setCurrentHop(i + 1)
    }

    setIsTracing(false)
  }

  const simulatePing = async (host: string) => {
    setIsPinging(true)
    setPingResults([])
    setPingCount(0)

    const baseRTT = 20 + Math.random() * 80
    const jitter = 5 + Math.random() * 15

    for (let i = 0; i < maxPings; i++) {
      if (!isPinging) break

      await new Promise(resolve => setTimeout(resolve, 1000))

      const shouldTimeout = Math.random() < 0.1
      const variance = (Math.random() - 0.5) * jitter

      const result: PingResult = {
        timestamp: new Date(),
        rtt: shouldTimeout ? 0 : Math.max(1, baseRTT + variance),
        status: shouldTimeout ? 'timeout' : 'success',
        ttl: shouldTimeout ? undefined : 64 - Math.floor(Math.random() * 10)
      }

      setPingResults(prev => [...prev, result])
      setPingCount(i + 1)
    }

    setIsPinging(false)
  }

  const handleStartTraceroute = () => {
    if (targetHost.trim()) {
      simulateTraceroute(targetHost.trim())
    }
  }

  const handleStartPing = () => {
    if (targetHost.trim()) {
      simulatePing(targetHost.trim())
    }
  }

  const handleStopTraceroute = () => {
    setIsTracing(false)
  }

  const handleStopPing = () => {
    setIsPinging(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle weight="fill" className="text-green-500" size={20} />
      case 'timeout':
        return <Clock weight="fill" className="text-amber-500" size={20} />
      case 'failed':
        return <XCircle weight="fill" className="text-red-500" size={20} />
      default:
        return <Warning weight="fill" className="text-gray-400" size={20} />
    }
  }

  const calculatePingStats = () => {
    const successfulPings = pingResults.filter(p => p.status === 'success')
    if (successfulPings.length === 0) return null

    const rtts = successfulPings.map(p => p.rtt)
    const min = Math.min(...rtts)
    const max = Math.max(...rtts)
    const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length
    const packetLoss = ((pingResults.length - successfulPings.length) / pingResults.length) * 100

    return { min, max, avg, packetLoss, sent: pingResults.length, received: successfulPings.length }
  }

  const stats = calculatePingStats()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
              <MapTrifold size={32} weight="duotone" className="text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-3xl tracking-tight text-foreground">
                Network Path Tracer
              </h1>
              <p className="text-muted-foreground mt-1">
                Trace routes and ping hosts to diagnose network connectivity
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Target Configuration</CardTitle>
            <CardDescription>Enter a hostname or IP address to trace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="example.com or 8.8.8.8"
                value={targetHost}
                onChange={(e) => setTargetHost(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isTracing && !isPinging && handleStartTraceroute()}
                className="flex-1"
              />
              <Button
                onClick={handleStartTraceroute}
                disabled={!targetHost.trim() || isTracing || isPinging}
                className="gap-2"
              >
                {isTracing ? (
                  <>
                    <Stop size={18} />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Traceroute
                  </>
                )}
              </Button>
              <Button
                onClick={isPinging ? handleStopPing : handleStartPing}
                disabled={!targetHost.trim() || isTracing}
                variant="secondary"
                className="gap-2"
              >
                {isPinging ? (
                  <>
                    <Stop size={18} />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Ping
                  </>
                )}
              </Button>
            </div>

            {isTracing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tracing route...</span>
                  <span className="font-mono text-foreground">
                    Hop {currentHop} / {maxHops}
                  </span>
                </div>
                <Progress value={(currentHop / maxHops) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {hops.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Traceroute Results</CardTitle>
              <CardDescription>
                Network path from your location to {targetHost}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AnimatePresence>
                  {hops.map((hop, index) => (
                    <motion.div
                      key={hop.number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-[60px]">
                        <Badge variant="outline" className="font-mono">
                          {hop.number}
                        </Badge>
                        {getStatusIcon(hop.status)}
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium font-mono text-foreground">
                            {hop.ip}
                          </div>
                          {hop.hostname && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {hop.hostname}
                            </div>
                          )}
                        </div>

                        {hop.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe size={14} />
                            {hop.location}
                          </div>
                        )}

                        <div className="flex items-center gap-2 justify-end">
                          {hop.status === 'success' && (
                            <Badge variant="secondary" className="font-mono">
                              {hop.rtt.toFixed(1)} ms
                            </Badge>
                          )}
                          {hop.status === 'timeout' && (
                            <Badge variant="outline" className="text-amber-600 border-amber-600/50">
                              Request timeout
                            </Badge>
                          )}
                          {hop.status === 'failed' && (
                            <Badge variant="destructive">
                              Failed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {index < hops.length - 1 && (
                        <ArrowRight size={16} className="text-muted-foreground hidden md:block" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}

        {pingResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ping Results</CardTitle>
              <CardDescription>
                Continuous connectivity test to {targetHost}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Min RTT</div>
                    <div className="text-2xl font-bold font-mono text-green-600">
                      {stats.min.toFixed(1)}ms
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Avg RTT</div>
                    <div className="text-2xl font-bold font-mono text-blue-600">
                      {stats.avg.toFixed(1)}ms
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Max RTT</div>
                    <div className="text-2xl font-bold font-mono text-orange-600">
                      {stats.max.toFixed(1)}ms
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Sent/Received</div>
                    <div className="text-2xl font-bold font-mono text-foreground">
                      {stats.sent}/{stats.received}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Packet Loss</div>
                    <div className={`text-2xl font-bold font-mono ${stats.packetLoss > 10 ? 'text-red-600' : stats.packetLoss > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {stats.packetLoss.toFixed(0)}%
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {pingResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 font-mono text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      {result.status === 'success' ? (
                        <>
                          <span className="text-foreground">
                            TTL={result.ttl}
                          </span>
                          <Badge variant="secondary">
                            time={result.rtt.toFixed(1)}ms
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600/50">
                          Request timeout
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {isPinging && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pinging...</span>
                    <span className="font-mono text-foreground">
                      {pingCount} / {maxPings}
                    </span>
                  </div>
                  <Progress value={(pingCount / maxPings) * 100} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
