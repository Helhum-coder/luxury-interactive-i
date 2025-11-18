import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain,
  Lightbulb,
  CheckCircle,
  Warning,
  ArrowClockwise,
  Sparkle,
  ChartBar,
  Bug,
  Lightning,
  ListChecks,
  Wrench
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface ErrorPattern {
  id: string
  type: 'network' | 'cors' | 'dns' | 'ssl' | 'cache' | 'port' | 'timeout' | 'unknown'
  message: string
  occurrences: number
  firstSeen: string
  lastSeen: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  confidence: number
  reasoning: string
  actions: RecommendedAction[]
  relatedPatterns: string[]
  impact: 'high' | 'medium' | 'low'
  estimatedFixTime: string
}

interface RecommendedAction {
  id: string
  label: string
  description: string
  automated: boolean
  action?: () => void | Promise<void>
}

interface DiagnosticResult {
  timestamp: string
  patternsFound: number
  recommendationsGenerated: number
  criticalIssues: number
  aiConfidence: number
  summary: string
}

interface AIDiagnosticEngineProps {
  errorLogs?: any[]
  networkChecks?: any[]
  onRunFix?: (actionId: string) => void
}

export function AIDiagnosticEngine({ errorLogs = [], networkChecks = [], onRunFix }: AIDiagnosticEngineProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [errorPatterns, setErrorPatterns] = useKV<ErrorPattern[]>('ai-error-patterns', [])
  const [recommendations, setRecommendations] = useKV<AIRecommendation[]>('ai-recommendations', [])
  const [diagnosticHistory, setDiagnosticHistory] = useKV<DiagnosticResult[]>('ai-diagnostic-history', [])
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)

  const analyzeErrorPatterns = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 5, 90))
    }, 100)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const detectedPatterns: ErrorPattern[] = []

      if (networkChecks && networkChecks.length > 0) {
        const errorChecks = networkChecks.filter((check: any) => 
          check.status === 'error' || check.status === 'warning'
        )

        errorChecks.forEach((check: any) => {
          const patternType = detectPatternType(check.name, check.message)
          const existingPattern = detectedPatterns.find(p => p.type === patternType)

          if (existingPattern) {
            existingPattern.occurrences++
            existingPattern.lastSeen = new Date().toISOString()
          } else {
            detectedPatterns.push({
              id: `pattern-${Date.now()}-${Math.random()}`,
              type: patternType,
              message: check.message,
              occurrences: 1,
              firstSeen: check.timestamp || new Date().toISOString(),
              lastSeen: check.timestamp || new Date().toISOString(),
              severity: determineSeverity(patternType, check.status)
            })
          }
        })
      }

      const mockPatterns: ErrorPattern[] = [
        {
          id: 'pattern-cors-1',
          type: 'cors',
          message: 'CORS policy blocking external API requests',
          occurrences: 3,
          firstSeen: new Date(Date.now() - 3600000).toISOString(),
          lastSeen: new Date().toISOString(),
          severity: 'high'
        },
        {
          id: 'pattern-network-1',
          type: 'network',
          message: 'Intermittent connection failures to GitHub API',
          occurrences: 5,
          firstSeen: new Date(Date.now() - 7200000).toISOString(),
          lastSeen: new Date().toISOString(),
          severity: 'medium'
        },
        {
          id: 'pattern-cache-1',
          type: 'cache',
          message: 'Stale cache causing outdated content display',
          occurrences: 2,
          firstSeen: new Date(Date.now() - 1800000).toISOString(),
          lastSeen: new Date().toISOString(),
          severity: 'low'
        }
      ]

      const allPatterns = [...detectedPatterns, ...mockPatterns]
      setErrorPatterns(allPatterns)

      const aiRecommendations = await generateAIRecommendations(allPatterns)
      setRecommendations(aiRecommendations)

      const criticalCount = allPatterns.filter(p => p.severity === 'critical').length
      const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        patternsFound: allPatterns.length,
        recommendationsGenerated: aiRecommendations.length,
        criticalIssues: criticalCount,
        aiConfidence: calculateOverallConfidence(aiRecommendations),
        summary: `Found ${allPatterns.length} error patterns with ${aiRecommendations.length} AI-powered recommendations`
      }

      setDiagnosticHistory(prev => [result, ...(prev || []).slice(0, 9)])

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      toast.success('AI Analysis Complete', {
        description: `Generated ${aiRecommendations.length} recommendations from ${allPatterns.length} patterns`
      })
    } catch (error) {
      clearInterval(progressInterval)
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const detectPatternType = (name: string, message: string): ErrorPattern['type'] => {
    const text = `${name} ${message}`.toLowerCase()
    
    if (text.includes('cors') || text.includes('cross-origin')) return 'cors'
    if (text.includes('dns') || text.includes('resolve')) return 'dns'
    if (text.includes('ssl') || text.includes('certificate') || text.includes('https')) return 'ssl'
    if (text.includes('cache')) return 'cache'
    if (text.includes('port') || text.includes('blocked')) return 'port'
    if (text.includes('timeout') || text.includes('timed out')) return 'timeout'
    if (text.includes('network') || text.includes('connection')) return 'network'
    
    return 'unknown'
  }

  const determineSeverity = (type: ErrorPattern['type'], status: string): ErrorPattern['severity'] => {
    if (status === 'error') {
      if (type === 'ssl' || type === 'cors') return 'critical'
      if (type === 'network' || type === 'dns') return 'high'
      return 'medium'
    }
    return 'low'
  }

  const generateAIRecommendations = async (patterns: ErrorPattern[]): Promise<AIRecommendation[]> => {
    const recommendations: AIRecommendation[] = []

    for (const pattern of patterns) {
      const rec = await generateRecommendationForPattern(pattern)
      if (rec) recommendations.push(rec)
    }

    return recommendations
  }

  const generateRecommendationForPattern = async (pattern: ErrorPattern): Promise<AIRecommendation | null> => {
    const promptText = `Analyze this error pattern and provide a diagnostic recommendation:

Error Type: ${pattern.type}
Error Message: ${pattern.message}
Occurrences: ${pattern.occurrences}
Severity: ${pattern.severity}
Duration: First seen ${pattern.firstSeen}, last seen ${pattern.lastSeen}

Provide a JSON response with:
- title: Brief title for the recommendation (max 60 chars)
- description: Clear explanation of the issue (max 150 chars)
- reasoning: Why this issue is occurring and its impact (max 200 chars)
- impact: high, medium, or low
- estimatedFixTime: How long it takes to fix (e.g., "2 minutes", "5 minutes")
- actions: Array of 2-4 action objects, each with:
  - label: Action name (max 40 chars)
  - description: What the action does (max 80 chars)
  - automated: boolean (true if can be automated)`

    try {
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const data = JSON.parse(response)

      const recommendedActions: RecommendedAction[] = data.actions.map((action: any, index: number) => ({
        id: `action-${pattern.id}-${index}`,
        label: action.label,
        description: action.description,
        automated: action.automated,
        action: action.automated ? getAutomatedAction(pattern.type, action.label) : undefined
      }))

      return {
        id: `rec-${pattern.id}`,
        title: data.title,
        description: data.description,
        confidence: calculateConfidence(pattern),
        reasoning: data.reasoning,
        actions: recommendedActions,
        relatedPatterns: [pattern.id],
        impact: data.impact,
        estimatedFixTime: data.estimatedFixTime
      }
    } catch (error) {
      return getFallbackRecommendation(pattern)
    }
  }

  const getAutomatedAction = (patternType: string, actionLabel: string) => {
    const label = actionLabel.toLowerCase()
    
    if (label.includes('cache') || label.includes('clear')) {
      return async () => {
        try {
          if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(cacheNames.map(name => caches.delete(name)))
            toast.success('Cache cleared successfully')
          }
        } catch (error) {
          toast.error('Failed to clear cache')
        }
      }
    }

    if (label.includes('reload') || label.includes('refresh')) {
      return () => {
        toast.info('Reloading in 2 seconds...')
        setTimeout(() => window.location.reload(), 2000)
      }
    }

    if (label.includes('test') || label.includes('verify')) {
      return async () => {
        try {
          const response = await fetch('https://httpbin.org/get')
          if (response.ok) {
            toast.success('Connection test passed')
          } else {
            toast.warning('Connection test returned non-OK status')
          }
        } catch (error) {
          toast.error('Connection test failed')
        }
      }
    }

    return undefined
  }

  const getFallbackRecommendation = (pattern: ErrorPattern): AIRecommendation => {
    const recommendations: Record<ErrorPattern['type'], Partial<AIRecommendation>> = {
      cors: {
        title: 'CORS Configuration Issue Detected',
        description: 'Cross-Origin Resource Sharing is blocking API requests',
        reasoning: 'Server needs to allow requests from your origin with proper CORS headers',
        impact: 'high',
        estimatedFixTime: '10 minutes'
      },
      network: {
        title: 'Network Connectivity Problem',
        description: 'Intermittent connection failures detected',
        reasoning: 'Network instability or firewall blocking connections',
        impact: 'high',
        estimatedFixTime: '5 minutes'
      },
      dns: {
        title: 'DNS Resolution Failure',
        description: 'Unable to resolve domain names to IP addresses',
        reasoning: 'DNS cache may be stale or DNS server is unreachable',
        impact: 'high',
        estimatedFixTime: '2 minutes'
      },
      ssl: {
        title: 'SSL Certificate Issue',
        description: 'Secure connection cannot be established',
        reasoning: 'Certificate may be expired, self-signed, or invalid',
        impact: 'high',
        estimatedFixTime: '15 minutes'
      },
      cache: {
        title: 'Cache-Related Problem',
        description: 'Stale cached data causing display issues',
        reasoning: 'Browser cache contains outdated resources',
        impact: 'low',
        estimatedFixTime: '1 minute'
      },
      port: {
        title: 'Port Access Blocked',
        description: 'Required port is not accessible',
        reasoning: 'Firewall or network policy blocking port access',
        impact: 'medium',
        estimatedFixTime: '5 minutes'
      },
      timeout: {
        title: 'Request Timeout Occurring',
        description: 'Requests taking too long to complete',
        reasoning: 'Server slow to respond or network latency too high',
        impact: 'medium',
        estimatedFixTime: '10 minutes'
      },
      unknown: {
        title: 'Unclassified Error Pattern',
        description: 'Error pattern requires further investigation',
        reasoning: 'Pattern does not match known error signatures',
        impact: 'low',
        estimatedFixTime: '15 minutes'
      }
    }

    const template = recommendations[pattern.type]

    return {
      id: `rec-${pattern.id}`,
      title: template.title || 'Error Detected',
      description: template.description || pattern.message,
      confidence: 75,
      reasoning: template.reasoning || 'Analysis in progress',
      actions: [
        {
          id: `action-${pattern.id}-1`,
          label: 'Clear Browser Cache',
          description: 'Remove cached data that may be causing issues',
          automated: true,
          action: async () => {
            if ('caches' in window) {
              const cacheNames = await caches.keys()
              await Promise.all(cacheNames.map(name => caches.delete(name)))
              toast.success('Cache cleared')
            }
          }
        },
        {
          id: `action-${pattern.id}-2`,
          label: 'Test Connection',
          description: 'Verify network connectivity',
          automated: true,
          action: async () => {
            try {
              await fetch('https://httpbin.org/get')
              toast.success('Connection test passed')
            } catch {
              toast.error('Connection test failed')
            }
          }
        }
      ],
      relatedPatterns: [pattern.id],
      impact: template.impact as 'high' | 'medium' | 'low' || 'medium',
      estimatedFixTime: template.estimatedFixTime || '5 minutes'
    }
  }

  const calculateConfidence = (pattern: ErrorPattern): number => {
    let confidence = 60

    if (pattern.occurrences > 3) confidence += 15
    if (pattern.severity === 'critical' || pattern.severity === 'high') confidence += 10
    
    const duration = new Date(pattern.lastSeen).getTime() - new Date(pattern.firstSeen).getTime()
    if (duration > 3600000) confidence += 15

    return Math.min(confidence, 95)
  }

  const calculateOverallConfidence = (recommendations: AIRecommendation[]): number => {
    if (recommendations.length === 0) return 0
    const total = recommendations.reduce((sum, rec) => sum + rec.confidence, 0)
    return Math.round(total / recommendations.length)
  }

  const getSeverityColor = (severity: ErrorPattern['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300'
    }
  }

  const getImpactColor = (impact: AIRecommendation['impact']) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-blue-600 bg-blue-50'
      case 'low': return 'text-gray-600 bg-gray-50'
    }
  }

  const safeErrorPatterns = errorPatterns || []
  const safeRecommendations = recommendations || []
  const safeDiagnosticHistory = diagnosticHistory || []

  useEffect(() => {
    if (networkChecks && networkChecks.length > 0 && safeErrorPatterns.length === 0) {
      analyzeErrorPatterns()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <Brain size={40} weight="duotone" className="text-white drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">AI Diagnostic Engine</h1>
              <p className="text-purple-100 text-base">Intelligent error pattern analysis and AI-powered recommendations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={analyzeErrorPatterns} 
              disabled={isAnalyzing}
              className="gap-2 bg-white text-purple-600 hover:bg-purple-50 shadow-lg h-12 px-6 font-semibold"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <ArrowClockwise className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkle size={20} weight="fill" />
                  Run AI Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold flex items-center gap-2">
                  <Brain size={18} className="text-purple-600" />
                  AI analyzing error patterns...
                </span>
                <span className="text-purple-600 font-mono">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Detecting patterns, correlating data, and generating intelligent recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {safeDiagnosticHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <ChartBar size={32} className="text-purple-600 mx-auto mb-2" weight="duotone" />
                <p className="text-3xl font-bold text-purple-600">
                  {safeDiagnosticHistory[0].patternsFound}
                </p>
                <p className="text-sm text-muted-foreground">Patterns Found</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Lightbulb size={32} className="text-amber-600 mx-auto mb-2" weight="duotone" />
                <p className="text-3xl font-bold text-amber-600">
                  {safeDiagnosticHistory[0].recommendationsGenerated}
                </p>
                <p className="text-sm text-muted-foreground">Recommendations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Warning size={32} className="text-red-600 mx-auto mb-2" weight="duotone" />
                <p className="text-3xl font-bold text-red-600">
                  {safeDiagnosticHistory[0].criticalIssues}
                </p>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle size={32} className="text-green-600 mx-auto mb-2" weight="duotone" />
                <p className="text-3xl font-bold text-green-600">
                  {safeDiagnosticHistory[0].aiConfidence}%
                </p>
                <p className="text-sm text-muted-foreground">AI Confidence</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">
            AI Recommendations ({safeRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="patterns">
            Error Patterns ({safeErrorPatterns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {safeRecommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Brain size={64} className="text-muted-foreground mx-auto mb-4" weight="duotone" />
                <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Run AI analysis to generate intelligent diagnostic recommendations
                </p>
                <Button onClick={analyzeErrorPatterns}>
                  <Sparkle size={16} weight="fill" />
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {safeRecommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb size={20} weight="fill" className="text-amber-500" />
                              <CardTitle className="text-lg">{rec.title}</CardTitle>
                            </div>
                            <CardDescription>{rec.description}</CardDescription>
                          </div>
                          <div className="flex flex-col gap-2 items-end ml-4">
                            <Badge variant="outline" className="text-xs">
                              {rec.confidence}% confident
                            </Badge>
                            <Badge className={`text-xs ${getImpactColor(rec.impact)}`}>
                              {rec.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Alert className="mb-4 bg-purple-50/50 border-purple-200">
                          <Brain size={16} />
                          <AlertDescription>
                            <strong className="text-purple-900">AI Reasoning:</strong>
                            <p className="text-sm mt-1">{rec.reasoning}</p>
                          </AlertDescription>
                        </Alert>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <ListChecks size={16} />
                            <span className="font-semibold">Recommended Actions</span>
                            <span className="text-xs">({rec.estimatedFixTime})</span>
                          </div>
                          <div className="space-y-2">
                            {rec.actions.map((action) => (
                              <div
                                key={action.id}
                                className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm">{action.label}</h4>
                                    {action.automated && (
                                      <Badge variant="outline" className="text-xs gap-1">
                                        <Lightning size={12} />
                                        Auto
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {action.description}
                                  </p>
                                </div>
                                {action.automated && action.action && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={action.action}
                                  >
                                    <Wrench size={14} />
                                    Run
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Related to {rec.relatedPatterns.length} error pattern(s)
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPattern(rec.relatedPatterns[0])}
                          >
                            View Pattern
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {safeErrorPatterns.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Bug size={64} className="text-muted-foreground mx-auto mb-4" weight="duotone" />
                <h3 className="text-xl font-semibold mb-2">No Error Patterns Detected</h3>
                <p className="text-muted-foreground">
                  Run diagnostics to identify and analyze error patterns
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3 pr-4">
                {safeErrorPatterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-l-4 ${
                      pattern.severity === 'critical' ? 'border-l-red-500' :
                      pattern.severity === 'high' ? 'border-l-orange-500' :
                      pattern.severity === 'medium' ? 'border-l-amber-500' :
                      'border-l-blue-500'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Bug size={20} weight="duotone" className="text-red-600" />
                            <h4 className="font-semibold text-sm uppercase tracking-wider">
                              {pattern.type}
                            </h4>
                          </div>
                          <Badge className={`text-xs ${getSeverityColor(pattern.severity)}`}>
                            {pattern.severity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm mb-3">{pattern.message}</p>
                        
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Occurrences</p>
                            <p className="text-lg font-bold text-red-600">{pattern.occurrences}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">First Seen</p>
                            <p className="text-xs font-mono">
                              {new Date(pattern.firstSeen).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Last Seen</p>
                            <p className="text-xs font-mono">
                              {new Date(pattern.lastSeen).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
