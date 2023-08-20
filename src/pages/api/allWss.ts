import { STOCKS_TO_INCLUDE } from '@/config';
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

export const socket: NextWebSocketHandler = async (client, req) => {
  if (req.url) {
    const url = new URL(req.url, 'http://localhost:3000');
    const expiry = url.searchParams.get('expiry');
    const percent = Number(url.searchParams.get('percent'));
    const entryPrice = Number(url.searchParams.get('entryPrice'));

    if (expiry && !Number.isNaN(percent) && !Number.isNaN(entryPrice)) {
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
        const { equityStock, optionsStocks } = await getInstrumentsToSubscribe(
          stockName,
          expiry
        );

        // Get LTP to calculate lower bound and upper bound
        const response = await getQuotes('NSE', equityStock.token);
        const ltp = Number(response.lp);
        const lowerBound =
          equityStock.symbol === 'ADANIENT'
            ? 0.5 * ltp
            : ((100 - 0.75 * percent) * ltp) / 100;
        const upperBound =
          equityStock.symbol === 'ADANIENT'
            ? 1.5 * ltp
            : ((100 + 0.75 * percent) * ltp) / 100;

        // Compute filtered stocks to send the scoket client
        const validInstruments = await getValidInstruments(
          tempWs,
          optionsStocks,
          entryPrice,
          lowerBound,
          upperBound
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
