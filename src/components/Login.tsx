import { AuthStatus } from '@/types';
import { Dialog, Transition } from '@headlessui/react';
import {
  Dispatch,
  FormEvent,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useRef,
  useState,
} from 'react';

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setAuthStatus: Dispatch<SetStateAction<AuthStatus>>;
}
const OTP_LENGTH = 6;

export function Login({ open, setOpen, setAuthStatus }: Props) {
  const [buttonState, setButtonState] = useState<'confirm' | 'confirming'>(
    'confirm'
  );

  const inputContainerRef = useRef<HTMLDivElement>(null);
  const digitIds = [...Array(OTP_LENGTH).keys()];

  const otpInputKeydownhandler = (event: KeyboardEvent, i: number) => {
    const inputContainer = inputContainerRef.current;
    if (!inputContainer) return;

    const inputs = inputContainer.querySelectorAll('input');

    if (event.key === 'Backspace') {
      inputs[i].value = '';
      if (i !== 0) inputs[i - 1].focus();
    } else if (/^[0-9]$/i.test(event.key)) {
      event.preventDefault();
      inputs[i].value = event.key;
      if (i !== inputs.length - 1) inputs[i + 1].focus();
    }
  };

  const confirmTotp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let finalOtp = '';
    for (const value of formData.values()) {
      finalOtp = finalOtp + value;
    }
    setButtonState('confirming');
    fetch('/api/login?totp=' + finalOtp)
      .then((res) => {
        console.log('Login successful!', res);
        setAuthStatus('authorized');
        setOpen(false);
      })
      .catch((err) => {
        console.error('Error while logging in', err);
        alert('Error while logging in. Please try again.');
      });
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="m-auto block min-h-screen text-center">
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
            <div className="relative my-8 inline-block transform overflow-hidden rounded-lg bg-white px-12 py-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900">
              <p className="mb-16 text-center text-2xl font-semibold text-zinc-800 dark:text-zinc-300">
                Confirm TOTP to login
              </p>
              <form onSubmit={confirmTotp} method="post">
                <div
                  className="mx-auto mb-4 flex w-fit flex-row gap-3"
                  ref={inputContainerRef}
                >
                  {digitIds.map((i) => (
                    <input
                      key={i.toString()}
                      className="hide-arrows h-16 w-14 rounded-xl border border-zinc-200 px-4 text-center text-lg outline-none ring-blue-700 focus:bg-zinc-50 focus:ring-1 dark:border-zinc-600 dark:bg-zinc-800"
                      type="number"
                      name={`otp-input-${i}`}
                      id={`otp-input-${i}`}
                      onKeyDown={(event) => otpInputKeydownhandler(event, i)}
                    />
                  ))}
                </div>
                <p className="mb-16 text-center text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  Please enter the TOTP generated on your Authenticator app.
                </p>
                <button
                  type="submit"
                  className="mx-auto flex justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {buttonState === 'confirm' ? (
                    'Confirm'
                  ) : (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Confirming...
                    </>
                  )}
                </button>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
