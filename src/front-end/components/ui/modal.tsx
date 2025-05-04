import React, {type FC, type ReactNode} from 'react';
import {Dialog} from 'radix-ui';
import {Card} from '@/front-end/components/ui/card.tsx';
import {X} from 'lucide-react';
import {Row} from '@/front-end/components/layout/row.tsx';
import {Typography} from '@/front-end/components/ui/typography.tsx';

interface Props {
  children: ReactNode | ReactNode[];
  content: ReactNode | ReactNode[];
  title: string;
  description?: ReactNode | ReactNode[];
  isOpen?: boolean;

  onClose?(): void;
}

export const Modal: FC<Props> = React.memo((props) => {
  const {children, content, title, description, isOpen, onClose} = props;

  return (<Dialog.Root open={isOpen}>
    <Dialog.Trigger>
      {children}
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed bg-black opacity-40" style={{inset: 0}}/>
      <Dialog.Content className="fixed top-1/2 left-1/2">
        <Card className="flex flex-col p-6 gap-6" style={{transform: 'translate(-50%, -50%)'}}>
          <Row>
            <Dialog.Title className="grow">
              <Typography className="text-xl">{title}</Typography>
            </Dialog.Title>
            <Dialog.Close onClick={onClose}>
              <X/>
            </Dialog.Close>
          </Row>
          {description && <Dialog.Description>
            {description}
          </Dialog.Description>}
          {content}
        </Card>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>);
});