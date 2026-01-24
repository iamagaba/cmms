import React, { ReactNode, useState } from 'react';
import ProfessionalSidebar from './ProfessionalSidebar';

import { MobileBottomNav, NavigationItem } from '../navigation/ResponsiveNavigation';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed for auto-expand
    const [sidebarExpanded, setSidebarExpanded] = useState(false); // Track hover state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

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
    React.useEffect(() => {
        const handleSidebarHover = (event: CustomEvent) => {
            setSidebarExpanded(event.detail.isExpanded);
        };

        window.addEventListener('sidebar-hover', handleSidebarHover as EventListener);
        return () => {
            window.removeEventListener('sidebar-hover', handleSidebarHover as EventListener);
        };
    }, []);

    return (
        <div className="min-h-screen bg-white theme-transition">
            {/* Floating Professional Sidebar - Auto-expands on hover */}
            <div className="hidden lg:block">
                <ProfessionalSidebar
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={handleToggleSidebar}
                />
            </div>

            {/* Mobile Navigation Overlay */}
            {/* Mobile Navigation Overlay */}
            <div className="lg:hidden">
                <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-machinery-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Hamburger removed as it is in bottom nav */}
                        <h1 className="text-lg font-bold font-brand text-machinery-900 ml-1">GOGO CMMS</h1>
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
                <div className={`fixed inset-y-0 left-0 z-[70] w-[200px] bg-white transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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

            {/* Main content - dynamic padding based on sidebar state and density */}
            <main
                className="min-h-screen theme-transition transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] pb-[80px] lg:pb-0"
                style={{
                    paddingLeft: sidebarExpanded ? '200px' : '56px',
                }}
            >
                <div className="lg:hidden pt-16" /> {/* Mobile header spacing */}
                <div className="lg:hidden pt-16" /> {/* Mobile header spacing */}
                {location.pathname === '/chat' || /^\/work-orders\/[^/]+$/.test(location.pathname) ? (
                    // Chat and Details pages need full width/height without standard page padding

                    <div className="w-full h-full">
                        {children}
                    </div>
                ) : (
                    // Standard pages get density-aware padding and max-width container
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
