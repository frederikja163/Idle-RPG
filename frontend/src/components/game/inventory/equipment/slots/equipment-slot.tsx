import React, { type FC } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { ItemBox } from '@/frontend/components/game/item-box';
import { Image } from '@/frontend/components/ui/image';

interface Props {
  imageSrc: string;
  imageAlt: string;
}

export const EquipmentSlot: FC<Props> = React.memo((props) => {
  const { imageSrc, imageAlt } = props;

  return (
    <ItemBox>
      <Image src={imageSrc} alt={imageAlt} className="opacity-40" />
    </ItemBox>
  );
});

EquipmentSlot.displayName = nameOf({ EquipmentSlot });
