import React, { type FC, useCallback } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { nameOf } from '@/frontend/lib/function-utils';
import { Typography } from '@/frontend/components/ui/typography';
import { Button } from '@/frontend/components/ui/input/button';
import { routes } from '@/frontend/router/routes';
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
