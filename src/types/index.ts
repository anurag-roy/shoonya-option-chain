import { instrument } from '@prisma/client';

export type AuthStatus = 'authorized' | 'unauthorized';

export type ShoonyaInstrument = {
  exchange: string;
  token: string;
  lotSize: number;
  symbol: string;
  tradingSymbol: string;
  expiry: string;
  instrument: string;
  optionType: string;
  strikePrice: number;
  tickSize: string;
};

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
        token: number;
        bid: number;
        ask: number;
      };
    };
