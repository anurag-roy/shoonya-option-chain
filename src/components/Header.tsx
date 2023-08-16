import { AuthStatus } from '@/types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Login } from './Login';
import { NseLogo } from './icons/NseLogo';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center rounded-md bg-zinc-50 p-1.5 ring-1 ring-zinc-200 transition dark:bg-white/5 dark:bg-zinc-800 dark:ring-1 dark:ring-white/10"
      aria-label="Toggle dark mode"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6 stroke-zinc-900 dark:hidden"
      >
        <path d="M12.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path>
        <path
          strokeLinecap="round"
          d="M10 5.5v-1M13.182 6.818l.707-.707M14.5 10h1M13.182 13.182l.707.707M10 15.5v-1M6.11 13.889l.708-.707M4.5 10h1M6.11 6.111l.708.707"
        ></path>
      </svg>
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="hidden h-6 w-6 stroke-white dark:block"
      >
        <path d="M15.224 11.724a5.5 5.5 0 0 1-6.949-6.949 5.5 5.5 0 1 0 6.949 6.949Z"></path>
      </svg>
    </button>
  );
}

type Props = {
  status: AuthStatus;
};

export function Header({ status }: Props) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(status);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center gap-2">
      <NseLogo />
      <h1 className="mr-auto text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Option Chain
      </h1>
      <ThemeToggle />
      {authStatus === 'authorized' ? (
        <span className="ml-2 inline-flex items-center rounded-md border border-transparent bg-emerald-50/50 px-4 py-2 text-sm font-medium leading-4 text-emerald-800 ring-1 ring-inset ring-emerald-700/20 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200">
          <CheckCircleIcon
            className="-ml-1 mr-2 h-5 w-5 fill-emerald-600 dark:fill-emerald-200/50"
            aria-hidden="true"
          />
          Logged in
        </span>
      ) : (
        <button
          className="ml-2 inline-flex items-center rounded-md border border-transparent bg-red-50/50 px-4 py-2 text-sm font-medium leading-4 text-red-800 ring-1 ring-inset ring-red-700/20 hover:ring-red-700/50 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-200"
          onClick={() => setIsLoginOpen(true)}
        >
          <XCircleIcon
            className="-ml-1 mr-2 h-5 w-5 fill-red-600 dark:fill-red-200/50"
            aria-hidden="true"
          />
          Session expired. Click here to login
        </button>
      )}
      <Login
        open={isLoginOpen}
        setOpen={setIsLoginOpen}
        setAuthStatus={setAuthStatus}
      />
    </header>
  );
}
