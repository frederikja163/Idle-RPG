import React, { type FC, type ReactNode } from 'react';
import { nameOf } from '@/front-end/lib/function-utils.ts';
import { AlertDialog } from 'radix-ui';
import { Row } from '@/front-end/components/ui/layout/row.tsx';
import { Button } from '@/front-end/components/ui/input/button.tsx';
import { Card } from '@/front-end/components/ui/card.tsx';
import { cardCva, contentCva, overlayCva, titleCva } from '@/front-end/components/ui/modals/styles.ts';
import { Typography } from '@/front-end/components/ui/typography.tsx';

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
