import { useContext } from 'react';
import {
    AuthActionsContext,
    type AuthActions,
} from '@/context/AuthActionsContext';

export function useAuthActions(): AuthActions {
    const context = useContext(AuthActionsContext);
    if (context === undefined) {
        throw new Error('useAuthActions must be used within an AuthProvider');
    }
    return context;
}
