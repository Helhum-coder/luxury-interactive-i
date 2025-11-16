import { GitHubRepository, GitHubBranch, GitHubCommit, GitHubUser } from './types'

export class GitHubAPI {
  private accessToken: string | null = null
  private baseUrl = 'https://api.github.com'

  setAccessToken(token: string) {
    this.accessToken = token
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  clearAccessToken() {
    this.accessToken = null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('GitHub access token not set')
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async getCurrentUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>('/user')
  }

  async listRepositories(sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated'): Promise<GitHubRepository[]> {
    return this.request<GitHubRepository[]>(`/user/repos?sort=${sort}&per_page=100`)
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(`/repos/${owner}/${repo}`)
  }

  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.request<GitHubBranch[]>(`/repos/${owner}/${repo}/branches?per_page=100`)
  }

  async listCommits(
    owner: string,
    repo: string,
    branch?: string,
    perPage: number = 30
  ): Promise<GitHubCommit[]> {
    const branchParam = branch ? `?sha=${branch}&per_page=${perPage}` : `?per_page=${perPage}`
    return this.request<GitHubCommit[]>(`/repos/${owner}/${repo}/commits${branchParam}`)
  }

  async compareBranches(owner: string, repo: string, base: string, head: string): Promise<{
    ahead_by: number
    behind_by: number
    commits: GitHubCommit[]
  }> {
    return this.request(`/repos/${owner}/${repo}/compare/${base}...${head}`)
  }

  async getBranchProtection(owner: string, repo: string, branch: string): Promise<any> {
    try {
      return await this.request(`/repos/${owner}/${repo}/branches/${branch}/protection`)
    } catch (error) {
      return null
    }
  }

  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    return this.request<GitHubCommit>(`/repos/${owner}/${repo}/commits/${sha}`)
  }

  async compareCommits(owner: string, repo: string, base: string, head: string): Promise<{
    base_commit: GitHubCommit
    merge_base_commit: { sha: string; commit: any }
    commits: GitHubCommit[]
    files: Array<{
      sha: string
      filename: string
      status: string
      additions: number
      deletions: number
      changes: number
      patch?: string
      previous_filename?: string
      blob_url: string
      raw_url: string
      contents_url: string
    }>
    stats: {
      total: number
      additions: number
      deletions: number
    }
    ahead_by: number
    behind_by: number
  }> {
    return this.request(`/repos/${owner}/${repo}/compare/${base}...${head}`)
  }

  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<{
    content: string
    encoding: string
    sha: string
    size: number
  }> {
    const refParam = ref ? `?ref=${ref}` : ''
    return this.request(`/repos/${owner}/${repo}/contents/${path}${refParam}`)
  }
}

export const githubAPI = new GitHubAPI()
