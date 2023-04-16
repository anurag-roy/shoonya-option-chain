import { Quotes } from '@/types/shoonya';

interface Props {
  quote: Quotes | null;
}

export function BuyerTable({ quote }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-900 overflow-y-auto ring-1 ring-zinc-200 dark:ring-zinc-700 rounded-lg">
      <table className="divide-y divide-zinc-300 dark:divide-white/10">
        <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0">
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
          <tbody className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 divide-y divide-zinc-200 dark:divide-white/10">
            <tr>
              <td colSpan={4}>No data to display.</td>
            </tr>
          </tbody>
        ) : (
          <tbody className="bg-blue-50/60 [&_td:not(:first-child)]:text-blue-800 dark:bg-blue-900/5 dark:[&_td:not(:first-child)]:text-blue-500 divide-y divide-zinc-200 dark:divide-white/10">
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
