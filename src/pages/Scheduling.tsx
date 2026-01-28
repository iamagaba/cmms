import React from 'react';
import SchedulingCalendar from '@/components/scheduling/SchedulingCalendar';


const SchedulingPage = () => {


  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header with shadcn/ui typography */}
      <div className="px-4 py-3 border-b border-border flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-2xl font-bold">Scheduling</h1>
        <p className="text-sm text-muted-foreground">Manage shifts and technician schedules</p>
      </div>

      <div className="flex-1 min-h-0">
        <SchedulingCalendar />
      </div>
    </div>
  );
};

export default SchedulingPage;
