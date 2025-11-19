# Dockerfile for Multi-Platform Deployment
FROM node:25-alpine AS base

# Set working directory
WORKDIR /app

# Add team information as labels
LABEL maintainer.helhum="helhum@hotmail.com"
LABEL maintainer.helbs="helbslozroj@gmail.com"
LABEL github.helhum="Helhum-coder"
LABEL github.helbs="HelbsLozroj"

# Install dependencies for production
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder

# Copy source code
COPY . .

# Install all dependencies (including dev dependencies)
RUN npm ci

# Build application with environment variables
ARG APP_ENV=production
ARG DEPLOYMENT_PLATFORM=docker
ARG HELHUM_EMAIL=helhum@hotmail.com
ARG HELHUM_GITHUB=Helhum-coder
ARG HELBS_EMAIL=helbslozroj@gmail.com
ARG HELBS_GITHUB=HelbsLozroj

ENV APP_ENV=$APP_ENV
ENV DEPLOYMENT_PLATFORM=$DEPLOYMENT_PLATFORM
ENV HELHUM_EMAIL=$HELHUM_EMAIL
ENV HELHUM_GITHUB=$HELHUM_GITHUB
ENV HELBS_EMAIL=$HELBS_EMAIL
ENV HELBS_GITHUB=$HELBS_GITHUB

# Build the application
RUN npm run build

# Production image
FROM base AS runner

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set environment variables
ENV NODE_ENV=production
ENV APP_ENV=production
ENV DEPLOYMENT_PLATFORM=docker

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Create directory for logs
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3000, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["npm", "start"]