import React, { type FC } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { Typography } from '@/frontend/components/ui/typography';
import { nameOf } from '@/frontend/lib/function-utils';

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
