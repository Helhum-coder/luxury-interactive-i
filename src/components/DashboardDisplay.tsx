import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardWidget } from '@/lib/types'
import { ChartBar, TrendUp, Table, CheckCircle, MapPin } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DashboardDisplayProps {
  widgets: DashboardWidget[]
  title: string
}

export default function DashboardDisplay({ widgets, title }: DashboardDisplayProps) {
  const getWidgetIcon = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'chart': return <ChartBar size={20} weight="fill" />
      case 'metric': return <TrendUp size={20} weight="fill" />
      case 'table': return <Table size={20} weight="fill" />
      case 'status': return <CheckCircle size={20} weight="fill" />
      case 'map': return <MapPin size={20} weight="fill" />
    }
  }

  const getWidgetColor = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'chart': return 'from-primary/20 to-primary/5'
      case 'metric': return 'from-accent/20 to-accent/5'
      case 'table': return 'from-secondary/20 to-secondary/5'
      case 'status': return 'from-accent/20 to-accent/5'
      case 'map': return 'from-primary/20 to-primary/5'
    }
  }

  if (widgets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-lg mb-2">No Dashboard Active</div>
          <div className="text-muted-foreground/70 text-sm">
            Execute a system command to generate dashboards
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50 luxury-gradient">
        <h2 className="font-orbitron font-bold text-xl tracking-wide text-foreground text-glow">
          {title}
        </h2>
      </div>
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto scrollbar-luxury">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className={cn(
              "p-4 border-2 border-border/50 console-glow h-full",
              "bg-gradient-to-br",
              getWidgetColor(widget.type)
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-accent">
                    {getWidgetIcon(widget.type)}
                  </div>
                  <h3 className="font-orbitron font-semibold text-sm tracking-wide">
                    {widget.title}
                  </h3>
                </div>
                <Badge variant="outline" className="border-accent/50 text-accent text-xs uppercase">
                  {widget.type}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                {typeof widget.data === 'object' && widget.data !== null ? (
                  Object.entries(widget.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-border/30">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-semibold text-foreground">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {String(widget.data)}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
