import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, BookOpen, Folder } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { DocumentCard } from '@/components/DocumentCard'
import { DocumentViewer } from '@/components/DocumentViewer'
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
            <div className="ml-auto">
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
