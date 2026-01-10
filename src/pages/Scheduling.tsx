import React from 'react';
import SchedulingCalendar from '@/components/scheduling/SchedulingCalendar';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';

const SchedulingPage = () => {
  const spacing = useDensitySpacing();

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header matching reports page */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Scheduling</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage shifts and technician schedules</p>
      </div>

      <div className="flex-1 min-h-0">
        <SchedulingCalendar />
      </div>
    </div>
  );
};

export default SchedulingPage;
