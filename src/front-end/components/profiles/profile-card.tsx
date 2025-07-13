import React, { type FC, useCallback, useMemo, useState } from 'react';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Trash2 } from 'lucide-react';
import { Row } from '@/front-end/components/ui/layout/row';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';
import { profilesAtom, selectedProfileIdAtom } from '@/front-end/store/atoms.tsx';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/front-end/router/routes.ts';
import { activities, type ItemAmount } from '@/shared/definition/definition-activities.ts';
import { Array } from '@sinclair/typebox';
import { Image } from '@/front-end/components/ui/image';
import { LabelBox } from '@/front-end/components/ui/label-box.tsx';
import { nameOf } from '@/front-end/lib/function-utils.ts';
import { RoundButton } from '@/front-end/components/ui/input/round-button.tsx';
import { LabeledText } from '@/front-end/components/ui/labeled-text.tsx';
import { BasicTooltip } from '@/front-end/components/ui/basic-tooltip.tsx';
import { Modal } from '@/front-end/components/ui/modal.tsx';
import { Button } from '@/front-end/components/ui/input/button.tsx';
import { useSetAtom } from 'jotai/index';

interface Props {
  profile: Partial<Profile>;
}

export const ProfileCard: FC<Props> = React.memo((props) => {
  const { profile } = props;

  const socket = useSocket();
  const navigate = useNavigate();

  const setProfiles = useSetAtom(profilesAtom);
  const selectedProfileId = useAtomValue(selectedProfileIdAtom);

  const isSelected = selectedProfileId === profile.id;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const activityDef = useMemo(() => activities.get(profile.activityId ?? ''), [profile.activityId]);

  const activityImage = useMemo(() => {
    if (!activityDef) {
      return <></>;
    }

    if (activityDef.result instanceof Array) {
      return (
        <Row>
          {(activityDef.result as ItemAmount[]).map((item: ItemAmount) => (
            <Image
              key={item.itemId}
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
  }, [activityDef]);

  const selectProfile = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      console.log('💔💔💔💔');
      if (isSelected) {
        navigate(routes.game);
        return;
      }

      socket?.send('Profile/Select', { profileId: profile.id! });
    },
    [profile.id, isSelected, socket, navigate],
  );

  const deleteProfile = useCallback(() => {
    socket?.send('Profile/Delete', { profileId: profile.id! });
    // setProfiles()
  }, [socket, profile.id]);

  const promptDelete = useCallback(() => setDeleteModalOpen(true), []);

  const closeModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);

  const modalContent = useMemo(
    () => (
      <Row className="justify-center gap-6">
        <Button onClick={deleteProfile} className="bg-red-400 hover:bg-red-400/60">
          Delete
        </Button>
        <Button onClick={closeModal} variant="outline">
          Cancel
        </Button>
      </Row>
    ),
    [closeModal, deleteProfile],
  );

  return (
    <>
      <Card className={`flex flex-col w-60 h-96 cursor-pointer overflow-hidden`} onClick={selectProfile}>
        <Row className={`w-full h-1/3 p-6 ${isSelected ? 'bg-primary' : 'bg-gray-200'}`}>{activityImage}</Row>
        <Column className="grow p-2 gap-8 relative max-w-full">
          <Row className="gap-2 items-center max-w-full">
            <BasicTooltip
              delayDuration={500}
              tooltipContent={
                <Card className="p-1">
                  <Typography>{profile?.name}</Typography>
                </Card>
              }>
              <Typography noWrap className="text-lg">
                {profile?.name}
              </Typography>
            </BasicTooltip>
            {isSelected && <LabelBox text="Active" className="bg-primary text-primary-foreground font-bold" />}
          </Row>
          <Column className="gap-2 opacity-80">
            <LabeledText label="Current activity" text={activityDef?.display ?? 'Inactive'} />
            <LabeledText label="First login" text={profile.firstLogin?.toLocaleString() ?? 'Unknown'} />
            <LabeledText label="Last login" text={profile.lastLogin?.toLocaleString() ?? 'Unknown'} />
          </Column>
          <RoundButton onClick={promptDelete} className="bg-red-400 hover:bg-red-400/60 absolute bottom-0 right-0 m-2">
            <Trash2 color="#f0f0f0" />
          </RoundButton>
        </Column>
      </Card>
      <Modal
        title="Delete profile"
        description={`Are you sure you want to delete profile named: ${profile.name}?`}
        content={modalContent}
        isOpen={deleteModalOpen}
        onClose={closeModal}
      />
    </>
  );
});

ProfileCard.displayName = nameOf({ ProfileCard });
