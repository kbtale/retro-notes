import { useContext } from 'react';
import { AuthStateContext, type AuthState } from '@/context/AuthStateContext';

export function useAuthState(): AuthState {
    const context = useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error('useAuthState must be used within an AuthProvider');
    }
    return context;
}
