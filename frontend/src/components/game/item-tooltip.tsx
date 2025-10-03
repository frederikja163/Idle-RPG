import React, { type FC } from 'react';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';
import { Row } from '@/frontend/components/ui/layout/row';
import { Card } from '@/frontend/components/ui/card';
import { LabelBox } from '@/frontend/components/ui/label-box';
import { ItemDef } from '@/shared/definition/definition-items';

interface Props {
  itemId: string;
}

export const ItemTooltip: FC<Props> = React.memo(function ItemTooltip(props) {
  const { itemId } = props;

  const item = ItemDef.getById(itemId);

  return (
    <Card className="p-2">
      <Column>
        <Typography className="font-bold text-center">{item?.display}</Typography>
        <Row className="gap-2">
          {item?.getTags().map((tag) => (
            <LabelBox key={tag + Date.now()} text={tag} />
          ))}
        </Row>
      </Column>
    </Card>
  );
});
