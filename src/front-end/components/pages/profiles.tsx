import React, { type FC, useMemo } from 'react';
import { Row } from '@/front-end/components/layout/row.tsx';
import { ProfileCard } from '@/front-end/components/profiles/profile-card.tsx';
import { ProfileCreator } from '@/front-end/components/profiles/profile-creator.tsx';
import { useSendSocket } from '@/front-end/providers/socket-provider.tsx';
import { profilesAtom } from '@/front-end/store/atoms.tsx';
import { useAtomValue } from 'jotai';

export const Profiles: FC = React.memo(function Profiles() {
  const profiles = useAtomValue(profilesAtom);

  const data = useMemo(
    () => ({
      profiles: {
        id: true,
        name: true,
      },
    }),
    [],
  );
  useSendSocket('Profile/QueryMany', data);

  return (
    <Row className="w-full justify-center flex-wrap gap-6 m-6">
      {profiles?.values().map((profile) => <ProfileCard key={profile.id} profile={profile} />)}
      {profiles?.size < 10 && <ProfileCreator />}
    </Row>
  );
});
