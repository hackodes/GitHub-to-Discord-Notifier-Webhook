import { formatText, formatDate, chunkItems, chunkText, truncateText } from '../utils';
import config from '../config.json';

function formatCoAuthors(coAuthors: any[]) {
  if (coAuthors.length === 0) return '';
  const maxCoAuthors = 3;
  const totalCoAuthors = coAuthors.length;

  return `⤷ \`👥\` **Co-Authors:** ${coAuthors.slice(0, maxCoAuthors).map(coAuthor => `\`${coAuthor.name}\``).join(', ')}${
    totalCoAuthors > maxCoAuthors ? `, and ${totalCoAuthors - maxCoAuthors} more...` : ''
  }`;
}

export function createPushEventEmbed(commits: any[], repoInfo: any) {
  const { ownerName, ownerAvatar, ownerRepo, branch } = repoInfo;

  // Create commit entries to be part of the embed description
  const entries = commits.map((commit) => {
    const coAuthors = formatCoAuthors(commit.coAuthors);
    return `[\`${commit.id.substring(0, 7)}\`](${commit.link}) ${truncateText(commit.message)} - [${commit.author}](${commit.authorUrl})${
      coAuthors ? `\n${coAuthors}` : ''
    }
    ⤷ \`✏️\` **${formatText(commit.fileCount, 'files')}** changed with \`🟢\` **${formatText(commit.additions, 'additions')}** and \`🔴\` **${formatText(commit.deletions, 'deletions')}**.
    ⤷ \`🕒\` **Committed on:** ${formatDate(commit.timestamp)}`;
  }).reverse();

  const chunkedEntries = entries.join('\n\n');
  const chunks = chunkText([chunkedEntries], 4096); 

  return chunks.map((chunk, i) => ({
    author: {
      name: ownerName,
      icon_url: ownerAvatar,
    },
    title: `[${ownerRepo}:${branch}] ${entries.length} new commit${entries.length === 1 ? '' : 's'}${chunks.length > 1 ? ` (${i + 1}/${chunks.length})` : ''}`,
    url: commits[0].link,  
    description: chunk.join('\n'),
    color: config.pushEmbedColors.commitColor,
  }));
}

function formatDescription(body: string, maxLength = 200): string {
  if (!body) return '';

  const plainText = body
    .replace(/!\[.*?\]\(.*?\)/g, '') 
    .replace(/#+\s?/g, '') 
    .replace(/\*\*(.*?)\*\*/g, '$1') 
    .replace(/\*(.*?)\*/g, '$1')   
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') 
    .replace(/`([^`]+)`/g, '$1') 
    .replace(/~~(.*?)~~/g, '$1')    
    .replace(/>\s+/g, '')       
    .replace(/\n/g, ' ')       
    .trim();

  const updatedDescription = plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText;

  return updatedDescription;
}

export function createPullRequestEmbed(pullRequestData: any) {
  const {
    action,
    pull_request: {
      title,
      body: description,
      html_url: url,
      state,
      created_at: createdAt,
      merged_at: mergedAt,
      additions,
      deletions,
      changed_files: changedFiles,
      user: { login: creator, avatar_url: creatorUrl, html_url: htmlUrl},
    },
    repository: { full_name: repoName },
  } = pullRequestData;

  const truncatedDescription = formatDescription(description);

  const color = state === 'closed' && mergedAt
    ? config.pullRequestEmbedColors.mergedColor
    : state === 'closed'
      ? config.pullRequestEmbedColors.closedColor
      : config.pullRequestEmbedColors.openColor;

  const descriptionText = `[\`${title}\`](${url}) - [${creator}](${htmlUrl})${truncatedDescription ? `\n${truncatedDescription}` : ''}
    ⤷ \`✏️\` **${formatText(changedFiles, 'files')}** changed with \`🟢\` **${formatText(additions, 'additions')}** and \`🔴\` **${formatText(deletions, 'deletions')}**.
    ⤷ \`🕒\` **Created at:** ${formatDate(createdAt)}
    ${mergedAt ? `⤷ \`🔀\` **Merged at:** ${formatDate(mergedAt)}\n` : ''}⤷ \`🚥\` **State:** ${state.toUpperCase()}${state.toUpperCase() !== action.toUpperCase() ? ` (${action.toUpperCase()})` : ''}`;

  const embed = {
    author: {
      name: creator,
      url: htmlUrl,
      icon_url: creatorUrl,
    },
    title: `[${repoName}] Pull Request: ${title}`,
    url: url,
    description: descriptionText.trim(),
    color: color,
  };

  return embed;
}
