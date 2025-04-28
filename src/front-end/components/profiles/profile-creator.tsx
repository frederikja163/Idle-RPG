import React, {type FC, type FormEvent, useCallback, useMemo} from 'react';
import {Card} from '@/front-end/components/ui/card.tsx';
import {Plus} from 'lucide-react';
import {Form} from 'radix-ui';
import {Input} from '@/front-end/components/ui/input.tsx';
import {Text} from '@/front-end/components/ui/text.tsx';
import {Modal} from '@/front-end/components/ui/modal.tsx';
import {Button} from '@/front-end/components/ui/button.tsx';
import {Column} from '@/front-end/components/layout/column.tsx';
import {getFormData} from '@/front-end/lib/utils.ts';
import {useNavigate} from 'react-router-dom';
import {routes} from '@/front-end/router/routes.ts';
import {useSocket} from '@/front-end/providers/socket-provider.tsx';

interface ProfileForm {
  name: string;
}

export const ProfileCreator: FC = React.memo(() => {
  const socket = useSocket();
  const navigate = useNavigate();

  const createProfile = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = getFormData<ProfileForm>(event);
    socket?.send('Profiles/CreateProfile', {name: formData.name});

    navigate(routes.game);
  }, [socket, navigate]);

  const modalContent = useMemo(() => (
    <Form.Root onSubmit={createProfile}>
      <Column className="flex items-center gap-6">
        <Form.Field name="name">
          <Form.Control asChild>
            <Input placeholder="Name" required></Input>
          </Form.Control>
        </Form.Field>
        <Form.Submit>
          <Button>
            <Plus/>
            <Text>Create profile</Text>
          </Button>
        </Form.Submit>
      </Column>
    </Form.Root>), [createProfile]);

  return (
    <Modal content={modalContent} description="Enter profile details">
      <Card className="bg-green-200 w-64 h-96 p-4 flex items-center justify-center">
        <Plus size={100}/>
      </Card>
    </Modal>);
});
