import { AllInstrument } from '@/types';
import { useState } from 'react';
import { OrderModal } from './OrderModal';

type Props = {
  i: AllInstrument;
};

export const AllTableRow = ({ i }: Props) => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <tr className="divide-x divide-zinc-200 dark:divide-white/10">
      <td>
        {i.symbol} {i.strikePrice} {i.optionType}
      </td>
      <td onClick={() => setIsOrderModalOpen(true)}>{i.bid}</td>
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
