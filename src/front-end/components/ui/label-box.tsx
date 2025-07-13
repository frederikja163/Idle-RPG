import React, { type FC } from 'react';
import { Row } from '../layout/row';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { fnNameFor } from '@vitest/expect';

interface Props {
  text: string;
  className?: string;
}

export const LabelBox: FC<Props> = React.memo((props) => {
  const { text, className } = props;

  return (
    <Row className={`p-1 rounded bg-gray-200 ${className}`}>
      <Typography className="leading-tight">{text}</Typography>
    </Row>
  );
});

fnNameFor(LabelBox);
