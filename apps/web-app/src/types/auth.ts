import type { User } from './user';

/**
 * Authentication state
 */
export interface AuthState {
    user: User | null;
    isLoading: boolean;
}

/**
 * Authentication actions available to the app
 */
export interface AuthActions {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

/**
 * Login credentials DTO
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * Login response from API
 */
export interface LoginResponse {
    success: boolean;
    user: User;
}
