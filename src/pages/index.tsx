import { Header } from '@/components/Header';
import { Main } from '@/components/Main';
import { AuthStatus } from '@/types';
import { injectTokenIntoEnv } from '@/utils/api';
import Head from 'next/head';

export async function getServerSideProps() {
  injectTokenIntoEnv();

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
      <Main />
    </>
  );
}
