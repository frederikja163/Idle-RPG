import React, { type FC, useCallback, useMemo } from 'react';
import { Column } from '@/front-end/components/layout/column.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Trash2 } from 'lucide-react';
import { Row } from '../layout/row';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';
import { selectedProfileIdAtom } from '@/front-end/state/atoms.tsx';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { activities, type ItemAmount } from '@/shared/definition/definition-activities.ts';
import { Array } from '@sinclair/typebox';
import { Image } from '@/front-end/components/ui/image';

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
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      event.stopPropagation();

      socket?.send('Profile/Delete', { profileId: profile.id! });
    },
    [socket, profile.id],
  );

  return (
    <Card
      className={`bg-primary w-64 h-96 p-4 cursor-pointer ${isSelected ? 'shadow-2xl' : ''}`}
      onClick={selectProfile}>
      <Column className="h-full items-center justify-between">
        {activityImage}
        {/*<Image src={`${import.meta.env.VITE_BASE_URL}/assets/items/${activityDef?.result.itemId}.svg`} alt={} />*/}
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
