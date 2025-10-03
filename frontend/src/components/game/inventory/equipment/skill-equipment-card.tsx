import React, { type FC } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { Card } from '@/frontend/components/ui/card';
import { Row } from '@/frontend/components/ui/layout/row';
import type { SkillDef } from '@/shared/definition/definition-skills';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { Image } from '@/frontend/components/ui/image';
import { Typography } from '@/frontend/components/ui/typography';

interface Props {
  skillDef: SkillDef;
}

export const SkillEquipmentCard: FC<Props> = React.memo((props) => {
  const { skillDef } = props;

  return (
    <Card className="bg-background p-4">
      <Row>
        <Image src={`${assetsBasePath}skills/${skillDef.id}.svg`} alt={skillDef.id} />
        <Typography>{skillDef.display}</Typography>
      </Row>
    </Card>
  );
});

SkillEquipmentCard.displayName = nameOf({ SkillEquipmentCard });
