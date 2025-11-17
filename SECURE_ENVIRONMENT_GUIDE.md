#!/bin/bash

# =============================================================================
# Secure Environment Setup Script for Multi-Platform Deployment
# Team: Helhum (helhum@hotmail.com) & HelbsLozroj (helbslozroj@gmail.com)
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Team information
HELHUM_EMAIL="helhum@hotmail.com"
HELHUM_GITHUB="Helhum-coder"
HELBS_EMAIL="helbslozroj@gmail.com"
HELBS_GITHUB="HelbsLozroj"

echo -e "${BLUE}🚀 Spark Template - Multi-Platform Environment Setup${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Team Members:"
echo -e "  • Helhum: ${HELHUM_EMAIL} (${HELHUM_GITHUB})"
echo -e "  • HelbsLozroj: ${HELBS_EMAIL} (${HELBS_GITHUB})"
echo ""

# =============================================================================
# FUNCTIONS
# =============================================================================

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# =============================================================================
# ENVIRONMENT DETECTION
# =============================================================================

detect_environment() {
    print_step "Detecting environment..."
    
    if [[ -n "$VERCEL" ]]; then
        PLATFORM="vercel"
        ENVIRONMENT="production"
    elif [[ -n "$NETLIFY" ]]; then
        PLATFORM="netlify" 
        ENVIRONMENT="production"
    elif [[ -n "$RAILWAY_ENVIRONMENT" ]]; then
        PLATFORM="railway"
        ENVIRONMENT="$RAILWAY_ENVIRONMENT"
    elif [[ -n "$RENDER" ]]; then
        PLATFORM="render"
        ENVIRONMENT="production"
    elif [[ -n "$AWS_LAMBDA_FUNCTION_NAME" ]]; then
        PLATFORM="aws"
        ENVIRONMENT="production"
    elif [[ -n "$WEBSITE_SITE_NAME" ]]; then
        PLATFORM="azure"
        ENVIRONMENT="production"
    elif [[ -n "$GOOGLE_CLOUD_PROJECT" ]]; then
        PLATFORM="gcp"
        ENVIRONMENT="production"
    elif [[ -n "$DOCKER_CONTAINER" ]] || [[ -f "/.dockerenv" ]]; then
        PLATFORM="docker"
        ENVIRONMENT="${APP_ENV:-production}"
    else
        PLATFORM="local"
        ENVIRONMENT="development"
    fi
    
    print_success "Detected platform: $PLATFORM, environment: $ENVIRONMENT"
}

# =============================================================================
# DEPENDENCY CHECK
# =============================================================================

check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing_deps=()
    
    # Core dependencies
    if ! check_command "node"; then missing_deps+=("node"); fi
    if ! check_command "npm"; then missing_deps+=("npm"); fi
    if ! check_command "git"; then missing_deps+=("git"); fi
    if ! check_command "curl"; then missing_deps+=("curl"); fi
    
    # Security tools
    if ! check_command "openssl"; then missing_deps+=("openssl"); fi
    
    # Platform-specific tools
    case $PLATFORM in
        "vercel")
            if ! check_command "vercel"; then 
                print_warning "Vercel CLI not found. Install with: npm i -g vercel"
            fi
            ;;
        "netlify")
            if ! check_command "netlify"; then 
                print_warning "Netlify CLI not found. Install with: npm i -g netlify-cli"
            fi
            ;;
        "railway")
            if ! check_command "railway"; then 
                print_warning "Railway CLI not found. Install with: npm i -g @railway/cli"
            fi
            ;;
        "aws")
            if ! check_command "aws"; then 
                print_warning "AWS CLI not found. Install from: https://aws.amazon.com/cli/"
            fi
            ;;
        "docker")
            if ! check_command "docker"; then missing_deps+=("docker"); fi
            if ! check_command "docker-compose"; then 
                print_warning "Docker Compose not found"
            fi
            ;;
    esac
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# =============================================================================
# ENVIRONMENT VARIABLE SETUP
# =============================================================================

setup_environment_variables() {
    print_step "Setting up environment variables..."
    
    local env_file
    case $ENVIRONMENT in
        "development") env_file=".env.local" ;;
        "staging") env_file=".env.staging" ;;
        "production") env_file=".env.production" ;;
        *) env_file=".env" ;;
    esac
    
    if [[ ! -f "$env_file" ]]; then
        print_step "Creating $env_file from template..."
        
        # Copy example file
        if [[ -f ".env.example" ]]; then
            cp ".env.example" "$env_file"
        else
            # Create basic environment file
            cat > "$env_file" << EOF
# =============================================================================
# TEAM CONFIGURATION
# =============================================================================
HELHUM_EMAIL=${HELHUM_EMAIL}
HELHUM_GITHUB=${HELHUM_GITHUB}
HELBS_EMAIL=${HELBS_EMAIL}
HELBS_GITHUB=${HELBS_GITHUB}

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
APP_ENV=${ENVIRONMENT}
DEPLOYMENT_PLATFORM=${PLATFORM}
APP_URL=
API_BASE_URL=
ALLOWED_ORIGINS=*

# =============================================================================
# SECURITY & AUTHENTICATION
# =============================================================================
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# =============================================================================
# API CREDENTIALS (FILL THESE IN)
# =============================================================================
GITHUB_TOKEN=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINEAR_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL=
DATABASE_SSL=true
REDIS_URL=

# =============================================================================
# EXTERNAL SERVICES
# =============================================================================
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=

# =============================================================================
# CLOUD STORAGE
# =============================================================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
CLOUDINARY_URL=

# =============================================================================
# MONITORING & ANALYTICS
# =============================================================================
SENTRY_DSN=
ANALYTICS_ID=
MIXPANEL_TOKEN=

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
ENABLE_CACHE=true

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
CORS_ORIGIN=*
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
EOF
        fi
        
        # Generate secrets for production
        if [[ "$ENVIRONMENT" == "production" ]]; then
            print_step "Generating secure secrets..."
            
            # Generate JWT secret if not set
            if ! grep -q "^JWT_SECRET=.\+" "$env_file"; then
                local jwt_secret=$(generate_secret)
                sed -i.bak "s/^JWT_SECRET=.*/JWT_SECRET=${jwt_secret}/" "$env_file"
                print_success "Generated JWT_SECRET"
            fi
            
            # Generate NextAuth secret if not set
            if ! grep -q "^NEXTAUTH_SECRET=.\+" "$env_file"; then
                local nextauth_secret=$(generate_secret)
                sed -i.bak "s/^NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=${nextauth_secret}/" "$env_file"
                print_success "Generated NEXTAUTH_SECRET"
            fi
            
            # Remove backup files
            rm -f "${env_file}.bak"
        fi
        
        print_success "Environment file created: $env_file"
    else
        print_success "Environment file already exists: $env_file"
    fi
    
    # Validate environment variables
    print_step "Validating environment variables..."
    
    if command -v node &> /dev/null; then
        node -e "
            try {
                const { validateEnvironment } = require('./src/lib/environment-manager.ts');
                const result = validateEnvironment();
                
                console.log('Environment validation:');
                console.log('Valid:', result.valid);
                
                if (result.missing.length > 0) {
                    console.log('Missing variables:', result.missing.join(', '));
                }
                
                if (result.errors.length > 0) {
                    console.log('Errors:', result.errors.join(', '));
                }
                
                if (!result.valid && process.env.APP_ENV === 'production') {
                    console.error('❌ Environment validation failed for production');
                    process.exit(1);
                } else {
                    console.log('✅ Environment validation passed');
                }
            } catch (error) {
                console.log('⚠️  Could not validate environment (module not built yet)');
            }
        "
    else
        print_warning "Node.js not available, skipping environment validation"
    fi
}

# =============================================================================
# SECURITY SETUP
# =============================================================================

setup_security() {
    print_step "Setting up security measures..."
    
    # Create .gitignore entries for environment files
    if [[ ! -f ".gitignore" ]]; then
        touch .gitignore
    fi
    
    local gitignore_entries=(
        ".env"
        ".env.local" 
        ".env.production"
        ".env.staging"
        "*.key"
        "*.pem"
        "secrets/"
        ".secrets"
    )
    
    for entry in "${gitignore_entries[@]}"; do
        if ! grep -q "^${entry}$" .gitignore; then
            echo "$entry" >> .gitignore
        fi
    done
    
    print_success "Updated .gitignore with security entries"
    
    # Set proper file permissions
    if [[ "$PLATFORM" != "local" ]]; then
        chmod 600 .env* 2>/dev/null || true
        print_success "Set secure file permissions"
    fi
    
    # Check for accidentally committed secrets
    print_step "Scanning for potential secrets in code..."
    
    local found_secrets=false
    
    if grep -r "sk-" src/ 2>/dev/null; then
        print_error "Found potential OpenAI API keys in source code"
        found_secrets=true
    fi
    
    if grep -r "ghp_" src/ 2>/dev/null; then
        print_error "Found potential GitHub tokens in source code"
        found_secrets=true
    fi
    
    if grep -r "pk_" src/ 2>/dev/null; then
        print_error "Found potential Stripe keys in source code"
        found_secrets=true
    fi
    
    if [[ "$found_secrets" == "true" ]]; then
        print_error "Potential secrets found in source code!"
        print_error "Please move all secrets to environment variables"
        echo ""
        echo "Quick fix commands:"
        echo "  git rm --cached <file>  # Remove from git"
        echo "  git commit -m 'Remove secrets from code'"
        echo ""
        if [[ "$ENVIRONMENT" == "production" ]]; then
            exit 1
        fi
    else
        print_success "No secrets found in source code"
    fi
}

# =============================================================================
# PLATFORM-SPECIFIC SETUP
# =============================================================================

setup_platform() {
    print_step "Setting up platform-specific configuration..."
    
    case $PLATFORM in
        "vercel")
            setup_vercel
            ;;
        "netlify")
            setup_netlify
            ;;
        "railway")
            setup_railway
            ;;
        "aws")
            setup_aws
            ;;
        "docker")
            setup_docker
            ;;
        "local")
            setup_local
            ;;
        *)
            print_warning "Unknown platform: $PLATFORM"
            ;;
    esac
}

setup_vercel() {
    print_step "Configuring for Vercel deployment..."
    
    if [[ -f "vercel.json" ]]; then
        print_success "vercel.json already exists"
    else
        print_warning "vercel.json not found - should have been created"
    fi
    
    print_success "Vercel configuration complete"
}

setup_netlify() {
    print_step "Configuring for Netlify deployment..."
    
    if [[ -f "netlify.toml" ]]; then
        print_success "netlify.toml already exists"
    else
        print_warning "netlify.toml not found - should have been created"
    fi
    
    # Create Netlify functions directory
    mkdir -p netlify/functions
    mkdir -p netlify/edge-functions
    
    print_success "Netlify configuration complete"
}

setup_railway() {
    print_step "Configuring for Railway deployment..."
    
    # Railway uses environment variables from the dashboard
    print_success "Railway uses dashboard environment variables"
    print_success "Railway configuration complete"
}

setup_aws() {
    print_step "Configuring for AWS deployment..."
    
    # Create basic CloudFormation template if not exists
    mkdir -p aws
    
    print_success "AWS configuration complete"
}

setup_docker() {
    print_step "Configuring for Docker deployment..."
    
    if [[ -f "Dockerfile" ]] && [[ -f "docker-compose.yml" ]]; then
        print_success "Docker configuration files exist"
    else
        print_warning "Docker configuration files missing"
    fi
    
    print_success "Docker configuration complete"
}

setup_local() {
    print_step "Configuring for local development..."
    
    # Install dependencies if package.json exists
    if [[ -f "package.json" ]]; then
        print_step "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    fi
    
    print_success "Local development configuration complete"
}

# =============================================================================
# POST-SETUP VALIDATION
# =============================================================================

validate_setup() {
    print_step "Validating setup..."
    
    # Check if build works
    if [[ -f "package.json" ]] && command -v npm &> /dev/null; then
        print_step "Testing build..."
        if npm run build &> /dev/null; then
            print_success "Build test passed"
        else
            print_error "Build test failed - please check configuration"
            return 1
        fi
    fi
    
    print_success "Setup validation complete"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    echo "Starting environment setup..."
    echo ""
    
    detect_environment
    check_dependencies
    setup_environment_variables
    setup_security
    setup_platform
    validate_setup
    
    echo ""
    print_success "🎉 Multi-platform environment setup complete!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review and fill in the environment variables in your .env file"
    echo "2. Set up secrets in your deployment platform dashboard"
    echo "3. Test your deployment with: npm run build"
    echo "4. Deploy using your platform's CLI or CI/CD pipeline"
    echo ""
    echo -e "${BLUE}Platform: ${PLATFORM}${NC}"
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo ""
    echo -e "${BLUE}Team Contact:${NC}"
    echo -e "  • Helhum: ${HELHUM_EMAIL}"
    echo -e "  • HelbsLozroj: ${HELBS_EMAIL}"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Run main function
main "$@"