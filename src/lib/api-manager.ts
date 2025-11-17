import { fetchWithRetry, globalErrorHandler, HandledError } from './error-handler'
import { APICredentials } from './utils'

export interface GitHubUserInfo {
  login: string
  id: number
  avatar_url: string
  name: string
  email: string
  bio: string
  public_repos: number
  followers: number
  following: number
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  html_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
}

export class APIManager {
  private credentials: APICredentials = {}
  private lastError: HandledError | null = null

  setGitHubToken(token: string, apiVersion = '2022-11-28') {
    this.credentials.github = { token, apiVersion }
  }

  setLinearKey(apiKey: string) {
    this.credentials.linear = { apiKey }
  }

  getGitHubToken(): string | undefined {
    return this.credentials.github?.token
  }

  getLinearKey(): string | undefined {
    return this.credentials.linear?.apiKey
  }

  hasGitHubCredentials(): boolean {
    return !!this.credentials.github?.token
  }

  hasLinearCredentials(): boolean {
    return !!this.credentials.linear?.apiKey
  }

  async testGitHubConnection(): Promise<{ success: boolean; user?: GitHubUserInfo; error?: string }> {
    if (!this.credentials.github?.token) {
      return { success: false, error: 'No GitHub token configured' }
    }

    try {
      const response = await fetchWithRetry('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.credentials.github.token}`,
          'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28',
          'Accept': 'application/vnd.github+json'
        }
      }, {
        maxRetries: 2,
        timeout: 10000
      })

      const user = await response.json()
      return { success: true, user }
    } catch (error) {
      const handledError = globalErrorHandler.handleError(error, { context: 'testGitHubConnection' })
      this.lastError = handledError
      return { 
        success: false, 
        error: handledError.userMessage 
      }
    }
  }

  getLastError(): HandledError | null {
    return this.lastError
  }

  async getGitHubOctocat(): Promise<string> {
    if (!this.credentials.github?.token) {
      throw new Error('No GitHub token configured')
    }

    const response = await fetchWithRetry('https://api.github.com/octocat', {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28'
      }
    }, {
      maxRetries: 2,
      timeout: 10000
    })

    return response.text()
  }

  async getGitHubRepositories(): Promise<GitHubRepo[]> {
    if (!this.credentials.github?.token) {
      throw new Error('No GitHub token configured')
    }

    const response = await fetchWithRetry('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28',
        'Accept': 'application/vnd.github+json'
      }
    }, {
      maxRetries: 2,
      timeout: 15000
    })

    return response.json()
  }

  async getGitHubRepository(owner: string, repo: string): Promise<GitHubRepo> {
    if (!this.credentials.github?.token) {
      throw new Error('No GitHub token configured')
    }

    const response = await fetchWithRetry(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28',
        'Accept': 'application/vnd.github+json'
      }
    }, {
      maxRetries: 2,
      timeout: 10000
    })

    return response.json()
  }

  clearCredentials() {
    this.credentials = {}
  }
}

export const apiManager = new APIManager()
