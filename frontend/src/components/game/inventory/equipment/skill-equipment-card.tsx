import React, { type FC } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { Card } from '@/frontend/components/ui/card';
import { Row } from '@/frontend/components/ui/layout/row';
import type { SkillDef } from '@/shared/definition/definition-skills';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { Image } from '@/frontend/components/ui/image';
import { Typography } from '@/frontend/components/ui/typography';
import { Grid } from '@/frontend/components/ui/layout/grid';
import { Divider } from '@/frontend/components/ui/layout/divider';

interface Props {
  skillDef: SkillDef;
}

export const SkillEquipmentCard: FC<Props> = React.memo((props) => {
  const { skillDef } = props;

  // TODO: bare lav ui for nu
  // const stats = useMemo(() => {}, []);

  return (
    <Card className="bg-background p-4">
      <Row className="justify-center">
        <Image src={`${assetsBasePath}skills/${skillDef.id}.svg`} alt={skillDef.id} />
        <Typography>{skillDef.display}</Typography>
      </Row>
      <Grid className="grid-cols-4 text-center">
        <Typography>Speed</Typography>
        <Typography>Productivity</Typography>
        <Divider className="col-span-full" />
        <Typography>100</Typography>
        <Typography>2</Typography>
      </Grid>
    </Card>
  );
});

SkillEquipmentCard.displayName = nameOf({ SkillEquipmentCard });
