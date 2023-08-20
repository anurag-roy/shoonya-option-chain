import { instrument } from '@prisma/client';

export type AuthStatus = 'authorized' | 'unauthorized';

export interface UiInstrument extends instrument {
  bid: number;
  ask: number;
}

export interface AllInstrument extends instrument {
  bid: number;
  value: number;
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
    }
  | {
      action: 'option-remove';
      data: {
        token: string;
      };
    };

export type AllSocketData =
  | {
      action: 'init';
      data: {
        options: AllInstrument[];
      };
    }
  | {
      action: 'option-update';
      data: {
        token: string;
        bid: number;
      };
    }
  | {
      action: 'option-remove';
      data: {
        token: string;
      };
    };
