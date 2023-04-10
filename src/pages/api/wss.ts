import { DIFF_PERCENT } from '@/config';
import { clients, tokenMap } from '@/globals';
import { UiInstrument } from '@/types';
import { getQuotes } from '@/utils/api';
import { getInstrumentsToSubscribe } from '@/utils/db';
import { subscribeToTokens, unsubscribeFromTokens } from '@/utils/socket';
import { NextApiHandler } from 'next';
import { NextWebSocketHandler } from 'next-plugin-websocket';

export const socket: NextWebSocketHandler = async (client, req) => {
  if (req.url) {
    const url = new URL(req.url, 'http://localhost:3000');
    const name = url.searchParams.get('name');
    const expiry = url.searchParams.get('expiry');

    if (name && expiry) {
      clients.set(name, client);

      // Actions on socket client disconnecting
      client.on('close', () => {
        // Remove from clients map
        clients.delete(name);

        // Unsubscribe ticker from all associated tokens
        const tokensToUnsubscribe: string[] = [];
        for (const [token, stockName] of tokenMap) {
          if (stockName === name) {
            tokensToUnsubscribe.push(token);
            tokenMap.delete(token);
          }
        }
        unsubscribeFromTokens(tokensToUnsubscribe);
      });

      // Get initial stocks from DB
      const { equityStock, optionsStocks } = await getInstrumentsToSubscribe(
        name,
        expiry
      );

      // Get LTP to calculate lower bound and upper bound
      const response = await getQuotes('NSE', equityStock.token);
      const ltp = Number(response.lp);
      const lowerBound =
        equityStock.symbol === 'ADANIENT'
          ? 0.5 * ltp
          : ((100 - 0.75 * DIFF_PERCENT) * ltp) / 100;
      const upperBound =
        equityStock.symbol === 'ADANIENT'
          ? 1.5 * ltp
          : ((100 + 0.75 * DIFF_PERCENT) * ltp) / 100;

      // Compute filtered stocks to send the scoket client
      const stocksToSubscribe = [`NSE|${equityStock.token}`];
      const filteredOptionStocks: UiInstrument[] = [];
      for (const stock of optionsStocks) {
        if (
          (stock.strikePrice <= lowerBound && stock.optionType === 'PE') ||
          (stock.strikePrice >= upperBound && stock.optionType === 'CE')
        ) {
          filteredOptionStocks.push({
            ...stock,
            bid: 0,
            ask: 0,
          });
          // Store token, to later unsubscribe easily
          tokenMap.set(stock.token, `NFO|${stock.token}`);
          stocksToSubscribe.push(`NFO|${stock.token}`);
        }
      }
      // Store the equity instrument as well
      tokenMap.set(equityStock.token, `NSE|${equityStock.token}`);

      // Send client init data
      client.send(
        JSON.stringify({
          action: 'init',
          data: {
            ltp: ltp,
            previousClose: Number(response.c),
            options: filteredOptionStocks,
          },
        })
      );

      subscribeToTokens(stocksToSubscribe);
    }
  }
};

const handler: NextApiHandler = (_req, res) => {
  res.status(405).end();
};

export default handler;
