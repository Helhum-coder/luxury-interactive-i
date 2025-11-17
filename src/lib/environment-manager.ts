/**
 * Secure Environment Variable Management System
 * Multi-platform deployment with proper secrets handling
 */

export type DeploymentEnvironment = 'development' | 'staging' | 'production'
export type DeploymentPlatform = 'vercel' | 'netlify' | 'railway' | 'render' | 'aws' | 'azure' | 'gcp' | 'docker'

export interface EnvironmentConfig {
    // API Credentials
    GITHUB_TOKEN?: string
    GITHUB_CLIENT_ID?: string
    GITHUB_CLIENT_SECRET?: string
    LINEAR_API_KEY?: string

    // Database Configuration
    DATABASE_URL?: string
    DATABASE_SSL?: string
    REDIS_URL?: string

    // Authentication
    JWT_SECRET?: string
    NEXTAUTH_SECRET?: string
    NEXTAUTH_URL?: string

    // External Services
    OPENAI_API_KEY?: string
    ANTHROPIC_API_KEY?: string
    STRIPE_SECRET_KEY?: string
    STRIPE_WEBHOOK_SECRET?: string
    SENDGRID_API_KEY?: string

    // Cloud Storage
    AWS_ACCESS_KEY_ID?: string
    AWS_SECRET_ACCESS_KEY?: string
    AWS_S3_BUCKET?: string
    CLOUDINARY_URL?: string

    // Monitoring & Analytics
    SENTRY_DSN?: string
    ANALYTICS_ID?: string
    MIXPANEL_TOKEN?: string

    // Application Settings
    APP_ENV?: DeploymentEnvironment
    APP_URL?: string
    API_BASE_URL?: string
    ALLOWED_ORIGINS?: string

    // Feature Flags
    ENABLE_ANALYTICS?: string
    ENABLE_MONITORING?: string
    ENABLE_CACHE?: string

    // Security
    CORS_ORIGIN?: string
    RATE_LIMIT_MAX?: string
    RATE_LIMIT_WINDOW?: string

    // Team Configuration
    HELHUM_EMAIL?: string  // helhum@hotmail.com
    HELHUM_GITHUB?: string // Helhum-coder
    HELBS_EMAIL?: string   // helbslozroj@gmail.com  
    HELBS_GITHUB?: string  // HelbsLozroj
}

export interface PlatformEnvConfig {
    platform: DeploymentPlatform
    envFile: string
    secretsPrefix?: string
    encryptionRequired: boolean
    supportedFormats: string[]
    deployCommand: string
    secretsCommand?: string
}

export const PLATFORM_CONFIGS: Record<DeploymentPlatform, PlatformEnvConfig> = {
    vercel: {
        platform: 'vercel',
        envFile: '.env.local',
        secretsPrefix: '',
        encryptionRequired: false,
        supportedFormats: ['.env', '.env.local', '.env.production'],
        deployCommand: 'vercel --prod',
        secretsCommand: 'vercel env add'
    },
    netlify: {
        platform: 'netlify',
        envFile: '.env',
        secretsPrefix: '',
        encryptionRequired: false,
        supportedFormats: ['.env', '.env.production'],
        deployCommand: 'netlify deploy --prod',
        secretsCommand: 'netlify env:set'
    },
    railway: {
        platform: 'railway',
        envFile: '.env',
        secretsPrefix: '',
        encryptionRequired: false,
        supportedFormats: ['.env'],
        deployCommand: 'railway up',
        secretsCommand: 'railway variables set'
    },
    render: {
        platform: 'render',
        envFile: '.env',
        secretsPrefix: '',
        encryptionRequired: false,
        supportedFormats: ['.env'],
        deployCommand: 'render deploy',
        secretsCommand: 'render env set'
    },
    aws: {
        platform: 'aws',
        envFile: '.env',
        secretsPrefix: 'AWS_',
        encryptionRequired: true,
        supportedFormats: ['.env', 'parameter-store'],
        deployCommand: 'aws cloudformation deploy',
        secretsCommand: 'aws ssm put-parameter'
    },
    azure: {
        platform: 'azure',
        envFile: '.env',
        secretsPrefix: 'AZURE_',
        encryptionRequired: true,
        supportedFormats: ['.env', 'key-vault'],
        deployCommand: 'az webapp deployment',
        secretsCommand: 'az keyvault secret set'
    },
    gcp: {
        platform: 'gcp',
        envFile: '.env',
        secretsPrefix: 'GCP_',
        encryptionRequired: true,
        supportedFormats: ['.env', 'secret-manager'],
        deployCommand: 'gcloud app deploy',
        secretsCommand: 'gcloud secrets create'
    },
    docker: {
        platform: 'docker',
        envFile: '.env',
        secretsPrefix: '',
        encryptionRequired: false,
        supportedFormats: ['.env', 'docker-secrets'],
        deployCommand: 'docker compose up -d',
        secretsCommand: 'docker secret create'
    }
}

export class EnvironmentManager {
    private environment: DeploymentEnvironment
    private platform: DeploymentPlatform
    private config: EnvironmentConfig = {}

    constructor(
        environment: DeploymentEnvironment = 'development',
        platform: DeploymentPlatform = 'vercel'
    ) {
        this.environment = environment
        this.platform = platform
        this.loadEnvironmentVariables()
    }

    private loadEnvironmentVariables() {
        // Load from process.env with validation
        this.config = {
            // API Credentials
            GITHUB_TOKEN: this.getSecureVar('GITHUB_TOKEN'),
            GITHUB_CLIENT_ID: this.getVar('GITHUB_CLIENT_ID'),
            GITHUB_CLIENT_SECRET: this.getSecureVar('GITHUB_CLIENT_SECRET'),
            LINEAR_API_KEY: this.getSecureVar('LINEAR_API_KEY'),

            // Database
            DATABASE_URL: this.getSecureVar('DATABASE_URL'),
            DATABASE_SSL: this.getVar('DATABASE_SSL', 'true'),
            REDIS_URL: this.getSecureVar('REDIS_URL'),

            // Authentication
            JWT_SECRET: this.getSecureVar('JWT_SECRET'),
            NEXTAUTH_SECRET: this.getSecureVar('NEXTAUTH_SECRET'),
            NEXTAUTH_URL: this.getVar('NEXTAUTH_URL'),

            // External Services
            OPENAI_API_KEY: this.getSecureVar('OPENAI_API_KEY'),
            ANTHROPIC_API_KEY: this.getSecureVar('ANTHROPIC_API_KEY'),
            STRIPE_SECRET_KEY: this.getSecureVar('STRIPE_SECRET_KEY'),
            STRIPE_WEBHOOK_SECRET: this.getSecureVar('STRIPE_WEBHOOK_SECRET'),
            SENDGRID_API_KEY: this.getSecureVar('SENDGRID_API_KEY'),

            // Cloud Storage
            AWS_ACCESS_KEY_ID: this.getSecureVar('AWS_ACCESS_KEY_ID'),
            AWS_SECRET_ACCESS_KEY: this.getSecureVar('AWS_SECRET_ACCESS_KEY'),
            AWS_S3_BUCKET: this.getVar('AWS_S3_BUCKET'),
            CLOUDINARY_URL: this.getSecureVar('CLOUDINARY_URL'),

            // Monitoring
            SENTRY_DSN: this.getVar('SENTRY_DSN'),
            ANALYTICS_ID: this.getVar('ANALYTICS_ID'),
            MIXPANEL_TOKEN: this.getSecureVar('MIXPANEL_TOKEN'),

            // Application
            APP_ENV: this.getVar('APP_ENV', this.environment) as DeploymentEnvironment,
            APP_URL: this.getVar('APP_URL'),
            API_BASE_URL: this.getVar('API_BASE_URL'),
            ALLOWED_ORIGINS: this.getVar('ALLOWED_ORIGINS'),

            // Feature Flags
            ENABLE_ANALYTICS: this.getVar('ENABLE_ANALYTICS', 'true'),
            ENABLE_MONITORING: this.getVar('ENABLE_MONITORING', 'true'),
            ENABLE_CACHE: this.getVar('ENABLE_CACHE', 'true'),

            // Security
            CORS_ORIGIN: this.getVar('CORS_ORIGIN', '*'),
            RATE_LIMIT_MAX: this.getVar('RATE_LIMIT_MAX', '100'),
            RATE_LIMIT_WINDOW: this.getVar('RATE_LIMIT_WINDOW', '900000'),

            // Team Configuration
            HELHUM_EMAIL: this.getVar('HELHUM_EMAIL', 'helhum@hotmail.com'),
            HELHUM_GITHUB: this.getVar('HELHUM_GITHUB', 'Helhum-coder'),
            HELBS_EMAIL: this.getVar('HELBS_EMAIL', 'helbslozroj@gmail.com'),
            HELBS_GITHUB: this.getVar('HELBS_GITHUB', 'HelbsLozroj')
        }
    }

    private getVar(key: string, defaultValue?: string): string | undefined {
        return process.env[key] ?? defaultValue
    }

    private getSecureVar(key: string): string | undefined {
        const value = process.env[key]
        if (value && this.environment === 'production') {
            // In production, ensure sensitive variables are not logged
            console.log(`✓ Loaded secure variable: ${key}`)
        }
        return value
    }

    public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
        return this.config[key]
    }

    public getRequired<K extends keyof EnvironmentConfig>(key: K): NonNullable<EnvironmentConfig[K]> {
        const value = this.config[key]
        if (!value) {
            throw new Error(`Required environment variable ${String(key)} is not set`)
        }
        return value as NonNullable<EnvironmentConfig[K]>
    }

    public set<K extends keyof EnvironmentConfig>(key: K, value: EnvironmentConfig[K]) {
        this.config[key] = value
    }

    public validate(): { valid: boolean; missing: string[]; errors: string[] } {
        const missing: string[] = []
        const errors: string[] = []

        // Required variables based on environment
        const requiredVars = this.getRequiredVariables()

        for (const key of requiredVars) {
            if (!this.config[key]) {
                missing.push(key)
            }
        }

        // Validation rules
        if (this.config.APP_URL && !this.isValidUrl(this.config.APP_URL)) {
            errors.push('APP_URL must be a valid URL')
        }

        if (this.config.HELHUM_EMAIL && !this.isValidEmail(this.config.HELHUM_EMAIL)) {
            errors.push('HELHUM_EMAIL must be a valid email address')
        }

        if (this.config.HELBS_EMAIL && !this.isValidEmail(this.config.HELBS_EMAIL)) {
            errors.push('HELBS_EMAIL must be a valid email address')
        }

        if (this.config.DATABASE_URL && !this.isValidDatabaseUrl(this.config.DATABASE_URL)) {
            errors.push('DATABASE_URL format appears invalid')
        }

        return {
            valid: missing.length === 0 && errors.length === 0,
            missing,
            errors
        }
    }

    private getRequiredVariables(): Array<keyof EnvironmentConfig> {
        const base: Array<keyof EnvironmentConfig> = []

        if (this.environment === 'production') {
            base.push('JWT_SECRET', 'APP_URL')
        }

        // Add platform-specific requirements
        switch (this.platform) {
            case 'vercel':
                if (this.environment === 'production') {
                    base.push('NEXTAUTH_SECRET')
                }
                break
            case 'aws':
                base.push('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY')
                break
            case 'azure':
                // Add Azure-specific requirements
                break
            case 'gcp':
                // Add GCP-specific requirements
                break
        }

        return base
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url)
            return true
        } catch {
            return false
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    private isValidDatabaseUrl(url: string): boolean {
        return url.startsWith('postgresql://') ||
            url.startsWith('mysql://') ||
            url.startsWith('mongodb://') ||
            url.startsWith('redis://')
    }

    public generateEnvFile(targetPlatform?: DeploymentPlatform): string {
        const platform = targetPlatform || this.platform
        const platformConfig = PLATFORM_CONFIGS[platform]

        let content = `# Environment Configuration for ${platform.toUpperCase()}\n`
        content += `# Generated on ${new Date().toISOString()}\n`
        content += `# Environment: ${this.environment}\n\n`

        // Team Information
        content += '# =============================================================================\n'
        content += '# TEAM CONFIGURATION\n'
        content += '# =============================================================================\n'
        content += `HELHUM_EMAIL=${this.config.HELHUM_EMAIL || 'helhum@hotmail.com'}\n`
        content += `HELHUM_GITHUB=${this.config.HELHUM_GITHUB || 'Helhum-coder'}\n`
        content += `HELBS_EMAIL=${this.config.HELBS_EMAIL || 'helbslozroj@gmail.com'}\n`
        content += `HELBS_GITHUB=${this.config.HELBS_GITHUB || 'HelbsLozroj'}\n\n`

        // Application Settings
        content += '# =============================================================================\n'
        content += '# APPLICATION SETTINGS\n'
        content += '# =============================================================================\n'
        content += `APP_ENV=${this.environment}\n`
        content += `APP_URL=${this.config.APP_URL || ''}\n`
        content += `API_BASE_URL=${this.config.API_BASE_URL || ''}\n`
        content += `ALLOWED_ORIGINS=${this.config.ALLOWED_ORIGINS || '*'}\n\n`

        // Security & Authentication
        content += '# =============================================================================\n'
        content += '# SECURITY & AUTHENTICATION (Keep these secret!)\n'
        content += '# =============================================================================\n'
        content += `JWT_SECRET=${this.config.JWT_SECRET || ''}\n`
        content += `NEXTAUTH_SECRET=${this.config.NEXTAUTH_SECRET || ''}\n`
        content += `NEXTAUTH_URL=${this.config.NEXTAUTH_URL || ''}\n\n`

        // API Keys (marked as sensitive)
        content += '# =============================================================================\n'
        content += '# API CREDENTIALS (SENSITIVE - DO NOT COMMIT)\n'
        content += '# =============================================================================\n'
        content += `GITHUB_TOKEN=${this.config.GITHUB_TOKEN || ''}\n`
        content += `GITHUB_CLIENT_ID=${this.config.GITHUB_CLIENT_ID || ''}\n`
        content += `GITHUB_CLIENT_SECRET=${this.config.GITHUB_CLIENT_SECRET || ''}\n`
        content += `LINEAR_API_KEY=${this.config.LINEAR_API_KEY || ''}\n`
        content += `OPENAI_API_KEY=${this.config.OPENAI_API_KEY || ''}\n`
        content += `ANTHROPIC_API_KEY=${this.config.ANTHROPIC_API_KEY || ''}\n\n`

        // Database
        content += '# =============================================================================\n'
        content += '# DATABASE CONFIGURATION\n'
        content += '# =============================================================================\n'
        content += `DATABASE_URL=${this.config.DATABASE_URL || ''}\n`
        content += `DATABASE_SSL=${this.config.DATABASE_SSL || 'true'}\n`
        content += `REDIS_URL=${this.config.REDIS_URL || ''}\n\n`

        // External Services
        content += '# =============================================================================\n'
        content += '# EXTERNAL SERVICES\n'
        content += '# =============================================================================\n'
        content += `STRIPE_SECRET_KEY=${this.config.STRIPE_SECRET_KEY || ''}\n`
        content += `STRIPE_WEBHOOK_SECRET=${this.config.STRIPE_WEBHOOK_SECRET || ''}\n`
        content += `SENDGRID_API_KEY=${this.config.SENDGRID_API_KEY || ''}\n\n`

        // Cloud Storage
        content += '# =============================================================================\n'
        content += '# CLOUD STORAGE\n'
        content += '# =============================================================================\n'
        content += `AWS_ACCESS_KEY_ID=${this.config.AWS_ACCESS_KEY_ID || ''}\n`
        content += `AWS_SECRET_ACCESS_KEY=${this.config.AWS_SECRET_ACCESS_KEY || ''}\n`
        content += `AWS_S3_BUCKET=${this.config.AWS_S3_BUCKET || ''}\n`
        content += `CLOUDINARY_URL=${this.config.CLOUDINARY_URL || ''}\n\n`

        // Monitoring
        content += '# =============================================================================\n'
        content += '# MONITORING & ANALYTICS\n'
        content += '# =============================================================================\n'
        content += `SENTRY_DSN=${this.config.SENTRY_DSN || ''}\n`
        content += `ANALYTICS_ID=${this.config.ANALYTICS_ID || ''}\n`
        content += `MIXPANEL_TOKEN=${this.config.MIXPANEL_TOKEN || ''}\n\n`

        // Feature Flags
        content += '# =============================================================================\n'
        content += '# FEATURE FLAGS\n'
        content += '# =============================================================================\n'
        content += `ENABLE_ANALYTICS=${this.config.ENABLE_ANALYTICS || 'true'}\n`
        content += `ENABLE_MONITORING=${this.config.ENABLE_MONITORING || 'true'}\n`
        content += `ENABLE_CACHE=${this.config.ENABLE_CACHE || 'true'}\n\n`

        // Security Settings
        content += '# =============================================================================\n'
        content += '# SECURITY SETTINGS\n'
        content += '# =============================================================================\n'
        content += `CORS_ORIGIN=${this.config.CORS_ORIGIN || '*'}\n`
        content += `RATE_LIMIT_MAX=${this.config.RATE_LIMIT_MAX || '100'}\n`
        content += `RATE_LIMIT_WINDOW=${this.config.RATE_LIMIT_WINDOW || '900000'}\n`

        return content
    }

    public async deploySecrets(platform: DeploymentPlatform): Promise<void> {
        const platformConfig = PLATFORM_CONFIGS[platform]

        if (!platformConfig.secretsCommand) {
            throw new Error(`Platform ${platform} does not support automated secret deployment`)
        }

        // This would integrate with platform-specific CLIs
        // Implementation depends on specific deployment strategy
        console.log(`Deploying secrets to ${platform}...`)
        console.log(`Command: ${platformConfig.secretsCommand}`)
    }

    public getTeamInfo() {
        return {
            helhum: {
                email: this.config.HELHUM_EMAIL,
                github: this.config.HELHUM_GITHUB
            },
            helbs: {
                email: this.config.HELBS_EMAIL,
                github: this.config.HELBS_GITHUB
            }
        }
    }

    public isProduction(): boolean {
        return this.environment === 'production'
    }

    public isPlatform(platform: DeploymentPlatform): boolean {
        return this.platform === platform
    }

    public getSafeConfig(): Partial<EnvironmentConfig> {
        // Return config without sensitive data for logging/debugging
        const safe = { ...this.config }

        // Remove sensitive fields
        const sensitiveKeys: Array<keyof EnvironmentConfig> = [
            'GITHUB_TOKEN', 'GITHUB_CLIENT_SECRET', 'LINEAR_API_KEY',
            'JWT_SECRET', 'NEXTAUTH_SECRET', 'DATABASE_URL', 'REDIS_URL',
            'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET', 'SENDGRID_API_KEY', 'AWS_SECRET_ACCESS_KEY',
            'CLOUDINARY_URL', 'MIXPANEL_TOKEN'
        ]

        for (const key of sensitiveKeys) {
            if (safe[key]) {
                safe[key] = '[REDACTED]' as any
            }
        }

        return safe
    }
}

// Global environment manager instance
export const env = new EnvironmentManager(
    (process.env.APP_ENV as DeploymentEnvironment) || 'development',
    (process.env.DEPLOYMENT_PLATFORM as DeploymentPlatform) || 'vercel'
)

// Utility functions
export function isProduction(): boolean {
    return env.isProduction()
}

export function getTeamInfo() {
    return env.getTeamInfo()
}

export function validateEnvironment(): { valid: boolean; missing: string[]; errors: string[] } {
    return env.validate()
}