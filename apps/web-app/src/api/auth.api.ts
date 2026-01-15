import { apiClient } from './client';
import type { User, LoginResponse } from '@/types';

/**
 * Auth API functions
 * Separated from React hooks for testability and reusability
 */

/**
 * Check current authentication status
 * @returns The authenticated user or null
 */
export async function checkAuthStatus(): Promise<User | null> {
    try {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    } catch {
        return null;
    }
}

/**
 * Login with username and password
 * @param username
 * @param password
 * @returns The logged in user
 */
export async function login(username: string, password: string): Promise<User> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
        username,
        password,
    });
    return response.data.user;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
    await apiClient.post('/auth/logout');
}

/**
 * Register a new user
 * @param username
 * @param password
 * @returns The newly created user
 */
export async function register(username: string, password: string): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', {
        username,
        password,
    });
    return response.data;
}
