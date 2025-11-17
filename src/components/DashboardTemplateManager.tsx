import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  dashboardTemplates, 
  DashboardTemplate, 
  IndustryType,
  getTemplatesByIndustry,
  getTemplatesByTags
} from '@/lib/dashboard-templates'
import { 
  ChartBar, 
  MagnifyingGlass,
  Sparkle,
  Plus,
  Tag
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface DashboardTemplateManagerProps {
  onApplyTemplate: (template: DashboardTemplate) => void
}

const industryIcons: Record<IndustryType, React.ReactNode> = {
  finance: '💰',
  healthcare: '🏥',
  ecommerce: '🛒',
  saas: '☁️',
  manufacturing: '🏭',
  marketing: '📢',
  logistics: '📦',
  education: '🎓',
  realEstate: '🏢',
  energy: '⚡'
}

const industryColors: Record<IndustryType, string> = {
  finance: 'oklch(0.85 0.18 90)',
  healthcare: 'oklch(0.65 0.20 180)',
  ecommerce: 'oklch(0.75 0.15 85)',
  saas: 'oklch(0.35 0.15 300)',
  manufacturing: 'oklch(0.55 0.22 30)',
  marketing: 'oklch(0.85 0.18 90)',
  logistics: 'oklch(0.65 0.20 180)',
  education: 'oklch(0.75 0.15 140)',
  realEstate: 'oklch(0.55 0.22 30)',
  energy: 'oklch(0.85 0.18 90)'
}

export default function DashboardTemplateManager({ onApplyTemplate }: DashboardTemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = Array.from(
    new Set(dashboardTemplates.flatMap(t => t.tags))
  ).sort()

  const filteredTemplates = dashboardTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => template.tags.includes(tag))
    
    return matchesSearch && matchesIndustry && matchesTags
  })

  const handleApplyTemplate = (template: DashboardTemplate) => {
    onApplyTemplate(template)
    toast.success('Template Applied!', {
      description: `${template.name} dashboard with ${template.widgets.length} widgets`
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="h-full flex flex-col bg-card/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/20 rounded-lg">
            <ChartBar size={32} weight="fill" className="text-accent" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-orbitron tracking-wide">
              DASHBOARD TEMPLATES
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Pre-configured industry-specific dashboards with professional visualizations
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-accent/50 text-accent font-mono">
            {filteredTemplates.length} Templates
          </Badge>
        </div>
      </CardHeader>

      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="relative">
          <MagnifyingGlass 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder="Search templates, tags, or industries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        <Tabs value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as IndustryType | 'all')}>
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto">
            <TabsTrigger value="all" className="font-orbitron text-xs">
              ALL
            </TabsTrigger>
            {Object.entries(industryIcons).map(([industry, icon]) => (
              <TabsTrigger 
                key={industry} 
                value={industry}
                className="font-orbitron text-xs gap-2"
              >
                <span>{icon}</span>
                {industry.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Tag size={16} className="text-muted-foreground mt-1" />
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <CardContent className="p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <ChartBar size={64} className="mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No templates found</p>
              <p className="text-muted-foreground text-sm">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="border-2 hover:border-accent/50 transition-all hover:shadow-lg group"
                    style={{ 
                      borderColor: `color-mix(in oklch, ${template.color} 30%, transparent)`
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div 
                          className="text-3xl p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `color-mix(in oklch, ${template.color} 20%, transparent)`
                          }}
                        >
                          {industryIcons[template.industry]}
                        </div>
                        <Badge 
                          variant="secondary"
                          className="text-xs font-mono"
                          style={{ 
                            backgroundColor: `color-mix(in oklch, ${template.color} 20%, transparent)`,
                            color: template.color
                          }}
                        >
                          {template.widgets.length} Widgets
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-orbitron tracking-wide">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => handleApplyTemplate(template)}
                        className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-all"
                        size="sm"
                        style={{ 
                          backgroundColor: `color-mix(in oklch, ${template.color} 80%, transparent)`
                        }}
                      >
                        <Plus size={16} weight="bold" className="mr-2" />
                        Apply Template
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </div>
  )
}
