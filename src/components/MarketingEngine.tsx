import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkle, TrendUp, Target, Megaphone, Lightning, ArrowRight } from '@phosphor-icons/react'
import { MarketingStrategy, Campaign } from '@/lib/types'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface MarketingEngineProps {
  onStrategyGenerated: (strategy: MarketingStrategy) => void
}

export default function MarketingEngine({ onStrategyGenerated }: MarketingEngineProps) {
  const [projectName, setProjectName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStrategy, setCurrentStrategy] = useState<MarketingStrategy | null>(null)

  const generateStrategy = async () => {
    if (!projectName || !targetAudience) {
      toast.error('Please enter project name and target audience')
      return
    }

    setIsGenerating(true)

    try {
      const promptText = `You are an expert marketing strategist. Create a comprehensive advertising and marketing strategy for the following project:

Project Name: ${projectName}
Target Audience: ${targetAudience}

Generate a complete marketing strategy with:
1. Multiple marketing channels (social media, content marketing, paid ads, influencer, email, SEO, etc.)
2. 3-5 specific campaign ideas with detailed tactics
3. Budget allocation recommendations
4. Timeline suggestions
5. Key performance indicators (KPIs)
6. Expected ROI for each campaign

Return the result as a valid JSON object with a single property called "strategy" containing the marketing strategy.
Format:
{
  "strategy": {
    "channels": ["channel1", "channel2", ...],
    "campaigns": [
      {
        "name": "Campaign Name",
        "description": "Detailed description",
        "channel": "primary channel",
        "tactics": ["tactic1", "tactic2", ...],
        "expectedROI": "percentage or description"
      }
    ],
    "budgetAllocation": "budget breakdown description",
    "timeline": "timeline description",
    "kpis": ["kpi1", "kpi2", ...]
  }
}`

      const result = await window.spark.llm(promptText, 'gpt-4o', true)
      const parsed = JSON.parse(result)
      
      const strategy: MarketingStrategy = {
        id: `strategy-${Date.now()}`,
        projectName,
        targetAudience,
        channels: parsed.strategy.channels || [],
        campaigns: parsed.strategy.campaigns.map((c: any, idx: number) => ({
          id: `campaign-${idx}`,
          name: c.name,
          description: c.description,
          channel: c.channel,
          tactics: c.tactics || [],
          expectedROI: c.expectedROI
        })),
        budgetAllocation: parsed.strategy.budgetAllocation || '$50,000 total budget',
        timeline: parsed.strategy.timeline || '3-6 months',
        kpis: parsed.strategy.kpis || [],
        timestamp: Date.now()
      }

      setCurrentStrategy(strategy)
      onStrategyGenerated(strategy)
      toast.success('Marketing strategy generated successfully!')
    } catch (error) {
      console.error('Strategy generation error:', error)
      toast.error('Failed to generate strategy. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border/50 luxury-gradient">
        <div className="flex items-center gap-3 mb-2">
          <Sparkle size={28} weight="fill" className="text-accent" />
          <h2 className="font-orbitron font-bold text-2xl tracking-wide text-foreground text-glow">
            AI MARKETING ENGINE
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Generate masterful advertising campaigns with AI-powered precision
        </p>
      </div>

      <ScrollArea className="flex-1 p-6 scrollbar-luxury">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6 border-2 border-border/50 console-glow bg-card/80">
            <h3 className="font-orbitron font-semibold text-lg mb-4 flex items-center gap-2">
              <Target size={20} weight="fill" className="text-secondary" />
              Project Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="text-sm font-medium mb-2 block">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter your project or brand name"
                  className="bg-background/80 border-input focus:border-accent"
                />
              </div>
              <div>
                <Label htmlFor="target-audience" className="text-sm font-medium mb-2 block">
                  Target Audience
                </Label>
                <Input
                  id="target-audience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Describe your target audience"
                  className="bg-background/80 border-input focus:border-accent"
                />
              </div>
              <Button
                onClick={generateStrategy}
                disabled={isGenerating}
                className="w-full gold-gradient hover:brightness-110 transition-all font-orbitron font-semibold tracking-wide"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Lightning size={20} weight="fill" className="animate-pulse" />
                    GENERATING STRATEGY...
                  </>
                ) : (
                  <>
                    <Sparkle size={20} weight="fill" />
                    GENERATE STRATEGY
                  </>
                )}
              </Button>
            </div>
          </Card>

          {currentStrategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="p-6 border-2 border-accent/50 console-glow-active bg-card/90">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-orbitron font-bold text-xl text-foreground">
                    {currentStrategy.projectName}
                  </h3>
                  <Badge className="gold-gradient text-accent-foreground font-semibold">
                    ACTIVE STRATEGY
                  </Badge>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Target: </span>
                  <span className="text-foreground font-medium">{currentStrategy.targetAudience}</span>
                </div>
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Timeline: </span>
                  <span className="text-foreground font-medium">{currentStrategy.timeline}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TrendUp size={16} weight="fill" className="text-accent" />
                    Marketing Channels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentStrategy.channels.map((channel, idx) => (
                      <Badge key={idx} variant="outline" className="border-accent/50 text-accent">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {currentStrategy.campaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 border-2 border-border/50 console-glow bg-card/80 hover:border-accent/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Megaphone size={20} weight="fill" className="text-secondary" />
                        <h4 className="font-orbitron font-semibold text-lg">{campaign.name}</h4>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {campaign.channel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                    <div className="mb-3">
                      <h5 className="text-sm font-semibold mb-2 text-secondary">Tactics:</h5>
                      <ul className="space-y-1">
                        {campaign.tactics.map((tactic, tIdx) => (
                          <li key={tIdx} className="text-sm flex items-start gap-2">
                            <ArrowRight size={16} className="text-accent mt-0.5 flex-shrink-0" />
                            <span>{tactic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Expected ROI:</span>
                      <span className="text-accent font-semibold">{campaign.expectedROI}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {currentStrategy.kpis.length > 0 && (
                <Card className="p-6 border-2 border-border/50 console-glow bg-card/80">
                  <h4 className="font-orbitron font-semibold text-lg mb-3 flex items-center gap-2">
                    <Target size={20} weight="fill" className="text-accent" />
                    Key Performance Indicators
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentStrategy.kpis.map((kpi, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span>{kpi}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
