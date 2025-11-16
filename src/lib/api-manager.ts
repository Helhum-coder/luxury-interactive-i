export interface APICredentials {
  github?: {
    token: string
    apiVersion?: string
  }
  linear?: {
    apiKey: string
  }
}

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
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.credentials.github.token}`,
          'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28',
          'Accept': 'application/vnd.github+json'
        }
      })

      if (!response.ok) {
        return { success: false, error: `GitHub API error: ${response.statusText}` }
      }

      const user = await response.json()
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getGitHubOctocat(): Promise<string> {
    if (!this.credentials.github?.token) {
      throw new Error('No GitHub token configured')
    }

    const response = await fetch('https://api.github.com/octocat', {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.text()
  }

  async getGitHubRepositories(): Promise<GitHubRepo[]> {
    if (!this.credentials.github?.token) {
      throw new Error('No GitHub token configured')
    }

    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28',
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getGitHubRepository(owner: string, repo: string): Promise<GitHubRepo> {
    if (!this.credentials.github?.token) {
      throw new Error('No GitHub token configured')
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.github.token}`,
        'X-GitHub-Api-Version': this.credentials.github.apiVersion || '2022-11-28',
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    return response.json()
  }

  clearCredentials() {
    this.credentials = {}
  }
}

export const apiManager = new APIManager()
