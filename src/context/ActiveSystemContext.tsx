/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { useSession } from './SessionContext';
import { ActiveSystem, hasCmmsAccess, hasTicketingAccess, hasDualAccess, UserRole } from '@/types/ticketing';

interface ActiveSystemContextType {
    activeSystem: ActiveSystem;
    setActiveSystem: (system: ActiveSystem) => void;
    canSwitchSystem: boolean;
    userRole: UserRole;
    hasCmms: boolean;
    hasTicketing: boolean;
}

const ActiveSystemContext = createContext<ActiveSystemContextType | undefined>(undefined);

export const ActiveSystemProvider = ({ children }: { children: ReactNode }) => {
    const { profile } = useSession();
    const role = (profile?.role as UserRole) || 'maintenance_technician';
    const hasCmms = hasCmmsAccess(role);
    const hasTicketing = hasTicketingAccess(role);
    const canSwitch = hasDualAccess(role);

    // Default to CMMS if user has access, else ticketing
    const [activeSystem, setActiveSystemState] = useState<ActiveSystem>(
        hasCmms ? 'cmms' : 'ticketing'
    );

    const setActiveSystem = useCallback((system: ActiveSystem) => {
        if (system === 'cmms' && hasCmms) {
            setActiveSystemState('cmms');
        } else if (system === 'ticketing' && hasTicketing) {
            setActiveSystemState('ticketing');
        }
    }, [hasCmms, hasTicketing]);

    const value = useMemo(() => ({
        activeSystem,
        setActiveSystem,
        canSwitchSystem: canSwitch,
        userRole: role,
        hasCmms,
        hasTicketing,
    }), [activeSystem, setActiveSystem, canSwitch, role, hasCmms, hasTicketing]);

    return (
        <ActiveSystemContext.Provider value={value}>
            {children}
        </ActiveSystemContext.Provider>
    );
};

export const useActiveSystem = () => {
    const context = useContext(ActiveSystemContext);
    if (context === undefined) {
        throw new Error('useActiveSystem must be used within an ActiveSystemProvider');
    }
    return context;
};
