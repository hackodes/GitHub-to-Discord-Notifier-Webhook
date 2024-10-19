import { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchCommits } from "../helpers/fetchCommits";
import { readPullRequestData } from '../helpers/readPullRequestData';
import { createPushEventEmbed, createPullRequestEmbed } from '../helpers/createEmbeds';

import { chunkItems } from '../utils';

import axios from 'axios';
import config from '../config.json';

const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;
const avatarUrl = config.avatarURL;

export async function handlePushEvent(req: VercelRequest, res: VercelResponse) {
  const data = req.body;
  const ownerName = data.repository.owner.name;
  const ownerAvatar = data.repository.owner.avatar_url;
  const ownerRepo = data.repository.full_name;
  const branch = data.ref.split('/').pop();

  try {
    const commits = await fetchCommits(data);

    const embeds = createPushEventEmbed(commits, { ownerName, ownerAvatar, ownerRepo, branch });

    const payloads = chunkItems(embeds, 10).map((embedChunk) => ({
      username: config.botName,
      avatar_url: avatarUrl,
      embeds: embedChunk,
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
    res.status(500).send('Error processing push event');
  }
}

export async function handlePullRequestEvent(req: VercelRequest, res: VercelResponse) {
  const pullRequestData = readPullRequestData(req);

  const embed = createPullRequestEmbed(pullRequestData);

  const payload = {
    username: config.botName,
    avatar_url: avatarUrl,
    embeds: [embed],
  };

  try {
    const response = await axios.post(webhookUrl, payload);
    
    if (response.status === 204) {
      res.status(200).send('Message sent successfully');
    } else {
      res.status(500).send('Error sending message');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing pull request event');
  }
}
