import { handlePushEvent, handlePullRequestEvent } from '../handlers/eventHandler';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    if (req.method === 'POST') {
      const eventType = req.headers['x-github-event'];
      
      switch (eventType) {
        case 'push':
          await handlePushEvent(req, res);
          break;
        case 'pull_request':
          await handlePullRequestEvent(req, res);
          break;
        default:
          console.log(`Unsupported event type: ${eventType}`);
          res.status(400).send(`Unsupported event type: ${eventType}`);
      }
    } else {
      res.status(405).send('Method not allowed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};
