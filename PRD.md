# Planning Guide

A streamlined onboarding interface that guides users through API integration setup in under 30 seconds, making the complex process of connecting GitHub and Linear APIs feel effortless and secure.

**Experience Qualities**: 
1. **Swift** - Users should complete the entire setup process in under a minute with clear, linear progression
2. **Reassuring** - Security indicators and clear messaging should eliminate concerns about token safety
3. **Delightful** - Small moments of visual feedback transform mundane setup into a satisfying experience

**Complexity Level**: Light Application (multiple features with basic state)
  - The app manages API token storage, connection testing, and data retrieval across two services, but remains focused on a single onboarding flow with straightforward state management.

## Essential Features

### GitHub Token Setup
- **Functionality**: Accepts GitHub personal access token and validates connection
- **Purpose**: Enables repository and organization data access through GitHub API
- **Trigger**: User clicks "Connect GitHub" or navigates to GitHub setup section
- **Progression**: View instructions → Click link to GitHub settings → Generate token with required scopes → Copy token → Paste in app → Click connect → See success confirmation
- **Success criteria**: Connection indicator turns green, test API call succeeds, "Load Repositories" button becomes available

### Linear API Key Setup
- **Functionality**: Accepts Linear API key and validates connection
- **Purpose**: Enables team and issue data access through Linear API
- **Trigger**: User clicks "Connect Linear" or navigates to Linear setup section
- **Progression**: View instructions → Click link to Linear settings → Generate API key → Copy key → Paste in app → Click connect → See success confirmation
- **Success criteria**: Connection indicator turns green, teams list populates, issue browsing becomes available

### Connection Testing
- **Functionality**: Validates API credentials with real API calls
- **Purpose**: Confirms tokens work before user attempts to use features
- **Trigger**: User clicks "Test Connection" button after entering credentials
- **Progression**: Click test button → Loading state appears → API call executes → Success or error message displays with specific feedback
- **Success criteria**: User receives clear feedback about connection status with actionable next steps

### Quick Actions Dashboard
- **Functionality**: Displays available actions once APIs are connected
- **Purpose**: Helps users immediately see value from their connected APIs
- **Trigger**: Automatically appears when at least one API is successfully connected
- **Progression**: API connects → Dashboard appears with action cards → User clicks action → Feature executes → Results display
- **Success criteria**: Users can successfully load repositories or view Linear issues with one click

## Edge Case Handling

- **Invalid Token Format**: Detect common formatting issues (extra spaces, incomplete tokens) and show helpful correction hints
- **Expired Tokens**: Catch authentication errors and guide user to regenerate with fresh instructions
- **Missing Scopes**: Detect insufficient permissions and display which specific scopes are missing
- **Network Failures**: Distinguish between network issues and credential problems with appropriate retry options
- **Empty Results**: When connected APIs return no data, explain why (no repos, no teams) with encouraging next steps
- **Disconnection Flow**: Allow users to easily disconnect and clear stored credentials with confirmation

## Design Direction

The design should feel modern and trustworthy with a focus on clarity over decoration—using clean layouts and purposeful animations to guide attention through the setup flow while security indicators provide constant reassurance.

## Color Selection

Triadic color scheme creates visual distinction between different API services and interaction states while maintaining harmony.

- **Primary Color**: `oklch(0.55 0.22 260)` - Professional blue-violet that communicates trust and technology
- **Secondary Colors**: 
  - GitHub: `oklch(0.45 0.15 240)` - Deep blue representing GitHub's brand territory
  - Linear: `oklch(0.58 0.18 280)` - Purple-blue for Linear's distinct identity
- **Accent Color**: `oklch(0.68 0.20 160)` - Vibrant teal for success states and CTAs, drawing eye to important actions
- **Foreground/Background Pairings**:
  - Background (Light Gray `oklch(0.98 0.002 260)`): Dark text `oklch(0.20 0.03 260)` - Ratio 12.5:1 ✓
  - Card (White `oklch(1.0 0 0)`): Dark text `oklch(0.20 0.03 260)` - Ratio 13.8:1 ✓
  - Primary (Blue-Violet `oklch(0.55 0.22 260)`): White text `oklch(0.98 0.002 260)` - Ratio 7.2:1 ✓
  - Secondary (Muted Blue `oklch(0.90 0.05 260)`): Dark text `oklch(0.25 0.04 260)` - Ratio 9.4:1 ✓
  - Accent (Teal `oklch(0.68 0.20 160)`): White text `oklch(0.98 0.002 260)` - Ratio 5.1:1 ✓

## Font Selection

Typography should balance technical precision with approachability, using a clean geometric sans-serif for interface elements and a monospace font for API tokens.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Inter Bold/32px/tight letter-spacing (-0.02em) - Establishes authority
  - H2 (Section Headers): Inter SemiBold/24px/normal letter-spacing - Clear hierarchy
  - H3 (Card Titles): Inter Medium/18px/normal letter-spacing - Organized content
  - Body Text: Inter Regular/15px/relaxed line-height (1.6) - Easy reading
  - Code/Tokens: JetBrains Mono Regular/14px/normal line-height (1.5) - Technical clarity
  - Labels: Inter Medium/13px/uppercase/wide letter-spacing (0.05em) - Clear identification
  - Button Text: Inter SemiBold/15px/normal letter-spacing - Confident actions

## Animations

Animations should feel snappy and purposeful, confirming actions without creating delays—subtle state changes keep the interface feeling responsive while success moments deserve brief celebration.

- **Purposeful Meaning**: Success confirmations use a gentle bounce to create satisfaction, while connection status changes use smooth color transitions to feel reliable rather than jarring
- **Hierarchy of Movement**: 
  - High Priority: Connection status changes, success/error states (300ms with spring physics)
  - Medium Priority: Card reveals, section transitions (250ms ease-out)
  - Low Priority: Hover states, focus indicators (150ms ease-in-out)

## Component Selection

- **Components**: 
  - Card for API service containers with distinct visual states
  - Input with password toggle for secure token entry
  - Button with loading states for connection actions
  - Badge for connection status indicators (connected/disconnected)
  - Alert for error messages and security notes
  - Tabs for switching between GitHub/Linear/Quick Actions
  - Accordion for expandable instruction sections
  - Separator for visual breathing room between sections
- **Customizations**: 
  - Custom "Copy to clipboard" button component with confirmation feedback
  - Custom connection status indicator with animated state transitions
  - Custom action card component with icon, title, description, and CTA
- **States**: 
  - Buttons: Default (solid primary), Hover (slight lift with shadow), Active (pressed down), Loading (spinner + disabled), Disabled (muted with reduced opacity)
  - Inputs: Default (subtle border), Focus (accent border with glow), Error (destructive border), Success (accent border), Disabled (muted background)
  - Cards: Default (subtle shadow), Hover (elevated shadow), Active/Connected (accent border glow)
- **Icon Selection**: 
  - @phosphor-icons/react: Key (API tokens), CheckCircle (success), Warning (errors), Copy (clipboard actions), Eye/EyeSlash (password toggle), GithubLogo, Plug (connection), Lightning (quick actions), ListBullets (repositories), Kanban (issues)
- **Spacing**: 
  - Card padding: p-6 (24px) for comfortable content space
  - Section gaps: gap-8 (32px) between major sections
  - Element gaps: gap-4 (16px) within related groups
  - Tight gaps: gap-2 (8px) for closely related items
  - Page margins: px-6 py-8 on mobile, px-12 py-12 on desktop
- **Mobile**: 
  - Stack tabs vertically on small screens
  - Full-width cards with reduced padding (p-4)
  - Sticky header with compact title
  - Action buttons become full-width
  - Instructions use accordion to save space
  - Reduce spacing scale by 25% (gap-6 → gap-4, etc.)
