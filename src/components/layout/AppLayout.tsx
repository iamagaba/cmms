import React, { ReactNode, useState } from 'react';
import ProfessionalSidebar from './ProfessionalSidebar';
import { useDensity } from '@/context/DensityContext';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed for auto-expand
    const [sidebarExpanded, setSidebarExpanded] = useState(false); // Track hover state
    const { isCompact } = useDensity();

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
            <div className="lg:hidden">
                {/* TODO: Implement mobile navigation drawer */}
                <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-machinery-200 p-4">
                    <h1 className="text-lg font-semibold text-machinery-900">GOGO CMMS</h1>
                </div>
            </div>

            {/* Main content - dynamic padding based on sidebar state and density */}
            <main
                className="min-h-screen theme-transition transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{
                    paddingLeft: sidebarExpanded ? '280px' : '80px',
                }}
            >
                <div className="lg:hidden pt-16" /> {/* Mobile header spacing */}
                <div className={isCompact ? 'p-2 lg:p-3' : 'p-3 lg:p-4'}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AppLayout;
