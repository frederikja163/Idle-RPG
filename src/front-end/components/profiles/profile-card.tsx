import React, { type FC, useCallback } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Trash2 } from 'lucide-react';
import { Row } from '../layout/row';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';
import { selectedProfileIdAtom } from '@/front-end/state/atoms.tsx';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';

interface Props {
  profile: Profile;
}

export const ProfileCard: FC<Props> = React.memo(function ProfileCard(props) {
  const { profile } = props;

  const socket = useSocket();
  const navigate = useNavigate();

  const [selectedProfileId, setSelectedProfileId] = useAtom(selectedProfileIdAtom);

  const isSelected = selectedProfileId === profile.id;

  const selectProfile = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      setSelectedProfileId(profile.id);

      if (isSelected) {
        navigate(routes.game);
        return;
      }

      socket?.send('Profile/SelectProfile', { profileId: profile.id });
    },
    [setSelectedProfileId, profile.id, isSelected, socket, navigate],
  );

  const deleteProfile = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      event.stopPropagation();

      socket?.send('Profile/DeleteProfile', { profileId: profile.id });
    },
    [socket, profile.id],
  );

  return (
    <Card
      className={`bg-primary w-64 h-96 p-4 cursor-pointer ${isSelected ? 'shadow-2xl' : ''}`}
      onClick={selectProfile}>
      <Column className="h-full items-center justify-between">
        <Typography className={`text-center text-lg ${isSelected ? 'font-bold' : ''}`}>{profile?.name}</Typography>
        <Row className="w-full justify-end">
          <div className="flex p-2">
            <Trash2 onClick={deleteProfile} />
          </div>
        </Row>
      </Column>
    </Card>
  );
});
