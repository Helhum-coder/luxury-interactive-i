import { DashboardWidget } from '@/lib/types'
import WidgetCard from '@/components/WidgetCard'

interface DashboardDisplayProps {
  widgets: DashboardWidget[]
  title: string
}

export default function DashboardDisplay({ widgets, title }: DashboardDisplayProps) {
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
          <WidgetCard key={widget.id} widget={widget} index={index} />
        ))}
      </div>
    </div>
  )
}
