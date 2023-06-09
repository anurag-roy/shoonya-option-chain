import env from '@/env.json';
import { SocketData } from '@/types';
import { TouchlineResponse } from '@/types/shoonya';
import { MessageEvent, WebSocket } from 'ws';
import { GlobalRef } from './GlobalRef';
import { clients, tokenMap } from './maps';

const ws = new GlobalRef<WebSocket>('myapp.ticker');
if (!ws.value) {
  ws.value = new WebSocket('wss://api.shoonya.com/NorenWSTP/');
  ws.value.onopen = () => {
    console.log('Ticker initialized and ready to connect...');

    if (process.env.token) {
      ws.value.send(
        JSON.stringify({
          t: 'c',
          uid: env.USER_ID,
          actid: env.USER_ID,
          susertoken: process.env.token,
          source: 'API',
        })
      );
    }
  };

  ws.value.onclose = () => {
    console.log('Ticker connection closed.');
  };

  ws.value.onerror = (error) => {
    console.log('Ticker error', error);
  };

  ws.value.onmessage = (messageEvent: MessageEvent) => {
    const messageData = JSON.parse(messageEvent.data as string);
    if (messageData.t === 'tk') {
      const socketId = tokenMap.get(messageData.tk);
      if (!socketId) {
        return;
      }

      const socketClient = clients.get(socketId)!;
      if (!socketClient) {
        return;
      }

      if (messageData.e === 'NFO' && !('oi' in messageData)) {
        let message: SocketData = {
          action: 'option-remove',
          data: {
            token: messageData.tk,
          },
        };
        ws.value.send(
          JSON.stringify({
            t: 'u',
            k: `NFO|${messageData.tk}`,
          })
        );
        socketClient?.send(JSON.stringify(message));
      } else {
        let message: SocketData;
        if (messageData.e === 'NSE' && 'lp' in messageData) {
          message = {
            action: 'ltp-update',
            data: {
              ltp: Number(messageData.lp),
            },
          };
        } else {
          message = {
            action: 'option-update',
            data: {
              token: messageData.tk,
            },
          };
          if ('bp1' in messageData) {
            message.data.bid = Number(messageData.bp1);
          }
          if ('sp1' in messageData) {
            message.data.ask = Number(messageData.sp1);
          }
        }
        socketClient?.send(JSON.stringify(message));
      }
    } else if (messageData.t === 'tf') {
      const data = messageData as TouchlineResponse;
      const socketId = tokenMap.get(data.tk);
      if (!socketId) {
        return;
      }

      const socketClient = clients.get(socketId)!;
      if (!socketClient) {
        return;
      }

      let message: SocketData;
      if (data.e === 'NSE' && 'lp' in data) {
        message = {
          action: 'ltp-update',
          data: {
            ltp: Number(data.lp),
          },
        };
      } else {
        message = {
          action: 'option-update',
          data: {
            token: data.tk,
          },
        };
        if ('bp1' in data) {
          message.data.bid = Number(data.bp1);
        }
        if ('sp1' in data) {
          message.data.ask = Number(data.sp1);
        }
      }
      socketClient?.send(JSON.stringify(message));
    } else if (messageData.t === 'ck' && messageData.s === 'OK') {
      console.log('Ticker connected successfully!');
    }
  };
}

export const ticker = ws.value;
