import axios, { AxiosResponse } from 'axios';
import { VercelRequest, VercelResponse } from '@vercel/node';

import { Commit } from '../interfaces/commit';

import config from '../config.json';
import { chunkItems, chunkText, formatText, truncateText, getAvatarUrl, formatDate } from '../utils';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;
const token = process.env.GITHUB_ACCESS_TOKEN!;
const baseUrl = 'https://api.github.com/repos/{}/commits/';
const headers = token ? { Authorization: `Bearer ${token}` } : {};



export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  if (req.method === 'POST') {
    const data = req.body;

    const ownerName = data.repository.owner.name;
    const ownerAvatar = data.repository.owner.avatar_url;
    const ownerUrl = data.repository.owner.html_url;
    const ownerRepo = data.repository.full_name;
    const branch = data.ref.split('/').pop();
    const headUrl = data.head_commit.url;
    const commitIds = data.commits.map((commit: any) => commit.id);

    const requestBaseUrl = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
    const avatarUrl = getAvatarUrl(requestBaseUrl, config.avatarURL); 

    try {
      const commits = await Promise.all(
        commitIds.map(async (commitId: string) => {
          const url = baseUrl.replace('{}', ownerRepo) + commitId;
          const response: AxiosResponse<Commit> = await axios.get(url, { headers });
          const data = response.data;
          return {
            id: data.sha,
            message: data.commit.message,
            author: data.author.login,
            authorUrl: data.author.html_url,
            link: data.html_url,
            fileCount: data.files.length,
            additions: data.stats.additions,
            deletions: data.stats.deletions,
            timestamp: data.commit.committer.date
          };
        })
      );

      const entries = commits.map(commit => {
        return `[\`${commit.id.substring(0, 7)}\`](${commit.link}) ${truncateText(commit.message)} - [${commit.author}](${commit.authorUrl})
      ⤷ \`✏️\` **${formatText(commit.fileCount, 'files')}** changed with \`🟢\` **${formatText(commit.additions, 'additions')}** and \`🔴\` **${formatText(commit.deletions, 'deletions')}**.
      ⤷ \`🕒\` **Committed on:** ${formatDate(commit.timestamp)}`;
      }).reverse();
      

      const chunkedEntries = entries.join('\n\n');
      const chunks = chunkText([chunkedEntries], 4096); 
      
      const embeds = chunks.map((chunk, i) => ({
        author: {
          name: ownerName,
          url: ownerUrl,
          icon_url: ownerAvatar
        },
        title: `[${ownerRepo}:${branch}] ${entries.length} new commit${entries.length === 1 ? '' : 's'}${chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : ''}`,
        url: headUrl + (chunks.length > 1 ? `?${i}` : ''),
        description: chunk.join('\n'),
        color: config.embedColor
      }));

      const payloads = chunkItems(embeds, 10).map(embeds => ({
        username: config.botName,
        avatar_url: avatarUrl,
        embeds
      }));

      const responses = await Promise.all(
        payloads.map(payload => axios.post(webhookUrl, payload))
      );

      if (responses.every(response => response.status === 204)) {
        res.status(200).send('Message sent successfully');
      } else {
        res.status(500).send('Error sending message');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  } else {
    res.status(405).send('Method not allowed');
  }
};
