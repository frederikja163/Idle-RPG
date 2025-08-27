import React, { type FC } from 'react';
import { Row } from '@/frontend/components/ui/layout/row';
import { Typography } from '@/frontend/components/ui/typography';
import { nameOf } from '@/frontend/lib/function-utils';

interface Props {
  text: string;
  className?: string;
}

export const LabelBox: FC<Props> = React.memo((props) => {
  const { text, className } = props;

  return (
    <Row className={`px-1 py-0.5 rounded bg-gray-200 ${className}`}>
      <Typography className="leading-tight">{text}</Typography>
    </Row>
  );
});

LabelBox.displayName = nameOf({ LabelBox });
