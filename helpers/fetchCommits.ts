import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Commit } from '../interfaces/commit';

const baseUrl = 'https://api.github.com/repos/{}/commits/';
const token = process.env.GITHUB_ACCESS_TOKEN!;
const headers = token ? { Authorization: `Bearer ${token}` } : {};

function extractCoAuthors(commitMessage: string): { name: string; email: string }[] {
    const coAuthors: { name: string; email: string }[] = [];
    const coAuthorPattern = /Co-Authored-By: (.+?) <(.+?)>/g;
    let match: RegExpExecArray | null;
    while ((match = coAuthorPattern.exec(commitMessage)) !== null) {
      const [, name, email] = match;
      coAuthors.push({ name, email });
    }
    return coAuthors;
  }

function updateCommitMessage(commitMessage: string) {
  const coAuthorPattern = /Co-Authored-By: (.+?) <(.+?)>/g;
  return commitMessage.replace(coAuthorPattern, '').trim();
}

export async function fetchCommits(data: any) {
  const commitIds = data.commits.map((commit: any) => commit.id);
  const ownerRepo = data.repository.full_name;

  return await Promise.all(
    commitIds.map(async (commitId: string) => {
      const url = baseUrl.replace('{}', ownerRepo) + commitId;
      const response : AxiosResponse<Commit> = await axios.get(url, { headers });
      const commitData = response.data;

      const coAuthors = extractCoAuthors(commitData.commit.message);
      const message = updateCommitMessage(commitData.commit.message);

      return {
        id: commitData.sha,
        message: message,
        author: commitData.author.login,
        authorUrl: commitData.author.html_url,
        link: commitData.html_url,
        fileCount: commitData.files.length,
        additions: commitData.stats.additions,
        deletions: commitData.stats.deletions,
        timestamp: commitData.commit.committer.date,
        coAuthors,
      };
    })
  );
}
