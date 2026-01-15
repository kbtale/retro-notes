/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/8bit/button';

interface DashboardContextValue {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

function useDashboardContext(): DashboardContextValue {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('Dashboard compound components must be used within Dashboard.Root');
    }
    return context;
}

interface RootProps {
    children: ReactNode;
    className?: string;
}

function Root({ children, className }: RootProps): ReactNode {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    const value = useMemo(
        () => ({ isSidebarOpen, toggleSidebar, closeSidebar }),
        [isSidebarOpen, toggleSidebar, closeSidebar],
    );

    return (
        <DashboardContext.Provider value={value}>
            <div className={cn('min-h-screen bg-background', className)}>
                {children}
            </div>
        </DashboardContext.Provider>
    );
}

interface HeaderProps {
    children: ReactNode;
    className?: string;
}

function Header({ children, className }: HeaderProps): ReactNode {
    const { toggleSidebar } = useDashboardContext();

    return (
        <header
            className={cn(
                'sticky top-0 z-40 flex h-16 items-center gap-4 border-b-4 border-foreground bg-background px-4 md:px-6',
                className,
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
            </Button>
            {children}
        </header>
    );
}

interface SidebarProps {
    children: ReactNode;
    className?: string;
}

function Sidebar({ children, className }: SidebarProps): ReactNode {
    const { isSidebarOpen, closeSidebar } = useDashboardContext();

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 border-r-4 border-foreground bg-background transition-transform duration-200 ease-in-out md:static md:translate-x-0',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    className,
                )}
            >
                <div className="flex h-full flex-col gap-4 p-4">
                    {children}
                </div>
            </aside>
        </>
    );
}

interface ContentProps {
    children: ReactNode;
    className?: string;
}

function Content({ children, className }: ContentProps): ReactNode {
    return (
        <main className={cn('flex-1 overflow-y-auto p-4 md:p-6', className)}>
            {children}
        </main>
    );
}

interface BodyProps {
    children: ReactNode;
    className?: string;
}

function Body({ children, className }: BodyProps): ReactNode {
    return (
        <div className={cn('flex flex-1 flex-col md:flex-row', className)}>
            {children}
        </div>
    );
}



export const Dashboard = {
    Root,
    Header,
    Sidebar,
    Body,
    Content,
};
