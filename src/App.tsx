import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import Console from '@/components/Console'
import DashboardDisplay from '@/components/DashboardDisplay'
import MarketingEngine from '@/components/MarketingEngine'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { 
  Terminal, 
  Code, 
  ChartBar, 
  Sparkle, 
  Cpu,
  Lightning,
  CirclesFour
} from '@phosphor-icons/react'
import { ConsoleType, ConsoleMessage, DashboardWidget, MarketingStrategy } from '@/lib/types'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function App() {
  const [activeConsole, setActiveConsole] = useState<ConsoleType>('system')
  const [consoleMessages, setConsoleMessages] = useKV<Record<ConsoleType, ConsoleMessage[]>>(
    'console-messages',
    {
      system: [],
      development: [],
      analytics: [],
      marketing: [],
      control: []
    }
  )
  const [dashboards, setDashboards] = useKV<DashboardWidget[]>('dashboards', [])
  const [strategies, setStrategies] = useKV<MarketingStrategy[]>('marketing-strategies', [])

  const addMessage = (consoleId: ConsoleType, type: ConsoleMessage['type'], content: string) => {
    const message: ConsoleMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: Date.now(),
      consoleId
    }
    
    setConsoleMessages((current) => {
      const messages = current || {
        system: [],
        development: [],
        analytics: [],
        marketing: [],
        control: []
      }
      return {
        ...messages,
        [consoleId]: [...messages[consoleId], message]
      }
    })
  }

  const executeCommand = async (consoleId: ConsoleType, command: string) => {
    addMessage(consoleId, 'input', command)

    const lowerCommand = command.toLowerCase().trim()

    if (lowerCommand === 'help') {
      const helpText = `Available Commands:
- help: Show this help message
- clear: Clear console
- status: Show system status
- generate dashboard [type]: Generate a dashboard (e.g., analytics, financial, performance)
- analyze [topic]: Analyze data on a topic
- deploy [project]: Deploy a project
- monitor: Start system monitoring
- optimize: Run system optimization`
      addMessage(consoleId, 'info', helpText)
      return
    }

    if (lowerCommand === 'clear') {
      clearConsole(consoleId)
      return
    }

    if (lowerCommand === 'status') {
      addMessage(consoleId, 'success', 'System Status: ALL SYSTEMS OPERATIONAL')
      addMessage(consoleId, 'output', `CPU: ${Math.floor(Math.random() * 30 + 20)}%`)
      addMessage(consoleId, 'output', `Memory: ${Math.floor(Math.random() * 40 + 30)}%`)
      addMessage(consoleId, 'output', `Network: ${Math.floor(Math.random() * 50 + 50)}Mbps`)
      addMessage(consoleId, 'output', `Active Processes: ${Math.floor(Math.random() * 20 + 10)}`)
      return
    }

    if (lowerCommand.startsWith('generate dashboard')) {
      const type = command.split(' ')[2] || 'analytics'
      addMessage(consoleId, 'info', `Generating ${type} dashboard...`)
      
      setTimeout(() => {
        const newWidgets: DashboardWidget[] = [
          {
            id: `widget-${Date.now()}-1`,
            type: 'metric',
            title: `${type.toUpperCase()} Overview`,
            data: {
              'Total Users': Math.floor(Math.random() * 10000 + 5000),
              'Active Sessions': Math.floor(Math.random() * 1000 + 500),
              'Conversion Rate': `${(Math.random() * 5 + 2).toFixed(2)}%`
            },
            position: { x: 0, y: 0, w: 4, h: 2 }
          },
          {
            id: `widget-${Date.now()}-2`,
            type: 'chart',
            title: 'Performance Metrics',
            data: {
              'Response Time': `${Math.floor(Math.random() * 100 + 50)}ms`,
              'Throughput': `${Math.floor(Math.random() * 500 + 200)}req/s`,
              'Error Rate': `${(Math.random() * 1).toFixed(2)}%`
            },
            position: { x: 4, y: 0, w: 4, h: 2 }
          },
          {
            id: `widget-${Date.now()}-3`,
            type: 'status',
            title: 'System Health',
            data: {
              'Database': 'Healthy',
              'API Gateway': 'Operational',
              'Cache': 'Optimal',
              'CDN': 'Active'
            },
            position: { x: 0, y: 2, w: 4, h: 2 }
          }
        ]
        
        setDashboards((current) => [...newWidgets, ...(current || [])].slice(0, 12))
        addMessage(consoleId, 'success', `Dashboard generated successfully with ${newWidgets.length} widgets`)
        toast.success('Dashboard generated!', { description: `${newWidgets.length} widgets created` })
      }, 1500)
      return
    }

    if (lowerCommand.startsWith('analyze')) {
      const topic = command.split(' ').slice(1).join(' ') || 'system'
      addMessage(consoleId, 'info', `Analyzing ${topic}...`)
      
      setTimeout(() => {
        addMessage(consoleId, 'output', `Analysis complete for: ${topic}`)
        addMessage(consoleId, 'output', `• Data points processed: ${Math.floor(Math.random() * 10000 + 5000)}`)
        addMessage(consoleId, 'output', `• Patterns detected: ${Math.floor(Math.random() * 20 + 5)}`)
        addMessage(consoleId, 'output', `• Anomalies found: ${Math.floor(Math.random() * 3)}`)
        addMessage(consoleId, 'success', 'Analysis completed successfully')
      }, 2000)
      return
    }

    if (lowerCommand.startsWith('deploy')) {
      const project = command.split(' ').slice(1).join(' ') || 'application'
      addMessage(consoleId, 'info', `Deploying ${project}...`)
      
      setTimeout(() => {
        addMessage(consoleId, 'output', 'Building application...')
        setTimeout(() => {
          addMessage(consoleId, 'output', 'Running tests...')
          setTimeout(() => {
            addMessage(consoleId, 'output', 'Pushing to production...')
            setTimeout(() => {
              addMessage(consoleId, 'success', `${project} deployed successfully!`)
              toast.success('Deployment complete!', { description: `${project} is now live` })
            }, 800)
          }, 800)
        }, 800)
      }, 1000)
      return
    }

    if (lowerCommand === 'monitor') {
      addMessage(consoleId, 'info', 'Starting system monitoring...')
      setTimeout(() => {
        addMessage(consoleId, 'output', 'Monitoring CPU, Memory, Network, and Disk I/O')
        addMessage(consoleId, 'success', 'Monitoring active - data streaming to analytics console')
      }, 1000)
      return
    }

    if (lowerCommand === 'optimize') {
      addMessage(consoleId, 'info', 'Running system optimization...')
      setTimeout(() => {
        addMessage(consoleId, 'output', 'Clearing cache...')
        setTimeout(() => {
          addMessage(consoleId, 'output', 'Optimizing database queries...')
          setTimeout(() => {
            addMessage(consoleId, 'output', 'Compressing assets...')
            setTimeout(() => {
              addMessage(consoleId, 'success', 'System optimization complete - Performance improved by 23%')
              toast.success('Optimization complete!')
            }, 600)
          }, 600)
        }, 600)
      }, 1000)
      return
    }

    addMessage(consoleId, 'output', `Executing: ${command}`)
    setTimeout(() => {
      addMessage(consoleId, 'success', 'Command executed successfully')
    }, 500)
  }

  const clearConsole = (consoleId: ConsoleType) => {
    setConsoleMessages((current) => {
      const messages = current || {
        system: [],
        development: [],
        analytics: [],
        marketing: [],
        control: []
      }
      return {
        ...messages,
        [consoleId]: []
      }
    })
  }

  const handleStrategyGenerated = (strategy: MarketingStrategy) => {
    setStrategies((current) => [strategy, ...(current || [])])
    toast.success('Strategy saved!', { 
      description: `${strategy.campaigns.length} campaigns generated` 
    })
  }

  const consoles: Array<{ id: ConsoleType; title: string; icon: React.ReactNode }> = [
    { id: 'system', title: 'SYSTEM', icon: <Terminal size={24} weight="fill" /> },
    { id: 'development', title: 'DEVELOPMENT', icon: <Code size={24} weight="fill" /> },
    { id: 'analytics', title: 'ANALYTICS', icon: <ChartBar size={24} weight="fill" /> },
    { id: 'marketing', title: 'MARKETING', icon: <Sparkle size={24} weight="fill" /> },
    { id: 'control', title: 'CONTROL', icon: <Cpu size={24} weight="fill" /> }
  ]

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <Toaster />
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b-2 border-border/50 luxury-gradient p-4 shadow-lg"
      >
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <CirclesFour size={40} weight="fill" className="text-accent" />
            </motion.div>
            <div>
              <h1 className="font-orbitron font-bold text-3xl tracking-wider text-glow uppercase">
                LUXE IDE
              </h1>
              <p className="text-muted-foreground text-sm tracking-wide">
                Premium Command Center · v2.0
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-accent/50 hover:bg-accent/20 hover:text-accent font-orbitron"
              onClick={() => {
                setConsoleMessages(() => ({
                  system: [],
                  development: [],
                  analytics: [],
                  marketing: [],
                  control: []
                }))
                setDashboards(() => [])
                toast.success('All systems reset')
              }}
            >
              <Lightning size={18} weight="fill" />
              RESET ALL
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="consoles" className="h-full flex flex-col">
          <div className="border-b border-border/50 bg-card/30 px-4">
            <TabsList className="bg-transparent border-b-0 h-14">
              <TabsTrigger 
                value="consoles" 
                className="font-orbitron tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Terminal size={18} weight="fill" className="mr-2" />
                CONSOLES
              </TabsTrigger>
              <TabsTrigger 
                value="dashboards"
                className="font-orbitron tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ChartBar size={18} weight="fill" className="mr-2" />
                DASHBOARDS
              </TabsTrigger>
              <TabsTrigger 
                value="marketing"
                className="font-orbitron tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Sparkle size={18} weight="fill" className="mr-2" />
                AI MARKETING
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="consoles" className="flex-1 p-6 m-0 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {consoles.map((console) => (
                <Console
                  key={console.id}
                  id={console.id}
                  title={console.title}
                  icon={console.icon}
                  isActive={activeConsole === console.id}
                  messages={consoleMessages?.[console.id] || []}
                  onExecute={(cmd) => executeCommand(console.id, cmd)}
                  onClear={() => clearConsole(console.id)}
                  onActivate={() => setActiveConsole(console.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dashboards" className="flex-1 m-0 overflow-hidden">
            <Card className="h-full border-2 border-border/50 console-glow rounded-none bg-card/50">
              <DashboardDisplay 
                widgets={dashboards || []} 
                title="DISTRIBUTED DASHBOARDS"
              />
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="flex-1 m-0 overflow-hidden">
            <Card className="h-full border-2 border-border/50 console-glow rounded-none bg-card/50">
              <MarketingEngine onStrategyGenerated={handleStrategyGenerated} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
