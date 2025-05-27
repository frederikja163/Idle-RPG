import React, { type FC, useEffect, useState } from 'react';
import { Row } from '@/front-end/components/layout/row.tsx';
import { ProfileCard } from '@/front-end/components/profiles/profile-card.tsx';
import { ProfileCreator } from '@/front-end/components/profiles/profile-creator.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';
import { routes } from '@/front-end/router/routes.ts';
import { useSetAtom } from 'jotai/index';
import { resetAtomsAtom } from '@/front-end/state/atoms.tsx';
import { useNavigate } from 'react-router-dom';

export const Profiles: FC = React.memo(function Profiles() {
  const socket = useSocket();
  const resetAtoms = useSetAtom(resetAtomsAtom);
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    socket?.send('Profile/GetProfiles', {});

    socket?.on('Profile/UpdateProfiles', (_, d) => {
      setProfiles(d.profiles);
    });
    socket?.on('Profile/SelectProfileSuccess', () => {
      resetAtoms();

      navigate(routes.game);
    });
  }, [navigate, resetAtoms, socket]);

  return (
    <Row className="w-full justify-center flex-wrap gap-6 m-6">
      {profiles?.map((profile, i) => <ProfileCard key={i} profile={profile} />)}
      {profiles?.length < 10 && <ProfileCreator />}
    </Row>
  );
});
