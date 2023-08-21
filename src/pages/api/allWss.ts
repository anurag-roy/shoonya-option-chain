import { CUSTOM_PERCENT, STOCKS_TO_INCLUDE } from '@/config';
import { AllSocketData } from '@/types';
import { TouchlineResponse } from '@/types/shoonya';
import { getQuotes } from '@/utils/api';
import { getInstrumentsToSubscribe } from '@/utils/db';
import {
  getNewTicker,
  getValidInstruments,
  subscribeToTokens,
} from '@/utils/socket';
import { NextApiHandler } from 'next';
import { NextWebSocketHandler } from 'next-plugin-websocket';
import { MessageEvent } from 'ws';

export const socket: NextWebSocketHandler = async (client, req) => {
  if (req.url) {
    const url = new URL(req.url, 'http://localhost:3000');
    const expiry = url.searchParams.get('expiry');
    const percent = Number(url.searchParams.get('percent'));
    const entryValue = Number(url.searchParams.get('entryValue'));

    if (expiry && !Number.isNaN(percent) && !Number.isNaN(entryValue)) {
      const ws = await getNewTicker();
      ws.onmessage = (messageEvent: MessageEvent) => {
        const messageData = JSON.parse(messageEvent.data as string);
        if (messageData.t === 'tf') {
          const data = messageData as TouchlineResponse;

          if ('bp1' in data) {
            const message: AllSocketData = {
              action: 'option-update',
              data: {
                token: data.tk,
                bid: Number(data.bp1),
              },
            };
            client.send(JSON.stringify(message));
          }
        }
      };

      const tempWs = await getNewTicker();

      // Actions on socket client disconnecting
      client.on('close', () => {
        ws.close();
      });

      // Get initial stocks from DB
      for (const stockName of STOCKS_TO_INCLUDE) {
        console.time(stockName);
        const { equityStock, optionsStocks } = await getInstrumentsToSubscribe(
          stockName,
          expiry
        );

        // Get LTP to calculate lower bound and upper bound
        const response = await getQuotes('NSE', equityStock.token);
        const ltp = Number(response.lp);
        console.log(`LTP for ${stockName} is`, ltp);

        const effectivePercent = CUSTOM_PERCENT[stockName] ?? percent;
        const lowerBound = ((100 - effectivePercent) * ltp) / 100;
        const upperBound = ((100 + effectivePercent) * ltp) / 100;
        console.log('Lowerbound:', lowerBound);
        console.log('Upperbound:', upperBound);

        // Compute filtered stocks to send the scoket client
        const validInstruments = await getValidInstruments(
          tempWs,
          optionsStocks,
          entryValue,
          lowerBound,
          upperBound
        );
        console.log(
          `Valid instruments for ${stockName}: `,
          validInstruments.length
        );

        // Send client init data
        client.send(
          JSON.stringify({
            action: 'init',
            data: {
              options: validInstruments,
            },
          })
        );
        console.timeEnd(stockName);
        subscribeToTokens(
          validInstruments.map((i) => `NFO|${i.token}`),
          ws
        );
      }

      tempWs.close();
    }
  }
};

const handler: NextApiHandler = (_req, res) => {
  res.status(405).end();
};

export default handler;
