import { ProjectVersion } from './types'

export interface PackageJsonData {
  name?: string
  version?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  [key: string]: any
}

export interface VersionInfo {
  appVersion: string
  cliVersions: {
    npm?: string
    node?: string
    git?: string
    vite?: string
    typescript?: string
    react?: string
  }
  dependencies: {
    name: string
    version: string
    type: 'dependency' | 'devDependency'
  }[]
  lastDetected: number
}

export async function detectVersionsFromPackageJson(
  packageJsonContent: string
): Promise<VersionInfo> {
  try {
    const packageData: PackageJsonData = JSON.parse(packageJsonContent)
    
    const cliVersions: VersionInfo['cliVersions'] = {}
    const dependencies: VersionInfo['dependencies'] = []

    if (packageData.dependencies) {
      if (packageData.dependencies['vite']) {
        cliVersions.vite = cleanVersion(packageData.dependencies['vite'])
      }
      if (packageData.dependencies['typescript']) {
        cliVersions.typescript = cleanVersion(packageData.dependencies['typescript'])
      }
      if (packageData.dependencies['react']) {
        cliVersions.react = cleanVersion(packageData.dependencies['react'])
      }

      Object.entries(packageData.dependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: cleanVersion(version),
          type: 'dependency'
        })
      })
    }

    if (packageData.devDependencies) {
      if (packageData.devDependencies['vite'] && !cliVersions.vite) {
        cliVersions.vite = cleanVersion(packageData.devDependencies['vite'])
      }
      if (packageData.devDependencies['typescript'] && !cliVersions.typescript) {
        cliVersions.typescript = cleanVersion(packageData.devDependencies['typescript'])
      }

      Object.entries(packageData.devDependencies).forEach(([name, version]) => {
        dependencies.push({
          name,
          version: cleanVersion(version),
          type: 'devDependency'
        })
      })
    }

    return {
      appVersion: packageData.version || '0.0.0',
      cliVersions,
      dependencies,
      lastDetected: Date.now()
    }
  } catch (error) {
    console.error('Error parsing package.json:', error)
    throw new Error('Failed to parse package.json')
  }
}

export function cleanVersion(version: string): string {
  return version.replace(/^[\^~>=<]/, '').trim()
}

export async function fetchPackageJsonFromRepo(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${branch}`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch package.json: ${response.statusText}`)
  }

  const data = await response.json()
  
  if (data.content) {
    return atob(data.content.replace(/\n/g, ''))
  }
  
  throw new Error('No content in package.json response')
}

export async function detectVersionsFromGitHub(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<VersionInfo> {
  const packageJsonContent = await fetchPackageJsonFromRepo(owner, repo, branch, token)
  return detectVersionsFromPackageJson(packageJsonContent)
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

export function isVersionOutdated(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0
}

export function getVersionStatus(current: string, latest: string): 'up-to-date' | 'minor-update' | 'major-update' {
  const comparison = compareVersions(current, latest)
  
  if (comparison === 0) return 'up-to-date'
  
  const currentParts = current.split('.').map(Number)
  const latestParts = latest.split('.').map(Number)
  
  if (currentParts[0] < latestParts[0]) return 'major-update'
  
  return 'minor-update'
}

export async function detectLocalVersion(): Promise<VersionInfo> {
  try {
    const response = await fetch('/package.json')
    if (!response.ok) {
      throw new Error('Could not fetch local package.json')
    }
    
    const packageJsonContent = await response.text()
    return detectVersionsFromPackageJson(packageJsonContent)
  } catch (error) {
    console.error('Error detecting local version:', error)
    
    return {
      appVersion: '0.0.0',
      cliVersions: {},
      dependencies: [],
      lastDetected: Date.now()
    }
  }
}
