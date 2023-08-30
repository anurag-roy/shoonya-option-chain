import { instrument } from '@prisma/client';

export type AuthStatus = 'authorized' | 'unauthorized';

export interface UiInstrument extends instrument {
  bid: number;
  ask: number;
}

export interface AllInstrument extends instrument {
  bid: number;
  value: number;
  return: number;
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
      action: 'option-init';
      data: AllInstrument[];
    }
  | {
      action: 'option-init-complete';
      data: null;
    }
  | {
      action: 'option-add';
      data: AllInstrument;
    }
  | {
      action: 'option-update';
      data: {
        token: string;
        bid: number;
        value: number;
      };
    }
  | {
      action: 'option-remove';
      data: {
        token: string;
      };
    };
