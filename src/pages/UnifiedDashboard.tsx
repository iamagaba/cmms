

import { useActiveSystem } from '@/context/ActiveSystemContext';
import ProfessionalCMMSDashboard from './ProfessionalCMMSDashboard';
import TicketingDashboard from './TicketingDashboard';

const UnifiedDashboard = () => {
    const { activeSystem } = useActiveSystem();

    if (activeSystem === 'ticketing') {
        return <TicketingDashboard />;
    }

    return <ProfessionalCMMSDashboard />;
};

export default UnifiedDashboard;
