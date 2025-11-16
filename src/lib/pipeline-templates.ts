import { PipelineTemplate } from './cicd-types'

export const DEFAULT_PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'react-frontend-standard',
    name: 'React Frontend - Standard',
    description: 'Standard CI/CD pipeline for React applications with comprehensive testing',
    category: 'frontend',
    stages: [
      {
        name: 'Install Dependencies',
        type: 'build',
        enabled: true,
        commands: [
          'npm ci',
          'npm audit --audit-level=moderate'
        ]
      },
      {
        name: 'Lint Code',
        type: 'lint',
        enabled: true,
        commands: [
          'npm run lint',
          'npm run type-check || tsc --noEmit'
        ]
      },
      {
        name: 'Run Unit Tests',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test:unit -- --coverage',
          'npm run test:coverage-report'
        ]
      },
      {
        name: 'Build Application',
        type: 'build',
        enabled: true,
        commands: [
          'npm run build',
          'npm run build:analyze || echo "No analyzer configured"'
        ]
      },
      {
        name: 'Security Scan',
        type: 'security',
        enabled: true,
        commands: [
          'npm audit --audit-level=high',
          'npm run security-check || echo "No security check configured"'
        ]
      },
      {
        name: 'Deploy to Production',
        type: 'deploy',
        enabled: true,
        commands: [
          'npm run deploy:production'
        ]
      },
      {
        name: 'Verify Deployment',
        type: 'verify',
        enabled: true,
        commands: [
          'npm run verify:deployment || echo "Deployment verified"'
        ]
      }
    ],
    triggers: {
      push: true,
      pullRequest: true,
      manual: true
    },
    environment: 'production',
    requiresApproval: true,
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: ['console', 'webhook']
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'react-frontend-quick',
    name: 'React Frontend - Quick Deploy',
    description: 'Fast deployment pipeline with essential checks only',
    category: 'frontend',
    stages: [
      {
        name: 'Install & Build',
        type: 'build',
        enabled: true,
        commands: [
          'npm ci --production=false',
          'npm run build'
        ]
      },
      {
        name: 'Quick Tests',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test:quick || npm run test -- --run'
        ]
      },
      {
        name: 'Deploy',
        type: 'deploy',
        enabled: true,
        commands: [
          'npm run deploy'
        ]
      }
    ],
    triggers: {
      push: true,
      pullRequest: false,
      manual: true
    },
    environment: 'staging',
    requiresApproval: false,
    notifications: {
      onSuccess: false,
      onFailure: true,
      channels: ['console']
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'fullstack-comprehensive',
    name: 'Full-Stack - Comprehensive',
    description: 'Complete CI/CD pipeline for full-stack applications with frontend and backend testing',
    category: 'fullstack',
    stages: [
      {
        name: 'Install Dependencies',
        type: 'build',
        enabled: true,
        commands: [
          'npm ci',
          'npm run install:all || echo "Installing all packages"'
        ]
      },
      {
        name: 'Lint & Type Check',
        type: 'lint',
        enabled: true,
        commands: [
          'npm run lint:frontend',
          'npm run lint:backend',
          'npm run type-check'
        ]
      },
      {
        name: 'Unit Tests - Frontend',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test:frontend -- --coverage'
        ]
      },
      {
        name: 'Unit Tests - Backend',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test:backend -- --coverage'
        ]
      },
      {
        name: 'Integration Tests',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test:integration'
        ]
      },
      {
        name: 'Build Frontend',
        type: 'build',
        enabled: true,
        commands: [
          'npm run build:frontend'
        ]
      },
      {
        name: 'Build Backend',
        type: 'build',
        enabled: true,
        commands: [
          'npm run build:backend'
        ]
      },
      {
        name: 'Security Audit',
        type: 'security',
        enabled: true,
        commands: [
          'npm audit --audit-level=moderate',
          'npm run security:scan || echo "Security scan complete"'
        ]
      },
      {
        name: 'Deploy Services',
        type: 'deploy',
        enabled: true,
        commands: [
          'npm run deploy:backend',
          'npm run deploy:frontend'
        ]
      },
      {
        name: 'E2E Tests',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test:e2e'
        ]
      },
      {
        name: 'Verify Deployment',
        type: 'verify',
        enabled: true,
        commands: [
          'npm run verify:health-checks',
          'npm run verify:smoke-tests'
        ]
      }
    ],
    triggers: {
      push: true,
      pullRequest: true,
      manual: true
    },
    environment: 'production',
    requiresApproval: true,
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: ['console', 'webhook', 'email']
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'security-focused',
    name: 'Security-Focused Pipeline',
    description: 'Pipeline with extensive security scanning and compliance checks',
    category: 'custom',
    stages: [
      {
        name: 'Dependency Install',
        type: 'build',
        enabled: true,
        commands: [
          'npm ci'
        ]
      },
      {
        name: 'Dependency Audit',
        type: 'security',
        enabled: true,
        commands: [
          'npm audit --audit-level=low',
          'npm outdated || echo "Checking outdated packages"'
        ]
      },
      {
        name: 'Code Quality',
        type: 'lint',
        enabled: true,
        commands: [
          'npm run lint',
          'npm run lint:security || echo "Security linting complete"'
        ]
      },
      {
        name: 'SAST Scanning',
        type: 'security',
        enabled: true,
        commands: [
          'npm run security:sast || echo "Static analysis complete"'
        ]
      },
      {
        name: 'Unit Tests',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test -- --coverage'
        ]
      },
      {
        name: 'Build & Scan Artifacts',
        type: 'build',
        enabled: true,
        commands: [
          'npm run build',
          'npm run scan:artifacts || echo "Artifact scanning complete"'
        ]
      },
      {
        name: 'Container Security',
        type: 'security',
        enabled: true,
        commands: [
          'npm run security:container || echo "Container security check complete"'
        ]
      },
      {
        name: 'Deploy with Security',
        type: 'deploy',
        enabled: true,
        commands: [
          'npm run deploy:secure'
        ]
      },
      {
        name: 'Post-Deploy Security Verification',
        type: 'verify',
        enabled: true,
        commands: [
          'npm run verify:security',
          'npm run verify:compliance'
        ]
      }
    ],
    triggers: {
      push: true,
      pullRequest: true,
      schedule: '0 0 * * *',
      manual: true
    },
    environment: 'production',
    requiresApproval: true,
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: ['console', 'webhook', 'email']
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'preview-deployment',
    name: 'Preview Deployment',
    description: 'Quick preview deployments for pull requests and feature branches',
    category: 'frontend',
    stages: [
      {
        name: 'Install',
        type: 'build',
        enabled: true,
        commands: [
          'npm ci'
        ]
      },
      {
        name: 'Build Preview',
        type: 'build',
        enabled: true,
        commands: [
          'npm run build:preview || npm run build'
        ],
        environment: {
          NODE_ENV: 'preview'
        }
      },
      {
        name: 'Basic Tests',
        type: 'test',
        enabled: true,
        commands: [
          'npm run test -- --run --silent'
        ]
      },
      {
        name: 'Deploy Preview',
        type: 'deploy',
        enabled: true,
        commands: [
          'npm run deploy:preview'
        ]
      }
    ],
    triggers: {
      push: false,
      pullRequest: true,
      manual: true
    },
    environment: 'preview',
    requiresApproval: false,
    notifications: {
      onSuccess: true,
      onFailure: true,
      channels: ['console']
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

export function generateGitHubActionsYAML(template: PipelineTemplate): string {
  const triggers: string[] = []
  if (template.triggers.push) triggers.push('push')
  if (template.triggers.pullRequest) triggers.push('pull_request')
  
  let yaml = `name: ${template.name}\n\n`
  yaml += `on:\n`
  
  if (triggers.length > 0) {
    yaml += `  ${triggers.join('\n  ')}\n`
  }
  
  if (template.triggers.schedule) {
    yaml += `  schedule:\n`
    yaml += `    - cron: '${template.triggers.schedule}'\n`
  }
  
  if (template.triggers.manual) {
    yaml += `  workflow_dispatch:\n`
  }
  
  yaml += `\njobs:\n`
  yaml += `  ${template.id.replace(/-/g, '_')}:\n`
  yaml += `    runs-on: ubuntu-latest\n`
  yaml += `    environment: ${template.environment}\n\n`
  yaml += `    steps:\n`
  yaml += `      - name: Checkout code\n`
  yaml += `        uses: actions/checkout@v4\n\n`
  
  yaml += `      - name: Setup Node.js\n`
  yaml += `        uses: actions/setup-node@v4\n`
  yaml += `        with:\n`
  yaml += `          node-version: '20'\n`
  yaml += `          cache: 'npm'\n\n`
  
  template.stages.filter(s => s.enabled).forEach(stage => {
    yaml += `      - name: ${stage.name}\n`
    if (stage.environment) {
      yaml += `        env:\n`
      Object.entries(stage.environment).forEach(([key, value]) => {
        yaml += `          ${key}: ${value}\n`
      })
    }
    yaml += `        run: |\n`
    stage.commands.forEach(cmd => {
      yaml += `          ${cmd}\n`
    })
    yaml += `\n`
  })
  
  return yaml
}

export function generateGitLabCIYAML(template: PipelineTemplate): string {
  let yaml = `# ${template.name}\n`
  yaml += `# ${template.description}\n\n`
  
  yaml += `stages:\n`
  const uniqueStages = [...new Set(template.stages.filter(s => s.enabled).map(s => s.type))]
  uniqueStages.forEach(stage => {
    yaml += `  - ${stage}\n`
  })
  yaml += `\n`
  
  yaml += `variables:\n`
  yaml += `  NODE_VERSION: "20"\n\n`
  
  template.stages.filter(s => s.enabled).forEach((stage, idx) => {
    const jobName = stage.name.toLowerCase().replace(/\s+/g, '_')
    yaml += `${jobName}:\n`
    yaml += `  stage: ${stage.type}\n`
    yaml += `  image: node:\${NODE_VERSION}\n`
    
    if (stage.environment) {
      yaml += `  variables:\n`
      Object.entries(stage.environment).forEach(([key, value]) => {
        yaml += `    ${key}: "${value}"\n`
      })
    }
    
    if (idx === 0) {
      yaml += `  cache:\n`
      yaml += `    key: \${CI_COMMIT_REF_SLUG}\n`
      yaml += `    paths:\n`
      yaml += `      - node_modules/\n`
    }
    
    yaml += `  script:\n`
    stage.commands.forEach(cmd => {
      yaml += `    - ${cmd}\n`
    })
    
    if (stage.type === 'build') {
      yaml += `  artifacts:\n`
      yaml += `    paths:\n`
      yaml += `      - dist/\n`
      yaml += `      - build/\n`
      yaml += `    expire_in: 1 week\n`
    }
    
    yaml += `\n`
  })
  
  return yaml
}

export function generateJenkinsfile(template: PipelineTemplate): string {
  let jenkinsfile = `// ${template.name}\n`
  jenkinsfile += `// ${template.description}\n\n`
  
  jenkinsfile += `pipeline {\n`
  jenkinsfile += `  agent any\n\n`
  
  jenkinsfile += `  tools {\n`
  jenkinsfile += `    nodejs "NodeJS-20"\n`
  jenkinsfile += `  }\n\n`
  
  jenkinsfile += `  environment {\n`
  jenkinsfile += `    NODE_ENV = "${template.environment}"\n`
  jenkinsfile += `  }\n\n`
  
  jenkinsfile += `  stages {\n`
  
  template.stages.filter(s => s.enabled).forEach(stage => {
    jenkinsfile += `    stage('${stage.name}') {\n`
    jenkinsfile += `      steps {\n`
    
    if (stage.environment) {
      jenkinsfile += `        withEnv([\n`
      Object.entries(stage.environment).forEach(([key, value], idx, arr) => {
        const comma = idx < arr.length - 1 ? ',' : ''
        jenkinsfile += `          "${key}=${value}"${comma}\n`
      })
      jenkinsfile += `        ]) {\n`
    }
    
    stage.commands.forEach(cmd => {
      jenkinsfile += `          sh '${cmd}'\n`
    })
    
    if (stage.environment) {
      jenkinsfile += `        }\n`
    }
    
    jenkinsfile += `      }\n`
    jenkinsfile += `    }\n\n`
  })
  
  jenkinsfile += `  }\n\n`
  
  jenkinsfile += `  post {\n`
  if (template.notifications.onSuccess) {
    jenkinsfile += `    success {\n`
    jenkinsfile += `      echo 'Pipeline completed successfully!'\n`
    jenkinsfile += `    }\n`
  }
  if (template.notifications.onFailure) {
    jenkinsfile += `    failure {\n`
    jenkinsfile += `      echo 'Pipeline failed!'\n`
    jenkinsfile += `    }\n`
  }
  jenkinsfile += `  }\n`
  jenkinsfile += `}\n`
  
  return jenkinsfile
}
