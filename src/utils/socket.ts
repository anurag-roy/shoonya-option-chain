import env from '@/env.json';
import { ticker } from '@/globals/ticker';

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

export const subscribeToTokens = (tokens: string[]) => {
  ticker.send(
    JSON.stringify({
      t: 't',
      k: tokens.join('#'),
    })
  );
};

export const unsubscribeFromTokens = (tokens: string[]) => {
  ticker.send(
    JSON.stringify({
      t: 'u',
      k: tokens.join('#'),
    })
  );
};
