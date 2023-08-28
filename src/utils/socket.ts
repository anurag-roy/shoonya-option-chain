import env from '@/env.json';
import { ticker } from '@/globals/ticker';
import { AllInstrument } from '@/types';
import { TouchlineResponse } from '@/types/shoonya';
import { instrument } from '@prisma/client';
import { MessageEvent, WebSocket } from 'ws';

export const sendConnectMessage = () => {
  if (ticker.OPEN) {
    ticker.send(
      JSON.stringify({
        t: 'c',
        uid: env.USER_ID,
        actid: env.USER_ID,
        susertoken: process.env.token,
        source: 'API',
      })
    );
  } else {
    console.error('Ticker is not open. Cannot send connect message');
  }
};

export const subscribeToTokens = (tokens: string[], ws?: WebSocket) => {
  (ws ?? ticker).send(
    JSON.stringify({
      t: 't',
      k: tokens.join('#'),
    })
  );
};

export const unsubscribeFromTokens = (tokens: string[], ws?: WebSocket) => {
  (ws ?? ticker).send(
    JSON.stringify({
      t: 'u',
      k: tokens.join('#'),
    })
  );
};

export const getNewTicker = async () =>
  new Promise<WebSocket>((resolve, reject) => {
    if (!process.env.token) reject('No token found in env');

    const ws = new WebSocket('wss://api.shoonya.com/NorenWSTP/');

    ws.onerror = (error) => {
      reject('Ticker error:' + error);
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          t: 'c',
          uid: env.USER_ID,
          actid: env.USER_ID,
          susertoken: process.env.token,
          source: 'API',
        })
      );
    };

    ws.onmessage = (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(messageEvent.data as string);
      if (messageData.t === 'ck' && messageData.s === 'OK') {
        console.log('Ticker connected successfully!');
        ws.onerror = null;
        resolve(ws);
      }
    };
  });

export const getValidInstruments = async (
  ws: WebSocket,
  instruments: instrument[],
  lowerBound: number,
  upperBound: number
) =>
  new Promise<AllInstrument[]>((resolve) => {
    let responseReceived = 0;
    const validInstruments: AllInstrument[] = [];

    const filteredInstruments = instruments.filter(
      (s) =>
        (s.strikePrice <= lowerBound && s.optionType === 'PE') ||
        (s.strikePrice >= upperBound && s.optionType === 'CE')
    );
    const tokensToSubscribe = filteredInstruments
      .map((s) => `NFO|${s.token}`)
      .join('#');

    // Timeout after 3 seconds, because sometimes Shoonya doesn't return an
    // acknowledgement for all the tokens
    const timeout = setTimeout(() => {
      ws.send(
        JSON.stringify({
          t: 'u',
          k: tokensToSubscribe,
        })
      );
      resolve(validInstruments);
    }, 3000);

    ws.onmessage = (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(
        messageEvent.data as string
      ) as TouchlineResponse;

      if (messageData.t === 'tk' && 'oi' in messageData && messageData.bp1) {
        const foundInstrument = instruments.find(
          (i) => i.token === messageData.tk
        )!;
        const value =
          (Number(messageData.bp1) - 0.05) * foundInstrument.lotSize;
        validInstruments.push({
          ...foundInstrument,
          bid: Number(messageData.bp1),
          value,
        });
      }

      responseReceived++;
      // If all responses received, resolve
      if (responseReceived === filteredInstruments.length) {
        ws.send(
          JSON.stringify({
            t: 'u',
            k: tokensToSubscribe,
          })
        );
        clearTimeout(timeout);
        resolve(validInstruments);
      }
    };

    ws.send(
      JSON.stringify({
        t: 't',
        k: tokensToSubscribe,
      })
    );
  });

export const getActionOnTick = (
  value: number,
  oldValue: number,
  newValue: number
) => {
  if (newValue >= value) {
    return oldValue >= value ? 'option-update' : 'option-add';
  } else {
    return oldValue >= value ? 'option-remove' : null;
  }
};
