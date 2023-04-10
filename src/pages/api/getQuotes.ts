import { getQuotes } from '@/utils/api';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  const { token } = req.query;

  const quotes = await getQuotes('NFO', token as string);

  res.json(quotes);
};

export default handler;
