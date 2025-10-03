import React, { type FC } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { Row } from '@/frontend/components/ui/layout/row';
import { SkillEquipmentCard } from '@/frontend/components/game/inventory/equipment/skill-equipment-card';
import { SkillDef } from '@/shared/definition/definition-skills';

export const EquipmentTab: FC = React.memo(() => {
  return (
    <Row>
      <SkillEquipmentCard skillDef={SkillDef.requireById('Mining')} />
    </Row>
  );
});

EquipmentTab.displayName = nameOf({ EquipmentTab });
