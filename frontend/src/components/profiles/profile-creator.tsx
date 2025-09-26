import React, { type FC, type FormEvent, useCallback, useMemo, useState } from 'react';
import { Card } from '@/frontend/components/ui/card';
import { Plus } from 'lucide-react';
import { Form } from 'radix-ui';
import { Input } from '@/frontend/components/ui/input/input';
import { Typography } from '@/frontend/components/ui/typography';
import { Modal } from '@/frontend/components/ui/modals/modal';
import { Button } from '@/frontend/components/ui/input/button';
import { Column } from '@/frontend/components/ui/layout/column';
import { getFormData } from '@/frontend/lib/utils';
import { useSocket } from '@/frontend/providers/socket-provider';

interface ProfileForm {
  name: string;
}

interface Props {
  isOpenInitial?: boolean;
}

export const ProfileCreator: FC<Props> = React.memo(function ProfileCreator(props) {
  const { isOpenInitial = false } = props;

  const socket = useSocket();

  const [isOpen, setIsOpen] = useState(isOpenInitial);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const createProfile = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const formData = getFormData<ProfileForm>(event);
      socket?.send('Profile/Create', { name: formData.name });

      setIsOpen(false);
    },
    [socket],
  );

  const modalContent = useMemo(
    () => (
      <Form.Root onSubmit={createProfile}>
        <Column className="flex items-center gap-6">
          <Form.Field name="name">
            <Form.Control asChild>
              <Input placeholder="Name" required></Input>
            </Form.Control>
          </Form.Field>
          <Form.Submit asChild>
            <Button>
              <Plus />
              <Typography>Create profile</Typography>
            </Button>
          </Form.Submit>
        </Column>
      </Form.Root>
    ),
    [createProfile],
  );

  return (
    <Modal
      content={modalContent}
      title="Create profile"
      description="Enter profile details"
      isOpen={isOpen}
      onClose={closeModal}>
      <Card onClick={openModal} className="w-60 h-96 p-4 flex flex-col items-center justify-center cursor-pointer">
        <Plus size={100} />
        <Typography>Create new profile</Typography>
      </Card>
    </Modal>
  );
});
