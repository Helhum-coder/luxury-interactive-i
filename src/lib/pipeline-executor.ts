import { PipelineRun, PipelineStage, TestSuite, PipelineStatus, TestStatus } from './cicd-types'

export async function simulatePipelineRun(
  templateName: string,
  stages: PipelineStage[],
  branch: string,
  commit: string,
  commitMessage: string,
  author: string,
  environment: string,
  onProgress: (run: PipelineRun) => void
): Promise<PipelineRun> {
  const run: PipelineRun = {
    id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: templateName,
    branch,
    commit,
    commitMessage,
    author,
    status: 'running',
    stages: stages.map(s => ({ ...s, status: 'idle', logs: [] })),
    startTime: Date.now(),
    environment,
    trigger: 'manual'
  }

  onProgress({ ...run })

  for (let i = 0; i < run.stages.length; i++) {
    const stage = run.stages[i]
    stage.status = 'running'
    stage.startTime = Date.now()
    stage.logs = [`Starting ${stage.name}...`]
    
    onProgress({ ...run })

    await new Promise(resolve => setTimeout(resolve, 500))

    if (stage.type === 'test') {
      const tests = await simulateTests(stage.name)
      stage.tests = tests
      
      const hasFailed = tests.some(t => t.status === 'failed')
      if (hasFailed) {
        stage.status = 'failed'
        stage.logs.push(`✗ Tests failed`)
        stage.endTime = Date.now()
        stage.duration = stage.endTime - (stage.startTime || 0)
        
        run.status = 'failed'
        run.endTime = Date.now()
        run.duration = run.endTime - run.startTime
        
        onProgress({ ...run })
        return run
      }
    }

    for (const command of stage.logs.slice(1)) {
      await new Promise(resolve => setTimeout(resolve, 300))
      stage.logs.push(`$ ${command}`)
      stage.logs.push(`  ✓ ${command} completed`)
      onProgress({ ...run })
    }

    const success = Math.random() > 0.05
    
    if (success) {
      stage.status = 'success'
      stage.logs.push(`✓ ${stage.name} completed successfully`)
    } else {
      stage.status = 'failed'
      stage.logs.push(`✗ ${stage.name} failed`)
      stage.logs.push(`Error: Simulated failure for demonstration`)
      
      run.status = 'failed'
      run.endTime = Date.now()
      run.duration = run.endTime - run.startTime
      
      stage.endTime = Date.now()
      stage.duration = stage.endTime - (stage.startTime || 0)
      
      onProgress({ ...run })
      return run
    }

    stage.endTime = Date.now()
    stage.duration = stage.endTime - (stage.startTime || 0)
    
    onProgress({ ...run })
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  run.status = 'success'
  run.endTime = Date.now()
  run.duration = run.endTime - run.startTime
  
  onProgress({ ...run })
  return run
}

async function simulateTests(stageName: string): Promise<TestSuite[]> {
  const suites: TestSuite[] = []
  
  const testTypes: Array<{ name: string; type: TestSuite['type']; count: number }> = [
    { name: 'Unit Tests', type: 'unit', count: 150 },
    { name: 'Integration Tests', type: 'integration', count: 45 },
    { name: 'Component Tests', type: 'unit', count: 80 }
  ]

  for (const testType of testTypes) {
    const passed = Math.floor(testType.count * 0.95)
    const failed = Math.floor(Math.random() * 3)
    const skipped = testType.count - passed - failed

    const suite: TestSuite = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: testType.name,
      type: testType.type,
      status: failed > 0 ? 'failed' : 'passed',
      duration: Math.floor(Math.random() * 5000) + 2000,
      coverage: Math.floor(Math.random() * 20) + 75,
      passed,
      failed,
      skipped
    }

    if (failed > 0) {
      suite.error = `${failed} test(s) failed. Check logs for details.`
    }

    suites.push(suite)
  }

  return suites
}

export function calculateTestCoverage(runs: PipelineRun[]): number {
  if (runs.length === 0) return 0

  let totalCoverage = 0
  let coverageCount = 0

  runs.forEach(run => {
    run.stages.forEach(stage => {
      stage.tests?.forEach(test => {
        if (test.coverage !== undefined) {
          totalCoverage += test.coverage
          coverageCount++
        }
      })
    })
  })

  return coverageCount > 0 ? Math.round(totalCoverage / coverageCount) : 0
}

export function calculateSuccessRate(runs: PipelineRun[]): number {
  if (runs.length === 0) return 0
  const successful = runs.filter(r => r.status === 'success').length
  return Math.round((successful / runs.length) * 100)
}

export function calculateAverageDuration(runs: PipelineRun[]): number {
  if (runs.length === 0) return 0
  const completed = runs.filter(r => r.duration !== undefined)
  if (completed.length === 0) return 0
  const total = completed.reduce((sum, r) => sum + (r.duration || 0), 0)
  return Math.round(total / completed.length)
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

export function getPipelineStatusColor(status: PipelineStatus): string {
  switch (status) {
    case 'success':
      return 'oklch(0.72 0.08 110)'
    case 'failed':
      return 'oklch(0.62 0.15 30)'
    case 'running':
      return 'oklch(0.85 0.18 90)'
    case 'skipped':
      return 'oklch(0.556 0 0)'
    default:
      return 'oklch(0.708 0 0)'
  }
}

export function getTestStatusColor(status: TestStatus): string {
  switch (status) {
    case 'passed':
      return 'oklch(0.72 0.08 110)'
    case 'failed':
      return 'oklch(0.62 0.15 30)'
    case 'running':
      return 'oklch(0.85 0.18 90)'
    case 'skipped':
      return 'oklch(0.556 0 0)'
    default:
      return 'oklch(0.708 0 0)'
  }
}
