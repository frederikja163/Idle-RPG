import React, { type FC, useMemo } from 'react';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import { ProfileCard } from '@/front-end/components/profiles/profile-card.tsx';
import { ProfileCreator } from '@/front-end/components/profiles/profile-creator.tsx';
import { useSendSocket } from '@/front-end/providers/socket-provider.tsx';
import { profilesAtom } from '@/front-end/store/atoms.tsx';
import { useAtomValue } from 'jotai';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Column } from '@/front-end/components/ui/layout/column.tsx';

export const Profiles: FC = React.memo(function Profiles() {
  const profiles = useAtomValue(profilesAtom);

  const data = useMemo(
    () => ({
      profiles: {
        id: true,
        name: true,
        activityId: true,
        firstLogin: true,
        lastLogin: true,
      },
    }),
    [],
  );
  useSendSocket('Profile/QueryMany', data);

  // TODO: add isOpenInitial when we have loading state
  return (
    <Column>
      <Typography className="text-2xl text-center p-8">Pick a profile</Typography>
      <Row className="w-full justify-center flex-wrap gap-6">
        {profiles?.values().map((profile) => <ProfileCard key={`${profile.id}${Date.now()}`} profile={profile} />)}
        {profiles?.size < 10 && <ProfileCreator isOpenInitial={false} />}
      </Row>
    </Column>
  );
});
