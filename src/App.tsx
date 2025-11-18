import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, BookOpen, Folder, GlobeHemisphereWest, Lightning, Brain, Globe, FileCode, HardDrives, Heartbeat, MapTrifold, Broadcast, Key, ChartLine, Activity, Package } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { DocumentCard } from '@/components/DocumentCard'
import { DocumentViewer } from '@/components/DocumentViewer'
import { NetworkDiagnosticPanel } from '@/components/NetworkDiagnosticPanel'
import { AutomatedFixScripts } from '@/components/AutomatedFixScripts'
import { AIDiagnosticEngine } from '@/components/AIDiagnosticEngine'
import { SatelliteConnectionMonitor } from '@/components/SatelliteConnectionMonitor'
import { FileConverterInterface } from '@/components/FileConverterInterface'
import { EnterpriseServerConnection } from '@/components/EnterpriseServerConnection'
import { ServerDiagnostic } from '@/components/ServerDiagnostic'
import { NetworkPathTracer } from '@/components/NetworkPathTracer'
import { LiveConnectivityDashboard } from '@/components/LiveConnectivityDashboard'
import { APITokensManager } from '@/components/APITokensManager'
import { PipelineMonitor } from '@/components/PipelineMonitor'
import { RealtimePipelineDashboard } from '@/components/RealtimePipelineDashboard'
import { RealtimeStatusFeed } from '@/components/RealtimeStatusFeed'
import { PackageDiagnostic } from '@/components/PackageDiagnostic'
import { useRecentDocuments } from '@/hooks/use-recent-documents'
import { 
  DOCUMENT_FILES, 
  categorizeDocument, 
  generateDocumentTitle, 
  generateDocumentDescription,
  type Document 
} from '@/lib/documents'

function App() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showNetworkDiagnostics, setShowNetworkDiagnostics] = useState(false)
  const [showFixScripts, setShowFixScripts] = useState(false)
  const [showAIDiagnostics, setShowAIDiagnostics] = useState(false)
  const [showSatelliteMonitor, setShowSatelliteMonitor] = useState(false)
  const [showFileConverter, setShowFileConverter] = useState(false)
  const [showEnterpriseServer, setShowEnterpriseServer] = useState(false)
  const [showServerDiagnostic, setShowServerDiagnostic] = useState(false)
  const [showPathTracer, setShowPathTracer] = useState(false)
  const [showLiveConnectivity, setShowLiveConnectivity] = useState(false)
  const [showAPITokens, setShowAPITokens] = useState(false)
  const [showPipelineMonitor, setShowPipelineMonitor] = useState(false)
  const [showRealtimeDashboard, setShowRealtimeDashboard] = useState(false)
  const [showPackageDiagnostic, setShowPackageDiagnostic] = useState(false)
  const [networkCheckResults, setNetworkCheckResults] = useState<any[]>([])
  const { addToRecent } = useRecentDocuments()

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      
      const loadedDocs: Document[] = []
      
      for (const fileName of DOCUMENT_FILES) {
        try {
          const response = await fetch(`/${fileName}`)
          if (response.ok) {
            const content = await response.text()
            const doc: Document = {
              id: fileName,
              title: generateDocumentTitle(fileName),
              fileName,
              category: categorizeDocument(fileName),
              content,
              description: generateDocumentDescription(content),
            }
            loadedDocs.push(doc)
          }
        } catch (error) {
          console.error(`Failed to load ${fileName}:`, error)
        }
      }
      
      setDocuments(loadedDocs)
      setLoading(false)
    }

    loadDocuments()
  }, [])

  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>()
    
    documents.forEach(doc => {
      const count = categoryMap.get(doc.category) || 0
      categoryMap.set(doc.category, count + 1)
    })
    
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [documents, searchQuery, selectedCategory])

  if (showPackageDiagnostic) {
    return <PackageDiagnostic onClose={() => setShowPackageDiagnostic(false)} />
  }

  if (showAIDiagnostics) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AIDiagnosticEngine networkChecks={networkCheckResults} />
        <div className="mt-6">
          <button
            onClick={() => setShowAIDiagnostics(false)}
            className="text-primary hover:underline"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    )
  }

  if (showSatelliteMonitor) {
    return (
      <div className="min-h-screen bg-background p-6">
        <SatelliteConnectionMonitor />
        <div className="mt-6">
          <button
            onClick={() => setShowSatelliteMonitor(false)}
            className="text-primary hover:underline"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    )
  }

  if (showFileConverter) {
    return <FileConverterInterface onClose={() => setShowFileConverter(false)} />
  }

  if (showEnterpriseServer) {
    return <EnterpriseServerConnection onClose={() => setShowEnterpriseServer(false)} />
  }

  if (showServerDiagnostic) {
    return <ServerDiagnostic onClose={() => setShowServerDiagnostic(false)} initialUrl="https://169.94.23.117:8443" />
  }

  if (showPathTracer) {
    return <NetworkPathTracer onClose={() => setShowPathTracer(false)} />
  }

  if (showLiveConnectivity) {
    return <LiveConnectivityDashboard onClose={() => setShowLiveConnectivity(false)} />
  }

  if (showAPITokens) {
    return <APITokensManager onClose={() => setShowAPITokens(false)} />
  }

  if (showPipelineMonitor) {
    return <PipelineMonitor onClose={() => setShowPipelineMonitor(false)} />
  }

  if (showNetworkDiagnostics) {
    return (
      <div className="min-h-screen bg-background p-6">
        <NetworkDiagnosticPanel 
          onShowFixScripts={() => {
            setShowFixScripts(true)
          }}
          onShowAIDiagnostics={(checks) => {
            setNetworkCheckResults(checks)
            setShowNetworkDiagnostics(false)
            setShowAIDiagnostics(true)
          }}
        />
        <div className="mt-6">
          <button
            onClick={() => setShowNetworkDiagnostics(false)}
            className="text-primary hover:underline"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    )
  }

  if (showFixScripts) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AutomatedFixScripts />
        <div className="mt-6">
          <button
            onClick={() => setShowFixScripts(false)}
            className="text-primary hover:underline"
          >
            ← Back to Documents
          </button>
        </div>
      </div>
    )
  }

  if (selectedDocument) {
    return (
      <DocumentViewer 
        document={selectedDocument} 
        onBack={() => setSelectedDocument(null)} 
      />
    )
  }

  const handleDocumentClick = (doc: Document) => {
    addToRecent(doc)
    setSelectedDocument(doc)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BookOpen size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-3xl tracking-tight text-foreground">
                Documentation Viewer
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse and search through all project documentation
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setShowPackageDiagnostic(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 hover:from-violet-500/20 hover:to-fuchsia-500/20 transition-colors border-2 border-violet-500/30"
              >
                <Package size={20} weight="duotone" className="text-violet-600" />
                <span className="text-sm font-semibold text-violet-600">Package Diagnostic</span>
              </button>
              <button
                onClick={() => setShowPipelineMonitor(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-colors border-2 border-blue-500/30"
              >
                <ChartLine size={20} weight="duotone" className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Pipeline Monitor</span>
              </button>
              <button
                onClick={() => setShowAPITokens(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-violet-500/10 hover:from-indigo-500/20 hover:to-violet-500/20 transition-colors border-2 border-indigo-500/30"
              >
                <Key size={20} weight="duotone" className="text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-600">API Tokens</span>
              </button>
              <button
                onClick={() => setShowLiveConnectivity(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 transition-colors border-2 border-purple-500/30"
              >
                <Broadcast size={20} weight="duotone" className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Live Connectivity</span>
              </button>
              <button
                onClick={() => setShowPathTracer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 transition-colors border-2 border-teal-500/30"
              >
                <MapTrifold size={20} weight="duotone" className="text-teal-600" />
                <span className="text-sm font-semibold text-teal-600">Path Tracer</span>
              </button>
              <button
                onClick={() => setShowServerDiagnostic(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500/10 to-orange-500/10 hover:from-rose-500/20 hover:to-orange-500/20 transition-colors border-2 border-rose-500/30"
              >
                <Heartbeat size={20} weight="duotone" className="text-rose-600" />
                <span className="text-sm font-semibold text-rose-600">Server Diagnostic</span>
              </button>
              <button
                onClick={() => setShowFileConverter(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-colors"
              >
                <FileCode size={20} weight="duotone" className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">File Converter</span>
              </button>
              <button
                onClick={() => setShowSatelliteMonitor(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-colors"
              >
                <Globe size={20} weight="duotone" className="text-green-600" />
                <span className="text-sm font-semibold text-green-600">Satellite Monitor</span>
              </button>
              <button
                onClick={() => setShowAIDiagnostics(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors"
              >
                <Brain size={20} weight="duotone" className="text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">AI Diagnostics</span>
              </button>
              <button
                onClick={() => setShowFixScripts(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                <Lightning size={20} weight="duotone" className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-600">Fix Scripts</span>
              </button>
              <button
                onClick={() => setShowNetworkDiagnostics(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <GlobeHemisphereWest size={20} weight="duotone" className="text-primary" />
                <span className="text-sm font-semibold text-primary">Network Diagnostics</span>
              </button>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {documents.length} documents
              </Badge>
            </div>
          </div>

          <div className="relative">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="flex-wrap h-auto gap-2">
              <TabsTrigger value="all" className="gap-2">
                <Folder size={16} weight="fill" />
                All ({documents.length})
              </TabsTrigger>
              {categories.map(({ name, count }) => (
                <TabsTrigger key={name} value={name} className="gap-2">
                  <Folder size={16} weight="fill" />
                  {name} ({count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex p-6 bg-muted rounded-full mb-4">
                <MagnifyingGlass size={48} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <DocumentCard
                    document={doc}
                    onClick={() => handleDocumentClick(doc)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
