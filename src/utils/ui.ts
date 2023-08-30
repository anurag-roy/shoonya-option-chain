import { EXPIRY_OPTION_LENGTH } from '@/config';
import { AllInstrument } from '@/types';
import { MarginResponse } from '@/types/shoonya';

export const getKeys = <T extends Object>(object: T) =>
  Object.keys(object) as Array<keyof T>;

export const classNames = (...classes: (boolean | string)[]) =>
  classes.filter(Boolean).join(' ');

export const getMonthName = (monthIndex: number) => {
  // Adjust from 0 based month to irl month index
  const numericMonth = (monthIndex + 1).toString();
  const monthDate = new Date(numericMonth);
  return Intl.DateTimeFormat('en', { month: 'short' })
    .format(monthDate)
    .toUpperCase();
};

export const getExpiryOptions = () => {
  const date = new Date();
  let currentMonthIndex = date.getMonth();
  let currentYear = date.getFullYear();

  const options: string[] = [];

  for (let i = 0; i < EXPIRY_OPTION_LENGTH; i++) {
    options.push(`${getMonthName(currentMonthIndex)}-${currentYear}`);

    currentMonthIndex = currentMonthIndex + 1;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear = currentYear + 1;
    }
  }

  return options;
};

export const displayInr = (amount: number) =>
  '₹ ' +
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

export const getRandomIndex = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const getReturnValue = async (i: AllInstrument) => {
  const { bid, lotSize, tradingSymbol } = i;

  try {
    const url = new URL('http://localhost:3000/api/getMargin');
    url.searchParams.append('price', bid.toString());
    url.searchParams.append('quantity', lotSize.toString());
    url.searchParams.append('tradingSymbol', encodeURIComponent(tradingSymbol));

    const res = await fetch(url);
    const margin: MarginResponse = await res.json();
    return ((bid - 0.05) * lotSize * 100) / Number(margin.ordermargin);
  } catch (error) {
    console.error('Could not get margin for', tradingSymbol, error);
    return 0;
  }
};
