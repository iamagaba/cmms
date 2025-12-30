import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  TimelineIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  UserIcon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';
import { Stack, Button, Group, Tabs, Badge, Skeleton, Select } from '@/components/tailwind-components';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician } from '@/types/supabase';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

type ViewMode = 'calendar' | 'timeline' | 'availability';

const Scheduling: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  // Fetch work orders
  const { data: workOrders, isLoading: loadingWorkOrders } = useQuery({
    queryKey: ['work-orders-scheduling', currentDate.format('YYYY-MM')],
    queryFn: async () => {
      const startOfMonth = currentDate.startOf('month').toISOString();
      const endOfMonth = currentDate.endOf('month').toISOString();

      const { data, error } = await supabase
        .from('work_orders')
        .select('*, technician:technicians(*), customer:customers(*), vehicle:vehicles(*)')
        .gte('scheduled_date', startOfMonth)
        .lte('scheduled_date', endOfMonth)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as WorkOrder[];
    },
  });

  // Fetch technicians
  const { data: technicians, isLoading: loadingTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Technician[];
    },
  });

  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];
    if (selectedTechnician === 'all') return workOrders;
    return workOrders.filter(wo => wo.technician_id === selectedTechnician);
  }, [workOrders, selectedTechnician]);

  const handlePreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const handleWorkOrderSelect = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
  };

  // Calculate scheduling stats
  const schedulingStats = useMemo(() => {
    if (!workOrders || !technicians) return { totalScheduled: 0, todayScheduled: 0, availableTechs: 0, overbooked: 0 };
    
    const today = dayjs();
    const todayScheduled = workOrders.filter(wo => 
      wo.scheduled_date && dayjs(wo.scheduled_date).isSame(today, 'day')
    ).length;

    const techWorkloadMap = new Map<string, number>();
    workOrders.forEach(wo => {
      if (wo.technician_id && wo.scheduled_date && dayjs(wo.scheduled_date).isSame(today, 'day')) {
        techWorkloadMap.set(wo.technician_id, (techWorkloadMap.get(wo.technician_id) || 0) + 1);
      }
    });

    const availableTechs = technicians.filter(tech => (techWorkloadMap.get(tech.id) || 0) < 3).length;
    const overbooked = technicians.filter(tech => (techWorkloadMap.get(tech.id) || 0) > 4).length;

    return {
      totalScheduled: workOrders.length,
      todayScheduled,
      availableTechs,
      overbooked
    };
  }, [workOrders, technicians]);

  if (loadingWorkOrders || loadingTechnicians) {
    return (
      <div className="flex h-screen bg-white">
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <Skeleton height={24} width={120} className="mb-3" />
            <Skeleton height={36} />
          </div>
          <div className="flex-1 p-4">
            <Skeleton height={400} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skeleton height={48} width={48} className="mx-auto mb-3" />
            <Skeleton height={20} width={160} className="mx-auto mb-2" />
            <Skeleton height={16} width={240} className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Panel - Calendar Navigation & Controls */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Scheduling</h1>
            <button
              onClick={handleToday}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HugeiconsIcon icon={Clock01Icon} size={16} />
            </button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-3">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <HugeiconsIcon icon={Clock01Icon} size={14} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'timeline' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <HugeiconsIcon icon={TimelineIcon} size={14} />
              Timeline
            </button>
          </div>

          {/* Technician Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Technician</label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Technicians</option>
              {technicians?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePreviousMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            </div>
          </div>

          {/* Mini Calendar */}
          <MiniCalendar
            currentDate={currentDate}
            workOrders={filteredWorkOrders}
            onDateSelect={setCurrentDate}
          />
        </div>

        {/* Quick Stats */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Today's Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{schedulingStats.todayScheduled}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Available Techs</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{schedulingStats.availableTechs}</span>
            </div>
            {schedulingStats.overbooked > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Overbooked</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{schedulingStats.overbooked}</span>
              </div>
            )}
          </div>
        </div>

        {/* Technician List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Technicians</h3>
            <div className="space-y-2">
              {technicians?.map(tech => {
                const todayWorkOrders = workOrders?.filter(wo => 
                  wo.technician_id === tech.id && 
                  wo.scheduled_date && 
                  dayjs(wo.scheduled_date).isSame(dayjs(), 'day')
                ).length || 0;

                return (
                  <div key={tech.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-semibold">
                      {tech.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{tech.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{todayWorkOrders} scheduled today</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      todayWorkOrders === 0 ? 'bg-emerald-400' :
                      todayWorkOrders <= 3 ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Calendar/Timeline View */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {viewMode === 'calendar' ? 'Calendar View' : 
                 viewMode === 'timeline' ? 'Timeline View' : 'Availability View'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {viewMode === 'calendar' ? 'Monthly calendar with scheduled work orders' :
                 viewMode === 'timeline' ? 'Technician timeline for the month' : 'Weekly technician availability'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('availability')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === 'availability' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <HugeiconsIcon icon={UserGroupIcon} size={16} className="mr-1.5" />
                Availability
              </button>
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-primary-600 dark:text-primary-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Scheduled</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schedulingStats.totalScheduled}</p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={Clock01Icon} size={16} className="text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Today</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schedulingStats.todayScheduled}</p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={UserIcon} size={16} className="text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Available</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schedulingStats.availableTechs}</p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-red-600 dark:text-red-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overbooked</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{schedulingStats.overbooked}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'calendar' && (
            <CalendarView
              currentDate={currentDate}
              workOrders={filteredWorkOrders}
              technicians={technicians || []}
              onWorkOrderSelect={handleWorkOrderSelect}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              currentDate={currentDate}
              workOrders={filteredWorkOrders}
              technicians={technicians || []}
              onWorkOrderSelect={handleWorkOrderSelect}
            />
          )}

          {viewMode === 'availability' && (
            <TechnicianAvailabilityView
              currentDate={currentDate}
              workOrders={filteredWorkOrders}
              technicians={technicians || []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Mini Calendar Component
const MiniCalendar: React.FC<{
  currentDate: dayjs.Dayjs;
  workOrders: WorkOrder[];
  onDateSelect: (date: dayjs.Dayjs) => void;
}> = ({ currentDate, workOrders, onDateSelect }) => {
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const days = [];
  let day = startDate;

  while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const getWorkOrdersForDay = (date: dayjs.Dayjs) => {
    return workOrders.filter(wo => {
      if (!wo.scheduled_date) return false;
      return dayjs(wo.scheduled_date).isSame(date, 'day');
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.month() === currentDate.month();
          const isToday = day.isSame(dayjs(), 'day');
          const dayWorkOrders = getWorkOrdersForDay(day);
          const hasWorkOrders = dayWorkOrders.length > 0;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`relative w-8 h-8 text-xs rounded-lg transition-colors ${
                isToday ? 'bg-primary-600 text-white font-semibold' :
                isCurrentMonth ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {day.format('D')}
              {hasWorkOrders && !isToday && (
                <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Calendar View Component
const CalendarView: React.FC<{
  currentDate: dayjs.Dayjs;
  workOrders: WorkOrder[];
  technicians: Technician[];
}> = ({ currentDate, workOrders }) => {
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const days = [];
  let day = startDate;

  while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getWorkOrdersForDay = (date: dayjs.Dayjs) => {
    return workOrders.filter(wo => {
      if (!wo.scheduled_date) return false;
      return dayjs(wo.scheduled_date).isSame(date, 'day');
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          {week.map((day, dayIndex) => {
            const isCurrentMonth = day.month() === currentDate.month();
            const isToday = day.isSame(dayjs(), 'day');
            const dayWorkOrders = getWorkOrdersForDay(day);

            return (
              <div
                key={dayIndex}
                className={`min-h-[120px] p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-blue-600 dark:text-blue-400' : isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {day.format('D')}
                </div>

                <div className="space-y-1">
                  {dayWorkOrders.slice(0, 3).map(wo => (
                    <div
                      key={wo.id}
                      className={`text-xs px-2 py-1 rounded truncate ${getStatusColor(wo.status)}`}
                      title={wo.title}
                    >
                      {wo.title}
                    </div>
                  ))}
                  {dayWorkOrders.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                      +{dayWorkOrders.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Timeline View Component
const TimelineView: React.FC<{
  currentDate: dayjs.Dayjs;
  workOrders: WorkOrder[];
  technicians: Technician[];
}> = ({ currentDate, workOrders, technicians }) => {
  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));

  const getWorkOrdersForTechnicianAndDay = (technicianId: string, date: dayjs.Dayjs) => {
    return workOrders.filter(wo => {
      if (!wo.scheduled_date) return false;
      return wo.technician_id === technicianId && dayjs(wo.scheduled_date).isSame(date, 'day');
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-400',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      on_hold: 'bg-orange-400',
      cancelled: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Header with days */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <div className="w-48 p-3 border-r border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
            Technician
          </div>
          <div className="flex-1 flex">
            {days.map((day, index) => {
              const isToday = day.isSame(dayjs(), 'day');
              const isWeekend = day.day() === 0 || day.day() === 6;
              
              return (
                <div
                  key={index}
                  className={`flex-1 min-w-[40px] p-2 text-center text-xs border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold text-blue-600 dark:text-blue-400' : isWeekend ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div>{day.format('D')}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">{day.format('ddd')}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician rows */}
        {technicians.map(technician => (
          <div key={technician.id} className="flex border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="w-48 p-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{technician.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{technician.specialization}</div>
            </div>
            <div className="flex-1 flex">
              {days.map((day, index) => {
                const dayWorkOrders = getWorkOrdersForTechnicianAndDay(technician.id, day);
                const isWeekend = day.day() === 0 || day.day() === 6;
                
                return (
                  <div
                    key={index}
                    className={`flex-1 min-w-[40px] p-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                      isWeekend ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                  >
                    {dayWorkOrders.length > 0 && (
                      <div className="space-y-1">
                        {dayWorkOrders.map(wo => (
                          <div
                            key={wo.id}
                            className={`h-6 rounded ${getStatusColor(wo.status)} cursor-pointer hover:opacity-80`}
                            title={`${wo.title} - ${wo.status}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Technician Availability View Component
const TechnicianAvailabilityView: React.FC<{
  currentDate: dayjs.Dayjs;
  workOrders: WorkOrder[];
  technicians: Technician[];
}> = ({ currentDate, workOrders, technicians }) => {
  const startOfWeek = currentDate.startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const getWorkOrdersForTechnicianAndDay = (technicianId: string, date: dayjs.Dayjs) => {
    return workOrders.filter(wo => {
      if (!wo.scheduled_date) return false;
      return wo.technician_id === technicianId && dayjs(wo.scheduled_date).isSame(date, 'day');
    });
  };

  const getAvailabilityStatus = (workOrderCount: number) => {
    if (workOrderCount === 0) return { label: 'Available', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    if (workOrderCount <= 2) return { label: 'Partially Booked', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'Fully Booked', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  };

  return (
    <div className="space-y-4">
      {/* Week selector */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Week of {startOfWeek.format('MMM D')} - {startOfWeek.add(6, 'day').format('MMM D, YYYY')}
        </div>
      </div>

      {/* Technician cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {technicians.map(technician => {
          const weekWorkOrders = days.map(day => ({
            day,
            workOrders: getWorkOrdersForTechnicianAndDay(technician.id, day),
          }));

          const totalWorkOrders = weekWorkOrders.reduce((sum, d) => sum + d.workOrders.length, 0);
          const avgPerDay = (totalWorkOrders / 7).toFixed(1);

          return (
            <div key={technician.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{technician.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{technician.specialization}</p>
                </div>
                <Badge variant="light" color="blue">
                  {totalWorkOrders} WOs this week
                </Badge>
              </div>

              <div className="space-y-2">
                {weekWorkOrders.map(({ day, workOrders: dayWorkOrders }) => {
                  const isToday = day.isSame(dayjs(), 'day');
                  const availability = getAvailabilityStatus(dayWorkOrders.length);

                  return (
                    <div
                      key={day.format('YYYY-MM-DD')}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isToday ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {day.format('ddd, MMM D')}
                        </div>
                        {isToday && (
                          <Badge size="xs" variant="filled" color="blue">
                            Today
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {dayWorkOrders.length} work order{dayWorkOrders.length !== 1 ? 's' : ''}
                        </span>
                        <Badge size="sm" className={availability.color}>
                          {availability.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Average per day:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{avgPerDay} work orders</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scheduling;
