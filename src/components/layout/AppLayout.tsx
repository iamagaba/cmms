import React, { ReactNode, useState, useEffect } from 'react';
import ProfessionalSidebar from './ProfessionalSidebar';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { MobileBottomNav, NavigationItem } from '../navigation/ResponsiveNavigation';
import { useNavigate, useLocation } from 'react-router-dom';
import { CommandPalette } from '../navigation/CommandPalette';
import { TopBar } from './TopBar';
import { KeyboardShortcutsDialog } from '../navigation/KeyboardShortcutsDialog';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Check if current page is full-bleed (no top bar)
    const isFullBleedPage = 
        location.pathname === '/chat' ||
        /^\/(work-orders|assets|technicians|customers|inventory|locations|reports|customer-care)(\/.*)?$/.test(location.pathname);

    // Define bottom navigation items
    const bottomNavItems: NavigationItem[] = [
        {
            id: 'dashboard',
            label: 'Home',
            icon: 'tabler:home',
            href: '/',
            onClick: () => navigate('/')
        },
        {
            id: 'work-orders',
            label: 'Orders',
            icon: 'tabler:clipboard-list',
            href: '/work-orders',
            onClick: () => navigate('/work-orders')
        },
        {
            id: 'assets',
            label: 'Assets',
            icon: 'tabler:building',
            href: '/assets',
            onClick: () => navigate('/assets')
        },
        {
            id: 'menu',
            label: 'Menu',
            icon: 'tabler:menu-2',
            onClick: () => setMobileMenuOpen(true)
        }
    ];

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Listen for sidebar hover events
    useEffect(() => {
        const handleSidebarHover = (event: CustomEvent) => {
            setSidebarExpanded(event.detail.isExpanded);
        };

        window.addEventListener('sidebar-hover', handleSidebarHover as EventListener);
        return () => {
            window.removeEventListener('sidebar-hover', handleSidebarHover as EventListener);
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + K for quick search
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandPaletteOpen(true);
                return;
            }

            // Cmd/Ctrl + ? for shortcuts help
            if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setShortcutsDialogOpen(true);
                return;
            }

            // Don't trigger navigation shortcuts if user is typing
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            // Navigation shortcuts (Cmd/Ctrl + Number)
            if (e.metaKey || e.ctrlKey) {
                const shortcuts: Record<string, string> = {
                    '1': '/',
                    '2': '/work-orders',
                    '3': '/assets',
                    '4': '/customers',
                    '5': '/technicians',
                    '6': '/inventory',
                    '7': '/scheduling',
                    '8': '/reports',
                };

                if (shortcuts[e.key]) {
                    e.preventDefault();
                    navigate(shortcuts[e.key]);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background theme-transition">
            {/* Command Palette */}
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
            />

            {/* Keyboard Shortcuts Dialog */}
            <KeyboardShortcutsDialog
                open={shortcutsDialogOpen}
                onOpenChange={setShortcutsDialogOpen}
            />

            {/* Floating Professional Sidebar - Auto-expands on hover */}
            <div className="hidden lg:block">
                <ProfessionalSidebar
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={handleToggleSidebar}
                />
            </div>

            {/* Mobile Navigation Overlay */}
            <div className="lg:hidden">
                <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold font-brand text-foreground ml-1">Fleet CMMS</h1>
                    </div>
                </div>

                {/* Mobile Drawer Backdrop */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-[70] w-[200px] bg-secondary transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <ProfessionalSidebar
                        collapsed={false}
                        className="!relative !w-full !h-full"
                        onToggleCollapse={() => setMobileMenuOpen(false)}
                        onNavigate={() => setMobileMenuOpen(false)}
                    />
                </div>

                {/* Bottom Navigation */}
                <MobileBottomNav
                    items={bottomNavItems}
                    activeItem={bottomNavItems.find(item => item.href === location.pathname)?.id || 'dashboard'}
                    onItemClick={(item) => {
                        if (item.onClick) item.onClick();
                    }}
                />
            </div>

            {/* Main content - dynamic padding based on sidebar state */}
            <main
                className="min-h-screen theme-transition transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] pb-[80px] lg:pb-0"
                style={{
                    paddingLeft: sidebarExpanded ? '200px' : '56px',
                }}
            >
                {/* Top Bar - Desktop only, NOT on full-bleed pages */}
                {!isFullBleedPage && (
                    <div className="hidden lg:block">
                        <TopBar 
                            onQuickSearchClick={() => setCommandPaletteOpen(true)}
                            onShortcutsClick={() => setShortcutsDialogOpen(true)}
                        />
                    </div>
                )}

                {/* Sidebar Toggle Button - Desktop only */}
                <button
                    onClick={handleToggleSidebar}
                    className="hidden lg:flex fixed z-50 items-center justify-center w-10 h-10 bg-background border border-border rounded-lg shadow-sm hover:bg-muted transition-colors"
                    style={{
                        top: isFullBleedPage ? '20px' : '76px', // Below top bar if present
                        left: sidebarExpanded ? '212px' : '68px',
                        transition: 'left 400ms cubic-bezier(0.25, 0.1, 0.25, 1), top 400ms cubic-bezier(0.25, 0.1, 0.25, 1)',
                    }}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {sidebarCollapsed ? (
                        <PanelLeft className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>

                {/* Mobile header spacing */}
                <div className="lg:hidden pt-16" />

                {isFullBleedPage ? (
                    // Full-bleed pages
                    <div className="w-full h-full">
                        {children}
                    </div>
                ) : (
                    // Standard pages with padding
                    <div className="p-6 md:p-8">
                        <div className="max-w-[2400px] mx-auto w-full">
                            {children}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AppLayout;
