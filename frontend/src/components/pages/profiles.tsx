import React, { type FC, useMemo } from 'react';
import { Row } from '@/frontend/components/ui/layout/row';
import { ProfileCard } from '@/frontend/components/profiles/profile-card';
import { ProfileCreator } from '@/frontend/components/profiles/profile-creator';
import { useSendSocket } from '@/frontend/providers/socket-provider';
import { profilesAtom } from '@/frontend/store/atoms';
import { useAtomValue } from 'jotai';
import { Typography } from '@/frontend/components/ui/typography';
import { Column } from '@/frontend/components/ui/layout/column';
import { mapValuesToArray } from '@/frontend/lib/array-utils';

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
        {mapValuesToArray(profiles).map((profile) => (
          <ProfileCard key={`${profile.id}${Date.now()}`} profile={profile} />
        ))}
        {profiles?.size < 10 && <ProfileCreator isOpenInitial={false} />}
      </Row>
    </Column>
  );
});
