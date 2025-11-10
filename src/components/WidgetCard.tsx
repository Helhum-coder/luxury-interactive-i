import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardWidget } from '@/lib/types'
import { 
  ChartLine, 
  ChartBar as ChartBarIcon, 
  ChartPie, 
  TrendUp, 
  Gauge as GaugeIcon,
  Target,
  CheckCircle 
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import LineChart from '@/components/widgets/LineChart'
import BarChart from '@/components/widgets/BarChart'
import PieChart from '@/components/widgets/PieChart'
import AreaChart from '@/components/widgets/AreaChart'
import RadarChart from '@/components/widgets/RadarChart'
import GaugeChart from '@/components/widgets/GaugeChart'

interface WidgetCardProps {
  widget: DashboardWidget
  index: number
}

export default function WidgetCard({ widget, index }: WidgetCardProps) {
  const getWidgetIcon = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'line': return <ChartLine size={20} weight="fill" />
      case 'bar': return <ChartBarIcon size={20} weight="fill" />
      case 'pie': return <ChartPie size={20} weight="fill" />
      case 'area': return <TrendUp size={20} weight="fill" />
      case 'radar': return <Target size={20} weight="fill" />
      case 'gauge': return <GaugeIcon size={20} weight="fill" />
      case 'metric': return <TrendUp size={20} weight="fill" />
      case 'status': return <CheckCircle size={20} weight="fill" />
    }
  }

  const getWidgetColor = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'line': return 'from-primary/20 to-primary/5'
      case 'bar': return 'from-accent/20 to-accent/5'
      case 'pie': return 'from-secondary/20 to-secondary/5'
      case 'area': return 'from-primary/20 to-primary/5'
      case 'radar': return 'from-accent/20 to-accent/5'
      case 'gauge': return 'from-secondary/20 to-secondary/5'
      case 'metric': return 'from-accent/20 to-accent/5'
      case 'status': return 'from-accent/20 to-accent/5'
    }
  }

  const renderChart = () => {
    const config = widget.chartConfig || {}
    
    switch (widget.type) {
      case 'line':
        return (
          <div className="flex items-center justify-center h-full">
            <LineChart
              data={widget.data}
              width={350}
              height={200}
              color={config.color}
              showGrid={config.showGrid}
              animate={config.animate}
            />
          </div>
        )
      
      case 'bar':
        return (
          <div className="flex items-center justify-center h-full">
            <BarChart
              data={widget.data}
              width={350}
              height={200}
              baseColor={config.color}
              animate={config.animate}
              horizontal={config.horizontal}
            />
          </div>
        )
      
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <PieChart
              data={widget.data}
              width={350}
              height={250}
              innerRadius={config.innerRadius}
              animate={config.animate}
              showLabels={config.showLabels}
            />
          </div>
        )
      
      case 'area':
        return (
          <div className="flex items-center justify-center h-full">
            <AreaChart
              series={widget.data}
              width={350}
              height={200}
              showGrid={config.showGrid}
              animate={config.animate}
              stacked={config.stacked}
            />
          </div>
        )
      
      case 'radar':
        return (
          <div className="flex items-center justify-center h-full">
            <RadarChart
              data={widget.data}
              width={350}
              height={280}
              color={config.color}
              levels={config.levels}
              animate={config.animate}
            />
          </div>
        )
      
      case 'gauge':
        return (
          <div className="flex items-center justify-center h-full pt-4">
            <GaugeChart
              value={widget.data.value}
              min={config.min || widget.data.min || 0}
              max={config.max || widget.data.max || 100}
              width={300}
              height={180}
              label={widget.data.label || widget.title}
              unit={config.unit || widget.data.unit || '%'}
              animate={config.animate}
            />
          </div>
        )
      
      case 'metric':
        return (
          <div className="space-y-2 text-sm">
            {typeof widget.data === 'object' && widget.data !== null ? (
              Object.entries(widget.data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="font-semibold text-foreground font-orbitron">
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
        )
      
      case 'status':
        return (
          <div className="space-y-2 text-sm">
            {typeof widget.data === 'object' && widget.data !== null ? (
              Object.entries(widget.data).map(([key, value]) => {
                const statusColor = 
                  String(value).toLowerCase().includes('healthy') || 
                  String(value).toLowerCase().includes('operational') ||
                  String(value).toLowerCase().includes('active') ||
                  String(value).toLowerCase().includes('optimal')
                    ? 'text-accent'
                    : String(value).toLowerCase().includes('error') || 
                      String(value).toLowerCase().includes('failed')
                    ? 'text-destructive'
                    : 'text-secondary'
                
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-muted-foreground capitalize">{key}:</span>
                    <Badge variant="outline" className={cn("border-current", statusColor)}>
                      {String(value)}
                    </Badge>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {String(widget.data)}
              </div>
            )}
          </div>
        )
      
      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            Unsupported widget type
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className={cn(
        "p-4 border-2 border-border/50 console-glow h-full flex flex-col",
        "bg-gradient-to-br",
        getWidgetColor(widget.type)
      )}>
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
        <div className="flex-1 overflow-auto scrollbar-luxury">
          {renderChart()}
        </div>
      </Card>
    </motion.div>
  )
}
