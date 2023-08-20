import { ComboBoxInput } from '@/components/ComboBoxInput';
import { getExpiryOptions } from '@/utils/ui';
import { FormEvent, useState } from 'react';

const expiryOptions = getExpiryOptions();

export default function () {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expiry, setExpiry] = useState<string>('');

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubscribed) {
      setIsSubscribed(false);
    } else {
      const formData = new FormData(event.currentTarget);
      const selectedExpiry = formData.get('expiry')?.valueOf() as string;

      setIsSubscribed(true);
      setExpiry(selectedExpiry);
    }
  };

  return (
    <main>
      <form
        className="mx-auto mt-6 flex max-w-5xl items-end justify-between rounded-lg bg-zinc-50 px-4 py-6 ring-1 ring-zinc-200 dark:bg-white/5 dark:bg-zinc-800 dark:ring-1 dark:ring-white/10 sm:px-6 lg:px-8"
        onSubmit={handleFormSubmit}
      >
        <div>
          <label
            htmlFor="entryPrice"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-100"
          >
            Entry Price
          </label>
          <div className="mt-1">
            <input
              type="number"
              defaultValue={0}
              step={0.05}
              min={0}
              name="entryPrice"
              id="entryPrice"
              className="rounded-md border-zinc-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
        <ComboBoxInput name="expiry" items={expiryOptions} />
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      </form>
    </main>
  );
}
