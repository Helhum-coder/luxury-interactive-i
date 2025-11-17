import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  dashboardTemplates, 
  DashboardTemplate, 
  IndustryType
} from '@/lib/dashboard-templates'
import {
  UserTemplate,
  createUserTemplate,
  updateUserTemplate,
  duplicateTemplate,
  createTemplateBackup,
  restoreFromBackup,
  exportTemplateToJSON,
  importTemplateFromJSON
} from '@/lib/user-templates'
import { DashboardWidget } from '@/lib/types'
import { 
  ChartBar, 
  MagnifyingGlass,
  Sparkle,
  Plus,
  Tag,
  Heart,
  HeartStraight,
  Trash,
  Copy,
  Download,
  Upload,
  FloppyDisk,
  Clock,
  Star,
  Shield,
  CheckCircle
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface PersonalTemplateManagerProps {
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

const categoryColors = {
  work: 'oklch(0.65 0.20 180)',
  personal: 'oklch(0.85 0.18 90)',
  project: 'oklch(0.35 0.15 300)',
  client: 'oklch(0.75 0.15 140)'
}

export default function PersonalTemplateManager({ onApplyTemplate }: PersonalTemplateManagerProps) {
  const [userTemplates, setUserTemplates] = useKV<UserTemplate[]>('user-custom-templates', [])
  const [templateBackups, setTemplateBackups] = useKV<any[]>('template-backups', [])
  const [lastBackupTime, setLastBackupTime] = useKV<number>('last-template-backup', 0)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'work' | 'personal' | 'project' | 'client'>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showCustomOnly, setShowCustomOnly] = useState(false)
  
  const [isCreating, setIsCreating] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDesc, setNewTemplateDesc] = useState('')
  const [newTemplateIndustry, setNewTemplateIndustry] = useState<IndustryType>('finance')
  const [newTemplateCategory, setNewTemplateCategory] = useState<'work' | 'personal' | 'project' | 'client'>('work')
  const [newTemplateTags, setNewTemplateTags] = useState('')
  const [newTemplateNotes, setNewTemplateNotes] = useState('')

  const userId = 'current-user'

  useEffect(() => {
    const autoBackup = setInterval(() => {
      if (userTemplates && userTemplates.length > 0) {
        createAutoBackup()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(autoBackup)
  }, [userTemplates])

  const createAutoBackup = () => {
    if (!userTemplates || userTemplates.length === 0) return

    const backup = createTemplateBackup(userTemplates, userId)
    
    setTemplateBackups((currentBackups) => {
      const backups = currentBackups || []
      const newBackups = [backup, ...backups].slice(0, 10)
      return newBackups
    })
    
    setLastBackupTime(Date.now())
    
    toast.success('Auto-backup completed', {
      description: `${userTemplates.length} templates saved securely`
    })
  }

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Template name is required')
      return
    }

    const sampleWidgets: DashboardWidget[] = [
      {
        id: 'sample-metric',
        type: 'metric',
        title: 'Key Metrics',
        data: {
          'Metric 1': '0',
          'Metric 2': '0',
          'Metric 3': '0'
        },
        position: { x: 0, y: 0, w: 4, h: 2 }
      }
    ]

    const tags = newTemplateTags.split(',').map(t => t.trim()).filter(Boolean)
    
    const newTemplate = createUserTemplate(
      newTemplateName,
      newTemplateIndustry,
      newTemplateDesc || 'Custom dashboard template',
      sampleWidgets,
      tags,
      userId,
      newTemplateCategory,
      newTemplateNotes || undefined
    )

    setUserTemplates((current) => [newTemplate, ...(current || [])])
    
    toast.success('Template created!', {
      description: `${newTemplateName} saved permanently to your collection`
    })

    setIsCreating(false)
    setNewTemplateName('')
    setNewTemplateDesc('')
    setNewTemplateTags('')
    setNewTemplateNotes('')
    
    createAutoBackup()
  }

  const handleToggleFavorite = (templateId: string) => {
    setUserTemplates((current) => 
      (current || []).map(t => 
        t.id === templateId 
          ? { ...t, isFavorite: !t.isFavorite, updatedAt: Date.now() }
          : t
      )
    )
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = userTemplates?.find(t => t.id === templateId)
    if (!template) return

    setUserTemplates((current) => 
      (current || []).filter(t => t.id !== templateId)
    )
    
    toast.success('Template deleted', {
      description: `${template.name} removed from your collection`
    })
    
    createAutoBackup()
  }

  const handleDuplicateTemplate = (template: UserTemplate) => {
    const duplicate = duplicateTemplate(template, userId)
    setUserTemplates((current) => [duplicate, ...(current || [])])
    
    toast.success('Template duplicated!', {
      description: `Created copy of ${template.name}`
    })
  }

  const handleExportTemplate = (template: UserTemplate) => {
    const json = exportTemplateToJSON(template)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.name.replace(/\s+/g, '-')}-template.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Template exported!', {
      description: 'Download started'
    })
  }

  const handleExportAllTemplates = () => {
    if (!userTemplates || userTemplates.length === 0) {
      toast.error('No templates to export')
      return
    }

    const backup = createTemplateBackup(userTemplates, userId)
    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `all-templates-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('All templates exported!', {
      description: `${userTemplates.length} templates backed up`
    })
  }

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string
        const imported = importTemplateFromJSON(json, userId)
        
        setUserTemplates((current) => [imported, ...(current || [])])
        
        toast.success('Template imported!', {
          description: `${imported.name} added to your collection`
        })
        
        createAutoBackup()
      } catch (error) {
        toast.error('Import failed', {
          description: 'Invalid template file'
        })
      }
    }
    reader.readAsText(file)
    
    event.target.value = ''
  }

  const allTemplates: (DashboardTemplate | UserTemplate)[] = [
    ...(userTemplates || []),
    ...dashboardTemplates
  ]

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry
    
    const isUserTemplate = 'isCustom' in template && template.isCustom
    const matchesCategory = selectedCategory === 'all' || 
                           (isUserTemplate && (template as UserTemplate).category === selectedCategory)
    
    const matchesFavorites = !showFavoritesOnly || 
                            (isUserTemplate && (template as UserTemplate).isFavorite)
    
    const matchesCustom = !showCustomOnly || isUserTemplate
    
    return matchesSearch && matchesIndustry && matchesCategory && matchesFavorites && matchesCustom
  })

  const handleApplyTemplate = (template: DashboardTemplate | UserTemplate) => {
    onApplyTemplate(template)
    toast.success('Template Applied!', {
      description: `${template.name} dashboard with ${template.widgets.length} widgets loaded`
    })
  }

  return (
    <div className="h-full flex flex-col bg-card/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 rounded-lg">
              <Shield size={32} weight="fill" className="text-accent" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-orbitron tracking-wide">
                YOUR PERSONAL TEMPLATES
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Protected & Auto-Saved • {userTemplates?.length || 0} Custom Templates
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(lastBackupTime ?? 0) > 0 && (
              <Badge variant="outline" className="border-accent/50 text-accent gap-2">
                <CheckCircle size={16} weight="fill" />
                Last backup: {new Date(lastBackupTime ?? 0).toLocaleTimeString()}
              </Badge>
            )}
            
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/80 text-accent-foreground font-orbitron">
                  <Plus size={18} weight="bold" className="mr-2" />
                  NEW TEMPLATE
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-orbitron">Create Custom Template</DialogTitle>
                  <DialogDescription>
                    Your template will be saved permanently and backed up automatically
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name *</Label>
                    <Input
                      id="template-name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="My Custom Dashboard"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-desc">Description</Label>
                    <Textarea
                      id="template-desc"
                      value={newTemplateDesc}
                      onChange={(e) => setNewTemplateDesc(e.target.value)}
                      placeholder="What does this dashboard track?"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-industry">Industry</Label>
                      <Select value={newTemplateIndustry} onValueChange={(v) => setNewTemplateIndustry(v as IndustryType)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="finance">💰 Finance</SelectItem>
                          <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                          <SelectItem value="ecommerce">🛒 E-Commerce</SelectItem>
                          <SelectItem value="saas">☁️ SaaS</SelectItem>
                          <SelectItem value="manufacturing">🏭 Manufacturing</SelectItem>
                          <SelectItem value="marketing">📢 Marketing</SelectItem>
                          <SelectItem value="logistics">📦 Logistics</SelectItem>
                          <SelectItem value="education">🎓 Education</SelectItem>
                          <SelectItem value="realEstate">🏢 Real Estate</SelectItem>
                          <SelectItem value="energy">⚡ Energy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="template-category">Category</Label>
                      <Select value={newTemplateCategory} onValueChange={(v) => setNewTemplateCategory(v as any)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                    <Input
                      id="template-tags"
                      value={newTemplateTags}
                      onChange={(e) => setNewTemplateTags(e.target.value)}
                      placeholder="sales, quarterly, reports"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-notes">Notes</Label>
                    <Textarea
                      id="template-notes"
                      value={newTemplateNotes}
                      onChange={(e) => setNewTemplateNotes(e.target.value)}
                      placeholder="Additional notes or instructions..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate} className="bg-accent hover:bg-accent/80">
                    <FloppyDisk size={18} weight="fill" className="mr-2" />
                    Create & Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              onClick={createAutoBackup}
              className="border-accent/50 hover:bg-accent/20"
            >
              <FloppyDisk size={18} weight="fill" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportAllTemplates}
              className="border-accent/50 hover:bg-accent/20"
            >
              <Download size={18} weight="fill" />
            </Button>
            
            <Button
              variant="outline"
              className="border-accent/50 hover:bg-accent/20 relative"
            >
              <Upload size={18} weight="fill" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportTemplate}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="p-4 border-b border-border/50 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-10"
            />
          </div>
          
          <Select value={selectedIndustry} onValueChange={(v) => setSelectedIndustry(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="finance">💰 Finance</SelectItem>
              <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
              <SelectItem value="ecommerce">🛒 E-Commerce</SelectItem>
              <SelectItem value="saas">☁️ SaaS</SelectItem>
              <SelectItem value="manufacturing">🏭 Manufacturing</SelectItem>
              <SelectItem value="marketing">📢 Marketing</SelectItem>
              <SelectItem value="logistics">📦 Logistics</SelectItem>
              <SelectItem value="education">🎓 Education</SelectItem>
              <SelectItem value="realEstate">🏢 Real Estate</SelectItem>
              <SelectItem value="energy">⚡ Energy</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart size={16} weight={showFavoritesOnly ? "fill" : "regular"} className="mr-2" />
            Favorites
          </Button>
          
          <Button
            variant={showCustomOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCustomOnly(!showCustomOnly)}
          >
            <Star size={16} weight={showCustomOnly ? "fill" : "regular"} className="mr-2" />
            My Templates
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => {
              const isUserTemplate = 'isCustom' in template && template.isCustom
              const userTemplate = isUserTemplate ? (template as UserTemplate) : null
              
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card 
                    className="group hover:border-accent/50 transition-all cursor-pointer relative overflow-hidden"
                    style={{
                      borderColor: isUserTemplate ? 'oklch(0.85 0.18 90)' : undefined
                    }}
                  >
                    {isUserTemplate && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-accent/20 -rotate-12 translate-x-6 -translate-y-6" />
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{industryIcons[template.industry]}</span>
                            {isUserTemplate && userTemplate && (
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  borderColor: categoryColors[userTemplate.category],
                                  color: categoryColors[userTemplate.category]
                                }}
                              >
                                {userTemplate.category}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-orbitron">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        
                        {isUserTemplate && userTemplate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(template.id)
                            }}
                          >
                            <Heart 
                              size={18} 
                              weight={userTemplate.isFavorite ? "fill" : "regular"}
                              className={userTemplate.isFavorite ? "text-red-500" : "text-muted-foreground"}
                            />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span>{template.widgets.length} widgets</span>
                        {isUserTemplate && userTemplate && (
                          <span className="text-xs">v{userTemplate.version}</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-accent hover:bg-accent/80"
                          onClick={() => handleApplyTemplate(template)}
                        >
                          <Sparkle size={16} weight="fill" className="mr-2" />
                          Apply
                        </Button>
                        
                        {isUserTemplate && userTemplate && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDuplicateTemplate(userTemplate)
                              }}
                            >
                              <Copy size={16} weight="fill" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExportTemplate(userTemplate)
                              }}
                            >
                              <Download size={16} weight="fill" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 hover:bg-destructive/20 hover:border-destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template.id)
                              }}
                            >
                              <Trash size={16} weight="fill" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {filteredTemplates.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <ChartBar size={64} weight="thin" className="text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create a new template
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus size={18} weight="bold" className="mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
