import { EXPIRY_OPTION_LENGTH } from '@/config';

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
