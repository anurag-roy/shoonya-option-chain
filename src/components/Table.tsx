import { DIFF_PERCENT } from '@/config';
import { SocketData, UiInstrument } from '@/types';
import { classNames } from '@/utils/ui';
import { memo, useEffect, useState } from 'react';
import { TableRow } from './TableRow';

type Props = {
  name: string;
  expiry: string;
};

export const Table = memo(({ name, expiry }: Props) => {
  const [ltp, setLtp] = useState(0);
  const [previousClose, setPreviousClose] = useState(0);
  const [instruments, setInstruments] = useState<UiInstrument[]>([]);

  const filteredInstruments = instruments?.filter((i) => {
    if (!ltp) return true;
    return (
      (i.strikePrice <= ((100 - DIFF_PERCENT) * ltp) / 100 &&
        i.optionType === 'PE') ||
      (i.strikePrice >= ((100 + DIFF_PERCENT) * ltp) / 100 &&
        i.optionType === 'CE')
    );
  });

  const diff = ltp - previousClose;

  useEffect(() => {
    if (name && expiry) {
      console.log('Connecting websocket');

      const ws = new WebSocket(
        `ws://localhost:3000/api/wss?name=${encodeURIComponent(
          name
        )}&expiry=${encodeURIComponent(expiry)}`
      );

      ws.onopen = () => {
        console.log('Connected!');
      };

      ws.onmessage = (event) => {
        const { action, data } = JSON.parse(event.data) as SocketData;
        if (action === 'init') {
          setLtp(data.ltp);
          setPreviousClose(data.previousClose);
          setInstruments(data.options);
        } else if (action === 'option-update') {
          setInstruments((instruments) =>
            instruments.map((i) => {
              if (i.token === data.token) {
                return {
                  ...i,
                  ...data,
                };
              } else {
                return i;
              }
            })
          );
        } else if (action === 'option-remove') {
          setInstruments((instruments) =>
            instruments.filter((i) => i.token !== data.token)
          );
        } else if (action === 'ltp-update') {
          setLtp(data.ltp);
        }
      };
      //clean up function
      return () => ws.close();
    }
  }, []);

  return (
    <div>
      <div className="p-2 flex items-baseline gap-4 text-zinc-900 dark:text-zinc-200">
        <h3 className="text-xl font-bold">{name}</h3>
        <span className="font-semibold">{ltp}</span>
        <span
          className={classNames(
            'text-sm font-semibold',
            diff < 0 ? 'text-red-600' : 'text-green-600'
          )}
        >
          {diff < 0 ? '↓ ' : '↑ '}
          {Math.abs(diff).toFixed(2)}
        </span>
        <p className="text-sm font-semibold"></p>
      </div>
      <div className="resize-y max-h-[50vh] bg-white dark:bg-zinc-900 overflow-y-auto ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-lg">
        <table className="min-w-full divide-y divide-zinc-300 dark:divide-white/10">
          <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0">
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <th scope="col">Strike</th>
              <th scope="col" className="min-w-[5ch]">
                Bid
              </th>
              <th scope="col" className="min-w-[5ch]">
                Ask
              </th>
              <th scope="col" className="min-w-[5ch]">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="text-zinc-900 dark:text-zinc-100 divide-y divide-zinc-200 dark:divide-white/10 bg-white dark:bg-zinc-900 overflow-y-auto">
            {filteredInstruments?.length === 0 ? (
              <tr>
                <td colSpan={4}>No data to display.</td>
              </tr>
            ) : (
              filteredInstruments.map((i) => <TableRow key={i.token} i={i} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
