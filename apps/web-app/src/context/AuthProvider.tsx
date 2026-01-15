import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import * as authApi from '@/api/auth.api';
import { AuthStateContext } from './AuthStateContext';
import { AuthActionsContext } from './AuthActionsContext';
import type { User } from '@/types';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async (): Promise<void> => {
        try {
            const userData = await authApi.checkAuthStatus();
            setUser(userData);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(
        async (username: string, password: string): Promise<void> => {
            const userData = await authApi.login(username, password);
            setUser(userData);
        },
        []
    );

    const logout = useCallback(async (): Promise<void> => {
        await authApi.logout();
        setUser(null);
    }, []);

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    const stateValue = useMemo(
        () => ({ user, isLoading }),
        [user, isLoading]
    );

    const actionsValue = useMemo(
        () => ({ login, logout, checkAuth }),
        [login, logout, checkAuth]
    );

    return (
        <AuthStateContext.Provider value={stateValue}>
            <AuthActionsContext.Provider value={actionsValue}>
                {children}
            </AuthActionsContext.Provider>
        </AuthStateContext.Provider>
    );
}
