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
        },
        {
          id: 'pattern-timeout-1',
          type: 'timeout',
          message: 'Request timeout after 30s waiting for server response',
          occurrences: 4,
          firstSeen: new Date(Date.now() - 5400000).toISOString(),
          lastSeen: new Date().toISOString(),
          severity: 'medium'
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
        title: 'Configure CORS Headers',
        description: 'Cross-Origin Resource Sharing is blocking your API requests',
        reasoning: 'The server is rejecting requests from your origin. You need to configure the server to include proper CORS headers or use a proxy.',
        impact: 'high',
        estimatedFixTime: '10 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Enable CORS Proxy',
            description: 'Route requests through a CORS proxy to bypass restrictions',
            automated: false
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Configure Server Headers',
            description: 'Add Access-Control-Allow-Origin header on the server',
            automated: false
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Use Server-Side Requests',
            description: 'Make API calls from server-side code instead of client',
            automated: false
          }
        ]
      },
      network: {
        title: 'Resolve Network Connectivity',
        description: 'Intermittent connection failures are disrupting service',
        reasoning: 'Network instability or firewall rules may be blocking connections. Check your network configuration and retry logic.',
        impact: 'high',
        estimatedFixTime: '5 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Test Network Connection',
            description: 'Verify connectivity to the target endpoint',
            automated: true,
            action: async () => {
              try {
                const response = await fetch('https://httpbin.org/get')
                if (response.ok) {
                  toast.success('Network connection is working')
                } else {
                  toast.warning('Network returned non-OK status')
                }
              } catch {
                toast.error('Network connection failed')
              }
            }
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Check Firewall Rules',
            description: 'Verify firewall is not blocking outbound connections',
            automated: false
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Implement Retry Logic',
            description: 'Add exponential backoff retry mechanism',
            automated: false
          }
        ]
      },
      dns: {
        title: 'Fix DNS Resolution',
        description: 'Domain names cannot be resolved to IP addresses',
        reasoning: 'DNS cache may be stale or DNS server is unreachable. Flushing DNS cache often resolves this.',
        impact: 'high',
        estimatedFixTime: '2 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Use Alternative DNS',
            description: 'Try using 8.8.8.8 (Google) or 1.1.1.1 (Cloudflare) DNS',
            automated: false
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Clear DNS Cache',
            description: 'Flush local DNS resolver cache',
            automated: false
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Verify Domain Name',
            description: 'Ensure the domain name is spelled correctly',
            automated: false
          }
        ]
      },
      ssl: {
        title: 'Resolve SSL Certificate Issue',
        description: 'Secure connection cannot be established due to certificate problems',
        reasoning: 'Certificate may be expired, self-signed, or have hostname mismatch. This is a security-critical issue.',
        impact: 'high',
        estimatedFixTime: '15 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Check Certificate Validity',
            description: 'Verify certificate expiration and issuer',
            automated: false
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Update Root Certificates',
            description: 'Ensure system has latest trusted CA certificates',
            automated: false
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Verify Hostname Match',
            description: 'Confirm certificate CN/SAN matches the domain',
            automated: false
          }
        ]
      },
      cache: {
        title: 'Clear Stale Cache',
        description: 'Outdated cached data is causing display issues',
        reasoning: 'Browser cache contains old resources. Clearing it will force fresh downloads.',
        impact: 'low',
        estimatedFixTime: '1 minute',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Clear Browser Cache',
            description: 'Remove all cached data and service workers',
            automated: true,
            action: async () => {
              try {
                if ('caches' in window) {
                  const cacheNames = await caches.keys()
                  await Promise.all(cacheNames.map(name => caches.delete(name)))
                  toast.success('Cache cleared successfully')
                } else {
                  toast.warning('Cache API not available')
                }
              } catch (error) {
                toast.error('Failed to clear cache')
              }
            }
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Hard Reload Page',
            description: 'Force reload bypassing cache (Ctrl+Shift+R)',
            automated: true,
            action: () => {
              toast.info('Reloading in 2 seconds...')
              setTimeout(() => window.location.reload(), 2000)
            }
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Disable Cache',
            description: 'Temporarily disable caching in browser DevTools',
            automated: false
          }
        ]
      },
      port: {
        title: 'Resolve Port Access',
        description: 'Required network port is blocked or inaccessible',
        reasoning: 'Firewall or network policy is blocking access to the required port. Administrative changes may be needed.',
        impact: 'medium',
        estimatedFixTime: '5 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Check Firewall Rules',
            description: 'Verify firewall allows traffic on required port',
            automated: false
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Use Alternative Port',
            description: 'Try using standard ports (80, 443) if available',
            automated: false
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Contact Network Admin',
            description: 'Request port to be opened in firewall',
            automated: false
          }
        ]
      },
      timeout: {
        title: 'Reduce Request Timeout',
        description: 'Requests are taking too long and timing out',
        reasoning: 'Server is slow to respond or network latency is high. Consider optimizing queries or increasing timeout.',
        impact: 'medium',
        estimatedFixTime: '10 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Increase Timeout Duration',
            description: 'Extend request timeout to 60 seconds',
            automated: false
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Optimize API Queries',
            description: 'Reduce data payload or add pagination',
            automated: false
          },
          {
            id: `action-${pattern.id}-3`,
            label: 'Add Loading States',
            description: 'Show progress indicators for long-running requests',
            automated: false
          },
          {
            id: `action-${pattern.id}-4`,
            label: 'Check Server Performance',
            description: 'Verify server resources and response times',
            automated: false
          }
        ]
      },
      unknown: {
        title: 'Investigate Unclassified Error',
        description: 'Error pattern requires further investigation',
        reasoning: 'This pattern does not match known error signatures. Manual investigation needed.',
        impact: 'low',
        estimatedFixTime: '15 minutes',
        actions: [
          {
            id: `action-${pattern.id}-1`,
            label: 'Check Browser Console',
            description: 'Review detailed error messages in DevTools',
            automated: false
          },
          {
            id: `action-${pattern.id}-2`,
            label: 'Review Network Tab',
            description: 'Inspect failed requests for details',
            automated: false
          }
        ]
      }
    }

    const template = recommendations[pattern.type]

    return {
      id: `rec-${pattern.id}`,
      title: template.title || 'Error Detected',
      description: template.description || pattern.message,
      confidence: 75,
      reasoning: template.reasoning || 'Analysis in progress',
      actions: (template.actions || []) as RecommendedAction[],
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
      case 'critical': return 'bg-red-100 text-red-800 border-2 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-2 border-orange-300'
      case 'medium': return 'bg-amber-100 text-amber-800 border-2 border-amber-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-2 border-blue-300'
    }
  }

  const getImpactColor = (impact: AIRecommendation['impact']) => {
    switch (impact) {
      case 'high': return 'text-green-700 bg-green-100 border-2 border-green-300'
      case 'medium': return 'text-blue-700 bg-blue-100 border-2 border-blue-300'
      case 'low': return 'text-gray-700 bg-gray-100 border-2 border-gray-300'
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

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-lg overflow-hidden">
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain size={24} className="text-purple-600 animate-pulse" weight="duotone" />
                      </div>
                      <div>
                        <p className="font-semibold text-purple-900">AI analyzing error patterns...</p>
                        <p className="text-xs text-purple-600">Detecting patterns, correlating data, and generating recommendations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600 font-mono">{Math.round(analysisProgress)}%</p>
                      <p className="text-xs text-purple-500">Progress</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={analysisProgress} className="h-3 shadow-inner" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-purple-700">
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 30 ? 'bg-purple-500' : 'bg-purple-200'}`} />
                      Pattern Detection
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-700">
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 60 ? 'bg-purple-500' : 'bg-purple-200'}`} />
                      Data Correlation
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-700">
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 90 ? 'bg-purple-500' : 'bg-purple-200'}`} />
                      Generating Solutions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {safeDiagnosticHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-purple-200 hover:border-purple-300 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-2xl w-fit mx-auto mb-3">
                    <ChartBar size={32} className="text-purple-600" weight="duotone" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    {safeDiagnosticHistory[0].patternsFound}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Patterns Found</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-amber-200 hover:border-amber-300 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-amber-100 rounded-2xl w-fit mx-auto mb-3">
                    <Lightbulb size={32} className="text-amber-600" weight="duotone" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
                    {safeDiagnosticHistory[0].recommendationsGenerated}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Recommendations</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-red-200 hover:border-red-300 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-2xl w-fit mx-auto mb-3">
                    <Warning size={32} className="text-red-600" weight="duotone" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent mb-1">
                    {safeDiagnosticHistory[0].criticalIssues}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-green-200 hover:border-green-300 transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-2xl w-fit mx-auto mb-3">
                    <CheckCircle size={32} className="text-green-600" weight="duotone" />
                  </div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                    {safeDiagnosticHistory[0].aiConfidence}%
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">AI Confidence</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50">
          <TabsTrigger value="recommendations" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Lightbulb size={18} weight="duotone" />
            AI Recommendations ({safeRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bug size={18} weight="duotone" />
            Error Patterns ({safeErrorPatterns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          {safeRecommendations.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="p-6 bg-purple-100 rounded-full w-fit mx-auto mb-6">
                  <Brain size={72} className="text-purple-600" weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No Recommendations Yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Run AI analysis to generate intelligent diagnostic recommendations based on detected error patterns
                </p>
                <Button onClick={analyzeErrorPatterns} size="lg" className="gap-2">
                  <Sparkle size={20} weight="fill" />
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-5 pr-4">
                {safeRecommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all hover:shadow-xl group">
                      <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
                                <Lightbulb size={24} weight="fill" className="text-amber-600" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-xl mb-1">{rec.title}</CardTitle>
                                <CardDescription className="text-base">{rec.description}</CardDescription>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant="outline" className="text-xs font-mono border-purple-300 text-purple-700 px-3 py-1">
                              {rec.confidence}% confidence
                            </Badge>
                            <Badge className={`text-xs px-3 py-1 ${getImpactColor(rec.impact)}`}>
                              {rec.impact.toUpperCase()} impact fix
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <Alert className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                          <div className="flex gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg h-fit">
                              <Brain size={20} className="text-purple-600" weight="duotone" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-purple-900 mb-2">AI Reasoning</h4>
                              <p className="text-sm text-purple-800 leading-relaxed">{rec.reasoning}</p>
                            </div>
                          </div>
                        </Alert>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <ListChecks size={20} weight="duotone" className="text-purple-600" />
                              <h4 className="font-semibold text-lg">Recommended Actions</h4>
                            </div>
                            <Badge variant="secondary" className="gap-1">
                              <Lightning size={14} weight="fill" />
                              {rec.estimatedFixTime}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {rec.actions.map((action, actionIndex) => (
                              <motion.div
                                key={action.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + actionIndex * 0.05 }}
                                className="flex items-start gap-3 p-4 bg-gradient-to-br from-muted/40 to-muted/60 rounded-xl border-2 border-border hover:border-purple-200 transition-all group/action"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600 font-bold text-sm flex-shrink-0 mt-0.5">
                                  {actionIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-semibold text-base">{action.label}</h5>
                                    {action.automated && (
                                      <Badge variant="outline" className="text-xs gap-1 bg-green-50 text-green-700 border-green-300">
                                        <Lightning size={12} weight="fill" />
                                        Automated
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {action.description}
                                  </p>
                                </div>
                                {action.automated && action.action && (
                                  <Button
                                    size="sm"
                                    onClick={action.action}
                                    className="gap-2 flex-shrink-0"
                                  >
                                    <Wrench size={16} weight="duotone" />
                                    Execute
                                  </Button>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t-2 border-dashed">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Bug size={16} weight="duotone" />
                            <span>Affects {rec.relatedPatterns.length} error pattern(s)</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPattern(rec.relatedPatterns[0])}
                            className="gap-2"
                          >
                            View Pattern Details
                            <ChartBar size={14} />
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

        <TabsContent value="patterns" className="space-y-4 mt-6">
          {safeErrorPatterns.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="p-6 bg-red-100 rounded-full w-fit mx-auto mb-6">
                  <Bug size={72} className="text-red-600" weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No Error Patterns Detected</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Run diagnostics to identify and analyze error patterns in your system
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {safeErrorPatterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-2 hover:shadow-xl transition-all group ${
                      pattern.severity === 'critical' ? 'border-l-8 border-l-red-500 hover:border-red-300' :
                      pattern.severity === 'high' ? 'border-l-8 border-l-orange-500 hover:border-orange-300' :
                      pattern.severity === 'medium' ? 'border-l-8 border-l-amber-500 hover:border-amber-300' :
                      'border-l-8 border-l-blue-500 hover:border-blue-300'
                    }`}>
                      <CardContent className="pt-6 pb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${
                              pattern.severity === 'critical' ? 'bg-red-100' :
                              pattern.severity === 'high' ? 'bg-orange-100' :
                              pattern.severity === 'medium' ? 'bg-amber-100' :
                              'bg-blue-100'
                            }`}>
                              <Bug size={28} weight="duotone" className={
                                pattern.severity === 'critical' ? 'text-red-600' :
                                pattern.severity === 'high' ? 'text-orange-600' :
                                pattern.severity === 'medium' ? 'text-amber-600' :
                                'text-blue-600'
                              } />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg uppercase tracking-wider">
                                  {pattern.type}
                                </h4>
                                <Badge className={`text-xs font-semibold ${getSeverityColor(pattern.severity)}`}>
                                  {pattern.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Pattern ID: {pattern.id}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Alert className="mb-4 border-2">
                          <AlertDescription className="text-base font-medium">
                            {pattern.message}
                          </AlertDescription>
                        </Alert>
                        
                        <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-dashed">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground font-medium mb-2">Occurrences</p>
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-3 h-3 rounded-full animate-pulse ${
                                pattern.severity === 'critical' ? 'bg-red-500' :
                                pattern.severity === 'high' ? 'bg-orange-500' :
                                pattern.severity === 'medium' ? 'bg-amber-500' :
                                'bg-blue-500'
                              }`} />
                              <p className="text-2xl font-bold">{pattern.occurrences}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground font-medium mb-2">First Seen</p>
                            <p className="text-sm font-mono font-semibold">
                              {new Date(pattern.firstSeen).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(pattern.firstSeen).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground font-medium mb-2">Last Seen</p>
                            <p className="text-sm font-mono font-semibold">
                              {new Date(pattern.lastSeen).toLocaleTimeString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(pattern.lastSeen).toLocaleDateString()}
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
