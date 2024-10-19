import { PullRequestData } from '../interfaces/pullRequestData';

export function readPullRequestData(req: any): PullRequestData {
  const data: PullRequestData = req.body;

  return {
    action: data.action,
    pull_request: {
      title: data.pull_request.title,
      body: data.pull_request.body,
      html_url: data.pull_request.html_url,
      state: data.pull_request.state,
      merged_at: data.pull_request.merged_at,
      created_at: data.pull_request.created_at,
      additions: data.pull_request.additions,
      deletions: data.pull_request.deletions,
      changed_files: data.pull_request.changed_files,
      user: {
        login: data.pull_request.user.login,
        avatar_url: data.pull_request.user.avatar_url,
        html_url: data.pull_request.user.html_url,
      },
    },
    repository: {
      full_name: data.repository.full_name,
    },
  };
}