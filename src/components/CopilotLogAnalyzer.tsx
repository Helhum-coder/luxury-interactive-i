import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  GitBranch, 
  MagnifyingGlass, 
  ArrowClockwise,
  Warning,
  CheckCircle,
  XCircle,
  Info,
  FileCode,
  GitCommit,
  ClockCounterClockwise
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface GitLog {
  hash: string
  author: string
  date: string
  message: string
  branch?: string
  files?: string[]
  isCopilotRelated?: boolean
}

interface BranchInfo {
  name: string
  lastCommit: string
  lastAuthor: string
  lastDate: string
  isCopilot?: boolean
}

export default function CopilotLogAnalyzer() {
  const [logs, setLogs] = useState<GitLog[]>([])
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filterCopilot, setFilterCopilot] = useState(false)

  const analyzeMockGitData = async () => {
    setIsAnalyzing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockBranches: BranchInfo[] = [
      {
        name: 'main',
        lastCommit: 'a1b2c3d',
        lastAuthor: 'Developer',
        lastDate: new Date(Date.now() - 86400000).toISOString(),
        isCopilot: false
      },
      {
        name: 'copilot/fix-5501681c-36cf-43cf-a621',
        lastCommit: 'e4f5g6h',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 3600000).toISOString(),
        isCopilot: true
      },
      {
        name: 'copilot/fix-91e08103-e406-4a3c-abd4',
        lastCommit: 'i7j8k9l',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 7200000).toISOString(),
        isCopilot: true
      },
      {
        name: 'copilot/domain-setup-cloudshell',
        lastCommit: 'c9d8e7f',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 10800000).toISOString(),
        isCopilot: true
      },
      {
        name: 'copilot/port-8000-backend',
        lastCommit: 'f6g5h4i',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 14400000).toISOString(),
        isCopilot: true
      },
      {
        name: 'development',
        lastCommit: 'm0n1o2p',
        lastAuthor: 'Developer',
        lastDate: new Date(Date.now() - 172800000).toISOString(),
        isCopilot: false
      },
      {
        name: 'copilot/feature-b439c4',
        lastCommit: 'q3r4s5t',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 259200000).toISOString(),
        isCopilot: true
      },
      {
        name: 'copilot/google-accounts-integration',
        lastCommit: 'x1y2z3a',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 345600000).toISOString(),
        isCopilot: true
      },
      {
        name: 'copilot/403-error-fix',
        lastCommit: 'b4c5d6e',
        lastAuthor: 'GitHub Copilot',
        lastDate: new Date(Date.now() - 432000000).toISOString(),
        isCopilot: true
      }
    ]

    const mockLogs: GitLog[] = [
      {
        hash: 'e4f5g6h7890',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 3600000).toISOString(),
        message: 'Implement ElMayordomo2025 file processing system',
        branch: 'copilot/fix-5501681c-36cf-43cf-a621',
        files: ['src/processors/file-handler.ts', 'src/utils/mayo-processor.ts'],
        isCopilotRelated: true
      },
      {
        hash: 'f6g5h4i3210',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 5000000).toISOString(),
        message: 'Configure port 8000 backend forwarding - Unable to forward request',
        branch: 'copilot/port-8000-backend',
        files: ['vite.config.ts', 'package.json', '.cloudshell/forwarding.config'],
        isCopilotRelated: true
      },
      {
        hash: 'i7j8k9l0123',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 7200000).toISOString(),
        message: 'Merge pull request #5 from Helhum-coder/copilot/fix',
        branch: 'copilot/fix-91e08103-e406-4a3c-abd4',
        files: ['package.json', 'src/App.tsx'],
        isCopilotRelated: true
      },
      {
        hash: 'c9d8e7f6543',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 10800000).toISOString(),
        message: 'Setup cloudshell domain: cs-1026435675871-default.cs-europe-west1-haha.cloudshell.dev',
        branch: 'copilot/domain-setup-cloudshell',
        files: ['.cloudshell/config', 'vite.config.ts', 'src/config/domains.ts'],
        isCopilotRelated: true
      },
      {
        hash: 'a1b2c3d4567',
        author: 'Developer',
        date: new Date(Date.now() - 86400000).toISOString(),
        message: 'Update production deployment configuration',
        branch: 'main',
        files: ['vercel.json', 'package.json'],
        isCopilotRelated: false
      },
      {
        hash: 'x1y2z3a4567',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 100000000).toISOString(),
        message: 'Integrate Google accounts.google.com authentication',
        branch: 'copilot/google-accounts-integration',
        files: ['src/auth/google-auth.ts', 'src/config/oauth.ts', '.env.example'],
        isCopilotRelated: true
      },
      {
        hash: 'b4c5d6e7890',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 150000000).toISOString(),
        message: 'Fix 403 error: "You do not have access to this page"',
        branch: 'copilot/403-error-fix',
        files: ['src/middleware/auth.ts', 'src/routes/protected.ts', 'src/config/permissions.ts'],
        isCopilotRelated: true
      },
      {
        hash: 'q3r4s5t6789',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 259200000).toISOString(),
        message: 'Add security audit and network monitoring',
        branch: 'copilot/feature-b439c4',
        files: ['security-audit.sh', 'src/components/NetworkDiagnostic.tsx'],
        isCopilotRelated: true
      },
      {
        hash: 'm0n1o2p3456',
        author: 'Developer',
        date: new Date(Date.now() - 172800000).toISOString(),
        message: 'Removed node_modules from tracking',
        branch: 'development',
        files: ['.gitignore', 'package-lock.json'],
        isCopilotRelated: false
      },
      {
        hash: 'u4v5w6x7890',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 345600000).toISOString(),
        message: 'Fix: wine-cellar git copilot block issue',
        branch: 'copilot/fix-5501681c',
        files: ['src/wine-cellar.ts', '.git/hooks/pre-commit'],
        isCopilotRelated: true
      },
      {
        hash: 'g8h9i0j1234',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 200000000).toISOString(),
        message: 'Hidden: Install xcode-select command line tools for macOS',
        branch: 'copilot/xcode-setup',
        files: ['scripts/xcode-install.sh', '.github/workflows/macos-build.yml'],
        isCopilotRelated: true
      },
      {
        hash: 'k2l3m4n5678',
        author: 'GitHub Copilot',
        date: new Date(Date.now() - 300000000).toISOString(),
        message: 'Block sudo commands and password authentication',
        branch: 'copilot/security-lockdown',
        files: ['security-audit.sh', 'src/security/sudo-blocker.ts', '.cloudshell/security.config'],
        isCopilotRelated: true
      },
      {
        hash: 'y7z8a9b0123',
        author: 'Developer',
        date: new Date(Date.now() - 432000000).toISOString(),
        message: 'Initial commit',
        branch: 'main',
        files: ['README.md', 'package.json', 'src/App.tsx'],
        isCopilotRelated: false
      }
    ]

    setBranches(mockBranches)
    setLogs(mockLogs)
    setIsAnalyzing(false)
    
    toast.success('Git Analysis Complete', {
      description: `Found ${mockBranches.filter(b => b.isCopilot).length} copilot branches and ${mockLogs.filter(l => l.isCopilotRelated).length} copilot commits`
    })
  }

  useEffect(() => {
    analyzeMockGitData()
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hash.includes(searchTerm)
    
    const matchesFilter = !filterCopilot || log.isCopilotRelated
    
    return matchesSearch && matchesFilter
  })

  const copilotBranches = branches.filter(b => b.isCopilot)
  const regularBranches = branches.filter(b => !b.isCopilot)

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-card/50 to-card">
      <CardHeader className="border-b border-border/50 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch size={32} weight="fill" className="text-primary" />
            <div>
              <CardTitle className="font-orbitron text-2xl tracking-wider">
                COPILOT LOG ANALYZER
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Hidden Git branches, copilot logs & deployment history revealed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1 mr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-orbitron">TOTAL COMMITS:</span>
                <Badge variant="secondary" className="font-mono">{logs.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-destructive font-orbitron">COPILOT COMMITS:</span>
                <Badge variant="destructive" className="font-mono">{logs.filter(l => l.isCopilotRelated).length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-destructive font-orbitron">COPILOT BRANCHES:</span>
                <Badge variant="destructive" className="font-mono">{copilotBranches.length}</Badge>
              </div>
            </div>
            <Button
              onClick={analyzeMockGitData}
              disabled={isAnalyzing}
              className="font-orbitron"
            >
              <ArrowClockwise 
                size={18} 
                weight="bold" 
                className={isAnalyzing ? 'animate-spin' : ''} 
              />
              {isAnalyzing ? 'ANALYZING...' : 'REFRESH'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 flex flex-col gap-4"
          >
            <Card className="border-2 border-destructive/50 bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-orbitron flex items-center gap-2">
                  <Warning size={20} weight="fill" className="text-destructive" />
                  COPILOT BRANCHES
                  <Badge variant="destructive" className="ml-auto">
                    {copilotBranches.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px]">
                  <div className="p-4 space-y-2">
                    {copilotBranches.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        No copilot branches detected
                      </div>
                    ) : (
                      copilotBranches.map((branch) => (
                        <motion.div
                          key={branch.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-2">
                            <GitBranch size={16} weight="fill" className="text-destructive mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-xs text-destructive font-bold break-all">
                                {branch.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {branch.lastCommit}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(branch.lastDate).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/50 bg-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-orbitron flex items-center gap-2">
                  <CheckCircle size={20} weight="fill" className="text-accent" />
                  REGULAR BRANCHES
                  <Badge variant="outline" className="ml-auto">
                    {regularBranches.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px]">
                  <div className="p-4 space-y-2">
                    {regularBranches.map((branch) => (
                      <motion.div
                        key={branch.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <GitBranch size={16} weight="fill" className="text-accent mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs font-bold break-all">
                              {branch.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[10px] h-5">
                                {branch.lastCommit}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(branch.lastDate).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            <Card className="border-2 border-primary/50">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <ClockCounterClockwise size={24} weight="fill" className="text-primary" />
                      <CardTitle className="text-lg font-orbitron">
                        COMMIT HISTORY & LOGS
                      </CardTitle>
                      <Badge variant="secondary" className="ml-auto">
                        {filteredLogs.length} commits
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <MagnifyingGlass 
                          size={18} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search commits, branches, authors..."
                          className="pl-10 font-mono text-sm"
                        />
                      </div>
                      <Button
                        variant={filterCopilot ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCopilot(!filterCopilot)}
                        className="font-orbitron whitespace-nowrap"
                      >
                        <Warning size={16} weight="fill" />
                        COPILOT ONLY
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-420px)] min-h-[500px]">
                  <div className="p-4 space-y-3">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center text-muted-foreground py-12">
                        <Info size={48} weight="fill" className="mx-auto mb-3 opacity-50" />
                        <p>No commits match your search criteria</p>
                      </div>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <motion.div
                          key={log.hash}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
                            log.isCopilotRelated
                              ? 'bg-destructive/5 border-destructive/30 hover:bg-destructive/10'
                              : 'bg-card border-border/30 hover:bg-accent/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {log.isCopilotRelated ? (
                                <XCircle size={20} weight="fill" className="text-destructive" />
                              ) : (
                                <CheckCircle size={20} weight="fill" className="text-accent" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-semibold text-sm leading-tight break-words">
                                  {log.message}
                                </p>
                                {log.isCopilotRelated && (
                                  <Badge variant="destructive" className="text-[10px] whitespace-nowrap flex-shrink-0">
                                    COPILOT
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  <GitCommit size={12} weight="bold" className="mr-1" />
                                  {log.hash.substring(0, 10)}
                                </Badge>
                                {log.branch && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] font-mono max-w-[200px] truncate ${
                                      log.isCopilotRelated ? 'border-destructive/50 text-destructive' : ''
                                    }`}
                                    title={log.branch}
                                  >
                                    <GitBranch size={12} weight="bold" className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{log.branch}</span>
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  by {log.author}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(log.date).toLocaleString()}
                                </span>
                              </div>

                              {log.files && log.files.length > 0 && (
                                <>
                                  <Separator className="my-2" />
                                  <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                                      <FileCode size={12} weight="bold" />
                                      {log.files.length} file{log.files.length !== 1 ? 's' : ''} changed
                                    </p>
                                    {log.files.map((file, idx) => (
                                      <p key={idx} className="text-[10px] font-mono text-muted-foreground pl-4 break-all">
                                        • {file}
                                      </p>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </CardContent>
    </div>
  )
}
