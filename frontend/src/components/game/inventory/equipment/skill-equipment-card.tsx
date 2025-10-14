import React, { type FC, type ReactNode, useMemo } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { Card } from '@/frontend/components/ui/card';
import { Row } from '@/frontend/components/ui/layout/row';
import type { SkillDef } from '@/shared/definition/definition-skills';
import { assetsBasePath } from '@/frontend/constants/asset-consts';
import { Image } from '@/frontend/components/ui/image';
import { Typography } from '@/frontend/components/ui/typography';
import { Grid } from '@/frontend/components/ui/layout/grid';
import { Divider } from '@/frontend/components/ui/layout/divider';
import { useAtomValue } from 'jotai';
import { profileSkillsAtom } from '@/frontend/store/atoms';

interface Props {
  skillDef: SkillDef;
  children: ReactNode;
}

export const SkillEquipmentCard: FC<Props> = React.memo((props) => {
  const { skillDef, children } = props;

  // use to get equipment bonus values. when ready
  const profile = useAtomValue(profileSkillsAtom);

  // TODO: bare lav ui for nu
  // const stats = useMemo(() => {}, []);

  const gridStyle = useMemo(() => `grid-cols-${2} text-center`, []);

  return (
    <Card className="bg-background p-4 w-60">
      <Row className="h-10 gap-4">
        <Row>
          <Image src={`${assetsBasePath}skills/${skillDef.id}.svg`} alt={skillDef.id} />
        </Row>
        <Typography className="self-center text-xl">{skillDef.display}</Typography>
      </Row>
      {children}
      <Grid className={gridStyle}>
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
