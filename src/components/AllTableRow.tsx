import { AllInstrument } from '@/types';
import { useState } from 'react';
import { OrderModal } from './OrderModal';

type Props = {
  i: AllInstrument;
};

export const AllTableRow = ({ i }: Props) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <tr
      className="cursor-pointer divide-x divide-zinc-200 hover:bg-zinc-50 dark:divide-white/10 dark:hover:bg-zinc-800"
      onClick={() => setIsOrderModalOpen(true)}
    >
      <td className="pl-8 text-left">
        {i.symbol} {i.strikePrice} {i.optionType}
      </td>
      <td>{i.bid}</td>
      <td>{i.value.toFixed(2)}</td>
      {isOrderModalOpen && (
        <OrderModal
          open={isOrderModalOpen}
          setOpen={setIsOrderModalOpen}
          i={i}
          price={i.bid}
        />
      )}
    </tr>
  );
};
