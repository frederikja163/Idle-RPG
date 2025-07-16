import React, { type FC, type ReactNode, useCallback } from 'react';
import { Dialog } from 'radix-ui';
import { Card } from '@/front-end/components/ui/card.tsx';
import { X } from 'lucide-react';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import { Typography } from '@/front-end/components/ui/typography.tsx';
import { cardCva, contentCva, overlayCva, titleCva } from '@/front-end/components/ui/modals/styles.ts';

interface Props {
  children?: ReactNode | ReactNode[];
  content?: ReactNode | ReactNode[];
  title: string;
  description?: ReactNode | ReactNode[];
  isOpen?: boolean;
  onClose?: () => void;
}

export const Modal: FC<Props> = React.memo(function Modal(props) {
  const { children, content, title, description, isOpen, onClose } = props;

  const handleClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      if (onClose) onClose();
    },
    [onClose],
  );

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayCva()} />
        <Dialog.Content className={contentCva()}>
          <Card className={cardCva()}>
            <Row>
              <Dialog.Title className="grow">
                <Typography className={titleCva()}>{title}</Typography>
              </Dialog.Title>
              <Dialog.Close onClick={onClose ? handleClose : undefined} className="cursor-pointer">
                <X />
              </Dialog.Close>
            </Row>
            {description && (
              <Dialog.Description>
                <Typography>{description}</Typography>
              </Dialog.Description>
            )}
            {content}
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
