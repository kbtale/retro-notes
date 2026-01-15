import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

interface ApiErrorResponse {
    message: string | string[];
    error?: string;
    statusCode: number;
}

/**
 * Configured Axios instance for API communication
 */
export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // Required for cookie-based auth
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor
 * Currently cookies are handled automatically via withCredentials
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.metadata = { startTime: new Date() };
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor
 * Handles global error transformation
 * Redirects to login on 401 Unauthorized
 */
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        // Network error or no response
        if (!error.response) {
            return Promise.reject(
                new ApiError(
                    'Network error. Please check your connection.',
                    0,
                    'NETWORK_ERROR'
                )
            );
        }

        const { status, data } = error.response;

        // Format error message
        let message = 'An unexpected error occurred';
        if (data?.message) {
            message = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message;
        }

        // Handle 401 Unauthorized session expired or not logged in
        if (status === 401) {
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(new ApiError('Session expired. Please log in again.', status, 'UNAUTHORIZED'));
        }

        // Handle 403 Forbidden
        if (status === 403) {
            return Promise.reject(new ApiError('You do not have permission to perform this action.', status, 'FORBIDDEN'));
        }

        // Handle 404 Not Found
        if (status === 404) {
            return Promise.reject(new ApiError('The requested resource was not found.', status, 'NOT_FOUND'));
        }

        // Handle 422/400 Validation errors
        if (status === 400 || status === 422) {
            return Promise.reject(new ApiError(message, status, 'VALIDATION_ERROR'));
        }

        // Handle 500+ Server errors
        if (status >= 500) {
            return Promise.reject(new ApiError('Server error. Please try again later.', status, 'SERVER_ERROR'));
        }

        // Generic error fallback
        return Promise.reject(new ApiError(message, status));
    }
);

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: Date;
        };
    }
}
