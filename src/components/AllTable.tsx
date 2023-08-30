import { AllInstrument, AllSocketData } from '@/types';
import { playAlert } from '@/utils/alerts';
import { classNames, getRandomIndex, getReturnValue } from '@/utils/ui';
import autoAnimate from '@formkit/auto-animate';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  CurrencyRupeeIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { memo, useEffect, useRef, useState } from 'react';
import { AllTableRow } from './AllTableRow';
import { OrderModal } from './OrderModal';

type Props = {
  expiry: string;
  percent: number;
  entryValue: number;
};

type Activity = {
  id: number;
  message: string;
  time: Date;
  icon: any;
  iconBackground: string;
};

export const AllTable = memo(({ expiry, percent, entryValue }: Props) => {
  const FETCH_INTERVAL = 2000;

  const [instruments, setInstruments] = useState<AllInstrument[]>([]);
  const instrumentsRef = useRef<AllInstrument[]>([]);
  const [selectedStock, setSelectedStock] = useState<AllInstrument | null>(
    null
  );
  const currentIndex = useRef(0);
  const randomMarginFetches = useRef<number[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);

  const parent = useRef(null);

  const getReturn = async (instrument: AllInstrument) =>
    new Promise<number | undefined>((resolve) => {
      let apiResponded = false;
      let timedOut = false;
      let returnValue: number | undefined;

      setTimeout(() => {
        if (apiResponded) resolve(returnValue);
        else timedOut = true;
      }, FETCH_INTERVAL);

      getReturnValue(instrument).then((ret) => {
        if (timedOut) resolve(ret);
        else {
          returnValue = ret;
          apiResponded = true;
        }
      });
    });

  const updateReturn = async () => {
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
    if (!instrument) {
      currentIndex.current = 0;
      updateReturn();
    }

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
          const newIndex = instrumentsRef.current.findIndex(
            (i) => i.token === instrument.token
          );
          if (newIndex !== foundIndex) {
            setActivity((activity) => [
              {
                id: Date.now(),
                message: `${instrument.tradingSymbol} moved from position ${
                  foundIndex + 1
                } to ${newIndex + 1}`,
                time: new Date(),
                icon:
                  newIndex < foundIndex
                    ? ArrowUpCircleIcon
                    : ArrowDownCircleIcon,
                iconBackground:
                  newIndex < foundIndex ? 'bg-green-600' : 'bg-red-600',
              },
              ...activity,
            ]);
          }
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
          setActivity((activity) => [
            {
              id: Date.now(),
              message: `Added ${data.tradingSymbol}`,
              time: new Date(),
              icon: PlusCircleIcon,
              iconBackground: 'bg-emerald-600',
            },
            ...activity,
          ]);
          instrumentsRef.current.push(data);
          instrumentsRef.current.sort((a, b) => b.return - a.return);
          setInstruments((instruments) =>
            [...instruments, data].sort((a, b) => b.return - a.return)
          );
        } else if (action === 'option-update') {
          const foundIndex = instrumentsRef.current.findIndex(
            (i) => i.token === data.token
          );
          if (foundIndex > -1) {
            playAlert('update');
            const instrument = instrumentsRef.current[foundIndex];
            setActivity((activity) => [
              {
                id: Date.now(),
                message: `Updated price for ${instrument.tradingSymbol} from ${instrument.bid} to ${data.bid}`,
                time: new Date(),
                icon: CurrencyRupeeIcon,
                iconBackground:
                  data.bid > instrument.bid ? 'bg-green-600' : 'bg-red-600',
              },
              ...activity,
            ]);
            instrument.bid = data.bid;
          }
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
          playAlert('remove');
          const foundIndex = instrumentsRef.current.findIndex(
            (i) => i.token === data.token
          );
          if (foundIndex > -1) {
            const instrument = instrumentsRef.current[foundIndex];
            setActivity((activity) => [
              {
                id: Date.now(),
                message: `Removed ${instrument.tradingSymbol}`,
                time: new Date(),
                icon: XCircleIcon,
                iconBackground: 'bg-rose-600',
              },
              ...activity,
            ]);
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

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  return (
    <>
      <div className="mx-auto mt-8 max-h-[50vh] max-w-5xl resize-y overflow-y-auto rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
        <table className="min-w-full divide-y divide-zinc-300 dark:divide-white/10">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <th scope="col" className="pl-8 text-left">
                Options ({instruments.length})
              </th>
              <th scope="col">Buyer Price</th>
              <th scope="col">Return Value</th>
            </tr>
          </thead>
          <tbody
            ref={parent}
            className="divide-y divide-zinc-200 overflow-y-auto bg-white text-zinc-900 dark:divide-white/10 dark:bg-zinc-900 dark:text-zinc-100"
          >
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
      </div>
      <div className="mx-auto mt-8 flow-root max-w-5xl">
        <ul role="list" className="-mb-8 max-w-2xl">
          {activity.map((a, aIdx) => (
            <li key={a.id}>
              <div className="relative pb-8">
                {aIdx !== activity.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={classNames(
                        a.iconBackground,
                        'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white'
                      )}
                    >
                      <a.icon
                        className="h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">{a.message}</p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time>{a.time.toLocaleTimeString().substring(0, 5)}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {selectedStock && (
        <OrderModal
          open={Boolean(selectedStock)}
          setOpen={() => setSelectedStock(null)}
          i={selectedStock}
          price={selectedStock.bid}
        />
      )}
    </>
  );
});
