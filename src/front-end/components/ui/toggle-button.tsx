import { Toggle } from 'radix-ui';
import React, { type FC, type ReactNode } from 'react';

interface Props {
  label: string;
  pressed?: boolean;
  onPressedChanged?: (pressed: boolean) => void;
  children: ReactNode;
}

export const ToggleButton: FC<Props> = React.memo(function ToggleButton(props) {
  const { label, pressed, onPressedChanged, children } = props;

  return (
    <Toggle.Root pressed={pressed} onPressedChange={onPressedChanged} aria-label={label} className="cursor-pointer">
      {children}
    </Toggle.Root>
  );
});
