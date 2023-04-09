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
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="block min-h-screen m-auto text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-zinc-500 bg-opacity-75 dark:bg-zinc-800 dark:bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block align-middle h-screen"
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
            <div className="relative inline-block align-middle bg-white dark:bg-zinc-900 rounded-lg px-12 py-6 text-left overflow-hidden shadow-xl transform transition-all my-8">
              <p className="text-zinc-800 text-center font-semibold text-2xl mb-16">
                Confirm TOTP to login
              </p>
              <form onSubmit={confirmTotp} method="post">
                <div
                  className="flex flex-row gap-3 mb-4 mx-auto w-fit"
                  ref={inputContainerRef}
                >
                  {digitIds.map((i) => (
                    <input
                      key={i.toString()}
                      className="w-14 h-16 text-center px-4 hide-arrows outline-none rounded-xl border border-zinc-200 text-lg bg-white focus:bg-zinc-50 focus:ring-1 ring-blue-700"
                      type="number"
                      name={`otp-input-${i}`}
                      id={`otp-input-${i}`}
                      onKeyDown={(event) => otpInputKeydownhandler(event, i)}
                    />
                  ))}
                </div>
                <p className="text-center text-sm font-medium text-zinc-400 mb-16">
                  Please enter the TOTP generated on your Authenticator app.
                </p>
                <button
                  type="submit"
                  className="mx-auto flex justify-center rounded-full border border-transparent shadow-sm px-6 py-2 bg-blue-600 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                >
                  {buttonState === 'confirm' ? (
                    'Confirm'
                  ) : (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
