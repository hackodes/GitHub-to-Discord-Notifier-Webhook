export interface PullRequestData {
  action: string
  pull_request: {
    title: string
    user: {
      login: string
      avatar_url: string
      html_url: string
    }
    body: string
    html_url: string
    state: string
    merged_at: string | null
    created_at: string
    additions: number
    deletions: number
    changed_files: number
  }
  repository: {
    full_name: string
  }
}
