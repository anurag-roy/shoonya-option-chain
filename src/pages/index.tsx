import { Header } from '@/components/Header';
import { Main } from '@/components/Main';
import env from '@/env.json';
import { AuthStatus } from '@/types';
import { getUserDetails, injectTokenIntoEnv } from '@/utils/api';
import Head from 'next/head';

export async function getServerSideProps() {
  injectTokenIntoEnv();

  try {
    if (!process.env.token) {
      throw Error('Token not set');
    }

    // getProfile call to check if logged in or not
    await getUserDetails();

    return {
      props: {
        status: 'authorized',
        data: env.USER_ID,
      },
    };
  } catch (error) {
    console.log('Token expired or not set.');
    return {
      props: {
        status: 'unauthorized',
      },
    };
  }
}

type Props = {
  status: AuthStatus;
  data: string;
};

export default function Home({ status, data }: Props) {
  return (
    <>
      <Head>
        <title>Option Chain (Equity Derivatives)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header status={status} data={data} />
      <Main />
    </>
  );
}
