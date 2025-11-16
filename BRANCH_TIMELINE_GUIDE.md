# Branch Timeline Visualization Guide

## Overview

The Branch Timeline Visualization is a sophisticated D3.js-powered feature that provides a visual representation of commit history across multiple git branches. It helps developers understand complex branching structures, identify merge points, track branch divergence, and comprehend git history flow at a glance.

## Features

### Visual Timeline Display
- **Multi-branch visualization**: View commits from multiple branches simultaneously in vertical lanes
- **Chronological ordering**: All commits positioned on a time-based Y-axis for clear historical context
- **Color-coded branches**: Each branch has a unique color for easy identification
- **Interactive nodes**: Click any commit to view detailed information
- **Merge visualization**: Curved paths show merge relationships between branches

### Commit Details Panel
- Branch name and color indicator
- Author name and avatar (when available)
- Commit timestamp
- Short SHA identifier
- Full commit message
- Merge indicator for merge commits
- Parent commit SHAs
- Version tags (when present)

### Search & Filter
- **Real-time search**: Filter commits by message, author, or SHA
- **Instant results**: Search applies immediately as you type
- **Maintained context**: Filtering preserves branch structure and relationships

### Demo Mode
- **No GitHub required**: Explore the timeline with realistic sample data
- **Multiple branches**: Demo includes main, develop, feature branches, and hotfixes
- **Realistic commits**: Generated data mimics actual development patterns
- **Easy toggle**: Switch between demo and real data with one click

## Getting Started

### Prerequisites

1. **GitHub OAuth Token** (for real repository data):
   - Navigate to the **Git Integration** tab
   - Click "Connect GitHub Account"
   - Authorize the application
   - Your token is stored securely in browser storage

2. **Demo Mode** (no authentication required):
   - Click "View Demo Timeline" or "Demo Mode" button
   - Explore with pre-generated sample data

### Accessing the Timeline

1. Navigate to the **Branch Timeline** tab in the main navigation
2. If you don't have a GitHub token, you'll see options to either:
   - Connect your GitHub account
   - View the demo timeline

### Using with Real Repositories

1. **Select Repository**:
   - Choose a repository from the dropdown
   - Repositories are sorted by recent activity

2. **Configure Display**:
   - Set max commits per branch (10, 20, 30, 50, or 100)
   - Adjust based on repository size and performance

3. **View Timeline**:
   - Branches appear as vertical lanes
   - Commits are plotted chronologically
   - Main/master branches typically appear on the left

4. **Interact with Commits**:
   - Hover over any commit node to see it expand
   - Click a commit to open the detail panel
   - View author, message, and metadata

5. **Search Commits**:
   - Use the search bar to filter commits
   - Search works across messages, authors, and SHAs

## Visual Elements

### Branch Lanes
- Each branch occupies a vertical lane
- Branch name appears at the top
- Dashed vertical line indicates the branch path
- Color-coded for easy identification

### Commit Nodes
- **Regular commits**: Small circles on the branch line
- **Merge commits**: Larger circles with inner detail
- **Glow effect**: Each commit has a subtle glow matching its branch color
- **Hover state**: Nodes expand on hover for emphasis

### Merge Lines
- Curved, dashed lines connect merge commits to their parents
- Show the source of merged code
- Color matches the target branch
- Subtle transparency for visual hierarchy

### Time Axis
- Left-side axis shows chronological time
- Format: "MMM DD, HH:MM" (e.g., "Jan 15, 14:30")
- Monospace font for technical precision
- Consistent with luxury theme colors

## Understanding Branch Relationships

### Branch Divergence
- When a branch splits from another, commits appear on separate lanes
- The divergence point is visible where commit paths separate
- Feature branches typically diverge from develop or main

### Branch Merges
- Merge commits show connections between branches
- Dashed lines indicate the merge path
- Multiple parents (octopus merges) show multiple incoming lines

### Branch Lifecycle
- **Active branches**: Recent commits, ongoing development
- **Merged branches**: Merge commit connects to main/develop
- **Stale branches**: No recent commits, may need cleanup

## Performance Considerations

### Commit Limits
- Default: 30 commits per branch
- Adjustable from 10 to 100
- Higher limits may impact rendering performance
- Use filtering for large repositories

### Branch Limits
- Displays up to 8 branches
- Most active branches shown first
- Main/master branches prioritized

### Data Loading
- Commits fetched from GitHub API
- Rate limiting handled gracefully
- Loading states provide feedback
- Errors displayed with helpful messages

## Demo Mode Details

### Sample Data
- **5 branches**: main, develop, feature/auth, feature/ui-refresh, hotfix/security-patch
- **Multiple commits**: Varied commit counts per branch (8-25 commits)
- **Realistic messages**: Common development commit types
- **Diverse authors**: 5 fictional developers with avatars
- **Merge commits**: Demonstrates merge patterns
- **Version tags**: Some commits include version tags

### Use Cases
- **Exploration**: Try the timeline without GitHub setup
- **Training**: Show team members how the visualization works
- **Testing**: Verify visual design and interactions
- **Presentations**: Demonstrate branching strategies

## Troubleshooting

### Timeline Not Loading
1. Verify GitHub token is set (Git Integration tab)
2. Check repository selection
3. Ensure repository has commits
4. Try demo mode to verify functionality

### Performance Issues
1. Reduce max commits per branch
2. Filter commits using search
3. Select fewer branches
4. Clear browser cache

### Missing Commits
1. Check branch selection
2. Verify commit limit setting
3. Ensure commits exist in GitHub
4. API rate limiting may affect data

### Visual Glitches
1. Refresh the page
2. Resize browser window to trigger re-render
3. Clear browser cache
4. Update to latest browser version

## Best Practices

### For Small Projects (< 100 commits)
- Use 50-100 commits per branch
- Display all branches
- Minimal filtering needed

### For Medium Projects (100-1000 commits)
- Use 20-30 commits per branch
- Focus on active branches
- Use search for specific commits

### For Large Projects (> 1000 commits)
- Use 10-20 commits per branch
- Select specific branches of interest
- Heavy use of search/filter
- Consider Version History tab for detailed analysis

## Integration with Other Features

### Git Integration Manager
- Access timeline from Git Integration panel
- Coordinate with branch synchronization
- View commit details before/after merges

### Commit Comparison Tool
- Select two commits from timeline
- Launch comparison directly
- Understand changes visually

### Version History Timeline
- Complementary view with different focus
- Timeline: branch relationships
- History: commit details and statistics

## Keyboard Shortcuts

- **Search**: Click search bar or start typing
- **Escape**: Close commit detail panel
- **Click outside**: Close commit detail panel
- **Hover**: Preview commit (no click required)

## Technical Architecture

### Components
- `CommitTimeline.tsx`: Core D3 visualization component
- `BranchTimelineViewer.tsx`: Container with GitHub integration
- `mock-timeline-data.ts`: Demo data generator

### Dependencies
- **D3.js**: Visualization rendering
- **Framer Motion**: Animations and transitions
- **GitHub API**: Repository data fetching
- **Shadcn UI**: Component library

### Data Flow
1. GitHub API fetches branches and commits
2. Data transformed into timeline format
3. D3 renders SVG visualization
4. User interactions trigger updates
5. State managed with React hooks

## Future Enhancements

Potential features for future iterations:
- Export timeline as image
- Custom date range selection
- Branch comparison mode
- Commit annotation
- Team activity heatmap
- Integration with CI/CD pipelines

## Support

For issues or questions:
1. Check this documentation
2. Try demo mode to isolate issues
3. Verify GitHub connection
4. Review console for errors
5. Contact support with error details
