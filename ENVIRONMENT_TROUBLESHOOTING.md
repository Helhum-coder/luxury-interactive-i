# 🔧 Environment Setup Troubleshooting

## Quick Diagnosis Script

Run this to quickly diagnose environment setup issues:

```bash
#!/bin/bash
echo "🔍 Environment Diagnosis"
echo "========================"

# Check environment files
echo "📁 Environment Files:"
ls -la .env* 2>/dev/null || echo "   No environment files found"

# Check required tools
echo ""
echo "🛠️ Required Tools:"
command -v node >/dev/null && echo "   ✅ Node.js: $(node --version)" || echo "   ❌ Node.js: Not installed"
command -v npm >/dev/null && echo "   ✅ NPM: $(npm --version)" || echo "   ❌ NPM: Not installed"
command -v git >/dev/null && echo "   ✅ Git: $(git --version)" || echo "   ❌ Git: Not installed"

# Check workspace permissions
echo ""
echo "🔐 Workspace Permissions:"
if [ -w . ]; then
    echo "   ✅ Workspace is writable"
else
    echo "   ❌ Workspace is not writable"
fi

# Check setup script
echo ""
echo "📜 Setup Script:"
if [ -f "setup-environment.sh" ]; then
    if [ -x "setup-environment.sh" ]; then
        echo "   ✅ Setup script exists and is executable"
    else
        echo "   ⚠️ Setup script exists but not executable - trying to fix..."
        chmod +x setup-environment.sh 2>/dev/null && echo "   ✅ Fixed permissions" || echo "   ❌ Cannot fix permissions"
    fi
else
    echo "   ❌ Setup script not found"
fi

# Check package.json scripts
echo ""
echo "📦 Available Scripts:"
if [ -f "package.json" ]; then
    node -pe "
    try {
        const pkg = require('./package.json');
        const scripts = pkg.scripts || {};
        console.log('   Scripts:', Object.keys(scripts).join(', ') || 'None');
    } catch(e) {
        console.log('   ❌ Cannot read package.json');
    }
    " 2>/dev/null
else
    echo "   ❌ package.json not found"
fi

echo ""
echo "🎯 Recommended Actions:"
echo "1. If setup script is not executable: Run 'chmod +x setup-environment.sh'"
echo "2. If no environment files: Run './setup-environment.sh' or copy from .env.example"
echo "3. If missing tools: Install Node.js, npm, and git"
echo "4. If workspace issues: Check Docker/container permissions"
```

## Alternative Setup Methods

### Method 1: Manual Environment Setup

If the setup script fails, you can manually configure:

```bash
# Create environment file
cat > .env.local << 'EOF'
# Team Configuration
HELHUM_EMAIL=helhum@hotmail.com
HELHUM_GITHUB=Helhum-coder
HELBS_EMAIL=helbslozroj@gmail.com
HELBS_GITHUB=HelbsLozroj

# Application Settings
APP_ENV=development
DEPLOYMENT_PLATFORM=local
APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api

# Secrets (generate your own!)
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Add your API keys here
GITHUB_TOKEN=ghp_your_github_token_here
OPENAI_API_KEY=sk-your_openai_key_here

EOF

echo "✅ Environment file created. Edit .env.local to add your API keys."
```

### Method 2: NPM Script Alternative

```bash
# Add to package.json scripts if not exists
npm pkg set scripts.setup="node -e \"
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment...');

// Create .env.local from template
const template = \`
HELHUM_EMAIL=helhum@hotmail.com
HELHUM_GITHUB=Helhum-coder
HELBS_EMAIL=helbslozroj@gmail.com
HELBS_GITHUB=HelbsLozroj
APP_ENV=development
DEPLOYMENT_PLATFORM=local
JWT_SECRET=\${require('crypto').randomBytes(32).toString('base64')}
NEXTAUTH_SECRET=\${require('crypto').randomBytes(32).toString('base64')}
\`;

if (!fs.existsSync('.env.local')) {
  fs.writeFileSync('.env.local', template);
  console.log('✅ Created .env.local');
} else {
  console.log('⚠️ .env.local already exists');
}

console.log('✅ Setup complete! Edit .env.local to add your API keys.');
\""

# Run the setup
npm run setup
```

### Method 3: Docker-Based Setup

If you have Docker but workspace issues:

```bash
# Create setup in Docker
docker run --rm -v "$PWD:/workspace" -w /workspace node:18 /bin/bash -c "
cat > .env.local << 'EOF'
HELHUM_EMAIL=helhum@hotmail.com
HELHUM_GITHUB=Helhum-coder
HELBS_EMAIL=helbslozroj@gmail.com
HELBS_GITHUB=HelbsLozroj
APP_ENV=development
JWT_SECRET=\$(openssl rand -base64 32)
NEXTAUTH_SECRET=\$(openssl rand -base64 32)
EOF
echo 'Environment file created in Docker'
"
```

## File Permission Fixes

### Linux/Mac Permission Issues

```bash
# Fix common permission issues
sudo chown -R $USER:$USER .
chmod -R u+rw .
chmod +x setup-environment.sh

# If using Docker/containers
sudo chmod 666 .env*
sudo chmod +x *.sh
```

### Windows WSL Permission Issues

```bash
# In WSL, fix Windows filesystem permissions
# Add to ~/.profile or ~/.bashrc:
if grep -q microsoft /proc/version; then
    # WSL detected
    umask 022
    export WSLENV=$WSLENV:NODE_ENV/w
fi

# Apply immediately
umask 022
```

## Platform-Specific Fixes

### Vercel Deployment Issues

```bash
# Common Vercel fixes
npx vercel login
npx vercel link
npx vercel env ls  # List current environment variables
npx vercel env add JWT_SECRET production  # Add missing secrets

# Check build logs
npx vercel logs
```

### Netlify Issues

```bash
# Netlify fixes
npm install -g netlify-cli
netlify login
netlify init
netlify env:list
netlify dev  # Test locally

# Check function logs
netlify functions:invoke --help
```

### Railway Issues

```bash
# Railway fixes
npm install -g @railway/cli
railway login
railway variables
railway logs

# Test deployment
railway up --detach
```

## Environment Variable Testing

Create a test script to verify your environment:

```bash
# Create test-env.js
cat > test-env.js << 'EOF'
const requiredVars = [
  'HELHUM_EMAIL',
  'HELBS_EMAIL', 
  'JWT_SECRET',
  'NEXTAUTH_SECRET'
];

console.log('🧪 Testing Environment Variables\n');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${'*'.repeat(Math.min(value.length, 8))}...`);
  } else {
    console.log(`❌ ${varName}: Missing!`);
  }
});

console.log('\n📊 Environment Summary:');
console.log(`Node.js: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`App Environment: ${process.env.APP_ENV || 'not set'}`);
EOF

# Load environment and test
source .env.local 2>/dev/null || echo "Warning: .env.local not found"
node test-env.js

# Cleanup
rm test-env.js
```

## Emergency Recovery

If everything fails, here's a minimal working setup:

```bash
# Nuclear option: Start fresh
echo "🚨 Emergency Recovery - Starting Fresh"

# Backup existing files
mkdir -p backup
cp -r .env* backup/ 2>/dev/null || true

# Create minimal working environment
cat > .env.local << 'EOF'
# Emergency minimal setup
HELHUM_EMAIL=helhum@hotmail.com
HELBS_EMAIL=helbslozroj@gmail.com
JWT_SECRET=emergency-jwt-secret-please-change-in-production
NEXTAUTH_SECRET=emergency-nextauth-secret-please-change
APP_ENV=development
EOF

echo "✅ Emergency environment created."
echo "⚠️  IMPORTANT: Change the default secrets before deploying!"
echo "💡 Your old files are backed up in ./backup/"
```

## Getting Help

If you're still having issues:

1. **Check workspace setup**: Ensure you're in a properly configured development environment
2. **Verify file permissions**: Make sure your user can read/write files in the workspace
3. **Test basic commands**: Try `node --version`, `npm --version`, `ls -la`
4. **Review error messages**: Look for specific error codes or permission denied messages

**Contact the team**:
- Helhum: helhum@hotmail.com (GitHub: Helhum-coder)
- HelbsLozroj: helbslozroj@gmail.com (GitHub: HelbsLozroj)

Remember: The connection error handling system we built should help catch and resolve many deployment-related issues automatically!