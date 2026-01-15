import type { ReactNode } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

export function DashboardPage(): ReactNode {
    const { user } = useAuthState();
    const { logout } = useAuthActions();

    async function handleLogout(): Promise<void> {
        await logout();
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <button
                        onClick={() => void handleLogout()}
                        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                </div>
                <div className="p-6 bg-gray-800 rounded-lg">
                    <p className="text-lg">
                        Welcome, <span className="font-semibold">{user?.username}</span>!
                    </p>
                    <p className="mt-2 text-gray-400">
                        You are now logged in with HttpOnly cookie authentication.
                    </p>
                </div>
            </div>
        </div>
    );
}
