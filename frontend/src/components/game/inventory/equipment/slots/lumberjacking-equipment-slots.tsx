import React, { type FC } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { EquipmentSlot } from '@/frontend/components/game/inventory/equipment/slots/equipment-slot';
import { nameOf } from '@/frontend/lib/function-utils';

export const LumberjackingEquipmentSlots: FC = React.memo(() => {
  return (
    <Column className="items-center gap-2 p-6">
      <EquipmentSlot imageSrc={`${assetsBasePath}icons/HeadAxePlaceholder.svg`} imageAlt="Axe head" />
      <EquipmentSlot imageSrc={`${assetsBasePath}icons/HandlePlaceholder.svg`} imageAlt="Handle" />
    </Column>
  );
});

LumberjackingEquipmentSlots.displayName = nameOf({ LumberjackingEquipmentSlots });
