import { createContext } from 'react';

export interface User {
    id: number;
    username: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
}

export const AuthStateContext = createContext<AuthState | undefined>(undefined);
