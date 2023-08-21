import { Header } from '@/components/Header';
import { AllIcon } from '@/components/icons/AllIcon';
import { SpecificIcon } from '@/components/icons/SpecificIcon';
import { AuthStatus } from '@/types';
import { injectTokenIntoEnv } from '@/utils/api';
import Head from 'next/head';
import Link from 'next/link';

export async function getServerSideProps() {
  await injectTokenIntoEnv();

  if (!process.env.token) {
    return {
      props: {
        status: 'unauthorized',
      },
    };
  }

  return {
    props: {
      status: 'authorized',
    },
  };
}

type Props = {
  status: AuthStatus;
};

export default function Home({ status }: Props) {
  return (
    <>
      <Head>
        <title>Option Chain (Equity Derivatives)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header status={status} />
      <main className="grid h-full place-content-center place-items-center gap-6">
        <p className="text-sm font-semibold">
          Please select a view to start the application with:
        </p>
        <div className="grid grid-cols-2 gap-8">
          <Link
            href="/specific"
            className="grid aspect-square h-80 place-content-center place-items-center gap-4 rounded-lg bg-zinc-50 text-zinc-700 ring-2 ring-zinc-100 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-100 dark:bg-white/5 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-2 dark:ring-white/10 dark:hover:bg-blue-500/5 dark:hover:text-blue-200 dark:hover:ring-blue-700/40"
          >
            <SpecificIcon />
            <span className="text-3xl font-bold">Specific Options</span>
            <p className="mt-4 px-4 pt-4 text-center text-sm font-semibold">
              View equity derivatives for a curated list of stocks, organised
              into categories.
            </p>
          </Link>
          <Link
            href="/all"
            className="grid aspect-square h-80 place-content-center place-items-center gap-4 rounded-lg bg-zinc-50 text-zinc-700 ring-2 ring-zinc-100 hover:bg-indigo-50 hover:text-indigo-700 hover:ring-indigo-100 dark:bg-white/5 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-2 dark:ring-white/10 dark:hover:bg-indigo-500/5 dark:hover:text-indigo-200 dark:hover:ring-indigo-700/40"
          >
            <AllIcon />
            <span className="text-3xl font-bold">All Options</span>
            <p className="mt-4 px-4 pt-4 text-center text-sm font-semibold">
              View all available equity derivatives in a single table, ordered
              by their value.
            </p>
          </Link>
        </div>
      </main>
    </>
  );
}
