import React, { type FC } from 'react';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { nameOf } from '@/front-end/lib/function-utils.ts';

interface Props {
  label: string;
  text: string;
  className?: string;
}

export const LabeledText: FC<Props> = React.memo((props) => {
  const { label, text, className } = props;

  return (
    <Column className={className}>
      <Typography className="text-xs opacity-60">{label}</Typography>
      <Typography>{text}</Typography>
    </Column>
  );
});

LabeledText.displayName = nameOf({ LabeledText });
