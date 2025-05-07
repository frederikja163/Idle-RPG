import React, {type FC, type ReactNode} from 'react';
import {Column} from '@/front-end/components/layout/column.tsx';
import {Typography} from "@/front-end/components/ui/typography.tsx";

interface Props {
  top: ReactNode | string;
  bottom: ReactNode | string;
}

export const ActivityDetail: FC<Props> = React.memo((props) => {
  const {top, bottom} = props;

  return (
    <Column className="w-full p-2 items-center">
      {typeof top === "string" ? <Typography className="text-muted-foreground">{top}</Typography> : top}
      {typeof bottom === "string" ? <Typography className="text-muted-foreground">{bottom}</Typography> : bottom}
    </Column>
  );
});
