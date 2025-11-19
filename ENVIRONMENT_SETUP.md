# Environment Configuration Guide

This document explains how to properly configure environment variables for the Luxury Interactive application.

## 🚀 Quick Setup

### 1. Development Environment

```bash
# Copy the development template
cp .env.development.template .env.local

# Edit the file with your development credentials
nano .env.local
```

### 2. Production Environment

Production environment variables are managed through your deployment platform:

- **GitHub Pages**: No server-side environment variables needed
- **Vercel**: Configure in Vercel Dashboard → Project Settings → Environment Variables
- **Netlify**: Configure in Netlify Dashboard → Site Settings → Environment Variables

## 📋 Environment Variables Reference

### Application Settings

| Variable | Description | Development | Production | Required |
|----------|-------------|-------------|------------|----------|
| `NODE_ENV` | Node.js environment | `development` | `production` | ✅ |
| `APP_ENV` | Application environment | `development` | `production` | ✅ |
| `VITE_APP_TITLE` | Application title | `Luxury Interactive (Dev)` | `Luxury Interactive` | ✅ |
| `VITE_APP_DESCRIPTION` | App description | Development description | Production description | ❌ |

### GitHub Integration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Iv1.a629723...` | ⚠️ |
| `VITE_GITHUB_CALLBACK_URL` | OAuth callback URL | `https://yourapp.com/auth/callback` | ⚠️ |

> ⚠️ Required only if using GitHub authentication

### API Configuration

| Variable | Description | Development | Production | Required |
|----------|-------------|-------------|------------|----------|
| `VITE_API_BASE_URL` | API base URL | `http://localhost:3001` | `https://api.yourapp.com` | ⚠️ |
| `VITE_API_VERSION` | API version | `v1` | `v1` | ❌ |

### Feature Flags

| Variable | Description | Development | Production | Default |
|----------|-------------|-------------|------------|---------|
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `false` | `true` | `false` |
| `VITE_ENABLE_ERROR_REPORTING` | Enable error reporting | `false` | `true` | `false` |
| `VITE_ENABLE_DEBUG_TOOLS` | Enable debug tools | `true` | `false` | `false` |

### Third-Party Services

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` or `pk_live_...` | ⚠️ |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN | `https://...@sentry.io/...` | ❌ |

## 🔒 Security Best Practices

### ✅ Safe for Client-Side (VITE_ prefix)

These can be included in your build and are visible to users:

- API endpoints
- Public keys (Stripe publishable, not secret)
- Feature flags
- CDN URLs

### ❌ Never Include in Client-Side

These should ONLY be in server-side configuration:

- Database passwords
- API secret keys
- Private tokens
- JWT secrets

### Example of UNSAFE variables (DO NOT USE):

```bash
# ❌ DON'T DO THIS - These should not have VITE_ prefix
VITE_DATABASE_PASSWORD=secret123
VITE_JWT_SECRET=mysecret
VITE_STRIPE_SECRET_KEY=sk_live_...
```

## 🛠️ Development Workflow

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.development.template .env.local

# Start development server
npm run dev
```

### 2. Environment Validation

The application includes built-in environment validation:

```bash
# Check if your environment is properly configured
npm run validate-env
```

### 3. Build Testing

Test your environment configuration before deployment:

```bash
# Build with current environment
npm run build

# Preview the build
npm run preview
```

## 🚀 Deployment Guides

### GitHub Pages

Environment variables are baked into the build during CI/CD. Configure them in GitHub Actions secrets:

1. Go to Repository → Settings → Secrets and Variables → Actions
2. Add your production environment variables
3. They will be automatically used during the build process

### Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all `VITE_*` variables for your environment
3. Set the environment (Production, Preview, Development)

### Netlify

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add all `VITE_*` variables
3. Deploy contexts will automatically use the correct variables

## 🐛 Troubleshooting

### Environment Variables Not Loading

1. **Check the prefix**: Client-side variables MUST start with `VITE_`
2. **Restart dev server**: Environment changes require restart
3. **Check file name**: Must be `.env.local` for development
4. **Check syntax**: No spaces around `=` sign

### Build Failures

1. **Missing required variables**: Check the Required column in tables above
2. **Invalid URLs**: Ensure URLs are properly formatted
3. **Type validation**: Some variables are validated during build

### Common Issues

```bash
# ❌ Wrong - no VITE_ prefix
API_URL=http://localhost:3001

# ✅ Correct - has VITE_ prefix  
VITE_API_URL=http://localhost:3001

# ❌ Wrong - spaces around =
VITE_API_URL = http://localhost:3001

# ✅ Correct - no spaces
VITE_API_URL=http://localhost:3001
```

## 📞 Support

If you encounter issues with environment configuration:

1. Check this documentation
2. Verify your `.env.local` file syntax
3. Check browser console for environment-related errors
4. Review the GitHub Actions logs for build-time issues

---

**Note**: This guide assumes you're using Vite as your build tool. Environment variables prefixed with `VITE_` are automatically exposed to your client-side code.