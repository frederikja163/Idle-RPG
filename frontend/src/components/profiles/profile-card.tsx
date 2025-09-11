import React, { type FC, useCallback, useMemo, useState } from 'react';
import { Column } from '@/frontend/components/ui/layout/column';
import { Card } from '@/frontend/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Row } from '@/frontend/components/ui/layout/row';
import { useSocket } from '@/frontend/providers/socket-provider';
import { Typography } from '@/frontend/components/ui/typography';
import type { Profile } from '@/shared/definition/schema/types/types-profiles';
import { selectedProfileIdAtom } from '@/frontend/store/atoms';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/frontend/router/routes';
import { craftingRecipes, type ItemAmount } from '@/shared/definition/definition-crafting';
import { Image } from '@/frontend/components/ui/image';
import { LabelBox } from '@/frontend/components/ui/label-box';
import { nameOf } from '@/frontend/lib/function-utils';
import { RoundButton } from '@/frontend/components/ui/input/round-button';
import { LabeledText } from '@/frontend/components/ui/labeled-text';
import { BasicTooltip } from '@/frontend/components/ui/basic-tooltip';
import { dateTimeNoSeconds } from '@/frontend/constants/date-time-consts';
import { Dialog } from '@/frontend/components/ui/modals/dialog';

interface Props {
  profile: Partial<Profile>;
}

export const ProfileCard: FC<Props> = React.memo((props) => {
  const { profile } = props;

  const socket = useSocket();
  const navigate = useNavigate();

  const selectedProfileId = useAtomValue(selectedProfileIdAtom);

  const isSelected = selectedProfileId === profile.id;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const activityDisplay = useMemo(() => {
    switch (profile.activity?.type) {
      case 'crafting': {
        const recipe = craftingRecipes.get(profile.activity.recipeId);
        if (!recipe) break;

        return recipe.display;
      }
    }

    return 'Inactive';
  }, [profile]);

  const activityImage = useMemo(() => {
    switch (profile.activity?.type) {
      case 'crafting': {
        const result = craftingRecipes.get(profile.activity.recipeId)?.result;
        if (!result) break;

        return (
          <Row>
            {result.map((item: ItemAmount) => (
              <Image
                key={item.itemId}
                src={`${import.meta.env.VITE_BASE_URL}/assets/items/${item.itemId}.svg`}
                alt={item.itemId}
              />
            ))}
          </Row>
        );
      }
    }

    return <></>;
  }, [profile]);

  const openDeleteModal = useCallback(() => setDeleteModalOpen(true), []);
  const closeDeleteModal = useCallback(() => setDeleteModalOpen(false), []);

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
    () => socket?.send('Profile/Delete', { profileId: profile.id! }),
    [socket, profile.id],
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
            <LabeledText label="Current activity" text={activityDisplay} />
            <LabeledText
              label="First login"
              text={
                profile.firstLogin
                  ? new Date(profile.firstLogin).toLocaleString(undefined, dateTimeNoSeconds)
                  : 'Unknown'
              }
            />
            <LabeledText
              label="Last login"
              text={
                profile.lastLogin ? new Date(profile.lastLogin).toLocaleString(undefined, dateTimeNoSeconds) : 'Unknown'
              }
            />
          </Column>
          <RoundButton
            onClick={openDeleteModal}
            className="bg-red-400 hover:bg-red-400/60 absolute bottom-0 right-0 m-2">
            <Trash2 color="#f0f0f0" />
          </RoundButton>
        </Column>
      </Card>
      <Dialog
        title="Delete profile"
        description={`Are you sure you want to delete profile named: ${profile.name}?`}
        isOpen={deleteModalOpen}
        actionText="Delete"
        onAction={deleteProfile}
        onCancel={closeDeleteModal}
        actionButtonClassName="bg-red-400 hover:bg-red-400/60"
      />
    </>
  );
});

ProfileCard.displayName = nameOf({ ProfileCard });
