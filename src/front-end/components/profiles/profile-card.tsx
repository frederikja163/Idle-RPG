import React, { type FC, useCallback, useContext } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Text } from '@radix-ui/themes';
import { Card } from '@/front-end/components/ui/card.tsx';
import type { ProfileDto } from '@/shared/socket-events.ts';
import { Trash2 } from 'lucide-react';
import { SocketContext } from '@/front-end/App.tsx';
import { Row } from '../layout/row';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';

interface Props {
  profileIndex: number;
  profile: ProfileDto;
}

export const ProfileCard: FC<Props> = React.memo((props) => {
  const { profileIndex, profile } = props;

  const socket = useContext(SocketContext);
  const navigate = useNavigate();

  const selectProfile = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      socket?.send('Profile/SelectProfile', { index: profileIndex });
      navigate(routes.game);
    },
    [socket, profileIndex, navigate],
  );

  const deleteProfile = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      event.stopPropagation();
      socket?.send('Profile/DeleteProfile', { index: profileIndex });
    },
    [socket, profileIndex],
  );

  return (
    <Card className="bg-green-200 w-64 h-96 p-4" onClick={selectProfile}>
      <Column className="h-full items-center justify-between">
        <Text className="text-center text-lg">{profile?.name}</Text>
        <Row className="w-full justify-end">
          <div className="flex p-2">
            <Trash2 onClick={deleteProfile} />
          </div>
        </Row>
      </Column>
    </Card>
  );
});
