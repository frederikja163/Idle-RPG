import React, { type FC, useCallback } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Trash2 } from 'lucide-react';
import { Row } from '../layout/row';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';

interface Props {
  profile: Profile;
}

export const ProfileCard: FC<Props> = React.memo(function ProfileCard(props) {
  const { profile } = props;

  const socket = useSocket();
  const navigate = useNavigate();

  const selectProfile = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      socket?.send('Profile/SelectProfile', { profileId: profile.id });
      navigate(routes.game);
    },
    [socket, profile.id, navigate],
  );

  const deleteProfile = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      event.stopPropagation();
      socket?.send('Profile/DeleteProfile', { profileId: profile.id });
    },
    [socket, profile.id],
  );

  return (
    <Card className="bg-primary w-64 h-96 p-4" onClick={selectProfile}>
      <Column className="h-full items-center justify-between">
        <Typography className="text-center text-lg">{profile?.name}</Typography>
        <Row className="w-full justify-end">
          <div className="flex p-2">
            <Trash2 onClick={deleteProfile} />
          </div>
        </Row>
      </Column>
    </Card>
  );
});
