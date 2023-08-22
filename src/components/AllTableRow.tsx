import { AllInstrument } from '@/types';
import { MouseEventHandler } from 'react';

type Props = {
  i: AllInstrument;
  onClick: MouseEventHandler<HTMLTableRowElement>;
};

export const AllTableRow = ({ i, onClick }: Props) => {
  return (
    <tr
      className="cursor-pointer divide-x divide-zinc-200 hover:bg-zinc-50 dark:divide-white/10 dark:hover:bg-zinc-800"
      onClick={onClick}
    >
      <td className="pl-8 text-left">
        {i.symbol} {i.strikePrice} {i.optionType}
      </td>
      <td>{i.bid}</td>
      <td>{i.value.toFixed(2)}</td>
    </tr>
  );
};
