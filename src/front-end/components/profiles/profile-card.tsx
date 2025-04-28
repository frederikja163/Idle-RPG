import React, {type FC, useCallback} from 'react';
import {Column} from '@/front-end/components/layout/column.tsx';
import {Card} from '@/front-end/components/ui/card.tsx';
import {Trash2} from 'lucide-react';
import {Row} from '../layout/row';
import {useNavigate} from 'react-router-dom';
import {routes} from '@/front-end/router/routes.ts';
import {useSocket} from '@/front-end/providers/socket-provider.tsx';
import type {ProfileDto} from '@/shared/socket-types.ts';
import {Text} from '@/front-end/components/ui/text.tsx';

interface Props {
  profileIndex: number;
  profile: ProfileDto;
}

export const ProfileCard: FC<Props> = React.memo((props) => {
  const {profileIndex, profile} = props;

  const socket = useSocket();
  const navigate = useNavigate();

  const selectProfile = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    socket?.send('Profiles/SelectProfile', {index: profileIndex});
    navigate(routes.game);
  }, [socket, profileIndex, navigate]);

  const deleteProfile = useCallback((event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.stopPropagation();
    socket?.send('Profiles/DeleteProfile', {index: profileIndex});
  }, [socket, profileIndex]);

  return (
    <Card className="bg-green-200 w-64 h-96 p-4" onClick={selectProfile}>
      <Column className="h-full items-center justify-between">
        <Text className="text-center text-lg">{profile?.name}</Text>
        <Row className="w-full justify-end">
          <div className="flex p-2">
            <Trash2 onClick={deleteProfile}/>
          </div>
        </Row>
      </Column>
    </Card>);
});