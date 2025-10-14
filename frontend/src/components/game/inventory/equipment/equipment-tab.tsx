import React, { type FC } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { Row } from '@/frontend/components/ui/layout/row';
import { SkillEquipmentCard } from '@/frontend/components/game/inventory/equipment/skill-equipment-card';
import { SkillDef } from '@/shared/definition/definition-skills';
import { MiningEquipmentSlots } from '@/frontend/components/game/inventory/equipment/slots/mining-equipment-slots';
import {
  LumberjackingEquipmentSlots
} from '@/frontend/components/game/inventory/equipment/slots/lumberjacking-equipment-slots';
import { CraftingEquipmentSlots } from '@/frontend/components/game/inventory/equipment/slots/crafting-equipment-slots';

export const EquipmentTab: FC = React.memo(() => {
  return (
    <Row className="gap-4">
      <SkillEquipmentCard skillDef={SkillDef.requireById('Mining')}>
        <MiningEquipmentSlots />
      </SkillEquipmentCard>
      <SkillEquipmentCard skillDef={SkillDef.requireById('Lumberjacking')}>
        <LumberjackingEquipmentSlots />
      </SkillEquipmentCard>
      <SkillEquipmentCard skillDef={SkillDef.requireById('Crafting')}>
        <CraftingEquipmentSlots />
      </SkillEquipmentCard>
    </Row>
  );
});

EquipmentTab.displayName = nameOf({ EquipmentTab });
