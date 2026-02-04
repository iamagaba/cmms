import { ArrowLeft, MapPin, Plus, SlidersHorizontal, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    eachDayOfInterval,
    isSameMonth,

    parseISO,
    differenceInMinutes
} from 'date-fns';


import { cn } from '@/lib/utils';
import ShiftCard, { ShiftCardProps } from './ShiftCard';
import { ShiftEditorDialog } from './ShiftEditorDialog';
import { useLocations } from '@/hooks/useLocations';
import { useShifts } from '@/hooks/useShifts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


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
    const [creatingShift, setCreatingShift] = useState<{ technicianId: string, date: Date } | null>(null);
    const [editingShift, setEditingShift] = useState<any | null>(null);

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
                    onClick: () => setEditingShift(shift),
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

    const handleShiftCreated = () => {
        // Refetch shifts
        // The query invalidation is handled in the Dialog component, but we can also trigger a refetch here if needed
    };

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
            {/* Header Toolbar - compact matching reports density */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={prevPeriod}
                            disabled={isLoading}
                            aria-label="Previous period"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <span className="px-3 text-sm font-semibold min-w-[140px] text-center text-foreground">
                            {viewMode === 'day'
                                ? format(currentDate, 'MMMM d, yyyy')
                                : `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 6), 'MMM d, yyyy')}`
                            }
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={nextPeriod}
                            disabled={isLoading}
                            aria-label="Next period"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-sm"
                        onClick={today}
                        disabled={isLoading}
                    >
                        Today
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Location Filter */}
                    <div className="w-[180px]">
                        <Select
                            value={selectedLocation}
                            onValueChange={setSelectedLocation}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="h-8 text-sm border-gray-200 dark:border-gray-800 bg-background shadow-sm focus:ring-1 focus:ring-primary/30 focus:ring-offset-0">
                                <SelectValue placeholder="Select Location" />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map(loc => (
                                    <SelectItem key={loc.id} value={loc.id} className="text-sm">{loc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant={showFilters ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 text-sm gap-1.5"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                    </Button>

                    <div className="flex bg-muted p-0.5 rounded-md">
                        <button
                            onClick={() => setViewMode('week')}
                            className={cn(
                                "px-3 py-1 text-sm font-semibold rounded-sm transition-all",
                                viewMode === 'week'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={cn(
                                "px-3 py-1 text-sm font-semibold rounded-sm transition-all",
                                viewMode === 'day'
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Day
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="px-3 py-2.5 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Filters:</span>

                        {/* Shift Type Filter */}
                        <div className="w-[160px]">
                            <Select
                                value={filters.shiftType}
                                onValueChange={(value) => setFilters({ ...filters, shiftType: value })}
                            >
                                <SelectTrigger className="h-8 text-sm border-gray-200 dark:border-gray-800 bg-background shadow-sm focus:ring-1 focus:ring-primary/30 focus:ring-offset-0">
                                    <SelectValue placeholder="Shift Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-sm">All Shift Types</SelectItem>
                                    {shiftTypes.map(type => (
                                        <SelectItem key={type} value={type} className="text-sm">{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="w-[140px]">
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters({ ...filters, status: value })}
                            >
                                <SelectTrigger className="h-8 text-sm border-gray-200 dark:border-gray-800 bg-background shadow-sm focus:ring-1 focus:ring-primary/30 focus:ring-offset-0">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                                    {statuses.map(status => (
                                        <SelectItem key={status} value={status} className="text-sm">{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Technician Filter */}
                        <div className="w-[180px]">
                            <Select
                                value={filters.technician}
                                onValueChange={(value) => setFilters({ ...filters, technician: value })}
                            >
                                <SelectTrigger className="h-8 text-sm border-gray-200 dark:border-gray-800 bg-background shadow-sm focus:ring-1 focus:ring-primary/30 focus:ring-offset-0">
                                    <SelectValue placeholder="Technician" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-sm">All Technicians</SelectItem>
                                    {technicians.map(tech => (
                                        <SelectItem key={tech.id} value={tech.id} className="text-sm">{tech.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {(filters.shiftType !== 'all' || filters.status !== 'all' || filters.technician !== 'all') && (
                            <Button
                                variant="link"
                                size="sm"
                                className="h-8 text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => setFilters({ shiftType: 'all', status: 'all', technician: 'all' })}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Calendar Grid - compact like reports page */}
            <div className="flex-1 overflow-auto bg-muted/10">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Loading schedule...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header Row */}
                        <div
                            className="grid border-b border-border bg-background sticky top-0 z-10"
                            style={{ gridTemplateColumns: `180px repeat(${calendarDays.length}, 1fr)` }}
                        >
                            <div className="py-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground border-r border-border/50">
                                Technician
                            </div>
                            {calendarDays.map((day) => (
                                <div key={day.toString()} className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground border-r border-border/50 last:border-r-0">
                                    {viewMode === 'day' ? format(day, 'EEEE, MMM d') : format(day, 'EEE d')}
                                </div>
                            ))}
                        </div>

                        {/* Technician Rows */}
                        {filteredTechnicians.length === 0 ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">No technicians found</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Add technicians to start scheduling</p>
                                </div>
                            </div>
                        ) : (
                            filteredTechnicians.map((technician) => {
                                const stats = technicianStats[technician.id] || { totalHours: 0, totalEarnings: 0 };

                                return (
                                    <div
                                        key={technician.id}
                                        className="grid border-b border-border hover:bg-muted/5 transition-colors"
                                        style={{ gridTemplateColumns: `180px repeat(${calendarDays.length}, 1fr)` }}
                                    >
                                        <div className="p-3 border-r border-border/50 bg-background">
                                            <div className="text-sm font-semibold text-foreground">{technician.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {stats.totalHours} hrs
                                            </div>
                                        </div>
                                        {calendarDays.map((day) => {
                                            const shifts = getShiftsForTechnicianAndDate(technician.id, day);

                                            const isCurrentMonth = isSameMonth(day, currentDate);

                                            return (
                                                <div
                                                    key={day.toString()}
                                                    className={cn(
                                                        "min-h-[60px] bg-background p-1 border-r border-border/50 last:border-r-0",
                                                        !isCurrentMonth && "bg-muted/20"
                                                    )}
                                                >

                                                    <div className="flex flex-col gap-1">
                                                        {shifts.map((shift) => (
                                                            <ShiftCard key={shift.id} {...shift} />
                                                        ))}
                                                        {shifts.length === 0 && (
                                                            <button
                                                                onClick={() => setCreatingShift({ technicianId: technician.id, date: day })}
                                                                className="w-full h-full min-h-[40px] flex items-center justify-center text-muted-foreground/30 hover:text-primary hover:bg-primary/5 rounded-sm transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                                                            >
                                                                <Plus className="w-5 h-5" />
                                                            </button>
                                                        )}
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
            {/* Shift Editor Dialog */}
            {creatingShift && (
                <ShiftEditorDialog
                    open={!!creatingShift}
                    onClose={() => setCreatingShift(null)}
                    technicianId={creatingShift.technicianId}
                    date={format(creatingShift.date, 'yyyy-MM-dd')}
                    locations={fetchedLocations}
                    onSave={handleShiftCreated}
                />
            )}
            {editingShift && (
                <ShiftEditorDialog
                    open={!!editingShift}
                    onClose={() => setEditingShift(null)}
                    shift={editingShift}
                    technicianId={editingShift.technician_id}
                    date={format(parseISO(editingShift.start_datetime), 'yyyy-MM-dd')}
                    locations={fetchedLocations}
                    onSave={handleShiftCreated}
                />
            )}
        </div>
    );
};

export default SchedulingCalendar;

