import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  GitBranch, 
  GitMerge, 
  GitCommit, 
  User, 
  Clock,
  ArrowsDownUp,
  MagnifyingGlass,
  GitFork
} from '@phosphor-icons/react'
import * as d3 from 'd3'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TimelineCommit {
  sha: string
  message: string
  author: string
  authorAvatar?: string
  date: Date
  branch: string
  parents: string[]
  isMerge?: boolean
  tags?: string[]
}

export interface TimelineBranch {
  name: string
  color: string
  commits: TimelineCommit[]
  mergedInto?: string
  divergedFrom?: string
}

interface CommitTimelineProps {
  branches: TimelineBranch[]
  maxCommits?: number
  onCommitClick?: (commit: TimelineCommit) => void
  className?: string
}

export default function CommitTimeline({ 
  branches, 
  maxCommits = 50,
  onCommitClick,
  className 
}: CommitTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedCommit, setSelectedCommit] = useState<TimelineCommit | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: width || 800, height: height || 600 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!svgRef.current || branches.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 40, bottom: 40, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const allCommits: Array<TimelineCommit & { branchIndex: number; branchColor: string }> = []
    
    branches.forEach((branch, branchIndex) => {
      branch.commits.slice(0, maxCommits).forEach(commit => {
        allCommits.push({
          ...commit,
          branchIndex,
          branchColor: branch.color
        })
      })
    })

    allCommits.sort((a, b) => b.date.getTime() - a.date.getTime())
    const displayCommits = allCommits.slice(0, maxCommits)

    if (displayCommits.length === 0) return

    const yScale = d3.scaleTime()
      .domain([
        d3.min(displayCommits, d => d.date) || new Date(),
        d3.max(displayCommits, d => d.date) || new Date()
      ])
      .range([height, 0])
      .nice()

    const branchXPositions = branches.map((_, i) => 
      (width / (branches.length + 1)) * (i + 1)
    )

    const commitsByBranch = new Map<string, typeof displayCommits>()
    displayCommits.forEach(commit => {
      const key = commit.branch
      if (!commitsByBranch.has(key)) {
        commitsByBranch.set(key, [])
      }
      commitsByBranch.get(key)!.push(commit)
    })

    commitsByBranch.forEach((commits, branchName) => {
      const branchIndex = branches.findIndex(b => b.name === branchName)
      if (branchIndex === -1) return

      const x = branchXPositions[branchIndex]
      const branchColor = branches[branchIndex].color

      const line = d3.line<typeof commits[0]>()
        .x(() => x)
        .y(d => yScale(d.date))
        .curve(d3.curveMonotoneY)

      g.append('path')
        .datum(commits)
        .attr('class', 'branch-line')
        .attr('fill', 'none')
        .attr('stroke', branchColor)
        .attr('stroke-width', 3)
        .attr('opacity', 0.6)
        .attr('d', line)
        .style('filter', `drop-shadow(0 0 4px ${branchColor})`)
    })

    displayCommits.forEach(commit => {
      const branchIndex = branches.findIndex(b => b.name === commit.branch)
      if (branchIndex === -1) return

      const x = branchXPositions[branchIndex]
      const y = yScale(commit.date)

      if (commit.isMerge && commit.parents.length > 1) {
        const parentCommit = displayCommits.find(c => c.sha === commit.parents[0])
        if (parentCommit) {
          const parentBranchIndex = branches.findIndex(b => b.name === parentCommit.branch)
          if (parentBranchIndex !== -1 && parentBranchIndex !== branchIndex) {
            const parentX = branchXPositions[parentBranchIndex]
            const parentY = yScale(parentCommit.date)

            g.append('path')
              .attr('class', 'merge-line')
              .attr('d', `M ${parentX},${parentY} Q ${(parentX + x) / 2},${(parentY + y) / 2} ${x},${y}`)
              .attr('fill', 'none')
              .attr('stroke', commit.branchColor)
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '5,5')
              .attr('opacity', 0.5)
              .style('filter', `drop-shadow(0 0 2px ${commit.branchColor})`)
          }
        }
      }
    })

    const commitNodes = g.selectAll('.commit-node')
      .data(displayCommits)
      .enter()
      .append('g')
      .attr('class', 'commit-node')
      .attr('transform', d => {
        const branchIndex = branches.findIndex(b => b.name === d.branch)
        return `translate(${branchXPositions[branchIndex]},${yScale(d.date)})`
      })
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedCommit(d)
        onCommitClick?.(d)
      })
      .on('mouseenter', function() {
        d3.select(this).select('circle').transition().duration(200).attr('r', 10)
      })
      .on('mouseleave', function() {
        d3.select(this).select('circle').transition().duration(200).attr('r', 6)
      })

    commitNodes.append('circle')
      .attr('r', d => d.isMerge ? 8 : 6)
      .attr('fill', d => d.branchColor)
      .attr('stroke', 'oklch(0.20 0.02 270)')
      .attr('stroke-width', 2)
      .style('filter', d => `drop-shadow(0 0 6px ${d.branchColor})`)

    commitNodes.filter(d => d.isMerge).append('circle')
      .attr('r', 4)
      .attr('fill', 'oklch(0.20 0.02 270)')

    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
      .tickFormat(d3.timeFormat('%b %d, %H:%M') as any)

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'oklch(0.685 0.169 237.323)')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '11px')

    g.selectAll('.y-axis line, .y-axis path')
      .style('stroke', 'oklch(0.278 0.033 256.848)')
      .style('opacity', 0.3)

    branches.forEach((branch, i) => {
      const x = branchXPositions[i]
      
      g.append('text')
        .attr('x', x)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('fill', branch.color)
        .style('font-family', 'var(--font-mono)')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('filter', `drop-shadow(0 0 4px ${branch.color})`)
        .text(branch.name)

      g.append('line')
        .attr('x1', x)
        .attr('y1', -10)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', branch.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.2)
    })

  }, [branches, dimensions, maxCommits, onCommitClick])

  const filteredBranches = branches.map(branch => ({
    ...branch,
    commits: branch.commits.filter(commit => 
      !searchTerm || 
      commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commit.sha.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  const totalCommits = branches.reduce((acc, branch) => acc + branch.commits.length, 0)
  const totalBranches = branches.length
  const mergeCommits = branches.reduce((acc, branch) => 
    acc + branch.commits.filter(c => c.isMerge).length, 0
  )

  return (
    <Card className={cn("h-full flex flex-col border-2 border-border/50 bg-card/50", className)}>
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg luxury-gradient">
              <GitBranch size={24} weight="fill" className="text-accent" />
            </div>
            <div>
              <CardTitle className="font-orbitron text-xl tracking-wider text-foreground">
                COMMIT TIMELINE
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                Visual branch history with merges & divergence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-accent/50 text-accent font-mono">
              <GitCommit size={14} weight="fill" className="mr-1" />
              {totalCommits} commits
            </Badge>
            <Badge variant="outline" className="border-accent/50 text-accent font-mono">
              <GitFork size={14} weight="fill" className="mr-1" />
              {totalBranches} branches
            </Badge>
            <Badge variant="outline" className="border-accent/50 text-accent font-mono">
              <GitMerge size={14} weight="fill" className="mr-1" />
              {mergeCommits} merges
            </Badge>
          </div>
        </div>

        <div className="mt-4 relative">
          <MagnifyingGlass 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            placeholder="Search commits, authors, or SHAs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 font-mono text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden flex">
        <div className="flex-1 overflow-hidden" ref={containerRef}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
          />
        </div>

        <AnimatePresence>
          {selectedCommit && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l border-border/50 bg-background/50"
            >
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <GitCommit size={20} weight="fill" className="text-accent" />
                      <h3 className="font-orbitron font-semibold text-foreground">
                        COMMIT DETAILS
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCommit(null)}
                      className="h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GitBranch size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">Branch</span>
                      </div>
                      <Badge 
                        className="font-mono"
                        style={{ 
                          backgroundColor: `${branches.find(b => b.name === selectedCommit.branch)?.color}20`,
                          borderColor: branches.find(b => b.name === selectedCommit.branch)?.color,
                          color: branches.find(b => b.name === selectedCommit.branch)?.color
                        }}
                      >
                        {selectedCommit.branch}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">Author</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedCommit.authorAvatar && (
                          <img 
                            src={selectedCommit.authorAvatar} 
                            alt={selectedCommit.author}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm font-mono text-foreground">
                          {selectedCommit.author}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">Date</span>
                      </div>
                      <span className="text-sm font-mono text-foreground">
                        {selectedCommit.date.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowsDownUp size={16} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">SHA</span>
                      </div>
                      <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                        {selectedCommit.sha.substring(0, 7)}
                      </code>
                    </div>

                    {selectedCommit.isMerge && (
                      <div>
                        <Badge variant="outline" className="border-accent/50 text-accent">
                          <GitMerge size={14} weight="fill" className="mr-1" />
                          Merge Commit
                        </Badge>
                      </div>
                    )}

                    {selectedCommit.tags && selectedCommit.tags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground font-mono">Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedCommit.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs font-mono">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border/50" />

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground font-mono">Message</span>
                    </div>
                    <p className="text-sm font-mono text-foreground whitespace-pre-wrap break-words bg-background/50 p-3 rounded border border-border/30">
                      {selectedCommit.message}
                    </p>
                  </div>

                  {selectedCommit.parents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          Parents ({selectedCommit.parents.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {selectedCommit.parents.map((parent, i) => (
                          <code 
                            key={i}
                            className="block text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded"
                          >
                            {parent.substring(0, 7)}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
