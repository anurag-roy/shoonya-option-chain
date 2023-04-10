import env from '@/env.json';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  const { price, quantity, tradingSymbol } = req.body;

  const orderRes = await fetch(
    'https://api.shoonya.com/NorenWClientTP/PlaceOrder',
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
          ret: 'DAY',
        }) +
        `&jKey=${process.env.token}`,
    }
  );
  if (!orderRes.ok) {
    throw new Error(await orderRes.text());
  }
  const orderResult = await orderRes.json();

  res.json(orderResult);
};

export default handler;
