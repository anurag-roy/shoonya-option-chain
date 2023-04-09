import { GROUPS } from '@/config';
import env from '@/env.json';
import { ShoonyaInstrument } from '@/types';
import JSZip from 'jszip';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const allowedStocks = Object.values(GROUPS).flatMap((s) => s);

export const injectTokenIntoEnv = (token?: string) => {
  if (token) {
    process.env.token = token;
  } else {
    try {
      const readToken = readFileSync('src/data/token.txt', 'utf-8');
      process.env.token = readToken;
    } catch (error) {
      console.log('Token file not found. Skipping token setting...');
    }
  }
};

export const getHash = (input: string) =>
  createHash('sha256').update(input).digest('hex');

export const getInstruments = async (forExchange: 'NSE' | 'NFO') => {
  const txtFileName = forExchange + '_symbols.txt';
  const zipFileName = txtFileName + '.zip';

  const res = await fetch('https://api.shoonya.com/' + zipFileName);
  const arrayBuffer = await res.arrayBuffer();

  const jsZip = new JSZip();
  const result = await jsZip.loadAsync(arrayBuffer);
  const file = result.file(txtFileName);
  if (!file) {
    ('Did not find the expected .txt file. Exiting...');
    process.exit(1);
  }

  const output: ShoonyaInstrument[] = [];

  const fileContents = await file.async('text');
  const rows = fileContents.split('\n').slice(1);

  for (const row of rows) {
    if (forExchange === 'NSE') {
      const [
        exchange,
        token,
        lotSize,
        symbol,
        tradingSymbol,
        instrument,
        tickSize,
      ] = row.split(',');

      if (instrument === 'EQ' && allowedStocks.includes(symbol)) {
        output.push({
          exchange,
          token,
          lotSize: Number(lotSize),
          symbol,
          tradingSymbol,
          expiry: '',
          instrument,
          optionType: 'XX',
          strikePrice: 0,
          tickSize,
        });
      }
    } else if (forExchange === 'NFO') {
      const [
        exchange,
        token,
        lotSize,
        symbol,
        tradingSymbol,
        expiry,
        instrument,
        optionType,
        strikePrice,
        tickSize,
      ] = row.split(',');

      if (
        (optionType === 'CE' || optionType === 'PE') &&
        allowedStocks.includes(symbol)
      ) {
        output.push({
          exchange,
          token,
          lotSize: Number(lotSize),
          symbol,
          tradingSymbol,
          expiry,
          instrument,
          optionType,
          strikePrice: Number(strikePrice),
          tickSize,
        });
      }
    }
  }

  return output;
};

export const getUserDetails = async () => {
  const res = await fetch(
    'https://api.shoonya.com/NorenWClientTP/UserDetails',
    {
      method: 'POST',
      body:
        'jData=' +
        JSON.stringify({
          uid: env.USER_ID,
        }) +
        `&jKey=${process.env.token}`,
    }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const userDetails = await res.json();
  if (userDetails.stat !== 'Ok') {
    throw new Error(userDetails.emsg);
  }

  return userDetails;
};
