import { AllInstrument, AllSocketData } from '@/types';
import { memo, useEffect, useState } from 'react';
import { AllTableRow } from './AllTableRow';

type Props = {
  expiry: string;
  percent: number;
  entryValue: number;
};

export const AllTable = memo(({ expiry, percent, entryValue }: Props) => {
  const [instruments, setInstruments] = useState<AllInstrument[]>([]);

  useEffect(() => {
    if (expiry) {
      const ws = new WebSocket(
        `ws://localhost:3000/api/allWss?expiry=${encodeURIComponent(
          expiry
        )}&percent=${percent}&entryValue=${entryValue}`
      );

      ws.onmessage = (event) => {
        const { action, data } = JSON.parse(event.data) as AllSocketData;
        if (action === 'init') {
          setInstruments((instruments) =>
            [...instruments, ...data.options].sort((a, b) => b.value - a.value)
          );
        } else if (action === 'option-update') {
          setInstruments((instruments) =>
            instruments
              .map((i) => {
                if (i.token === data.token) {
                  return {
                    ...i,
                    ...data,
                    value: (data.bid - 0.05) * i.lotSize,
                  };
                } else {
                  return i;
                }
              })
              .sort((a, b) => b.value - a.value)
          );
        } else if (action === 'option-remove') {
          setInstruments((instruments) =>
            instruments.filter((i) => i.token !== data.token)
          );
        }
      };
      //clean up function
      return () => ws.close();
    }
  }, []);

  return (
    <div className="mx-auto mt-8 max-h-[50vh] max-w-5xl resize-y overflow-y-auto rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
      <table className="min-w-full divide-y divide-zinc-300 dark:divide-white/10">
        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
          <tr className="divide-x divide-zinc-200 dark:divide-white/10">
            <th scope="col">Option</th>
            <th scope="col">Buyer Price</th>
            <th scope="col">Total Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 overflow-y-auto bg-white text-zinc-900 dark:divide-white/10 dark:bg-zinc-900 dark:text-zinc-100">
          {instruments?.length === 0 ? (
            <tr>
              <td colSpan={3}>No data to display.</td>
            </tr>
          ) : (
            instruments.map((i) => <AllTableRow key={i.token} i={i} />)
          )}
        </tbody>
      </table>
    </div>
  );
});
