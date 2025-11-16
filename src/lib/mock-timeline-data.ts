import { TimelineBranch, TimelineCommit } from '@/components/CommitTimeline'

export function generateMockTimelineData(): TimelineBranch[] {
  const now = new Date()
  const branchColors = [
    'oklch(0.85 0.18 90)',
    'oklch(0.75 0.15 85)', 
    'oklch(0.35 0.15 300)',
    'oklch(0.65 0.20 180)',
    'oklch(0.70 0.18 270)',
  ]

  const authors = [
    { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Carol White', avatar: 'https://i.pravatar.cc/150?img=3' },
    { name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=4' },
    { name: 'Eve Davis', avatar: 'https://i.pravatar.cc/150?img=5' },
  ]

  const commitMessages = [
    'Add new authentication module',
    'Fix navigation bug in sidebar',
    'Update dependencies to latest versions',
    'Implement dark mode toggle',
    'Refactor database queries',
    'Add unit tests for API endpoints',
    'Optimize image loading performance',
    'Fix memory leak in event listeners',
    'Update documentation',
    'Add error handling middleware',
    'Implement caching layer',
    'Fix cross-browser compatibility issues',
    'Add accessibility features',
    'Update UI components library',
    'Implement real-time notifications',
    'Fix security vulnerabilities',
    'Add data validation',
    'Optimize build configuration',
    'Update TypeScript definitions',
    'Add loading states to components',
  ]

  const generateCommit = (
    branch: string,
    daysAgo: number,
    index: number,
    isMerge: boolean = false
  ): TimelineCommit => {
    const author = authors[Math.floor(Math.random() * authors.length)]
    const message = isMerge 
      ? `Merge pull request #${Math.floor(Math.random() * 100) + 1} from feature/${branch}` 
      : commitMessages[Math.floor(Math.random() * commitMessages.length)]
    
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - index * 60 * 60 * 1000)
    const sha = Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 9)
    
    return {
      sha,
      message,
      author: author.name,
      authorAvatar: author.avatar,
      date,
      branch,
      parents: [],
      isMerge,
      tags: Math.random() > 0.9 ? [`v${Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`] : []
    }
  }

  const mainCommits: TimelineCommit[] = []
  for (let i = 0; i < 20; i++) {
    const isMerge = i % 5 === 0 && i > 0
    mainCommits.push(generateCommit('main', i * 2, i, isMerge))
  }

  const developCommits: TimelineCommit[] = []
  for (let i = 0; i < 25; i++) {
    const isMerge = i % 7 === 0 && i > 0
    developCommits.push(generateCommit('develop', i * 1.5, i, isMerge))
  }

  const featureAuthCommits: TimelineCommit[] = []
  for (let i = 0; i < 12; i++) {
    featureAuthCommits.push(generateCommit('feature/auth', i + 5, i))
  }

  const featureUICommits: TimelineCommit[] = []
  for (let i = 0; i < 15; i++) {
    featureUICommits.push(generateCommit('feature/ui-refresh', i + 3, i))
  }

  const hotfixCommits: TimelineCommit[] = []
  for (let i = 0; i < 8; i++) {
    hotfixCommits.push(generateCommit('hotfix/security-patch', i + 1, i))
  }

  const branches: TimelineBranch[] = [
    {
      name: 'main',
      color: branchColors[0],
      commits: mainCommits,
    },
    {
      name: 'develop',
      color: branchColors[1],
      commits: developCommits,
      divergedFrom: 'main',
    },
    {
      name: 'feature/auth',
      color: branchColors[2],
      commits: featureAuthCommits,
      divergedFrom: 'develop',
      mergedInto: 'develop',
    },
    {
      name: 'feature/ui-refresh',
      color: branchColors[3],
      commits: featureUICommits,
      divergedFrom: 'develop',
    },
    {
      name: 'hotfix/security-patch',
      color: branchColors[4],
      commits: hotfixCommits,
      divergedFrom: 'main',
      mergedInto: 'main',
    },
  ]

  mainCommits.filter(c => c.isMerge).forEach((commit, i) => {
    const sourceBranches = ['develop', 'hotfix/security-patch']
    const sourceBranch = sourceBranches[i % sourceBranches.length]
    const sourceCommits = branches.find(b => b.name === sourceBranch)?.commits || []
    if (sourceCommits.length > 0) {
      commit.parents = [sourceCommits[0].sha]
    }
  })

  developCommits.filter(c => c.isMerge).forEach((commit, i) => {
    const featureCommits = featureAuthCommits
    if (featureCommits.length > i) {
      commit.parents = [featureCommits[i].sha]
    }
  })

  return branches
}
