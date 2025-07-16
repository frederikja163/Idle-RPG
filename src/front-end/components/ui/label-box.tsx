import React, { type FC } from 'react';
import { Row } from '@/front-end/components/ui/layout/row';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { nameOf } from '@/front-end/lib/function-utils.ts';

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
