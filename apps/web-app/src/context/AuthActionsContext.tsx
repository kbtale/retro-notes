import { createContext } from 'react';
import type { AuthActions } from '@/types';

export const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

// Re-export types for backward compatibility
export type { AuthActions } from '@/types';
