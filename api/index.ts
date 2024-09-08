import { VercelRequest, VercelResponse } from '@vercel/node'

export default (req: VercelRequest, res: VercelResponse) => {
  res.status(200).send(`
    <h1>GitHub to Discord Notifier Webhook</h1>
    <p>GitHub to Discord Notifier Webhook is running! 🚀</p>
  `);
};