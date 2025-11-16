import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Stop, 
  Download, 
  Plus, 
  GitBranch, 
  Check, 
  X, 
  Clock, 
  Terminal,
  FileCode,
  Shield,
  Package,
  Rocket,
  CheckCircle,
  Spinner,
  CircleNotch
} from '@phosphor-icons/react'
import { PipelineTemplate, PipelineRun, TestSuite } from '@/lib/cicd-types'
import { DEFAULT_PIPELINE_TEMPLATES, generateGitHubActionsYAML, generateGitLabCIYAML, generateJenkinsfile } from '@/lib/pipeline-templates'
import { simulatePipelineRun, formatDuration, getPipelineStatusColor, getTestStatusColor, calculateTestCoverage, calculateSuccessRate, calculateAverageDuration } from '@/lib/pipeline-executor'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function CICDPipelineManager() {
  const [templates] = useKV<PipelineTemplate[]>('cicd-templates', DEFAULT_PIPELINE_TEMPLATES)
  const [pipelineRuns, setPipelineRuns] = useKV<PipelineRun[]>('pipeline-runs', [])
  const [selectedTemplate, setSelectedTemplate] = useState<PipelineTemplate | null>(null)
  const [currentRun, setCurrentRun] = useState<PipelineRun | null>(null)
  const [branch, setBranch] = useState('main')
  const [commit, setCommit] = useState('abc123f')
  const [commitMessage, setCommitMessage] = useState('feat: update deployment configuration')
  const [author, setAuthor] = useState('DevOps Engineer')
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<'github' | 'gitlab' | 'jenkins'>('github')

  const handleRunPipeline = async () => {
    if (!selectedTemplate) {
      toast.error('No template selected')
      return
    }

    const enabledStages = selectedTemplate.stages
      .filter(s => s.enabled)
      .map(s => ({
        id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: s.name,
        type: s.type,
        status: 'idle' as const,
        logs: s.commands
      }))

    toast.info('Starting pipeline execution...')

    try {
      const run = await simulatePipelineRun(
        selectedTemplate.name,
        enabledStages,
        branch,
        commit,
        commitMessage,
        author,
        selectedTemplate.environment,
        (updatedRun) => {
          setCurrentRun({ ...updatedRun })
        }
      )

      setPipelineRuns(current => [run, ...(current || [])].slice(0, 50))

      if (run.status === 'success') {
        toast.success('Pipeline completed successfully!', {
          description: `Completed in ${formatDuration(run.duration || 0)}`
        })
      } else {
        toast.error('Pipeline failed', {
          description: 'Check the logs for details'
        })
      }
    } catch (error) {
      toast.error('Pipeline execution error')
      console.error(error)
    }
  }

  const handleExportTemplate = () => {
    if (!selectedTemplate) return

    let content = ''
    let filename = ''

    switch (exportFormat) {
      case 'github':
        content = generateGitHubActionsYAML(selectedTemplate)
        filename = `${selectedTemplate.id}.yml`
        break
      case 'gitlab':
        content = generateGitLabCIYAML(selectedTemplate)
        filename = '.gitlab-ci.yml'
        break
      case 'jenkins':
        content = generateJenkinsfile(selectedTemplate)
        filename = 'Jenkinsfile'
        break
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Template exported!', {
      description: `Downloaded ${filename}`
    })
  }

  const avgDuration = calculateAverageDuration(pipelineRuns || [])
  const successRate = calculateSuccessRate(pipelineRuns || [])
  const testCoverage = calculateTestCoverage(pipelineRuns || [])

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-orbitron font-bold tracking-wide text-glow">
              CI/CD PIPELINE CENTER
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Automated Testing & Deployment Pipelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-accent/50">
                  <Plus size={18} weight="bold" className="mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-orbitron">Create Pipeline Template</DialogTitle>
                  <DialogDescription>
                    Configure a new CI/CD pipeline template for your project
                  </DialogDescription>
                </DialogHeader>
                <div className="text-center py-8 text-muted-foreground">
                  Custom template builder coming soon. Use preset templates for now.
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock size={24} className="text-primary" weight="fill" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
                <div className="text-xl font-bold font-mono">
                  {avgDuration > 0 ? formatDuration(avgDuration) : '-'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <CheckCircle size={24} className="text-accent" weight="fill" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
                <div className="text-xl font-bold font-mono">{successRate}%</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Shield size={24} className="text-secondary-foreground" weight="fill" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Test Coverage</div>
                <div className="text-xl font-bold font-mono">{testCoverage}%</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Rocket size={24} className="text-accent" weight="fill" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Runs</div>
                <div className="text-xl font-bold font-mono">{pipelineRuns?.length || 0}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="templates" className="h-full flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="runs">Pipeline Runs</TabsTrigger>
            <TabsTrigger value="current">Current Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 p-6 m-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <Card className="p-4 border-border/50 bg-card/30">
                <h3 className="font-orbitron font-bold mb-4 flex items-center gap-2">
                  <FileCode size={20} weight="fill" />
                  Available Templates
                </h3>
                <ScrollArea className="h-[calc(100%-3rem)]">
                  <div className="space-y-3 pr-4">
                    {templates?.map(template => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`p-4 cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id
                              ? 'border-accent bg-accent/10'
                              : 'border-border/50 hover:border-accent/50'
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <span>{template.stages.filter(s => s.enabled).length} stages</span>
                            <span>•</span>
                            <span>{template.environment}</span>
                            {template.requiresApproval && (
                              <>
                                <span>•</span>
                                <span className="text-accent">Requires Approval</span>
                              </>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              <Card className="p-4 border-border/50 bg-card/30">
                {selectedTemplate ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-orbitron font-bold flex items-center gap-2">
                        <Terminal size={20} weight="fill" />
                        Pipeline Configuration
                      </h3>
                      <div className="flex items-center gap-2">
                        <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="github">GitHub</SelectItem>
                            <SelectItem value="gitlab">GitLab</SelectItem>
                            <SelectItem value="jenkins">Jenkins</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={handleExportTemplate}>
                          <Download size={16} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>

                    <ScrollArea className="h-[calc(100%-8rem)]">
                      <div className="space-y-4 pr-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="branch" className="text-xs">Branch</Label>
                            <Input
                              id="branch"
                              value={branch}
                              onChange={e => setBranch(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="commit" className="text-xs">Commit SHA</Label>
                            <Input
                              id="commit"
                              value={commit}
                              onChange={e => setCommit(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="message" className="text-xs">Commit Message</Label>
                          <Input
                            id="message"
                            value={commitMessage}
                            onChange={e => setCommitMessage(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="author" className="text-xs">Author</Label>
                          <Input
                            id="author"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-bold text-sm mb-3">Pipeline Stages</h4>
                          <div className="space-y-2">
                            {selectedTemplate.stages.map((stage, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-muted-foreground font-mono text-xs">
                                    {idx + 1}
                                  </div>
                                  {stage.type === 'build' && <Package size={16} />}
                                  {stage.type === 'test' && <CheckCircle size={16} />}
                                  {stage.type === 'lint' && <FileCode size={16} />}
                                  {stage.type === 'security' && <Shield size={16} />}
                                  {stage.type === 'deploy' && <Rocket size={16} />}
                                  {stage.type === 'verify' && <Check size={16} />}
                                  <span className="text-sm">{stage.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {stage.type}
                                  </Badge>
                                </div>
                                <Switch checked={stage.enabled} disabled />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Button
                        className="w-full bg-accent hover:bg-accent/90"
                        size="lg"
                        onClick={handleRunPipeline}
                        disabled={currentRun?.status === 'running'}
                      >
                        <Play size={20} weight="fill" className="mr-2" />
                        Run Pipeline
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a template to configure and run
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="runs" className="flex-1 p-6 m-0 overflow-hidden">
            <Card className="h-full p-4 border-border/50 bg-card/30">
              <h3 className="font-orbitron font-bold mb-4">Pipeline History</h3>
              <ScrollArea className="h-[calc(100%-3rem)]">
                <div className="space-y-3 pr-4">
                  {pipelineRuns && pipelineRuns.length > 0 ? (
                    pipelineRuns.map(run => (
                      <Card
                        key={run.id}
                        className="p-4 border-border/50 hover:border-accent/50 transition-all cursor-pointer"
                        onClick={() => setCurrentRun(run)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">{run.name}</h4>
                              <Badge
                                style={{
                                  backgroundColor: getPipelineStatusColor(run.status) + '20',
                                  borderColor: getPipelineStatusColor(run.status),
                                  color: getPipelineStatusColor(run.status)
                                }}
                                className="text-xs"
                              >
                                {run.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <GitBranch size={14} />
                                <span>{run.branch}</span>
                                <span>•</span>
                                <span className="font-mono">{run.commit.substring(0, 7)}</span>
                              </div>
                              <div>{run.commitMessage}</div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>{new Date(run.startTime).toLocaleString()}</div>
                            {run.duration && (
                              <div className="font-mono mt-1">
                                {formatDuration(run.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {run.stages.map((stage, idx) => (
                            <div
                              key={idx}
                              className="h-2 flex-1 rounded"
                              style={{
                                backgroundColor: getPipelineStatusColor(stage.status)
                              }}
                              title={stage.name}
                            />
                          ))}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No pipeline runs yet. Run a pipeline to see history.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="current" className="flex-1 p-6 m-0 overflow-hidden">
            <Card className="h-full p-4 border-border/50 bg-card/30">
              {currentRun ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-orbitron font-bold flex items-center gap-2">
                        {currentRun.name}
                        <Badge
                          style={{
                            backgroundColor: getPipelineStatusColor(currentRun.status) + '20',
                            borderColor: getPipelineStatusColor(currentRun.status),
                            color: getPipelineStatusColor(currentRun.status)
                          }}
                        >
                          {currentRun.status}
                        </Badge>
                      </h3>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <GitBranch size={14} />
                        <span>{currentRun.branch}</span>
                        <span>•</span>
                        <span className="font-mono">{currentRun.commit}</span>
                        {currentRun.duration && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(currentRun.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {currentRun.status === 'running' && (
                      <Spinner size={24} className="animate-spin text-accent" />
                    )}
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="space-y-4 pr-4">
                      {currentRun.stages.map((stage, idx) => (
                        <Card key={idx} className="p-4 border-border/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {stage.type === 'build' && <Package size={20} weight="fill" />}
                              {stage.type === 'test' && <CheckCircle size={20} weight="fill" />}
                              {stage.type === 'lint' && <FileCode size={20} weight="fill" />}
                              {stage.type === 'security' && <Shield size={20} weight="fill" />}
                              {stage.type === 'deploy' && <Rocket size={20} weight="fill" />}
                              {stage.type === 'verify' && <Check size={20} weight="fill" />}
                              <div>
                                <h4 className="font-bold">{stage.name}</h4>
                                {stage.duration && (
                                  <div className="text-xs text-muted-foreground font-mono mt-1">
                                    {formatDuration(stage.duration)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: getPipelineStatusColor(stage.status) + '20',
                                borderColor: getPipelineStatusColor(stage.status),
                                color: getPipelineStatusColor(stage.status)
                              }}
                            >
                              {stage.status === 'success' && <Check size={14} weight="bold" className="mr-1" />}
                              {stage.status === 'failed' && <X size={14} weight="bold" className="mr-1" />}
                              {stage.status === 'running' && <Spinner size={14} className="mr-1 animate-spin" />}
                              {stage.status}
                            </Badge>
                          </div>

                          {stage.tests && stage.tests.length > 0 && (
                            <div className="mb-3 space-y-2">
                              {stage.tests.map(test => (
                                <div key={test.id} className="p-3 rounded-lg bg-muted/30">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{test.name}</span>
                                    <Badge
                                      variant="outline"
                                      style={{
                                        borderColor: getTestStatusColor(test.status),
                                        color: getTestStatusColor(test.status)
                                      }}
                                    >
                                      {test.status}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">Passed:</span>
                                      <span className="ml-1 font-mono">{test.passed}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Failed:</span>
                                      <span className="ml-1 font-mono">{test.failed}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Skipped:</span>
                                      <span className="ml-1 font-mono">{test.skipped}</span>
                                    </div>
                                    {test.coverage !== undefined && (
                                      <div>
                                        <span className="text-muted-foreground">Coverage:</span>
                                        <span className="ml-1 font-mono">{test.coverage}%</span>
                                      </div>
                                    )}
                                  </div>
                                  {test.coverage !== undefined && (
                                    <Progress value={test.coverage} className="h-1 mt-2" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {stage.logs && stage.logs.length > 0 && (
                            <div className="bg-black/50 rounded-lg p-3 font-mono text-xs">
                              {stage.logs.map((log, logIdx) => (
                                <div
                                  key={logIdx}
                                  className={`${
                                    log.startsWith('✓')
                                      ? 'text-green-400'
                                      : log.startsWith('✗')
                                      ? 'text-red-400'
                                      : log.startsWith('$')
                                      ? 'text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  {log}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No pipeline execution selected. Run a pipeline or select from history.
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
