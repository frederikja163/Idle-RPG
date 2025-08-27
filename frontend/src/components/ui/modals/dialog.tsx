import React, { type FC, type ReactNode } from 'react';
import { nameOf } from '@/frontend/lib/function-utils';
import { AlertDialog } from 'radix-ui';
import { Row } from '@/frontend/components/ui/layout/row';
import { Button } from '@/frontend/components/ui/input/button';
import { Card } from '@/frontend/components/ui/card';
import { cardCva, contentCva, overlayCva, titleCva } from '@/frontend/components/ui/modals/styles';
import { Typography } from '@/frontend/components/ui/typography';

interface Props {
  children?: ReactNode | ReactNode[];
  isOpen?: boolean;
  title: string;
  description?: ReactNode | ReactNode[];
  actionText?: string;
  cancelText?: string;
  actionButtonClassName?: string;
  cancelButtonClassName?: string;
  onAction: () => void;
  onCancel?: () => void;
}

export const Dialog: FC<Props> = React.memo((props) => {
  const {
    children,
    isOpen,
    title,
    description,
    actionText = 'Ok',
    cancelText = 'Cancel',
    actionButtonClassName,
    cancelButtonClassName,
    onAction,
    onCancel,
  } = props;

  return (
    <AlertDialog.Root open={isOpen}>
      <AlertDialog.Trigger>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={overlayCva()} />
        <AlertDialog.Content className={contentCva()}>
          <Card className={cardCva()}>
            <AlertDialog.Title>
              <Typography className={titleCva()}>{title}</Typography>
            </AlertDialog.Title>
            {description && (
              <AlertDialog.Description>
                <Typography>{description}</Typography>
              </AlertDialog.Description>
            )}
            <Row className="justify-center gap-6">
              <AlertDialog.Action>
                <Button onClick={onAction} className={actionButtonClassName}>
                  {actionText}
                </Button>
              </AlertDialog.Action>
              <AlertDialog.Cancel>
                <Button onClick={onCancel} variant="outline" className={cancelButtonClassName}>
                  {cancelText}
                </Button>
              </AlertDialog.Cancel>
            </Row>
          </Card>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
});

Dialog.displayName = nameOf({ Dialog });
