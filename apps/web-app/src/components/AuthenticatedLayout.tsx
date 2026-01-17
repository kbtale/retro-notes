import type { ReactNode } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';
import { Button } from '@/components/ui/8bit/button';
import { useCallback } from 'react';

interface AuthenticatedLayoutProps {
    children: ReactNode;
    /** Optional custom header content to replace the default title */
    headerContent?: ReactNode;
    /** Whether to show the sidebar (default: true) */
    showSidebar?: boolean;
    /** Custom sidebar content */
    sidebarContent?: ReactNode;
}

/**
 * Shared layout for authenticated routes.
 * Provides consistent header with logout and optional sidebar.
 */
export function AuthenticatedLayout({
    children,
    headerContent,
    showSidebar = true,
    sidebarContent,
}: AuthenticatedLayoutProps): ReactNode {
    const { user } = useAuthState();
    const { logout } = useAuthActions();

    const handleLogout = useCallback(async () => {
        await logout();
    }, [logout]);

    return (
        <Dashboard.Root>
            <Dashboard.Header>
                {headerContent ?? (
                    <h1 className="retro flex-1 text-lg font-bold md:text-xl">
                        RetroNotes
                    </h1>
                )}
                <span className="retro hidden text-sm text-muted-foreground md:block">
                    {user?.username}
                </span>
                <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
                    Logout
                </Button>
            </Dashboard.Header>

            <Dashboard.Body>
                {showSidebar && sidebarContent && (
                    <Dashboard.Sidebar>{sidebarContent}</Dashboard.Sidebar>
                )}
                <Dashboard.Content>{children}</Dashboard.Content>
            </Dashboard.Body>
        </Dashboard.Root>
    );
}
