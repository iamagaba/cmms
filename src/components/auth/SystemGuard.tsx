import React from 'react';
import { Navigate } from 'react-router-dom';
import { useActiveSystem } from '@/context/ActiveSystemContext';
import { ActiveSystem } from '@/types/ticketing';

interface SystemGuardProps {
    requiredSystem: ActiveSystem;
    children: React.ReactNode;
}

/**
 * SystemGuard component protects routes based on the user's assigned system access.
 * If a user tries to access a system they don't have permission for, it redirects them
 * to the alternative system or a default landing page.
 */
const SystemGuard: React.FC<SystemGuardProps> = ({ requiredSystem, children }) => {
    const { hasCmms, hasTicketing } = useActiveSystem();

    // If required system is CMMS but user doesn't have CMMS access
    if (requiredSystem === 'cmms' && !hasCmms) {
        // Redirect to Ticketing if they have access, otherwise they'll be stuck (but they should have at least one)
        if (hasTicketing) {
            return <Navigate to="/customer-care" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // If required system is Ticketing but user doesn't have Ticketing access
    if (requiredSystem === 'ticketing' && !hasTicketing) {
        if (hasCmms) {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default SystemGuard;
