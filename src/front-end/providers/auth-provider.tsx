import React, { createContext, type FC, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '@/front-end/App.tsx';
import type { CredentialResponse } from '@react-oauth/google';

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

export const AuthProvider: FC<Props> = React.memo((props) => {
  const { children } = props;

  const socket = useContext(SocketContext);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(
    (credentialResponse: CredentialResponse) => {
      if (!socket || !credentialResponse.credential) return;
      socket.send('Auth/GoogleLogin', { token: credentialResponse.credential });
    },
    [socket],
  );

  const logout = useCallback(() => {
    if (!socket) return;
    socket.send('Auth/Logout', {});
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('Auth/LoginSuccess', (s, d) => {
      setIsLoggedIn(true);
    });

    socket.on('Auth/LogoutSuccess', (s, d) => {
      setIsLoggedIn(false);
    });
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
