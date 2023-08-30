import { CUSTOM_PERCENT, STOCKS_TO_INCLUDE } from '@/config';
import { AllInstrument, AllSocketData } from '@/types';
import { TouchlineResponse } from '@/types/shoonya';
import { getQuotes } from '@/utils/api';
import { getInstrumentsToSubscribe } from '@/utils/db';
import {
  getActionOnTick,
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

    const tokenToInstrumentMap = new Map<string, AllInstrument>();

    if (expiry && !Number.isNaN(percent) && !Number.isNaN(entryValue)) {
      const ws = await getNewTicker();
      ws.onmessage = (messageEvent: MessageEvent) => {
        const messageData = JSON.parse(messageEvent.data as string);
        if (messageData.t !== 'tf') return;

        const data = messageData as TouchlineResponse;
        if (!('bp1' in data)) return;
        const bid = Number(data.bp1);

        const instrument = tokenToInstrumentMap.get(data.tk);
        if (!instrument) return;

        const value = (bid - 0.05) * instrument.lotSize;
        const updatedInstrument = { ...instrument, bid, value };
        tokenToInstrumentMap.set(data.tk, updatedInstrument);

        const action = getActionOnTick(entryValue, instrument.value, value);
        if (!action) return;

        let message: AllSocketData;
        switch (action) {
          case 'option-add':
            message = {
              action: 'option-add',
              data: updatedInstrument,
            };
            break;
          case 'option-update':
            message = {
              action: 'option-update',
              data: {
                token: data.tk,
                bid: Number(data.bp1),
                value: value,
              },
            };
            break;
          case 'option-remove':
            message = {
              action: 'option-remove',
              data: {
                token: data.tk,
              },
            };
            break;
        }
        if (message) client.send(JSON.stringify(message));
      };

      // Actions on socket client disconnecting
      client.on('close', () => {
        ws.close();
      });

      const tempWs = await getNewTicker();

      // Get initial stocks from DB
      console.log('Starting initialization...');
      for (const stockName of STOCKS_TO_INCLUDE) {
        console.log(`Fetching data for ${stockName}...`);
        const { equityStock, optionsStocks } = await getInstrumentsToSubscribe(
          stockName,
          expiry
        );

        // Get LTP to calculate lower bound and upper bound
        const response = await getQuotes('NSE', equityStock.token);
        const ltp = Number(response.lp);

        const effectivePercent = CUSTOM_PERCENT[stockName] ?? percent;
        const lowerBound = ((100 - effectivePercent) * ltp) / 100;
        const upperBound = ((100 + effectivePercent) * ltp) / 100;

        // Compute filtered stocks to send to socket client
        const validInstruments = await getValidInstruments(
          tempWs,
          optionsStocks,
          lowerBound,
          upperBound
        );

        const instrumentsToSend = validInstruments.filter(
          (i) => i.value > entryValue
        );
        console.log(
          `${instrumentsToSend.length} options satisfied entry condition`
        );
        // for (const i of instrumentsToSend) {
        //   i.return = await getReturnValue(i);
        // }

        // Send client init data
        client.send(
          JSON.stringify({
            action: 'option-init',
            data: instrumentsToSend,
          })
        );
        validInstruments.forEach((i) => tokenToInstrumentMap.set(i.token, i));
        subscribeToTokens(
          validInstruments.map((i) => `NFO|${i.token}`),
          ws
        );
      }

      client.send(
        JSON.stringify({ action: 'option-init-complete', data: null })
      );
      console.log('Initialization complete!');
      tempWs.close();
    }
  }
};

const handler: NextApiHandler = (_req, res) => {
  res.status(405).end();
};

export default handler;
