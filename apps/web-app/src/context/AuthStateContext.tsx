import { createContext } from 'react';
import type { AuthState } from '@/types';

export const AuthStateContext = createContext<AuthState | undefined>(undefined);

// Re-export types for backward compatibility
export type { AuthState, User } from '@/types';
