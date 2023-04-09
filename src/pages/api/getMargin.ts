import env from '@/env.json';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  const { price, quantity, tradingSymbol } = req.query;

  const marginRes = await fetch(
    'https://api.shoonya.com/NorenWClientTP/GetOrderMargin',
    {
      method: 'POST',
      body:
        'jData=' +
        JSON.stringify({
          uid: env.USER_ID,
          actid: env.USER_ID,
          exch: 'NFO',
          tsym: tradingSymbol,
          qty: quantity,
          prc: price,
          prd: 'M',
          trantype: 'S',
          prctyp: 'LMT',
        }) +
        `&jKey=${process.env.token}`,
    }
  );
  if (!marginRes.ok) {
    throw new Error(await marginRes.text());
  }
  const margin = await marginRes.json();
  if (margin.stat !== 'Ok') {
    throw new Error(margin.emsg);
  }

  return res.json(margin);
};

export default handler;
