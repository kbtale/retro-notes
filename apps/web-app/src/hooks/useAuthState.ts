import { useContext } from 'react';
import { AuthStateContext } from '@/context/AuthStateContext';
import type { AuthState } from '@/types';

export function useAuthState(): AuthState {
    const context = useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error('useAuthState must be used within an AuthProvider');
    }
    return context;
}
