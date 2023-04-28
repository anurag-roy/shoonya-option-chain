import { GROUPS } from '@/config';
import { Dialog, Transition } from '@headlessui/react';
import { Dispatch, Fragment, SetStateAction } from 'react';

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export function GroupDetails({ open, setOpen }: Props) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
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
            <div className="relative my-8 inline-block transform overflow-hidden rounded-lg bg-white px-8 py-4 text-left align-middle shadow-xl transition-all dark:bg-zinc-900">
              <Dialog.Title
                as="h3"
                className="mb-6 text-center font-semibold leading-6 text-zinc-800 dark:text-zinc-200"
              >
                Group Details
              </Dialog.Title>
              <div className="grid grid-cols-2 gap-8">
                {Object.entries(GROUPS).map(([key, values]) => (
                  <div
                    key={key}
                    className="rounded-xl bg-zinc-50 px-4 pb-6 pt-3 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
                  >
                    <h4 className="mb-6 text-lg font-bold text-zinc-800 dark:text-zinc-100">
                      {key}
                    </h4>
                    <ul className="flex flex-wrap gap-4">
                      {values.map((v) => (
                        <li
                          key={v}
                          className="rounded-full border border-blue-500/20 bg-blue-50/50 p-4 px-2.5 py-0.5 text-sm font-semibold leading-6 text-blue-900 dark:bg-blue-500/5 dark:text-blue-200"
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mx-auto mt-6 flex justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setOpen(false)}
              >
                Got it!
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
