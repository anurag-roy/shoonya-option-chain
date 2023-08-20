import { ComboBoxInput } from '@/components/ComboBoxInput';
import { GroupDetails } from '@/components/GroupDetails';
import { Table } from '@/components/Table';
import { GROUPS } from '@/config';
import { getExpiryOptions, getKeys } from '@/utils/ui';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { FormEvent, useState } from 'react';

const groupDropdownOptions = getKeys(GROUPS);
const expiryOptions = getExpiryOptions();

export default function () {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedStocks, setSubscribedStocks] = useState<string[]>([]);
  const [expiry, setExpiry] = useState<string>('');

  const [isGroupDetailsOpen, setIsGroupDetailsOpen] = useState(false);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubscribed) {
      setSubscribedStocks([]);
      setIsSubscribed(false);
    } else {
      const formData = new FormData(event.currentTarget);
      const selectedGroup = formData
        .get('group')
        ?.valueOf() as keyof typeof GROUPS;
      const selectedExpiry = formData.get('expiry')?.valueOf() as string;

      setIsSubscribed(true);
      setExpiry(selectedExpiry);
      setSubscribedStocks(GROUPS[selectedGroup]);
    }
  };

  return (
    <main>
      <form
        className="mx-auto mt-6 flex max-w-5xl items-end rounded-lg bg-zinc-50 px-4 py-6 ring-1 ring-zinc-200 dark:bg-white/5 dark:bg-zinc-800 dark:ring-1 dark:ring-white/10 sm:px-6 lg:px-8 [&>*:first-child]:grow"
        onSubmit={handleFormSubmit}
      >
        <ComboBoxInput name="group" items={groupDropdownOptions} />
        <button
          type="button"
          onClick={() => setIsGroupDetailsOpen(!isGroupDetailsOpen)}
          className="mb-1 ml-1 mr-auto rounded-md p-1"
          title="Group Details"
        >
          <QuestionMarkCircleIcon className="h-6 w-6 text-zinc-400 hover:text-zinc-600" />
        </button>
        <ComboBoxInput name="expiry" items={expiryOptions} />
        <button
          type="submit"
          className="ml-auto rounded-full bg-blue-600 px-4 py-2 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      </form>
      <div className="grid grid-cols-[repeat(_auto-fit,_minmax(360px,_1fr))] gap-12 p-12">
        {subscribedStocks.map((s) => (
          <Table key={s} name={s} expiry={expiry} />
        ))}
      </div>
      <GroupDetails open={isGroupDetailsOpen} setOpen={setIsGroupDetailsOpen} />
    </main>
  );
}
