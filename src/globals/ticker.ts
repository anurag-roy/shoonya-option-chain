import { TouchlineResponse } from '@/types/shoonya';
import { MessageEvent, WebSocket } from 'ws';
import { GlobalRef } from './GlobalRef';
import { clients, tokenMap } from './maps';

const socket = new GlobalRef<WebSocket>('myapp.ticker');
if (!socket.value) {
  const ws = new WebSocket('wss://api.shoonya.com/NorenWSTP/');
  ws.onopen = () => {
    console.log('Ticker initialized...');
  };

  ws.onclose = () => {
    console.log('Ticker connection closed.');
  };

  ws.onerror = (error) => {
    console.log('Ticker error', error);
  };

  ws.onmessage = (messageEvent: MessageEvent) => {
    const data = JSON.parse(messageEvent.data as string) as TouchlineResponse;
    if (data.t === 'tk' || data.t === 'tf') {
      const socketId = tokenMap.get(data.tk);
      if (!socketId) {
        return;
      }

      const socketClient = clients.get(socketId)!;
      if (!socketClient) {
        return;
      }

      let message: any;
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
          message.action.data.bid = Number(data.bp1);
        }
        if ('sp1' in data) {
          message.action.data.ask = Number(data.sp1);
        }
      }
      socketClient?.send(JSON.stringify(message));
    }
  };
}

export const ticker = socket.value;
