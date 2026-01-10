import React, { useState, useMemo } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO,
    differenceInMinutes
} from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    FilterHorizontalIcon,
    Location03Icon
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import ShiftCard, { ShiftCardProps } from './ShiftCard';
import { useLocations } from '@/hooks/useLocations';
import { useShifts } from '@/hooks/useShifts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Technician {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status?: string;
    specialization?: string;
}

const SchedulingCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        shiftType: 'all',
        status: 'all',
        technician: 'all'
    });

    const nextPeriod = () => {
        if (viewMode === 'week') {
            setCurrentDate(addDays(currentDate, 7));
        } else {
            setCurrentDate(addDays(currentDate, 1));
        }
    };
    
    const prevPeriod = () => {
        if (viewMode === 'week') {
            setCurrentDate(addDays(currentDate, -7));
        } else {
            setCurrentDate(addDays(currentDate, -1));
        }
    };
    
    const today = () => setCurrentDate(new Date());

    // Generate days for the grid based on view mode
    const calendarDays = useMemo(() => {
        if (viewMode === 'day') {
            // Show only the current day
            return [currentDate];
        } else {
            // Week view - show current week (7 days)
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
            return eachDayOfInterval({
                start: weekStart,
                end: addDays(weekStart, 6),
            });
        }
    }, [currentDate, viewMode]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Fetch locations from Supabase
    const { locations: fetchedLocations, loading: loadingLocations } = useLocations();

    // Combine "All Locations" with fetched locations
    const locations = [
        { id: 'all', name: 'All Locations' },
        ...fetchedLocations
    ];

    // Fetch shifts for the current view range
    const fetchStartDate = useMemo(() => {
        if (viewMode === 'day') {
            return format(currentDate, 'yyyy-MM-dd');
        } else {
            // Week view
            return format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
        }
    }, [currentDate, viewMode]);

    const fetchEndDate = useMemo(() => {
        if (viewMode === 'day') {
            return format(currentDate, 'yyyy-MM-dd');
        } else {
            // Week view
            return format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), 'yyyy-MM-dd');
        }
    }, [currentDate, viewMode]);

    const { shifts, isLoading: loadingShifts } = useShifts(fetchStartDate, fetchEndDate);

    // Fetch technicians
    const { data: technicians = [], isLoading: loadingTechnicians } = useQuery({
        queryKey: ['technicians'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('technicians')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data as Technician[];
        },
    });

    // Calculate technician stats from shifts
    const technicianStats = useMemo(() => {
        if (!shifts || !technicians) return {};

        const stats: Record<string, { totalHours: number; totalEarnings: number }> = {};

        technicians.forEach(tech => {
            const techShifts = shifts.filter(shift => shift.technician_id === tech.id);
            
            const totalMinutes = techShifts.reduce((sum, shift) => {
                const start = parseISO(shift.start_datetime);
                const end = parseISO(shift.end_datetime);
                const breakMinutes = shift.break_duration_minutes || 0;
                return sum + differenceInMinutes(end, start) - breakMinutes;
            }, 0);

            const totalHours = totalMinutes / 60;
            // Assuming an average hourly rate - you can adjust this based on your data
            const totalEarnings = totalHours * 25; // $25/hour default

            stats[tech.id] = {
                totalHours: Math.round(totalHours * 10) / 10,
                totalEarnings: Math.round(totalEarnings)
            };
        });

        return stats;
    }, [shifts, technicians]);

    // Convert database shifts to ShiftCardProps
    const getShiftsForTechnicianAndDate = (technicianId: string, date: Date): ShiftCardProps[] => {
        if (!shifts) return [];

        const dateStr = format(date, 'yyyy-MM-dd');
        
        return shifts
            .filter(shift => {
                const shiftDate = format(parseISO(shift.start_datetime), 'yyyy-MM-dd');
                const matchesTechnician = shift.technician_id === technicianId;
                const matchesDate = shiftDate === dateStr;
                const matchesLocation = selectedLocation === 'all' || shift.location_id === selectedLocation;
                
                // Apply additional filters
                const matchesShiftType = filters.shiftType === 'all' || shift.shift_type === filters.shiftType;
                const matchesStatus = filters.status === 'all' || shift.status === filters.status;
                
                return matchesTechnician && matchesDate && matchesLocation && matchesShiftType && matchesStatus;
            })
            .map(shift => {
                const startTime = format(parseISO(shift.start_datetime), 'h:mma');
                const endTime = format(parseISO(shift.end_datetime), 'h:mma');
                
                // Determine status and color based on shift data
                let status: ShiftCardProps['status'] = 'assigned';
                let color = '#6b7280'; // default gray
                
                if (shift.status === 'published') {
                    status = 'assigned';
                    color = '#3b82f6'; // blue
                } else if (shift.status === 'draft') {
                    status = 'assigned';
                    color = '#9ca3af'; // lighter gray
                } else if (shift.status === 'cancelled') {
                    status = 'unavailable';
                }

                return {
                    id: shift.id,
                    status,
                    startTime,
                    endTime,
                    employeeName: shift.technician?.name,
                    role: shift.shift_type,
                    location: shift.location?.name,
                    notes: shift.notes,
                    color,
                };
            });
    };

    // Calculate total open shift hours (keeping for potential future use)
    const openShiftStats = useMemo(() => {
        if (!shifts) return { totalHours: 0, totalEarnings: 0 };

        const openShifts = shifts.filter(shift => !shift.technician_id || shift.status === 'open');
        
        const totalMinutes = openShifts.reduce((sum, shift) => {
            const start = parseISO(shift.start_datetime);
            const end = parseISO(shift.end_datetime);
            const breakMinutes = shift.break_duration_minutes || 0;
            return sum + differenceInMinutes(end, start) - breakMinutes;
        }, 0);

        return {
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
            totalEarnings: 0 // Open shifts have no earnings yet
        };
    }, [shifts]);

    const isLoading = loadingShifts || loadingTechnicians || loadingLocations;

    // Get unique shift types and statuses for filter options
    const shiftTypes = useMemo(() => {
        if (!shifts) return [];
        const types = new Set(shifts.map(s => s.shift_type).filter(Boolean));
        return Array.from(types);
    }, [shifts]);

    const statuses = useMemo(() => {
        if (!shifts) return [];
        const statusSet = new Set(shifts.map(s => s.status).filter(Boolean));
        return Array.from(statusSet);
    }, [shifts]);

    // Get filtered technicians based on filters
    const filteredTechnicians = useMemo(() => {
        if (filters.technician === 'all') return technicians;
        return technicians.filter(t => t.id === filters.technician);
    }, [technicians, filters.technician]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
            {/* Header Toolbar - matching reports page density */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded p-0.5">
                        <button
                            onClick={prevPeriod}
                            className="p-1 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            disabled={isLoading}
                        >
                            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                        </button>
                        <span className="px-3 text-xs font-semibold min-w-[140px] text-center text-gray-900 dark:text-gray-100">
                            {viewMode === 'day' 
                                ? format(currentDate, 'MMMM d, yyyy')
                                : `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), 'MMM d, yyyy')}`
                            }
                        </span>
                        <button
                            onClick={nextPeriod}
                            className="p-1 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            disabled={isLoading}
                        >
                            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                        </button>
                    </div>

                    <button
                        onClick={today}
                        className="px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        Today
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Location Filter */}
                    <div className="relative">
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="appearance-none pl-7 pr-8 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-900"
                            disabled={isLoading}
                        >
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                        <HugeiconsIcon
                            icon={Location03Icon}
                            size={14}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                        />
                    </div>

                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded transition-colors",
                            showFilters 
                                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700" 
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        <HugeiconsIcon icon={FilterHorizontalIcon} size={14} />
                        Filters
                    </button>

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded">
                        <button 
                            onClick={() => setViewMode('week')}
                            className={cn(
                                "px-3 py-1 text-xs font-semibold rounded transition-colors",
                                viewMode === 'week' 
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            Week
                        </button>
                        <button 
                            onClick={() => setViewMode('day')}
                            className={cn(
                                "px-3 py-1 text-xs font-semibold rounded transition-colors",
                                viewMode === 'day' 
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            Day
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Filters:</span>
                        
                        {/* Shift Type Filter */}
                        <select
                            value={filters.shiftType}
                            onChange={(e) => setFilters({ ...filters, shiftType: e.target.value })}
                            className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="all">All Shift Types</option>
                            {shiftTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="all">All Statuses</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        {/* Technician Filter */}
                        <select
                            value={filters.technician}
                            onChange={(e) => setFilters({ ...filters, technician: e.target.value })}
                            className="px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                            <option value="all">All Technicians</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        {(filters.shiftType !== 'all' || filters.status !== 'all' || filters.technician !== 'all') && (
                            <button
                                onClick={() => setFilters({ shiftType: 'all', status: 'all', technician: 'all' })}
                                className="px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Calendar Grid - compact like reports page */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Loading schedule...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Row */}
                        <div
                            className="grid border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10"
                            style={{ gridTemplateColumns: `180px repeat(${calendarDays.length}, 1fr)` }}
                        >
                            <div className="py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-gray-700">
                                Technician
                            </div>
                            {calendarDays.map((day) => (
                                <div key={day.toString()} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-r border-gray-100 dark:border-gray-700 last:border-r-0">
                                    {viewMode === 'day' ? format(day, 'EEEE, MMM d') : format(day, 'EEE d')}
                                </div>
                            ))}
                        </div>

                        {/* Technician Rows */}
                        {filteredTechnicians.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No technicians found</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add technicians to start scheduling</p>
                                </div>
                            </div>
                        ) : (
                            filteredTechnicians.map((technician) => {
                                const stats = technicianStats[technician.id] || { totalHours: 0, totalEarnings: 0 };
                                
                                return (
                                    <div
                                        key={technician.id}
                                        className="grid border-b border-gray-200 dark:border-gray-800"
                                        style={{ gridTemplateColumns: `180px repeat(${calendarDays.length}, 1fr)` }}
                                    >
                                        <div className="p-3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{technician.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {stats.totalHours} hrs
                                            </div>
                                        </div>
                                        {calendarDays.map((day) => {
                                            const shifts = getShiftsForTechnicianAndDate(technician.id, day);
                                            const isToday = isSameDay(day, new Date());
                                            const isCurrentMonth = isSameMonth(day, currentDate);

                                            return (
                                                <div
                                                    key={day.toString()}
                                                    className={cn(
                                                        "min-h-[80px] bg-white dark:bg-gray-900 p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                                                        !isCurrentMonth && "bg-gray-50/30 dark:bg-gray-800/30"
                                                    )}
                                                >
                                                    <div className="flex justify-end mb-1">
                                                        <span className={cn(
                                                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                                            isToday ? "bg-primary-600 text-white" : "text-gray-700 dark:text-gray-300"
                                                        )}>
                                                            {format(day, 'd')}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        {shifts.map((shift) => (
                                                            <ShiftCard key={shift.id} {...shift} />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SchedulingCalendar;
