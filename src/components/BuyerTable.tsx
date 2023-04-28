import { Quotes } from '@/types/shoonya';

interface Props {
  quote: Quotes | null;
}

export function BuyerTable({ quote }: Props) {
  return (
    <div className="overflow-y-auto rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
      <table className="divide-y divide-zinc-300 dark:divide-white/10">
        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
          <tr className="divide-x divide-zinc-200 dark:divide-white/10">
            <th scope="col" className="min-w-[100px]">
              Buyer
            </th>
            <th scope="col" className="min-w-[8ch]">
              Bid
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
          <tbody className="divide-y divide-zinc-200 bg-blue-50/60 dark:divide-white/10 dark:bg-blue-900/5 [&_td:not(:first-child)]:text-blue-800 dark:[&_td:not(:first-child)]:text-blue-500">
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Buyer 1</td>
              <td>{quote.bp1 ?? '-'}</td>
              <td>{quote.bq1 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Buyer 2</td>
              <td>{quote.bp2 ?? '-'}</td>
              <td>{quote.bq2 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Buyer 3</td>
              <td>{quote.bp3 ?? '-'}</td>
              <td>{quote.bq3 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Buyer 4</td>
              <td>{quote.bp4 ?? '-'}</td>
              <td>{quote.bq4 ?? '-'}</td>
            </tr>
            <tr className="divide-x divide-zinc-200 dark:divide-white/10">
              <td className="bg-white dark:bg-zinc-900">Buyer 5</td>
              <td>{quote.bp5 ?? '-'}</td>
              <td>{quote.bq5 ?? '-'}</td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
