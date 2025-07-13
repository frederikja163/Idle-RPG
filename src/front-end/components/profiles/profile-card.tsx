import React, { type FC, useCallback, useMemo } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Trash2 } from 'lucide-react';
import { Row } from '../layout/row';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';
import { selectedProfileIdAtom } from '@/front-end/store/atoms.tsx';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { activities, type ItemAmount } from '@/shared/definition/definition-activities.ts';
import { Array } from '@sinclair/typebox';
import { Image } from '@/front-end/components/ui/image';
import { Label } from '../ui/label';

interface Props {
  profile: Partial<Profile>;
}

export const ProfileCard: FC<Props> = React.memo(function ProfileCard(props) {
  const { profile } = props;

  const socket = useSocket();
  const navigate = useNavigate();

  const selectedProfileId = useAtomValue(selectedProfileIdAtom);

  const isSelected = selectedProfileId === profile.id;

  const activityDef = useMemo(() => activities.get(profile.activityId ?? ''), [profile.activityId]);

  const activityImage = useMemo(() => {
    if (!activityDef) {
      console.log('Nej');
      return <></>;
    }

    if (activityDef.result instanceof Array) {
      return (
        <Row>
          {(activityDef.result as ItemAmount[]).map((item: ItemAmount) => (
            <Image
              key={`${profile.id}${item.itemId}`}
              src={`${import.meta.env.VITE_BASE_URL}/assets/items/${item.itemId}.svg`}
              alt={activityDef.display}
            />
          ))}
        </Row>
      );
    }

    return (
      <Image
        src={`${import.meta.env.VITE_BASE_URL}/assets/items/${(activityDef.result as ItemAmount).itemId}.svg`}
        alt={activityDef.display}
      />
    );
  }, [activityDef, profile.id]);

  const selectProfile = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      if (isSelected) {
        navigate(routes.game);
        return;
      }

      socket?.send('Profile/Select', { profileId: profile.id! });
    },
    [profile.id, isSelected, socket, navigate],
  );

  const deleteProfile = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      socket?.send('Profile/Delete', { profileId: profile.id! });
    },
    [socket, profile.id],
  );

  // TODO: add label boks her nede
  return (
    <Card
      className={`flex flex-col w-60 h-96 cursor-pointer overflow-hidden ${isSelected ? 'shadow-2xl' : ''}`}
      onClick={selectProfile}>
      <Row className="bg-primary w-full h-1/3 p-4">{activityImage}</Row>
      <Column className="grow p-2">
        <Typography className="text-lg">{profile?.name}</Typography>
        <Label>hej</Label>
        <Row className="w-full justify-end mt-auto">
          <Row onClick={deleteProfile} className="bg-red-400 p-2 rounded-full">
            <Trash2 color="#f0f0f0" />
          </Row>
        </Row>
      </Column>
    </Card>
  );
});
