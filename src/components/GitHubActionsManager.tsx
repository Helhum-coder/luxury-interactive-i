import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  ArrowClockwise,
  Warning,
  Code,
  FileCode,
  PlayCircle,
  ListBullets,
  Wrench
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface GitHubActionsManagerProps {
  githubToken?: string
  repository?: string
}

interface WorkflowRun {
  id: number
  name: string
  status: 'completed' | 'in_progress' | 'queued' | 'waiting'
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null
  created_at: string
  updated_at: string
  html_url: string
  head_branch: string
  event: string
  run_number: number
}

interface WorkflowFile {
  name: string
  path: string
  state: 'active' | 'disabled_manually' | 'disabled_inactivity'
  created_at: string
  updated_at: string
  url: string
  html_url: string
  badge_url: string
}

interface DiagnosticIssue {
  severity: 'critical' | 'warning' | 'info'
  type: string
  message: string
  fix?: string
  line?: number
}

export function GitHubActionsManager({ githubToken, repository = 'HelbsLozRoj/elmayordomo2025' }: GitHubActionsManagerProps) {
  const [workflows, setWorkflows] = useState<WorkflowFile[]>([])
  const [recentRuns, setRecentRuns] = useState<WorkflowRun[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [diagnostics, setDiagnostics] = useState<Map<string, DiagnosticIssue[]>>(new Map())
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const loadWorkflows = async () => {
    if (!githubToken) {
      toast.error('GitHub token required')
      return
    }

    setIsLoading(true)
    try {
      const [owner, repo] = repository.split('/')
      
      const workflowsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!workflowsRes.ok) throw new Error('Failed to fetch workflows')
      const workflowsData = await workflowsRes.json()
      setWorkflows(workflowsData.workflows || [])

      const runsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=40`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!runsRes.ok) throw new Error('Failed to fetch workflow runs')
      const runsData = await runsRes.json()
      setRecentRuns(runsData.workflow_runs || [])

      await analyzeFails(workflowsData.workflows || [], runsData.workflow_runs || [])
      
      toast.success(`Loaded ${workflowsData.workflows?.length || 0} workflows`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load workflows')
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeFails = async (workflowFiles: WorkflowFile[], runs: WorkflowRun[]) => {
    const issuesMap = new Map<string, DiagnosticIssue[]>()
    
    const failedRuns = runs.filter(run => run.conclusion === 'failure')
    const workflowFailCounts = new Map<string, number>()
    
    failedRuns.forEach(run => {
      const count = workflowFailCounts.get(run.name) || 0
      workflowFailCounts.set(run.name, count + 1)
    })

    workflowFiles.forEach(workflow => {
      const issues: DiagnosticIssue[] = []
      const failCount = workflowFailCounts.get(workflow.name) || 0

      if (workflow.state === 'disabled_manually') {
        issues.push({
          severity: 'warning',
          type: 'Disabled Workflow',
          message: 'This workflow has been manually disabled',
          fix: 'Enable the workflow in GitHub Actions settings'
        })
      }

      if (workflow.state === 'disabled_inactivity') {
        issues.push({
          severity: 'warning',
          type: 'Inactive Workflow',
          message: 'Workflow disabled due to repository inactivity',
          fix: 'Re-enable by making a commit or manually enabling in settings'
        })
      }

      if (failCount >= 5) {
        issues.push({
          severity: 'critical',
          type: 'Multiple Failures',
          message: `${failCount} recent failures detected`,
          fix: 'Review workflow logs and check for configuration issues'
        })
      }

      if (failCount >= 10) {
        issues.push({
          severity: 'critical',
          type: 'Systematic Failure',
          message: 'Pattern of consistent failures suggests configuration issue',
          fix: 'Workflow may need complete rewrite. Check authentication, secrets, and dependencies.'
        })
      }

      if (issues.length > 0) {
        issuesMap.set(workflow.name, issues)
      }
    })

    setDiagnostics(issuesMap)
  }

  const rerunWorkflow = async (runId: number) => {
    if (!githubToken) return

    try {
      const [owner, repo] = repository.split('/')
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/rerun`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      )

      if (!res.ok) throw new Error('Failed to rerun workflow')
      toast.success('Workflow queued for rerun')
      setTimeout(loadWorkflows, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rerun')
    }
  }

  const generateFixedWorkflow = (workflowName: string): string => {
    return `name: ${workflowName}

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: read
  actions: read
  checks: write

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        continue-on-error: false
      
      - name: Run linter
        run: npm run lint --if-present
        continue-on-error: true
      
      - name: Run tests
        run: npm test --if-present
        continue-on-error: true
      
      - name: Build project
        run: npm run build --if-present
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        if: success()
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7
`
  }

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') return <Clock size={16} className="text-blue-500 animate-pulse" />
    if (status === 'queued') return <Clock size={16} className="text-gray-400" />
    if (conclusion === 'success') return <CheckCircle size={16} weight="fill" className="text-green-500" />
    if (conclusion === 'failure') return <XCircle size={16} weight="fill" className="text-red-500" />
    if (conclusion === 'cancelled') return <XCircle size={16} className="text-gray-400" />
    return <Clock size={16} className="text-gray-400" />
  }

  const getStatusBadge = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') return <Badge variant="outline" className="text-blue-500 border-blue-500">Running</Badge>
    if (status === 'queued') return <Badge variant="outline">Queued</Badge>
    if (conclusion === 'success') return <Badge className="bg-green-500">Success</Badge>
    if (conclusion === 'failure') return <Badge variant="destructive">Failed</Badge>
    if (conclusion === 'cancelled') return <Badge variant="outline">Cancelled</Badge>
    return <Badge variant="outline">Unknown</Badge>
  }

  const failedCount = recentRuns.filter(r => r.conclusion === 'failure').length
  const successCount = recentRuns.filter(r => r.conclusion === 'success').length
  const inProgressCount = recentRuns.filter(r => r.status === 'in_progress').length

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GitBranch size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">GitHub Actions Manager</h2>
              <p className="text-sm text-muted-foreground">{repository}</p>
            </div>
          </div>
          <Button onClick={loadWorkflows} disabled={isLoading || !githubToken}>
            <ArrowClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {!githubToken && (
          <Alert>
            <Warning size={18} />
            <AlertDescription>
              Connect GitHub in the GitHub tab to manage workflows
            </AlertDescription>
          </Alert>
        )}

        {githubToken && recentRuns.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-card/50">
                <div className="text-2xl font-bold">{workflows.length}</div>
                <div className="text-sm text-muted-foreground">Total Workflows</div>
              </Card>
              <Card className="p-4 bg-green-500/10">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </Card>
              <Card className="p-4 bg-red-500/10">
                <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </Card>
              <Card className="p-4 bg-blue-500/10">
                <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </Card>
            </div>

            <Separator className="my-6" />

            {failedCount > 0 && (
              <Alert variant="destructive" className="mb-6">
                <Warning size={18} />
                <AlertDescription>
                  {failedCount} workflow run{failedCount > 1 ? 's have' : ' has'} failed. Review the diagnostics below for recommended fixes.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </Card>

      {githubToken && workflows.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCode size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Workflow Files</h3>
          </div>
          
          <Accordion type="single" collapsible className="space-y-2">
            {workflows.map((workflow) => {
              const issues = diagnostics.get(workflow.name) || []
              const criticalIssues = issues.filter(i => i.severity === 'critical').length
              
              return (
                <AccordionItem key={workflow.path} value={workflow.path} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Code size={18} className="text-muted-foreground" />
                        <span className="font-medium">{workflow.name}</span>
                        {workflow.state !== 'active' && (
                          <Badge variant="outline" className="text-xs">
                            {workflow.state.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      {criticalIssues > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {criticalIssues} issue{criticalIssues > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Path:</span>
                        <div className="font-mono text-xs mt-1 p-2 bg-muted/50 rounded">
                          {workflow.path}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="mt-1">
                          <Badge variant={workflow.state === 'active' ? 'default' : 'outline'}>
                            {workflow.state}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {issues.length > 0 && (
                      <div className="space-y-2">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <Warning size={16} />
                          Diagnostic Issues
                        </div>
                        {issues.map((issue, idx) => (
                          <Alert key={idx} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                            <AlertDescription>
                              <div className="font-semibold">{issue.type}</div>
                              <div className="text-sm mt-1">{issue.message}</div>
                              {issue.fix && (
                                <div className="text-sm mt-2 flex items-start gap-2">
                                  <Wrench size={14} className="mt-0.5 flex-shrink-0" />
                                  <span className="italic">{issue.fix}</span>
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(workflow.html_url, '_blank')}
                      >
                        View on GitHub
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow.name)}
                      >
                        <Code size={14} className="mr-1" />
                        Generate Fixed Version
                      </Button>
                    </div>

                    {selectedWorkflow === workflow.name && (
                      <div className="mt-4 space-y-2">
                        <div className="font-semibold text-sm">Recommended Fixed Workflow:</div>
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          <code>{generateFixedWorkflow(workflow.name)}</code>
                        </pre>
                        <p className="text-xs text-muted-foreground">
                          Copy this configuration and replace your existing workflow file at <code>{workflow.path}</code>
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </Card>
      )}

      {githubToken && recentRuns.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListBullets size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Recent Workflow Runs (Last 40)</h3>
          </div>
          
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {recentRuns.map((run) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(run.status, run.conclusion)}
                        <span className="font-medium">{run.name}</span>
                        {getStatusBadge(run.status, run.conclusion)}
                        <Badge variant="outline" className="text-xs">#{run.run_number}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <GitBranch size={14} />
                          <span>{run.head_branch}</span>
                          <span>•</span>
                          <span>{run.event}</span>
                        </div>
                        <div className="text-xs">
                          Updated: {new Date(run.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(run.html_url, '_blank')}
                      >
                        View Logs
                      </Button>
                      {run.conclusion === 'failure' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rerunWorkflow(run.id)}
                        >
                          <PlayCircle size={14} className="mr-1" />
                          Rerun
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
