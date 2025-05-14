import React, { type FC, useEffect, useState } from 'react';
import { Row } from '@/front-end/components/layout/row.tsx';
import { ProfileCard } from '@/front-end/components/profiles/profile-card.tsx';
import { ProfileCreator } from '@/front-end/components/profiles/profile-creator.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';

export const Profiles: FC = React.memo(function Profiles() {
  const socket = useSocket();

  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    socket?.send('Profile/GetProfiles', {});
    socket?.on('Profile/UpdateProfiles', (_, d) => {
      setProfiles(d.profiles);
    });
  }, [socket]);

  return (
    <Row className="w-full justify-center flex-wrap gap-6 m-6">
      {profiles?.map((profile, i) => <ProfileCard key={i} profileIndex={i} profile={profile} />)}
      {profiles?.length < 10 && <ProfileCreator />}
    </Row>
  );
});
