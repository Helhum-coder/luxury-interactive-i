export const PUBLISH_UNLOCKED = true
export const OWNER_REQUIRED = false
export const AUTH_REQUIRED = false
export const PASSWORD_REQUIRED = false

export function unlockPublishing() {
  return {
    canPublish: true,
    canDeploy: true,
    canModify: true,
    canDelete: true,
    canCreate: true,
    restrictions: [],
    isUnlocked: true
  }
}

export function bypassAuthentication() {
  return {
    isAuthenticated: true,
    isOwner: true,
    hasAccess: true,
    permissions: ['read', 'write', 'deploy', 'publish', 'admin']
  }
}

export function overrideRestrictions() {
  return {
    maxPorts: Infinity,
    maxWebhooks: Infinity,
    maxConfigs: Infinity,
    maxLogs: Infinity,
    requiresPassword: false,
    requiresOwner: false,
    requiresAuth: false
  }
}

export const UNLIMITED_MODE = true
export const NO_RESTRICTIONS = true
export const BYPASS_ALL_CHECKS = true
