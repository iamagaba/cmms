/**
 * TimelineFilters Component
 * Filtering controls for the activity timeline using shadcn/ui components
 * Uses default styling as per application isolation rules
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, CalendarDays, Filter, X, Search, User, Check } from 'lucide-react';
import dayjs from 'dayjs';

// shadcn/ui components with default styling
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { getActivityTypeConfig, getAllActivityTypes } from '@/utils/activity-type-config';
import type { TimelineFilters, ActivityType, TimelineFiltersProps } from '@/types/activity-timeline';

/**
 * Predefined date range options for quick selection
 */
const DATE_RANGE_PRESETS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
] as const;

/**
 * TimelineFilters - Filter controls for activity timeline
 * 
 * Features:
 * - Date range picker with presets and custom calendar selection
 * - Activity type multi-select with checkboxes and visual indicators
 * - Technician dropdown with search functionality
 * - Clear filters functionality
 * - Uses shadcn/ui components with default styling
 * - Follows Requirements 3.1, 3.2, 3.3
 */
export function TimelineFilters({
  filters,
  onFiltersChange,
  availableTechnicians = [],
  className
}: TimelineFiltersProps) {
  // Local state for UI interactions
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [activityTypesOpen, setActivityTypesOpen] = useState(false);
  const [technicianOpen, setTechnicianOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Get all available activity types
  const allActivityTypes = getAllActivityTypes();

  // Calculate active filter count for display
  const activeFilterCount = [
    filters.dateRange ? 1 : 0,
    filters.activityTypes?.length ? 1 : 0,
    filters.technicianIds?.length ? 1 : 0,
    filters.searchQuery?.trim() ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  // Handle date range preset selection
  const handleDateRangePreset = useCallback((days: number) => {
    const end = dayjs().endOf('day').toDate();
    const start = dayjs().subtract(days - 1, 'day').startOf('day').toDate();
    
    onFiltersChange({
      ...filters,
      dateRange: { start, end }
    });
    setDateRangeOpen(false);
  }, [filters, onFiltersChange]);

  // Handle custom date range selection
  const handleCustomDateRange = useCallback((range: { from?: Date; to?: Date }) => {
    setCustomDateRange(range);
    
    if (range.from && range.to) {
      onFiltersChange({
        ...filters,
        dateRange: {
          start: dayjs(range.from).startOf('day').toDate(),
          end: dayjs(range.to).endOf('day').toDate()
        }
      });
      setDateRangeOpen(false);
    } else if (range.from && !range.to) {
      // Single date selection - set as start and end of same day
      onFiltersChange({
        ...filters,
        dateRange: {
          start: dayjs(range.from).startOf('day').toDate(),
          end: dayjs(range.from).endOf('day').toDate()
        }
      });
      setDateRangeOpen(false);
    }
  }, [filters, onFiltersChange]);

  // Handle activity type toggle
  const handleActivityTypeToggle = useCallback((activityType: ActivityType) => {
    const currentTypes = filters.activityTypes || [];
    const isSelected = currentTypes.includes(activityType);
    
    const newTypes = isSelected
      ? currentTypes.filter(type => type !== activityType)
      : [...currentTypes, activityType];
    
    onFiltersChange({
      ...filters,
      activityTypes: newTypes.length > 0 ? newTypes : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle technician selection
  const handleTechnicianToggle = useCallback((technicianId: string) => {
    const currentIds = filters.technicianIds || [];
    const isSelected = currentIds.includes(technicianId);
    
    const newIds = isSelected
      ? currentIds.filter(id => id !== technicianId)
      : [...currentIds, technicianId];
    
    onFiltersChange({
      ...filters,
      technicianIds: newIds.length > 0 ? newIds : undefined
    });
  }, [filters, onFiltersChange]);

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
    setCustomDateRange({});
  }, [onFiltersChange]);

  // Format date range for display
  const formatDateRangeDisplay = () => {
    if (!filters.dateRange) return 'Select date range';
    
    const { start, end } = filters.dateRange;
    const startStr = dayjs(start).format('MMM D');
    const endStr = dayjs(end).format('MMM D, YYYY');
    
    // Check if it's the same day
    if (dayjs(start).format('YYYY-MM-DD') === dayjs(end).format('YYYY-MM-DD')) {
      return dayjs(start).format('MMM D, YYYY');
    }
    
    return `${startStr} - ${endStr}`;
  };

  // Get selected technician names for display
  const getSelectedTechnicianNames = () => {
    if (!filters.technicianIds?.length) return 'All technicians';
    
    const selectedNames = filters.technicianIds
      .map(id => availableTechnicians.find(tech => tech.id === id)?.name)
      .filter(Boolean);
    
    if (selectedNames.length === 1) return selectedNames[0];
    if (selectedNames.length <= 2) return selectedNames.join(', ');
    return `${selectedNames[0]} +${selectedNames.length - 1} more`;
  };

  // Sync custom date range with filters
  useEffect(() => {
    if (filters.dateRange) {
      setCustomDateRange({
        from: filters.dateRange.start,
        to: filters.dateRange.end
      });
    } else {
      setCustomDateRange({});
    }
  }, [filters.dateRange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Filter */}
        <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !filters.dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              {formatDateRangeDisplay()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              {/* Preset Options */}
              <div className="space-y-1">
                <div className="text-sm font-medium">Quick Select</div>
                <div className="grid grid-cols-1 gap-1">
                  {DATE_RANGE_PRESETS.map(preset => (
                    <Button
                      key={preset.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateRangePreset(preset.value)}
                      className="justify-start h-8"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Custom Calendar */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Custom Range</div>
                <CalendarComponent
                  mode="range"
                  selected={customDateRange}
                  onSelect={handleCustomDateRange}
                  numberOfMonths={1}
                  className="rounded-md border"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Activity Types Filter */}
        <Popover open={activityTypesOpen} onOpenChange={setActivityTypesOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !filters.activityTypes?.length && 'text-muted-foreground'
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              {filters.activityTypes?.length 
                ? `${filters.activityTypes.length} activity type${filters.activityTypes.length !== 1 ? 's' : ''}`
                : 'All activity types'
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3">
              <div className="text-sm font-medium mb-3">Activity Types</div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allActivityTypes.map(activityType => {
                  const config = getActivityTypeConfig(activityType);
                  const isSelected = filters.activityTypes?.includes(activityType) || false;
                  
                  return (
                    <div
                      key={activityType}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                      onClick={() => handleActivityTypeToggle(activityType)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleActivityTypeToggle(activityType)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          config.color.replace('text-', 'bg-')
                        )} />
                        <span className="text-sm">{config.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {filters.activityTypes?.length ? (
                <>
                  <Separator className="my-3" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, activityTypes: undefined })}
                    className="w-full justify-start h-8"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear activity types
                  </Button>
                </>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>

        {/* Technician Filter */}
        <Popover open={technicianOpen} onOpenChange={setTechnicianOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !filters.technicianIds?.length && 'text-muted-foreground'
              )}
            >
              <User className="w-4 h-4 mr-2" />
              {getSelectedTechnicianNames()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search technicians..." />
              <CommandList>
                <CommandEmpty>No technicians found.</CommandEmpty>
                <CommandGroup>
                  {availableTechnicians.map(technician => {
                    const isSelected = filters.technicianIds?.includes(technician.id) || false;
                    
                    return (
                      <CommandItem
                        key={technician.id}
                        onSelect={() => handleTechnicianToggle(technician.id)}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleTechnicianToggle(technician.id)}
                        />
                        <span className="flex-1">{technician.name}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
            
            {filters.technicianIds?.length ? (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, technicianIds: undefined })}
                  className="w-full justify-start h-8"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear technician filter
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>

        {/* Clear All Filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {/* Date Range Badge */}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateRangeDisplay()}
              <button
                onClick={() => onFiltersChange({ ...filters, dateRange: undefined })}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {/* Activity Types Badges */}
          {filters.activityTypes?.map(activityType => {
            const config = getActivityTypeConfig(activityType);
            return (
              <Badge key={activityType} variant="secondary" className="gap-1">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  config.color.replace('text-', 'bg-')
                )} />
                {config.label}
                <button
                  onClick={() => handleActivityTypeToggle(activityType)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          
          {/* Technician Badges */}
          {filters.technicianIds?.map(technicianId => {
            const technician = availableTechnicians.find(tech => tech.id === technicianId);
            if (!technician) return null;
            
            return (
              <Badge key={technicianId} variant="secondary" className="gap-1">
                <User className="w-3 h-3" />
                {technician.name}
                <button
                  onClick={() => handleTechnicianToggle(technicianId)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TimelineFilters;