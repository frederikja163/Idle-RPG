import React, { createContext, type FC, type ReactNode, useCallback, useContext, useState } from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import { useOnSocket, useSocket } from '@/front-end/state/socket-provider.tsx';

interface IAuthContext {
  isLoggedIn: boolean;
  login?: (credentialResponse: CredentialResponse) => void;
  logout?: () => void;
}

const initialState: IAuthContext = {
  isLoggedIn: false,
  login: undefined,
  logout: undefined,
};

const AuthContext = createContext<IAuthContext>(initialState);
export const useAuth = (): IAuthContext => useContext(AuthContext);

interface Props {
  children: ReactNode | ReactNode[];
}

export const AuthProvider: FC<Props> = React.memo(function AuthProvider(props) {
  const { children } = props;

  const socket = useSocket();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useOnSocket('Auth/LoginSuccess', (_, __) => {
    setIsLoggedIn(true);
  });

  useOnSocket('Auth/LogoutSuccess', (_, __) => {
    setIsLoggedIn(false);
  });

  const login = useCallback(
    (credentialResponse: CredentialResponse) => {
      if (!socket || !credentialResponse.credential) return;
      socket.send('User/GoogleLogin', { token: credentialResponse.credential });
    },
    [socket],
  );

  const logout = useCallback(() => {
    if (!socket) return;
    socket.send('User/Logout', {});
  }, [socket]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
});
