import React, { type FC, type FormEvent, useCallback, useMemo, useState } from 'react';
import { Card } from '@/front-end/components/ui/card.tsx';
import { Plus } from 'lucide-react';
import { Form } from 'radix-ui';
import { Input } from '@/front-end/components/ui/input/input.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { Modal } from '@/front-end/components/ui/modal.tsx';
import { Button } from '@/front-end/components/ui/input/button.tsx';
import { Column } from '@/front-end/components/ui/layout/column.tsx';
import { getFormData } from '@/front-end/lib/utils.ts';
import { useSocket } from '@/front-end/providers/socket-provider.tsx';

interface ProfileForm {
  name: string;
}

export const ProfileCreator: FC = React.memo(function ProfileCreator() {
  const socket = useSocket();

  const [isOpen, setIsOpen] = useState(false);

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
          <Form.Submit>
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
      <Card onClick={openModal} className="w-60 h-96 p-4 flex items-center justify-center cursor-pointer">
        <Plus size={100} />
      </Card>
    </Modal>
  );
});
