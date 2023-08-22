import env from '@/env.json';
import { PrismaClient } from '@prisma/client';
import { injectTokenIntoEnv } from './utils/api';

let useless = 0;

await injectTokenIntoEnv();
const ws = new WebSocket('wss://api.shoonya.com/NorenWSTP/');

ws.onopen = () => {
  console.log('Ticker initialized and ready to connect...');

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

ws.onclose = () => {
  console.log('Ticker connection closed.');
};

ws.onerror = (error) => {
  console.log('Ticker error', error);
};

ws.onmessage = (messageEvent: MessageEvent) => {
  const messageData = JSON.parse(messageEvent.data as string);
  if (messageData.t === 'ck' && messageData.s === 'OK') {
    console.log('Ticker connected successfully!');

    main();
  }
};

const checkTokens = async (tokens: string[]) =>
  new Promise<void>((resolve) => {
    let responseReceived = 0;
    ws.onmessage = (messageEvent: MessageEvent) => {
      const messageData = JSON.parse(messageEvent.data as string);
      if (messageData.t !== 'tk') {
        console.log(messageData);
      }
      if (messageData.t === 'tk') {
        if (!('oi' in messageData)) {
          useless++;
        }
        responseReceived++;
        console.log('Response received', responseReceived);
        if (responseReceived === tokens.length) {
          console.log('Unsubscribing');
          ws.send(
            JSON.stringify({
              t: 'u',
              k: tokens.map((t) => `NFO|${t}`).join('#'),
            })
          );
          resolve();
        }
      }
    };

    console.log('Subscribing to', tokens.length);
    ws.send(
      JSON.stringify({
        t: 't',
        k: tokens.map((t) => `NFO|${t}`).join('#'),
      })
    );
  });

async function main() {
  const db = new PrismaClient();

  const numberOfRecords = 39992;
  const BATCH_SIZE = 200;

  for (let i = 0; i < numberOfRecords; i = i + BATCH_SIZE) {
    const instruments = await db.instrument.findMany({
      where: {
        expiry: '31-AUG-2023',
        optionType: {
          in: ['CE', 'PE'],
        },
      },
      orderBy: {
        token: 'asc',
      },
      take: BATCH_SIZE,
      skip: i,
    });
    await checkTokens(instruments.map((i) => i.token));
    console.log(`Finished checking for ${i} items`);
    console.log('Current useless stocks:', useless);
  }

  console.log('Final useless stocks:', useless);
  ws.close();
}
