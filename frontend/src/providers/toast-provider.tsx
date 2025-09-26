import React, { createContext, type FC, type ReactNode, useCallback, useContext, useState } from 'react';
import type { ProviderProps } from '@/frontend/types/provider-types';
import { Toast } from 'radix-ui';

type ToastType = 'info' | 'success' | 'warning' | 'error';

const typeColorMap = new Map<ToastType, string>([
  ['info', 'bg-blue-400'],
  ['success', 'bg-green-400'],
  ['warning', 'bg-amber-400'],
  ['error', 'bg-red-400'],
]);

interface IToastContext {
  displayToast: (text: string, type?: ToastType, duration?: number) => void;
}

const initialState: IToastContext = {
  displayToast: () => {},
};

const ToastContext = createContext<IToastContext>(initialState);

export const useToast = (): IToastContext => useContext(ToastContext);

export const ToastProvider: FC<ProviderProps> = React.memo(function ToastProvider(props) {
  const { children } = props;

  const [toasts, setToasts] = useState<(ReactNode | undefined)[]>([]);
  const [pointer, setPointer] = useState(0);

  const displayToast = useCallback(
    (text: string, type: ToastType = 'info', duration: number = 5000) => {
      setToasts((prevToasts) => {
        const newToasts = [...prevToasts];

        newToasts[pointer] = (
          <Toast.Root
            key={pointer}
            duration={duration}
            className={`w-80 text-primary-foreground p-4 my-2 rounded shadow ${typeColorMap.get(type)}`}>
            <Toast.Description>{text}</Toast.Description>
          </Toast.Root>
        );

        return newToasts;
      });

      setTimeout(() => {
        setToasts((prevToasts) => {
          const newToasts = [...prevToasts];
          newToasts[pointer] = undefined;
          return newToasts;
        });
      }, duration + 1000); // Remove 1 second later to allow for animation

      setPointer((prevPointer) => (prevPointer >= 100 ? 0 : prevPointer + 1));
    },
    [pointer],
  );

  return (
    <ToastContext.Provider
      value={{
        displayToast,
      }}>
      <Toast.Provider>
        {toasts}
        <Toast.Viewport className="fixed bottom-0 right-0 m-4" />
        {children}
      </Toast.Provider>
    </ToastContext.Provider>
  );
});
