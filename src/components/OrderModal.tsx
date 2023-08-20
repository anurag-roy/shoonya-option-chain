import { AllInstrument, UiInstrument } from '@/types';
import { MarginResponse, Quotes } from '@/types/shoonya';
import { classNames, displayInr } from '@/utils/ui';
import { Dialog, Transition } from '@headlessui/react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import {
  Dispatch,
  Fragment,
  SetStateAction,
  memo,
  useEffect,
  useState,
} from 'react';
import { BuyerTable } from './BuyerTable';
import { SellerTable } from './SellerTable';

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  i: UiInstrument | AllInstrument;
  price: number;
}

export const OrderModal = memo(
  ({ open, setOpen, i, price }: Props) => {
    const [quantity, setQuantity] = useState(1);
    const [margin, setMargin] = useState<MarginResponse | null>(null);
    const [netReturn, setNetReturn] = useState<string>('-');
    const [quote, setQuote] = useState<Quotes | null>(null);

    useEffect(() => {
      if (open) {
        const marginParams = new URLSearchParams();
        marginParams.append('price', price.toString());
        marginParams.append('quantity', (quantity * i.lotSize).toString());
        marginParams.append('tradingSymbol', i.tradingSymbol);
        fetch('/api/getMargin?' + marginParams.toString())
          .then((res) => res.json())
          .then((margin) => setMargin(margin));

        fetch('/api/getQuotes?token=' + i.token)
          .then((res) => res.json())
          .then((quote) => setQuote(quote));
      }
    }, [quantity, open]);

    useEffect(() => {
      if (margin) {
        const returnValue =
          (
            ((price - 0.05) * i.lotSize * quantity * 100) /
            Number(margin.ordermargin)
          ).toFixed(2) + '%';
        setNetReturn(returnValue);
      } else {
        setNetReturn('-');
      }
    }, [margin]);

    const placeSellOrder = () => {
      const body = {
        price: price.toString(),
        quantity: (i.lotSize * quantity).toString(),
        tradingSymbol: i.tradingSymbol,
      };
      fetch('/api/placeSellOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
        .then((_res) => {
          alert('Order placed successfully!');
          setOpen(false);
        })
        .catch((_err) => alert('Error while placing order'));
    };

    return (
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="td"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={setOpen}
        >
          <div className="m-auto block min-h-screen max-w-[80vw] text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-zinc-500 bg-opacity-75 transition-opacity dark:bg-zinc-800 dark:bg-opacity-75" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-0 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-0 scale-95"
            >
              <div className="relative my-8 inline-block min-w-[512px] transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900">
                <Dialog.Title
                  as="div"
                  className="-m-6 mb-12 flex flex-row items-center justify-between border-b border-zinc-500/20 bg-zinc-50 px-6 py-4 dark:bg-zinc-500/5"
                >
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {i.symbol} {i.strikePrice} {i.optionType}{' '}
                    {i.expiry.split('-')[1]}
                  </h3>
                  <button
                    type="button"
                    className="rounded-md bg-transparent text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>
                <div className="mb-8 flex items-start gap-12">
                  <BuyerTable quote={quote} />
                  <div className="mx-auto grid max-w-sm grid-cols-[auto,_auto] gap-6">
                    <div className="col-span-2 flex items-center gap-1 rounded-md bg-blue-50/50 px-4 py-3 text-blue-800 ring-1 ring-inset ring-blue-700/20 dark:border-blue-500/30 dark:bg-blue-500/5 dark:text-blue-200">
                      <InformationCircleIcon
                        className="h-4 w-4 fill-blue-600 dark:fill-blue-200/50"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-500">
                        Net Return on this margin is:
                      </span>
                      <span className="ml-2 text-xl font-bold">
                        {netReturn}
                      </span>
                    </div>
                    <div className="rounded-md bg-emerald-50/50 p-4 text-emerald-800 ring-1 ring-inset ring-emerald-700/20 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200">
                      <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-500">
                        Price
                      </h4>
                      <p className="text-2xl font-bold">{displayInr(price)}</p>
                    </div>
                    {margin?.remarks === 'Insufficient Balance' ? (
                      <div className="rounded-md bg-red-50/50 p-4 text-red-800 ring-1 ring-inset ring-red-700/20 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-200">
                        <h4 className="text-sm font-semibold text-red-700 dark:text-red-500">
                          Shortfall
                        </h4>
                        <p className="text-2xl font-bold">
                          {margin ? displayInr(Number(margin.marginused)) : '-'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-md bg-zinc-50/50 p-4 text-zinc-800 ring-1 ring-inset ring-zinc-700/20 dark:border-zinc-500/30 dark:bg-zinc-500/5 dark:text-zinc-200">
                          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-500">
                            Margin
                          </h4>
                          <p className="text-2xl font-bold">
                            {margin
                              ? displayInr(Number(margin.ordermargin))
                              : '-'}
                          </p>
                        </div>
                        <p className="col-span-2 text-right text-sm font-semibold">
                          Remaining Cash:{' '}
                          {displayInr(
                            Number(margin?.cash) -
                              Number(margin?.marginusedprev) -
                              Number(margin?.ordermargin)
                          )}
                        </p>
                      </>
                    )}
                  </div>
                  <SellerTable quote={quote} />
                </div>
                <div className="mx-auto mb-16 grid max-w-sm grid-cols-[repeat(5,_auto)] place-items-center gap-2 px-4">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Lot Size
                  </span>
                  <span></span>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Quantity
                  </label>
                  <span></span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Total
                  </span>
                  <span className="rounded-md border border-zinc-300 bg-zinc-100 px-5 py-2 font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    {i.lotSize}
                  </span>
                  <span className="text-sm font-medium text-zinc-500">×</span>
                  <input
                    type="number"
                    name="quantity"
                    className="w-24 rounded-md border-zinc-300 text-center font-semibold text-zinc-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                  />
                  <span className="text-sm font-medium text-zinc-500">=</span>
                  <span className="rounded-md border border-zinc-300 bg-zinc-100 px-5 py-2 font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    {i.lotSize * quantity}
                  </span>
                </div>
                <div className="flex flex-row-reverse gap-4">
                  <button
                    type="button"
                    disabled={margin?.remarks === 'Insufficient Balance'}
                    className={classNames(
                      'ml-3 inline-flex w-auto justify-center rounded-full border border-transparent px-6 py-2.5 font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      margin?.remarks === 'Insufficient Balance'
                        ? 'pointer-events-none cursor-not-allowed bg-zinc-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    )}
                    onClick={placeSellOrder}
                  >
                    Place Sell Order
                  </button>
                  <button
                    type="button"
                    className="mt-0 inline-flex w-auto justify-center rounded-full border border-zinc-300 bg-white px-6 py-2.5 font-medium text-zinc-700 shadow-sm hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 hover:dark:text-zinc-200"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    );
  },
  (prevProps, nextProps) => prevProps.open === nextProps.open
);
