import { AllInstrument, AllSocketData } from '@/types';
import { playAlert } from '@/utils/alerts';
import { getRandomIndex, getReturnValue } from '@/utils/ui';
import { memo, useEffect, useRef, useState } from 'react';
import { AllTableRow } from './AllTableRow';
import { OrderModal } from './OrderModal';

type Props = {
  expiry: string;
  percent: number;
  entryValue: number;
};

export const AllTable = memo(({ expiry, percent, entryValue }: Props) => {
  const [instruments, setInstruments] = useState<AllInstrument[]>([]);
  const instrumentsRef = useRef<AllInstrument[]>([]);
  const [selectedStock, setSelectedStock] = useState<AllInstrument | null>(
    null
  );
  const currentIndex = useRef(0);
  const randomMarginFetches = useRef<number[]>([]);

  const getReturn = async (instrument: AllInstrument) =>
    new Promise<number | undefined>((resolve) => {
      let apiResponded = false;
      let timedOut = false;
      let returnValue: number | undefined;

      setTimeout(() => {
        if (apiResponded) resolve(returnValue);
        else timedOut = true;
      }, 600);

      getReturnValue(instrument).then((ret) => {
        if (timedOut) resolve(ret);
        else {
          returnValue = ret;
          apiResponded = true;
        }
      });
    });

  const updateReturn = async () => {
    console.log('Current index is', currentIndex.current);
    if (instrumentsRef.current.length > 200) {
      if (randomMarginFetches.current.length === 100) {
        randomMarginFetches.current = [];
        currentIndex.current = 0;
      }

      if (currentIndex.current > 100) {
        // TODO: Check if it has already been calculated
        currentIndex.current = getRandomIndex(
          101,
          instrumentsRef.current.length
        );
      }
    } else {
      if (currentIndex.current === instrumentsRef.current.length) {
        currentIndex.current = 0;
      }
    }

    const instrument = instrumentsRef.current[currentIndex.current];
    console.log('Current instrument is', instrument);
    if (!instrument) {
      currentIndex.current = 0;
      updateReturn();
    }

    console.log('Fetching return value');
    getReturn(instrument)
      .then((ret) => {
        currentIndex.current++;
        if (!ret) return;

        const foundIndex = instrumentsRef.current.findIndex(
          (i) => i.token === instrument.token
        );
        if (foundIndex > -1) {
          instrumentsRef.current[foundIndex] = {
            ...instrumentsRef.current[foundIndex],
            return: ret,
          };
          instrumentsRef.current.sort((a, b) => b.return - a.return);
        }
        setInstruments((instruments) =>
          instruments
            .map((i) => {
              if (i.token === instrument.token) {
                return {
                  ...i,
                  return: ret,
                };
              } else {
                return i;
              }
            })
            .sort((a, b) => b.return - a.return)
        );
      })
      .then(updateReturn);
  };

  useEffect(() => {
    if (expiry) {
      const ws = new WebSocket(
        `ws://localhost:3000/api/allWss?expiry=${encodeURIComponent(
          expiry
        )}&percent=${percent}&entryValue=${entryValue}`
      );

      ws.onmessage = (event) => {
        const { action, data } = JSON.parse(event.data) as AllSocketData;
        if (action === 'option-init') {
          instrumentsRef.current.push(...data);
          instrumentsRef.current.sort((a, b) => b.return - a.return);
          setInstruments((instruments) =>
            [...instruments, ...data].sort((a, b) => b.return - a.return)
          );
        } else if (action === 'option-init-complete') {
          console.log('Option init complete starting updateReturn');
          updateReturn();
        } else if (action === 'option-add') {
          playAlert('add');
          instrumentsRef.current.push(data);
          instrumentsRef.current.sort((a, b) => b.return - a.return);
          setInstruments((instruments) =>
            [...instruments, data].sort((a, b) => b.return - a.return)
          );
        } else if (action === 'option-update') {
          playAlert('update');
          const foundIndex = instrumentsRef.current.findIndex(
            (i) => i.token === data.token
          );
          if (foundIndex > -1) {
            instrumentsRef.current[foundIndex] = {
              ...instrumentsRef.current[foundIndex],
              ...data,
            };
            instrumentsRef.current.sort((a, b) => b.return - a.return);
          }
          setInstruments((instruments) =>
            instruments
              .map((i) => {
                if (i.token === data.token) {
                  return {
                    ...i,
                    ...data,
                  };
                } else {
                  return i;
                }
              })
              .sort((a, b) => b.return - a.return)
          );
        } else if (action === 'option-remove') {
          playAlert('remove');
          const foundIndex = instrumentsRef.current.findIndex(
            (i) => i.token === data.token
          );
          if (foundIndex > -1) {
            instrumentsRef.current.splice(foundIndex, 1);
          }
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
            <th scope="col" className="pl-8 text-left">
              Option
            </th>
            <th scope="col">Buyer Price</th>
            <th scope="col">Return Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 overflow-y-auto bg-white text-zinc-900 dark:divide-white/10 dark:bg-zinc-900 dark:text-zinc-100">
          {instruments?.length === 0 ? (
            <tr>
              <td colSpan={3}>No data to display.</td>
            </tr>
          ) : (
            instruments.map((i) => (
              <AllTableRow
                key={i.token}
                i={i}
                onClick={() => setSelectedStock(i)}
              />
            ))
          )}
        </tbody>
      </table>
      {selectedStock && (
        <OrderModal
          open={Boolean(selectedStock)}
          setOpen={() => setSelectedStock(null)}
          i={selectedStock}
          price={selectedStock.bid}
        />
      )}
    </div>
  );
});
