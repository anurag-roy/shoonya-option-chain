import { instrument } from '@prisma/client';

export type AuthStatus = 'authorized' | 'unauthorized';

export interface UiInstrument extends instrument {
  bid: number;
  ask: number;
}

export type SocketData =
  | {
      action: 'init';
      data: {
        ltp: number;
        previousClose: number;
        options: UiInstrument[];
      };
    }
  | {
      action: 'ltp-update';
      data: {
        ltp: number;
      };
    }
  | {
      action: 'option-update';
      data: {
        token: string;
        bid?: number;
        ask?: number;
      };
    };
