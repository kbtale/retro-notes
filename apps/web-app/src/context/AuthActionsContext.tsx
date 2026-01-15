import { createContext } from 'react';

export interface AuthActions {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const AuthActionsContext = createContext<AuthActions | undefined>(
    undefined,
);
