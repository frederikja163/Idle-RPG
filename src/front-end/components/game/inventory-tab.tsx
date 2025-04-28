import React, {type FC} from 'react';
import {Typography} from '@/front-end/components/ui/typography.tsx';

interface Props {
  id: string;
  label: string;

  onClick(): void;
}

export const InventoryTab: FC<Props> = React.memo((props) => {
  const {id, label, onClick} = props;

  return (
    <div onClick={onClick}>
      <Typography>
        {label}
      </Typography>
    </div>
  );
});