import { useContext } from 'react';
import { AuthActionsContext } from '@/context/AuthActionsContext';
import type { AuthActions } from '@/types';

export function useAuthActions(): AuthActions {
    const context = useContext(AuthActionsContext);
    if (context === undefined) {
        throw new Error('useAuthActions must be used within an AuthProvider');
    }
    return context;
}
