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
- generate dashboard [type]: Generate a dashboard with D3 visualizations (e.g., analytics, financial, performance)
- demo charts: Generate a demo dashboard showcasing all chart types
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

    if (lowerCommand === 'demo charts') {
      addMessage(consoleId, 'info', 'Generating comprehensive chart demo...')
      
      setTimeout(() => {
        const demoWidgets: DashboardWidget[] = [
          {
            id: `demo-line-${Date.now()}`,
            type: 'line',
            title: 'Revenue Trend (Line Chart)',
            data: Array.from({ length: 15 }, (_, i) => ({
              x: i,
              y: Math.floor(Math.random() * 60 + 40 + i * 3)
            })),
            position: { x: 0, y: 0, w: 4, h: 2 },
            chartConfig: { 
              color: 'oklch(0.85 0.18 90)', 
              showGrid: true, 
              animate: true 
            }
          },
          {
            id: `demo-bar-${Date.now()}`,
            type: 'bar',
            title: 'Sales by Category (Bar Chart)',
            data: [
              { label: 'Electronics', value: 145, color: 'oklch(0.85 0.18 90)' },
              { label: 'Fashion', value: 98, color: 'oklch(0.75 0.15 85)' },
              { label: 'Food', value: 122, color: 'oklch(0.35 0.15 300)' },
              { label: 'Sports', value: 87, color: 'oklch(0.65 0.20 180)' },
              { label: 'Books', value: 76, color: 'oklch(0.70 0.18 270)' }
            ],
            position: { x: 4, y: 0, w: 4, h: 2 },
            chartConfig: { animate: true }
          },
          {
            id: `demo-pie-${Date.now()}`,
            type: 'pie',
            title: 'Market Share (Donut Chart)',
            data: [
              { label: 'Product A', value: 35, color: 'oklch(0.85 0.18 90)' },
              { label: 'Product B', value: 28, color: 'oklch(0.75 0.15 85)' },
              { label: 'Product C', value: 22, color: 'oklch(0.35 0.15 300)' },
              { label: 'Product D', value: 15, color: 'oklch(0.65 0.20 180)' }
            ],
            position: { x: 8, y: 0, w: 4, h: 2 },
            chartConfig: { 
              innerRadius: 70, 
              animate: true, 
              showLabels: true 
            }
          },
          {
            id: `demo-area-${Date.now()}`,
            type: 'area',
            title: 'Revenue vs Expenses (Area Chart)',
            data: [
              {
                name: 'Revenue',
                data: Array.from({ length: 12 }, (_, i) => ({ 
                  x: i, 
                  y: Math.floor(Math.random() * 40 + 60 + i * 2) 
                })),
                color: 'oklch(0.85 0.18 90)'
              },
              {
                name: 'Expenses',
                data: Array.from({ length: 12 }, (_, i) => ({ 
                  x: i, 
                  y: Math.floor(Math.random() * 30 + 30 + i * 1.5) 
                })),
                color: 'oklch(0.55 0.22 25)'
              },
              {
                name: 'Profit',
                data: Array.from({ length: 12 }, (_, i) => ({ 
                  x: i, 
                  y: Math.floor(Math.random() * 20 + 20 + i * 0.5) 
                })),
                color: 'oklch(0.35 0.15 300)'
              }
            ],
            position: { x: 0, y: 2, w: 6, h: 2 },
            chartConfig: { 
              showGrid: true, 
              animate: true 
            }
          },
          {
            id: `demo-radar-${Date.now()}`,
            type: 'radar',
            title: 'Performance Radar',
            data: [
              { axis: 'Speed', value: 85 },
              { axis: 'Quality', value: 92 },
              { axis: 'Security', value: 78 },
              { axis: 'Usability', value: 88 },
              { axis: 'Features', value: 75 },
              { axis: 'Support', value: 90 }
            ],
            position: { x: 6, y: 2, w: 3, h: 2 },
            chartConfig: { 
              color: 'oklch(0.35 0.15 300)', 
              levels: 5,
              animate: true 
            }
          },
          {
            id: `demo-gauge-${Date.now()}`,
            type: 'gauge',
            title: 'System Load (Gauge)',
            data: { 
              value: 78, 
              label: 'CPU USAGE',
              unit: '%'
            },
            position: { x: 9, y: 2, w: 3, h: 2 },
            chartConfig: { 
              min: 0,
              max: 100,
              animate: true 
            }
          },
          {
            id: `demo-bar-horizontal-${Date.now()}`,
            type: 'bar',
            title: 'Top Products (Horizontal)',
            data: [
              { label: 'Widget Pro', value: 234 },
              { label: 'Gadget Max', value: 198 },
              { label: 'Tool Elite', value: 176 },
              { label: 'Device Plus', value: 145 }
            ],
            position: { x: 0, y: 4, w: 4, h: 2 },
            chartConfig: { 
              color: 'oklch(0.75 0.15 85)',
              animate: true,
              horizontal: true
            }
          },
          {
            id: `demo-metric-${Date.now()}`,
            type: 'metric',
            title: 'Key Performance Indicators',
            data: {
              'Total Revenue': '$127,450',
              'Active Users': '12,847',
              'Conversion Rate': '3.42%',
              'Avg Order Value': '$89.32',
              'Customer Satisfaction': '4.8/5.0'
            },
            position: { x: 4, y: 4, w: 4, h: 2 }
          },
          {
            id: `demo-status-${Date.now()}`,
            type: 'status',
            title: 'Infrastructure Status',
            data: {
              'Web Servers': 'Operational',
              'Database': 'Healthy',
              'Cache Layer': 'Optimal',
              'API Gateway': 'Active',
              'CDN': 'Protected',
              'Monitoring': 'Active'
            },
            position: { x: 8, y: 4, w: 4, h: 2 }
          }
        ]
        
        setDashboards(() => demoWidgets)
        addMessage(consoleId, 'success', `Chart demo generated with ${demoWidgets.length} visualizations`)
        toast.success('Demo Dashboard Created!', { 
          description: 'Showcasing Line, Bar, Pie, Area, Radar, and Gauge charts' 
        })
      }, 1000)
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
        const generateLineData = () => 
          Array.from({ length: 12 }, (_, i) => ({
            x: i,
            y: Math.floor(Math.random() * 80 + 20)
          }))

        const generateBarData = () => [
          { label: 'Mon', value: Math.floor(Math.random() * 100 + 50) },
          { label: 'Tue', value: Math.floor(Math.random() * 100 + 50) },
          { label: 'Wed', value: Math.floor(Math.random() * 100 + 50) },
          { label: 'Thu', value: Math.floor(Math.random() * 100 + 50) },
          { label: 'Fri', value: Math.floor(Math.random() * 100 + 50) }
        ]

        const generatePieData = () => [
          { label: 'Desktop', value: Math.floor(Math.random() * 50 + 30), color: 'oklch(0.85 0.18 90)' },
          { label: 'Mobile', value: Math.floor(Math.random() * 50 + 30), color: 'oklch(0.75 0.15 85)' },
          { label: 'Tablet', value: Math.floor(Math.random() * 30 + 10), color: 'oklch(0.35 0.15 300)' },
          { label: 'Other', value: Math.floor(Math.random() * 20 + 5), color: 'oklch(0.65 0.20 180)' }
        ]

        const generateAreaData = () => [
          {
            name: 'Revenue',
            data: Array.from({ length: 10 }, (_, i) => ({ x: i, y: Math.floor(Math.random() * 60 + 40) })),
            color: 'oklch(0.85 0.18 90)'
          },
          {
            name: 'Costs',
            data: Array.from({ length: 10 }, (_, i) => ({ x: i, y: Math.floor(Math.random() * 40 + 20) })),
            color: 'oklch(0.55 0.22 25)'
          }
        ]

        const generateRadarData = () => [
          { axis: 'Speed', value: Math.floor(Math.random() * 50 + 50) },
          { axis: 'Quality', value: Math.floor(Math.random() * 50 + 50) },
          { axis: 'Security', value: Math.floor(Math.random() * 50 + 50) },
          { axis: 'UX', value: Math.floor(Math.random() * 50 + 50) },
          { axis: 'Performance', value: Math.floor(Math.random() * 50 + 50) }
        ]

        const newWidgets: DashboardWidget[] = [
          {
            id: `widget-${Date.now()}-1`,
            type: 'line',
            title: `${type.toUpperCase()} Trend`,
            data: generateLineData(),
            position: { x: 0, y: 0, w: 4, h: 2 },
            chartConfig: { 
              color: 'oklch(0.85 0.18 90)', 
              showGrid: true, 
              animate: true 
            }
          },
          {
            id: `widget-${Date.now()}-2`,
            type: 'bar',
            title: 'Weekly Performance',
            data: generateBarData(),
            position: { x: 4, y: 0, w: 4, h: 2 },
            chartConfig: { 
              color: 'oklch(0.75 0.15 85)', 
              animate: true 
            }
          },
          {
            id: `widget-${Date.now()}-3`,
            type: 'pie',
            title: 'Traffic Distribution',
            data: generatePieData(),
            position: { x: 8, y: 0, w: 4, h: 2 },
            chartConfig: { 
              innerRadius: 60, 
              animate: true, 
              showLabels: true 
            }
          },
          {
            id: `widget-${Date.now()}-4`,
            type: 'gauge',
            title: 'System Performance',
            data: { 
              value: Math.floor(Math.random() * 40 + 60), 
              label: 'EFFICIENCY',
              unit: '%'
            },
            position: { x: 0, y: 2, w: 4, h: 2 },
            chartConfig: { 
              animate: true 
            }
          },
          {
            id: `widget-${Date.now()}-5`,
            type: 'area',
            title: 'Financial Overview',
            data: generateAreaData(),
            position: { x: 4, y: 2, w: 4, h: 2 },
            chartConfig: { 
              showGrid: true, 
              animate: true 
            }
          },
          {
            id: `widget-${Date.now()}-6`,
            type: 'radar',
            title: 'Quality Metrics',
            data: generateRadarData(),
            position: { x: 8, y: 2, w: 4, h: 2 },
            chartConfig: { 
              color: 'oklch(0.35 0.15 300)', 
              animate: true 
            }
          },
          {
            id: `widget-${Date.now()}-7`,
            type: 'metric',
            title: 'Key Metrics',
            data: {
              'Total Users': Math.floor(Math.random() * 10000 + 5000),
              'Active Sessions': Math.floor(Math.random() * 1000 + 500),
              'Conversion Rate': `${(Math.random() * 5 + 2).toFixed(2)}%`,
              'Revenue': `$${Math.floor(Math.random() * 50000 + 25000).toLocaleString()}`
            },
            position: { x: 0, y: 4, w: 4, h: 2 }
          },
          {
            id: `widget-${Date.now()}-8`,
            type: 'status',
            title: 'System Health',
            data: {
              'Database': 'Healthy',
              'API Gateway': 'Operational',
              'Cache': 'Optimal',
              'CDN': 'Active',
              'Security': 'Protected'
            },
            position: { x: 4, y: 4, w: 4, h: 2 }
          }
        ]
        
        setDashboards((current) => [...newWidgets, ...(current || [])].slice(0, 24))
        addMessage(consoleId, 'success', `Dashboard generated successfully with ${newWidgets.length} widgets`)
        toast.success('Dashboard generated!', { description: `${newWidgets.length} advanced visualizations created` })
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
