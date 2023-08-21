import { AllTable } from '@/components/AllTable';
import { ComboBoxInput } from '@/components/ComboBoxInput';
import { getExpiryOptions } from '@/utils/ui';
import { FormEvent, useState } from 'react';

const expiryOptions = getExpiryOptions();

export default function () {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedExpriy, setSelectedExpiry] = useState('');
  const [selectedPercentage, setSelectedPercentage] = useState(33);
  const [selectedEntryValue, setSelectedEntryValue] = useState(0);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubscribed) {
      setIsSubscribed(false);
    } else {
      const formData = new FormData(event.currentTarget);
      setSelectedExpiry(formData.get('expiry')?.valueOf() as string);
      setSelectedPercentage(Number(formData.get('percentage')?.valueOf()));
      setSelectedEntryValue(Number(formData.get('entryValue')?.valueOf()));
      setIsSubscribed(true);
    }
  };

  return (
    <main>
      <form
        className="mx-auto mt-6 flex max-w-5xl items-end justify-between rounded-lg bg-zinc-50 px-4 py-6 ring-1 ring-zinc-200 dark:bg-white/5 dark:bg-zinc-800 dark:ring-1 dark:ring-white/10 sm:px-6 lg:px-8"
        onSubmit={handleFormSubmit}
      >
        <ComboBoxInput name="expiry" items={expiryOptions} />
        <div>
          <label
            htmlFor="percentage"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-100"
          >
            Percentage
          </label>
          <div className="mt-1">
            <input
              type="number"
              defaultValue={30}
              step={1}
              min={0}
              name="percentage"
              id="percentage"
              className="rounded-md border-zinc-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="entryValue"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-100"
          >
            Entry Value
          </label>
          <div className="mt-1">
            <input
              type="number"
              defaultValue={0}
              step={0.05}
              min={0}
              name="entryValue"
              id="entryValue"
              className="rounded-md border-zinc-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      </form>
      {isSubscribed ? (
        <AllTable
          expiry={selectedExpriy}
          percent={selectedPercentage}
          entryValue={selectedEntryValue}
        />
      ) : (
        <></>
      )}
    </main>
  );
}
