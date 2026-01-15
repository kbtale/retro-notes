import {
    useState,
    useCallback,
    useEffect,
    useMemo,
    type ReactNode,
} from 'react';
import { apiClient } from '@/api/client';
import { AuthStateContext, type User } from './AuthStateContext';
import { AuthActionsContext } from './AuthActionsContext';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async (): Promise<void> => {
        try {
            const response = await apiClient.get<{ id: number; username: string }>(
                '/auth/me',
            );
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(
        async (username: string, password: string): Promise<void> => {
            const response = await apiClient.post<{
                success: boolean;
                user: User;
            }>('/auth/login', { username, password });
            setUser(response.data.user);
        },
        [],
    );

    const logout = useCallback(async (): Promise<void> => {
        await apiClient.post('/auth/logout');
        setUser(null);
    }, []);

    useEffect(() => {
        void checkAuth();
    }, [checkAuth]);

    const stateValue = useMemo(
        () => ({ user, isLoading }),
        [user, isLoading],
    );

    const actionsValue = useMemo(
        () => ({ login, logout, checkAuth }),
        [login, logout, checkAuth],
    );

    return (
        <AuthStateContext.Provider value={stateValue}>
            <AuthActionsContext.Provider value={actionsValue}>
                {children}
            </AuthActionsContext.Provider>
        </AuthStateContext.Provider>
    );
}
