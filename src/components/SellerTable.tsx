import { Quotes } from '@/types/shoonya';

interface Props {
  quote: Quotes | null;
}

export function SellerTable({ quote }: Props) {
  return (
    <div className="overflow-y-auto rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
      <table className="divide-y divide-zinc-300 dark:divide-white/10">
        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
          <tr className="divide-x divide-zinc-200 dark:divide-white/10">
            <th scope="col" className="min-w-[100px]">
              Seller
            </th>
            <th scope="col" className="min-w-[8ch]">
              Ask
            </th>
            <th scope="col" className="min-w-[8ch]">
              Qty
            </th>
          </tr>
        </thead>
        {quote === null ? (
          <tbody className="divide-y divide-zinc-200 bg-white text-zinc-900 dark:divide-white/10 dark:bg-zinc-900 dark:text-zinc-100">
            <tr>
              <td colSpan={4}>No data to display.</td>
            </tr>
          </tbody>
        ) : (
          <tbody className="divide-y divide-zinc-200 bg-red-50/60 dark:divide-white/10 dark:bg-red-900/5 [&_td:not(:first-child)]:text-red-800 dark:[&_td:not(:first-child)]:text-red-500">
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Seller 1</td>
              <td>{quote.sp1 ?? '-'}</td>
              <td>{quote.sq1 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Seller 2</td>
              <td>{quote.sp2 ?? '-'}</td>
              <td>{quote.sq2 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Seller 3</td>
              <td>{quote.sp3 ?? '-'}</td>
              <td>{quote.sq3 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Seller 4</td>
              <td>{quote.sp4 ?? '-'}</td>
              <td>{quote.sq4 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Seller 5</td>
              <td>{quote.sp5 ?? '-'}</td>
              <td>{quote.sq5 ?? '-'}</td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
