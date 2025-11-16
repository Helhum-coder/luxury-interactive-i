import { PublishingPreset, DeploymentPlatform, EnvironmentType } from './publishing-types'

export const defaultPresets: Omit<PublishingPreset, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Production - Vercel',
    description: 'Optimized production deployment to Vercel with maximum performance',
    environment: 'production',
    platform: 'vercel',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: []
    },
    deploymentConfig: {
      autoPublish: true,
      branchDeployment: false,
      previewDeployments: false,
      buildOnPush: true,
      deployOnMerge: true
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: false,
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
      }
    },
    performanceConfig: {
      compression: true,
      caching: true,
      cdn: true,
      minification: true,
      imageOptimization: true,
      cacheMaxAge: 31536000
    }
  },
  {
    name: 'Production - Netlify',
    description: 'Production deployment to Netlify with automatic deployments',
    environment: 'production',
    platform: 'netlify',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: []
    },
    deploymentConfig: {
      autoPublish: true,
      branchDeployment: false,
      previewDeployments: true,
      buildOnPush: true,
      deployOnMerge: true
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: false,
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    performanceConfig: {
      compression: true,
      caching: true,
      cdn: true,
      minification: true,
      imageOptimization: true,
      cacheMaxAge: 31536000
    }
  },
  {
    name: 'Production - Firebase',
    description: 'Firebase Hosting deployment with Google Cloud CDN',
    environment: 'production',
    platform: 'firebase',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: []
    },
    deploymentConfig: {
      autoPublish: true,
      branchDeployment: false,
      previewDeployments: true,
      buildOnPush: true,
      deployOnMerge: true
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: false,
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {}
    },
    performanceConfig: {
      compression: true,
      caching: true,
      cdn: true,
      minification: true,
      imageOptimization: true,
      cacheMaxAge: 31536000
    }
  },
  {
    name: 'Staging Environment',
    description: 'Staging environment for testing before production',
    environment: 'staging',
    platform: 'vercel',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: [
        { key: 'NODE_ENV', value: 'staging', secret: false, required: true }
      ]
    },
    deploymentConfig: {
      autoPublish: true,
      branchDeployment: true,
      previewDeployments: true,
      buildOnPush: true,
      deployOnMerge: false
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: true,
      password: 'staging-2024',
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {}
    },
    performanceConfig: {
      compression: true,
      caching: false,
      cdn: false,
      minification: false,
      imageOptimization: false,
      cacheMaxAge: 0
    }
  },
  {
    name: 'Preview Branch',
    description: 'Automatic preview deployments for feature branches',
    environment: 'preview',
    platform: 'netlify',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: [
        { key: 'NODE_ENV', value: 'preview', secret: false, required: true }
      ]
    },
    deploymentConfig: {
      autoPublish: true,
      branchDeployment: true,
      previewDeployments: true,
      buildOnPush: true,
      deployOnMerge: false
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: false,
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {}
    },
    performanceConfig: {
      compression: false,
      caching: false,
      cdn: false,
      minification: false,
      imageOptimization: false,
      cacheMaxAge: 0
    }
  },
  {
    name: 'GitHub Pages',
    description: 'Deploy to GitHub Pages for documentation and static sites',
    environment: 'production',
    platform: 'github-pages',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: []
    },
    deploymentConfig: {
      autoPublish: false,
      branchDeployment: false,
      previewDeployments: false,
      buildOnPush: false,
      deployOnMerge: true
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: false,
      allowedDomains: [],
      cors: {
        enabled: false,
        origins: []
      },
      headers: {}
    },
    performanceConfig: {
      compression: true,
      caching: true,
      cdn: true,
      minification: true,
      imageOptimization: true,
      cacheMaxAge: 31536000
    }
  },
  {
    name: 'Cloudflare Pages',
    description: 'Deploy to Cloudflare Pages with edge computing',
    environment: 'production',
    platform: 'cloudflare',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: []
    },
    deploymentConfig: {
      autoPublish: true,
      branchDeployment: true,
      previewDeployments: true,
      buildOnPush: true,
      deployOnMerge: true
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: false,
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    performanceConfig: {
      compression: true,
      caching: true,
      cdn: true,
      minification: true,
      imageOptimization: true,
      cacheMaxAge: 31536000
    }
  },
  {
    name: 'Testing Environment',
    description: 'Automated testing environment with debugging enabled',
    environment: 'testing',
    platform: 'vercel',
    buildConfig: {
      command: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      nodeVersion: '20.x',
      environmentVariables: [
        { key: 'NODE_ENV', value: 'test', secret: false, required: true },
        { key: 'DEBUG', value: 'true', secret: false, required: false }
      ]
    },
    deploymentConfig: {
      autoPublish: false,
      branchDeployment: true,
      previewDeployments: false,
      buildOnPush: false,
      deployOnMerge: false
    },
    securityConfig: {
      httpsOnly: true,
      passwordProtection: true,
      password: 'test-env-2024',
      allowedDomains: [],
      cors: {
        enabled: true,
        origins: ['*']
      },
      headers: {}
    },
    performanceConfig: {
      compression: false,
      caching: false,
      cdn: false,
      minification: false,
      imageOptimization: false,
      cacheMaxAge: 0
    }
  }
]

export function createPresetFromTemplate(
  template: Omit<PublishingPreset, 'id' | 'createdAt' | 'updatedAt'>
): PublishingPreset {
  return {
    ...template,
    id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export function getPlatformIcon(platform: DeploymentPlatform): string {
  const icons: Record<DeploymentPlatform, string> = {
    vercel: '▲',
    netlify: '◆',
    firebase: '🔥',
    aws: '☁️',
    'github-pages': '📄',
    heroku: '🟣',
    railway: '🚂',
    render: '🎨',
    cloudflare: '🟠',
    custom: '⚙️'
  }
  return icons[platform]
}

export function getEnvironmentColor(environment: EnvironmentType): string {
  const colors: Record<EnvironmentType, string> = {
    production: 'oklch(0.85 0.18 90)',
    staging: 'oklch(0.75 0.15 85)',
    preview: 'oklch(0.65 0.20 180)',
    testing: 'oklch(0.70 0.18 270)',
    development: 'oklch(0.35 0.15 300)',
    custom: 'oklch(0.85 0.18 90)'
  }
  return colors[environment]
}

export function generateDeploymentCommand(preset: PublishingPreset): string {
  const commands: Record<DeploymentPlatform, string> = {
    vercel: 'vercel --prod',
    netlify: 'netlify deploy --prod',
    firebase: 'firebase deploy',
    aws: 'aws s3 sync dist/ s3://your-bucket',
    'github-pages': 'gh-pages -d dist',
    heroku: 'git push heroku main',
    railway: 'railway up',
    render: 'render deploy',
    cloudflare: 'wrangler pages deploy dist',
    custom: preset.customPlatformUrl || 'custom deploy command'
  }
  return commands[preset.platform]
}

export function estimateDeploymentTime(preset: PublishingPreset): number {
  const baseTimes: Record<DeploymentPlatform, number> = {
    vercel: 90,
    netlify: 120,
    firebase: 150,
    aws: 180,
    'github-pages': 240,
    heroku: 300,
    railway: 120,
    render: 180,
    cloudflare: 90,
    custom: 120
  }
  
  let time = baseTimes[preset.platform]
  
  if (preset.performanceConfig.minification) time += 15
  if (preset.performanceConfig.imageOptimization) time += 20
  if (preset.performanceConfig.compression) time += 10
  
  return time
}
