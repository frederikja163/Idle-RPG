import React, { type FC } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { EquipmentSlot } from '@/frontend/components/game/inventory/equipment/slots/equipment-slot';
import { nameOf } from '@/frontend/lib/function-utils';

export const MiningEquipmentSlots: FC = React.memo(() => {
  return (
    <Column className="items-center gap-2 p-6">
      <EquipmentSlot imageSrc={`${assetsBasePath}items/HeadPickaxePlaceholder.svg`} imageAlt="Picaxe head" />
      <EquipmentSlot imageSrc={`${assetsBasePath}items/HandlePlaceholder.svg`} imageAlt="Handle" />
    </Column>
  );
});

MiningEquipmentSlots.displayName = nameOf({ MiningEquipmentSlots });
