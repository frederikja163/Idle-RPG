import React, { type FC, useCallback } from 'react';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { nameOf } from '@/front-end/lib/function-utils.ts';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Button } from '@/front-end/components/ui/input/button.tsx';
import { routes } from '@/front-end/router/routes.ts';
import { useNavigate } from 'react-router-dom';

export const Error: FC = React.memo(() => {
  const navigate = useNavigate();

  const navigateToProfiles = useCallback(() => {
    navigate(routes.profiles);
  }, [navigate]);

  return (
    <Column className="items-center gap-20 pt-40">
      <Typography className="text-2xl">No page exists at this route</Typography>
      <Button onClick={navigateToProfiles} className="w-52">
        <Typography>Go to game</Typography>
      </Button>
    </Column>
  );
});

Error.displayName = nameOf({ Error });
