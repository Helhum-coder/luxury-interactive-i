export interface Document {
  id: string
  title: string
  fileName: string
  category: string
  content: string
  description?: string
}

export interface DocumentCategory {
  id: string
  name: string
  icon: string
  count: number
}

export const DOCUMENT_FILES = [
  'API_ENHANCEMENT_SUMMARY.md',
  'API_INTEGRATION_GUIDE.md',
  'API_QUICKSTART.md',
  'BRANCH_TIMELINE_GUIDE.md',
  'CICD_PIPELINE_GUIDE.md',
  'CICD_QUICKSTART.md',
  'CODESPACE_GIT_INSTRUCTIONS.md',
  'CONNECTION_ERROR_GUIDE.md',
  'CONNECTION_ERROR_INDEX.md',
  'CONNECTION_ERROR_QUICKREF.md',
  'CONNECTION_ERROR_SUMMARY.md',
  'COPILOT_REPOSITORY_PREVENTION.md',
  'DASHBOARD_TEMPLATES_GUIDE.md',
  'DASHBOARD_TEMPLATES_QUICKSTART.md',
  'DEPLOYMENT_CHECKLIST.md',
  'ENVIRONMENT_TROUBLESHOOTING.md',
  'FIREBASE_FIX_GUIDE.md',
  'FIREBASE_INTEGRATION_GUIDE.md',
  'FIREBASE_QUICKSTART.md',
  'GIT_INTEGRATION_GUIDE.md',
  'GIT_QUICKSTART.md',
  'NEXT_STEPS.md',
  'PORT_REDIRECTION_AND_BLOCKER_GUIDE.md',
  'PORT_SECURITY_INTEGRATION.md',
  'PORT_SECURITY_README.md',
  'PRD.md',
  'PUBLISH_UNLOCKED.md',
  'QUICK_START_TEMPLATES.md',
  'README.md',
  'SECURE_ENVIRONMENT_GUIDE.md',
  'SECURITY.md',
  'SETUP_COMPLETE_SUMMARY.md',
  'SOLUTION_SUMMARY.md',
  'START_HERE.md',
  'SYSTEM_ARCHITECTURE.md',
  'TEMPLATE_PROTECTION_GUIDE.md',
  'TEMPLATE_RECOVERY_GUIDE.md',
  'TESTING_SUMMARY.md',
  'UNIFIED_DASHBOARD_GUIDE.md',
  'UNIFIED_DASHBOARD_QUICKSTART.md',
  'UNIFIED_DASHBOARD_SETUP.md',
  'VERIFICATION_TEST.md',
  'VERSION_DETECTION_GUIDE.md',
  'VERSION_HISTORY_GUIDE.md',
  'WEBHOOK_INTEGRATION_GUIDE.md',
  'WEBHOOK_NOTIFICATION_GUIDE.md',
]

export function categorizeDocument(fileName: string): string {
  const upperFileName = fileName.toUpperCase()
  
  if (upperFileName.includes('API')) return 'API Integration'
  if (upperFileName.includes('GIT') || upperFileName.includes('BRANCH') || upperFileName.includes('COMMIT')) return 'Git & Version Control'
  if (upperFileName.includes('CICD') || upperFileName.includes('PIPELINE')) return 'CI/CD & Deployment'
  if (upperFileName.includes('DEPLOY') || upperFileName.includes('PUBLISH')) return 'CI/CD & Deployment'
  if (upperFileName.includes('FIREBASE')) return 'Firebase'
  if (upperFileName.includes('PORT') || upperFileName.includes('SECURITY') || upperFileName.includes('SECURE')) return 'Security & Ports'
  if (upperFileName.includes('CONNECTION') || upperFileName.includes('ERROR') || upperFileName.includes('TROUBLESHOOT')) return 'Troubleshooting'
  if (upperFileName.includes('DASHBOARD') || upperFileName.includes('TEMPLATE')) return 'Dashboards & Templates'
  if (upperFileName.includes('WEBHOOK') || upperFileName.includes('NOTIFICATION')) return 'Webhooks & Notifications'
  if (upperFileName.includes('ENVIRONMENT') || upperFileName.includes('SETUP')) return 'Setup & Configuration'
  if (upperFileName.includes('TEST') || upperFileName.includes('VERIFICATION')) return 'Testing'
  if (upperFileName.includes('VERSION') && !upperFileName.includes('GIT')) return 'Version Management'
  if (upperFileName === 'README.MD' || upperFileName === 'START_HERE.MD' || upperFileName === 'NEXT_STEPS.MD') return 'Getting Started'
  if (upperFileName === 'PRD.MD' || upperFileName === 'SYSTEM_ARCHITECTURE.MD') return 'Architecture & Planning'
  
  return 'General'
}

export function generateDocumentTitle(fileName: string): string {
  return fileName
    .replace('.md', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export function generateDocumentDescription(content: string): string {
  const lines = content.split('\n').filter(line => line.trim())
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.length > 20) {
      return trimmed.substring(0, 150) + (trimmed.length > 150 ? '...' : '')
    }
  }
  
  return 'Documentation file'
}
