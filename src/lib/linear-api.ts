export interface LinearIssue {
  id: string
  identifier: string
  title: string
  description?: string
  priority: number
  state: {
    id: string
    name: string
    type: string
  }
  assignee?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  url: string
}

export interface LinearProject {
  id: string
  name: string
  description?: string
  state: string
  progress: number
  url: string
}

export interface LinearTeam {
  id: string
  name: string
  key: string
}

export class LinearAPI {
  private apiKey: string
  private baseUrl = 'https://api.linear.app/graphql'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async query(query: string, variables?: Record<string, any>) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.errors) {
      throw new Error(`Linear API error: ${data.errors[0].message}`)
    }

    return data.data
  }

  async getViewer() {
    const query = `
      query {
        viewer {
          id
          name
          email
        }
      }
    `
    return this.query(query)
  }

  async getTeams(): Promise<LinearTeam[]> {
    const query = `
      query {
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    `
    const data = await this.query(query)
    return data.teams.nodes
  }

  async getIssues(teamId?: string, limit = 50): Promise<LinearIssue[]> {
    const query = `
      query($teamId: String, $first: Int) {
        issues(
          filter: { team: { id: { eq: $teamId } } }
          first: $first
          orderBy: updatedAt
        ) {
          nodes {
            id
            identifier
            title
            description
            priority
            state {
              id
              name
              type
            }
            assignee {
              id
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `
    const data = await this.query(query, { teamId, first: limit })
    return data.issues.nodes
  }

  async getProjects(teamId?: string): Promise<LinearProject[]> {
    const query = `
      query($teamId: String) {
        projects(
          filter: { team: { id: { eq: $teamId } } }
        ) {
          nodes {
            id
            name
            description
            state
            progress
            url
          }
        }
      }
    `
    const data = await this.query(query, { teamId })
    return data.projects.nodes
  }

  async createIssue(
    teamId: string,
    title: string,
    description?: string,
    priority?: number
  ) {
    const query = `
      mutation($teamId: String!, $title: String!, $description: String, $priority: Int) {
        issueCreate(
          input: {
            teamId: $teamId
            title: $title
            description: $description
            priority: $priority
          }
        ) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `
    const data = await this.query(query, { teamId, title, description, priority })
    return data.issueCreate
  }

  async updateIssue(
    issueId: string,
    updates: {
      title?: string
      description?: string
      priority?: number
      stateId?: string
    }
  ) {
    const query = `
      mutation($issueId: String!, $title: String, $description: String, $priority: Int, $stateId: String) {
        issueUpdate(
          id: $issueId
          input: {
            title: $title
            description: $description
            priority: $priority
            stateId: $stateId
          }
        ) {
          success
          issue {
            id
            identifier
            title
          }
        }
      }
    `
    const data = await this.query(query, { issueId, ...updates })
    return data.issueUpdate
  }

  async searchIssues(searchTerm: string): Promise<LinearIssue[]> {
    const query = `
      query($searchTerm: String!) {
        issueSearch(query: $searchTerm) {
          nodes {
            id
            identifier
            title
            description
            priority
            state {
              id
              name
              type
            }
            assignee {
              id
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `
    const data = await this.query(query, { searchTerm })
    return data.issueSearch.nodes
  }
}

export const createLinearClient = (apiKey: string) => {
  return new LinearAPI(apiKey)
}
