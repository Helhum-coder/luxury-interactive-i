import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Warning, 
  ArrowsClockwise, 
  Package, 
  GitBranch,
  Sparkle,
  MagnifyingGlass,
  Download,
  Upload,
  CloudArrowDown,
  Info
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'

interface PackageVersion {
  name: string
  version: string
  latestVersion?: string
  compatible: boolean
  status: 'current' | 'outdated' | 'breaking' | 'unknown'
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  issues?: string[]
  category?: string
}

interface CompatibilityIssue {
  package1: string
  package2: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  recommendation?: string
}

interface Environment {
  name: string
  packages: PackageVersion[]
  nodeVersion?: string
  npmVersion?: string
}

export function VersionCompatibilityMatrix({ onClose }: { onClose: () => void }) {
  const [packages, setPackages] = useState<PackageVersion[]>([])
  const [environments, setEnvironments] = useKV<Environment[]>('compatibility-environments', [])
  const [issues, setIssues] = useState<CompatibilityIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('matrix')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadPackageData()
  }, [])

  const loadPackageData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/package.json')
      const packageJson = await response.json()
      
      const deps = packageJson.dependencies || {}
      const devDeps = packageJson.devDependencies || {}
      
      const allPackages: PackageVersion[] = []
      
      for (const [name, version] of Object.entries(deps)) {
        allPackages.push(await analyzePackage(name, version as string, 'production'))
      }
      
      for (const [name, version] of Object.entries(devDeps)) {
        allPackages.push(await analyzePackage(name, version as string, 'development'))
      }
      
      setPackages(allPackages)
      analyzeCompatibility(allPackages)
    } catch (error) {
      console.error('Failed to load package data:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzePackage = async (name: string, version: string, category: string): Promise<PackageVersion> => {
    const cleanVersion = version.replace(/[\^~>=<]/g, '')
    
    let latestVersion = cleanVersion
    let status: PackageVersion['status'] = 'current'
    
    try {
      const response = await fetch(`https://registry.npmjs.org/${name}/latest`)
      if (response.ok) {
        const data = await response.json()
        latestVersion = data.version
        
        const currentMajor = parseInt(cleanVersion.split('.')[0])
        const latestMajor = parseInt(latestVersion.split('.')[0])
        
        if (latestMajor > currentMajor) {
          status = 'breaking'
        } else if (latestVersion !== cleanVersion) {
          status = 'outdated'
        }
      }
    } catch {
      status = 'unknown'
    }
    
    return {
      name,
      version: cleanVersion,
      latestVersion,
      compatible: true,
      status,
      category,
      issues: []
    }
  }

  const analyzeCompatibility = async (pkgs: PackageVersion[]) => {
    setAnalyzing(true)
    const foundIssues: CompatibilityIssue[] = []
    
    const reactPkg = pkgs.find(p => p.name === 'react')
    const reactDomPkg = pkgs.find(p => p.name === 'react-dom')
    
    if (reactPkg && reactDomPkg && reactPkg.version !== reactDomPkg.version) {
      foundIssues.push({
        package1: 'react',
        package2: 'react-dom',
        severity: 'critical',
        message: 'React and React-DOM versions must match',
        recommendation: `Update both to version ${reactPkg.latestVersion || reactPkg.version}`
      })
    }
    
    const typescriptPkg = pkgs.find(p => p.name === 'typescript')
    const reactTypesPkg = pkgs.find(p => p.name === '@types/react')
    
    if (typescriptPkg && reactTypesPkg) {
      const tsVersion = parseInt(typescriptPkg.version.split('.')[0])
      if (tsVersion < 5) {
        foundIssues.push({
          package1: 'typescript',
          package2: '@types/react',
          severity: 'warning',
          message: 'TypeScript version may be incompatible with latest React types',
          recommendation: 'Consider upgrading to TypeScript 5.x'
        })
      }
    }
    
    pkgs.forEach(pkg => {
      if (pkg.status === 'breaking') {
        foundIssues.push({
          package1: pkg.name,
          package2: 'latest',
          severity: 'warning',
          message: `Major version update available (${pkg.version} → ${pkg.latestVersion})`,
          recommendation: 'Review breaking changes before updating'
        })
      }
    })
    
    setIssues(foundIssues)
    setAnalyzing(false)
  }

  const runAIAnalysis = async () => {
    setAnalyzing(true)
    
    try {
      const packageList = packages.map(p => 
        `${p.name}@${p.version} (latest: ${p.latestVersion})`
      ).join('\n')
      
      const promptText = `Analyze these npm packages for compatibility issues and provide recommendations:

${packageList}

Identify:
1. Version conflicts between related packages
2. Security concerns with outdated versions
3. Breaking changes in available updates
4. Recommended upgrade paths

Return as JSON with structure:
{
  "issues": [{"package1": "name", "package2": "name", "severity": "critical|warning|info", "message": "...", "recommendation": "..."}],
  "summary": "overall assessment"
}`

      const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const analysis = JSON.parse(result)
      
      if (analysis.issues) {
        setIssues(prev => [...prev, ...analysis.issues])
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchesSearch = searchQuery === '' || 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || 
        pkg.category === selectedCategory ||
        (selectedCategory === 'outdated' && pkg.status !== 'current')
      
      return matchesSearch && matchesCategory
    })
  }, [packages, searchQuery, selectedCategory])

  const categories = useMemo(() => {
    const cats = new Map<string, number>()
    packages.forEach(pkg => {
      if (pkg.category) {
        cats.set(pkg.category, (cats.get(pkg.category) || 0) + 1)
      }
    })
    return Array.from(cats.entries()).map(([name, count]) => ({ name, count }))
  }, [packages])
  
  const safeEnvironments = environments || []

  const stats = useMemo(() => {
    const total = packages.length
    const outdated = packages.filter(p => p.status === 'outdated').length
    const breaking = packages.filter(p => p.status === 'breaking').length
    const critical = issues.filter(i => i.severity === 'critical').length
    
    return { total, outdated, breaking, critical }
  }, [packages, issues])

  const saveEnvironment = () => {
    const envName = window.prompt('Enter environment name:')
    if (!envName) return
    
    const newEnv: Environment = {
      name: envName,
      packages: packages,
      nodeVersion: '20.x',
      npmVersion: '10.x'
    }
    
    setEnvironments(prev => [...(prev || []), newEnv])
  }

  const compareEnvironments = (env1: Environment, env2: Environment) => {
    const differences: Array<{pkg: string, v1: string, v2: string}> = []
    
    env1.packages.forEach(p1 => {
      const p2 = env2.packages.find(p => p.name === p1.name)
      if (p2 && p1.version !== p2.version) {
        differences.push({ pkg: p1.name, v1: p1.version, v2: p2.version })
      }
    })
    
    return differences
  }

  const getStatusColor = (status: PackageVersion['status']) => {
    switch (status) {
      case 'current': return 'text-green-600 bg-green-100'
      case 'outdated': return 'text-amber-600 bg-amber-100'
      case 'breaking': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: PackageVersion['status']) => {
    switch (status) {
      case 'current': return <CheckCircle size={16} weight="fill" className="text-green-600" />
      case 'outdated': return <Warning size={16} weight="fill" className="text-amber-600" />
      case 'breaking': return <XCircle size={16} weight="fill" className="text-red-600" />
      default: return <Info size={16} weight="fill" className="text-gray-600" />
    }
  }

  const getSeverityColor = (severity: CompatibilityIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-amber-500 bg-amber-50'
      case 'info': return 'border-blue-500 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
              <Package size={32} weight="duotone" className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Version Compatibility Matrix</h1>
              <p className="text-muted-foreground mt-1">
                Analyze package versions and compatibility across environments
              </p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X size={24} />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outdated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.outdated}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Breaking Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.breaking}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={loadPackageData} variant="outline" disabled={loading}>
            <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button onClick={runAIAnalysis} variant="outline" disabled={analyzing}>
            <Sparkle size={16} className={analyzing ? 'animate-pulse' : ''} />
            AI Analysis
          </Button>
          <Button onClick={saveEnvironment} variant="outline">
            <Download size={16} />
            Save Environment
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="matrix">Compatibility Matrix</TabsTrigger>
            <TabsTrigger value="packages">Package List</TabsTrigger>
            <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
            <TabsTrigger value="environments">Environments ({safeEnvironments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <Card>
              <CardHeader>
                <CardTitle>Package Compatibility Matrix</CardTitle>
                <CardDescription>
                  Cross-reference package versions and identify conflicts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Badge 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All ({packages.length})
                  </Badge>
                  {categories.map(cat => (
                    <Badge 
                      key={cat.name}
                      variant={selectedCategory === cat.name ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      {cat.name} ({cat.count})
                    </Badge>
                  ))}
                  <Badge 
                    variant={selectedCategory === 'outdated' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('outdated')}
                  >
                    Outdated ({stats.outdated + stats.breaking})
                  </Badge>
                </div>

                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-12 gap-2">
                    {filteredPackages.slice(0, 12).map((pkg, i) => (
                      <div key={pkg.name} className="col-span-1">
                        <div 
                          className="text-xs font-mono truncate -rotate-45 origin-bottom-left h-24 w-6"
                          title={pkg.name}
                        >
                          {pkg.name}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-24">
                    {filteredPackages.slice(0, 12).map((pkgRow, rowIdx) => (
                      <div key={pkgRow.name} className="grid grid-cols-12 gap-2 mb-2">
                        {filteredPackages.slice(0, 12).map((pkgCol, colIdx) => (
                          <div 
                            key={`${pkgRow.name}-${pkgCol.name}`}
                            className={`col-span-1 h-8 rounded flex items-center justify-center ${
                              rowIdx === colIdx 
                                ? getStatusColor(pkgRow.status)
                                : 'bg-muted hover:bg-accent transition-colors cursor-pointer'
                            }`}
                            title={rowIdx === colIdx ? `${pkgRow.name}@${pkgRow.version}` : `${pkgRow.name} × ${pkgCol.name}`}
                          >
                            {rowIdx === colIdx && getStatusIcon(pkgRow.status)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages">
            <Card>
              <CardHeader>
                <CardTitle>All Packages</CardTitle>
                <CardDescription>
                  Complete list of dependencies with version information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Package</TableHead>
                        <TableHead>Current Version</TableHead>
                        <TableHead>Latest Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPackages.map(pkg => (
                        <TableRow key={pkg.name}>
                          <TableCell className="font-mono text-sm">{pkg.name}</TableCell>
                          <TableCell className="font-mono text-sm">{pkg.version}</TableCell>
                          <TableCell className="font-mono text-sm">{pkg.latestVersion || '—'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(pkg.status)}>
                              {pkg.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pkg.category}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues">
            <div className="space-y-4">
              <AnimatePresence>
                {issues.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Alert>
                      <CheckCircle size={20} weight="fill" className="text-green-600" />
                      <AlertDescription>
                        No compatibility issues detected. All packages appear to be compatible.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                ) : (
                  issues.map((issue, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Alert className={getSeverityColor(issue.severity)}>
                        <div className="flex items-start gap-3">
                          {issue.severity === 'critical' && <XCircle size={20} weight="fill" className="text-red-600 mt-0.5" />}
                          {issue.severity === 'warning' && <Warning size={20} weight="fill" className="text-amber-600 mt-0.5" />}
                          {issue.severity === 'info' && <Info size={20} weight="fill" className="text-blue-600 mt-0.5" />}
                          
                          <div className="flex-1">
                            <div className="font-semibold mb-1">
                              {issue.package1} ↔ {issue.package2}
                            </div>
                            <AlertDescription className="mb-2">
                              {issue.message}
                            </AlertDescription>
                            {issue.recommendation && (
                              <div className="text-sm bg-background/50 p-2 rounded">
                                <span className="font-medium">Recommendation:</span> {issue.recommendation}
                              </div>
                            )}
                          </div>
                          
                          <Badge variant="outline" className="capitalize">
                            {issue.severity}
                          </Badge>
                        </div>
                      </Alert>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="environments">
            <Card>
              <CardHeader>
                <CardTitle>Saved Environments</CardTitle>
                <CardDescription>
                  Compare package versions across different environments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeEnvironments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CloudArrowDown size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No saved environments yet.</p>
                    <p className="text-sm mt-2">Click "Save Environment" to snapshot your current packages.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeEnvironments.map((env, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{env.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {env.packages.length} packages
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setEnvironments(prev => (prev || []).filter((_, i) => i !== idx))}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                          {env.nodeVersion && (
                            <CardDescription>
                              Node {env.nodeVersion} • npm {env.npmVersion}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-48">
                            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                              {env.packages.slice(0, 10).map(pkg => (
                                <div key={pkg.name} className="flex items-center justify-between">
                                  <span className="truncate">{pkg.name}</span>
                                  <span className="text-muted-foreground">{pkg.version}</span>
                                </div>
                              ))}
                              {env.packages.length > 10 && (
                                <div className="col-span-2 text-center text-muted-foreground">
                                  ... and {env.packages.length - 10} more
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
