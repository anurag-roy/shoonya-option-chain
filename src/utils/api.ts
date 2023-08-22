import { STOCKS_TO_INCLUDE } from '@/config';
import env from '@/env.json';
import { Quotes, ShoonyaInstrument } from '@/types/shoonya';
import JSZip from 'jszip';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const injectTokenIntoEnv = async (token?: string) => {
  if (token) {
    process.env.token = token;
  } else {
    try {
      const readToken = readFileSync('src/data/token.txt', 'utf-8');
      process.env.token = readToken;

      try {
        await getUserDetails();
      } catch (error) {
        console.log('Token expired');
        process.env.token = undefined;
      }
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

      if (instrument === 'EQ' && STOCKS_TO_INCLUDE.includes(symbol)) {
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
        STOCKS_TO_INCLUDE.includes(symbol)
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

export const getQuotes = async (
  exchange: 'NSE' | 'NFO',
  instrumentToken: string
) => {
  const res = await fetch('https://api.shoonya.com/NorenWClientTP/GetQuotes', {
    method: 'POST',
    body:
      'jData=' +
      JSON.stringify({
        uid: env.USER_ID,
        exch: exchange,
        token: instrumentToken,
      }) +
      `&jKey=${process.env.token}`,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const quotes = await res.json();
  if (quotes.stat !== 'Ok') {
    throw new Error(quotes.emsg);
  }
  return quotes as Quotes;
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
