import React, { useState, useMemo, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Location } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { TechnicianFormDialog } from '@/components/TechnicianFormDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Enhanced Technician type with calculated fields
type EnhancedTechnician = Technician & {
  location?: Location;
  openTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
  efficiency: number;
  workload: 'light' | 'moderate' | 'heavy' | 'overloaded';
  lastActivity?: string;
  skillsCount: number;
};

// Filter types
interface TechnicianFilters {
  status: string[];
  specialization: string[];
  location: string[];
  workloadRange: [number, number];
}

const TechniciansPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<EnhancedTechnician | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<Technician | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TechnicianFilters>({
    status: [],
    specialization: [],
    location: [],
    workloadRange: [0, 10],
  });

  // Data fetching
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*').order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(technician => snakeToCamelCase(technician) as Technician);
    }
  });

  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(workOrder => snakeToCamelCase(workOrder) as WorkOrder);
    }
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(location => snakeToCamelCase(location) as Location);
    }
  });

  // Mutations
  const technicianMutation = useMutation({
    mutationFn: async (technicianData: Partial<Technician>) => {
      const snakeCaseData = camelToSnakeCase(technicianData);
      const cleanData = Object.fromEntries(
        Object.entries(snakeCaseData).filter(([_, value]) => value !== undefined)
      );

      if (technicianData.id) {
        const { error } = await supabase.from('technicians').update(cleanData).eq('id', technicianData.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('technicians').insert([cleanData]);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess(editingTechnician ? 'Technician updated successfully' : 'Technician created successfully');
      setIsDialogOpen(false);
      setEditingTechnician(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('technicians').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
      showSuccess('Technician deleted successfully');
      setDeleteDialogOpen(false);
      setTechnicianToDelete(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    }
  });

  // Calculate enhanced technician data
  const enhancedTechnicians = useMemo<EnhancedTechnician[]>(() => {
    if (!technicians || !workOrders) return [];

    return technicians.map(tech => {
      const techWorkOrders = workOrders.filter(wo => wo.assignedTechnicianId === tech.id);
      const openTasks = techWorkOrders.filter(wo => wo.status === 'Open' || wo.status === 'In Progress').length;
      const completedTasks = techWorkOrders.filter(wo => wo.status === 'Completed').length;

      let workload: 'light' | 'moderate' | 'heavy' | 'overloaded' = 'light';
      if (openTasks >= 8) workload = 'overloaded';
      else if (openTasks >= 5) workload = 'heavy';
      else if (openTasks >= 3) workload = 'moderate';

      const location = locations?.find(loc => loc.id === tech.locationId);
      const skillsCount = tech.specializations?.length || 0;

      return {
        ...tech,
        location,
        openTasks,
        completedTasks,
        averageCompletionTime: 0,
        efficiency: completedTasks > 0 ? (completedTasks / (completedTasks + openTasks)) * 100 : 0,
        workload,
        lastActivity: techWorkOrders[0]?.updatedAt,
        skillsCount,
        rating: 4.5,
      };
    });
  }, [technicians, workOrders, locations]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = enhancedTechnicians.length;
    const available = enhancedTechnicians.filter(t => t.status === 'available').length;
    const busy = enhancedTechnicians.filter(t => t.status === 'busy').length;
    const offline = enhancedTechnicians.filter(t => t.status === 'offline').length;
    const overloaded = enhancedTechnicians.filter(t => t.workload === 'overloaded').length;

    return { total, available, busy, offline, overloaded };
  }, [enhancedTechnicians]);

  // Filter and search technicians
  const filteredTechnicians = useMemo(() => {
    let result = enhancedTechnicians;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(tech =>
        tech.name?.toLowerCase().includes(query) ||
        tech.email?.toLowerCase().includes(query) ||
        tech.phone?.toLowerCase().includes(query) ||
        tech.specializations?.some(s => s.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(tech => filters.status.includes(tech.status || ''));
    }

    // Specialization filter
    if (filters.specialization.length > 0) {
      result = result.filter(tech =>
        tech.specializations?.some(s => filters.specialization.includes(s))
      );
    }

    // Location filter
    if (filters.location.length > 0) {
      result = result.filter(tech => tech.locationId && filters.location.includes(tech.locationId));
    }

    // Workload filter
    const [minWorkload, maxWorkload] = filters.workloadRange;
    result = result.filter(tech => tech.openTasks >= minWorkload && tech.openTasks <= maxWorkload);

    return result;
  }, [enhancedTechnicians, searchQuery, filters]);

  // Event handlers
  const handleAddTechnician = () => {
    setEditingTechnician(null);
    setIsDialogOpen(true);
  };

  const handleEditTechnician = (technician: Technician) => {
    setEditingTechnician(technician);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (technician: Technician) => {
    setTechnicianToDelete(technician);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!technicianToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(technicianToDelete.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveTechnician = (technicianData: Partial<Technician>) => {
    technicianMutation.mutate(technicianData);
  };

  const handleStatClick = (filterType: string) => {
    if (filterType === 'all') {
      setFilters(prev => ({ ...prev, status: [] }));
    } else if (filterType === 'overloaded') {
      // Filter by workload instead
      setFilters(prev => ({ ...prev, workloadRange: [8, 10] }));
    } else {
      setFilters(prev => ({ ...prev, status: [filterType] }));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      status: [],
      specialization: [],
      location: [],
      workloadRange: [0, 10],
    });
  };

  const hasActiveFilters = searchQuery || filters.status.length > 0 ||
    filters.specialization.length > 0 || filters.location.length > 0 ||
    (filters.workloadRange[0] !== 0 || filters.workloadRange[1] !== 10);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Page Header */}
      <div className="flex-none px-6 pt-4 pb-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Technicians
            </h1>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              Manage your maintenance team
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filtersOpen
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Icon icon="heroicons:funnel" className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
            <button
              onClick={handleAddTechnician}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Icon icon="heroicons:plus" className="w-4 h-4" />
              <span>Add Technician</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Ribbon */}
      <div className="flex-none grid grid-cols-5 divide-x divide-gray-200 dark:divide-gray-800 border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={() => handleStatClick('all')}
          className="px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <Icon icon="heroicons:users" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatClick('available')}
          className="px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.available}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <Icon icon="heroicons:check-circle" className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatClick('busy')}
          className="px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Busy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.busy}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
              <Icon icon="heroicons:clock" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatClick('offline')}
          className="px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Offline</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.offline}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
              <Icon icon="heroicons:moon" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatClick('overloaded')}
          className="px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overloaded</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.overloaded}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
              <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </button>
      </div>

      {/* Filters Panel (Collapsible) */}
      {filtersOpen && (
        <div className="flex-none bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon icon="heroicons:magnifying-glass" className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone, or specialization..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                {filters.status.map(status => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium border border-blue-200 dark:border-blue-800"
                  >
                    {status}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }))}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Grid */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {isLoadingTechnicians ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading technicians...</p>
            </div>
          </div>
        ) : filteredTechnicians.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="heroicons:users" className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No technicians found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || hasActiveFilters ? 'Try adjusting your search or filters' : 'Get started by adding a new technician'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Technician
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Workload
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden md:table-cell">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden lg:table-cell">
                    Skills
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden xl:table-cell">
                    Performance
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredTechnicians.map((technician) => {
                  // Helper functions for styling with design system tokens
                  const getStatusColor = (status?: string) => {
                    switch (status) {
                      case 'available':
                        return 'bg-success-100 text-success-700 border-success-200';
                      case 'busy':
                        return 'bg-warning-100 text-warning-700 border-warning-200';
                      case 'offline':
                        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
                      default:
                        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
                    }
                  };

                  const getWorkloadColor = (workload: string) => {
                    switch (workload) {
                      case 'light':
                        return 'text-success-600 bg-success-50';
                      case 'moderate':
                        return 'text-primary-600 bg-primary-50';
                      case 'heavy':
                        return 'text-warning-600 bg-warning-50';
                      case 'overloaded':
                        return 'text-error-600 bg-error-50';
                      default:
                        return 'text-neutral-600 bg-neutral-50';
                    }
                  };

                  const getInitials = (name: string) => {
                    return name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                  };

                  return (
                    <tr
                      key={technician.id}
                      onClick={() => setSelectedTechnician(technician)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Technician Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {technician.avatar ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={technician.avatar} alt="" />
                              ) : (
                                getInitials(technician.name || 'NA')
                              )}
                            </div>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${technician.status === 'available'
                                ? 'bg-success-500'
                                : technician.status === 'busy'
                                  ? 'bg-warning-500'
                                  : 'bg-neutral-400'
                                }`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 transition-colors">
                              {technician.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {technician.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(technician.status || undefined)}`}>
                          {technician.status || 'offline'}
                        </span>
                      </td>

                      {/* Workload */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getWorkloadColor(technician.workload)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          {technician.openTasks} active
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        {technician.location ? (
                          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                            <Icon icon="heroicons:map-pin" className="flex-shrink-0 mr-1.5 h-4 w-4 text-neutral-400" />
                            {technician.location.name}
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">-</span>
                        )}
                      </td>

                      {/* Skills */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {technician.specializations && technician.specializations.length > 0 ? (
                            <>
                              {technician.specializations.slice(0, 2).map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                >
                                  {spec}
                                </span>
                              ))}
                              {technician.specializations.length > 2 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                                  +{technician.specializations.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-neutral-400 text-xs italic">No skills listed</span>
                          )}
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs">
                            <Icon icon="heroicons:check-circle" className="h-4 w-4 text-success-500" />
                            <span className="font-medium text-neutral-700 dark:text-neutral-300">{technician.completedTasks}</span>
                          </div>
                          {technician.efficiency > 0 && (
                            <div className="text-xs text-neutral-500">
                              {Math.round(technician.efficiency)}% eff.
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Chevron */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Icon icon="heroicons:chevron-right" className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full-Screen Details Modal */}
      {selectedTechnician && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedTechnician(null)}
                    className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to List</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleEditTechnician(selectedTechnician);
                      setSelectedTechnician(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Icon icon="heroicons:pencil" className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteClick(selectedTechnician);
                      setSelectedTechnician(null);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-error-700 dark:text-error-400 bg-white dark:bg-error-900/10 border border-error-200 dark:border-error-800 rounded-md hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                  >
                    <Icon icon="heroicons:trash" className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-73px)] bg-neutral-50 dark:bg-gray-900">
            <div className="max-w-5xl mx-auto px-6 py-8">
              {/* Technician Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {selectedTechnician.avatar ? (
                        <img
                          src={selectedTechnician.avatar}
                          alt={selectedTechnician.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        selectedTechnician.name
                          ?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 ${selectedTechnician.status === 'available'
                        ? 'bg-success-500'
                        : selectedTechnician.status === 'busy'
                          ? 'bg-warning-500'
                          : 'bg-neutral-400'
                        }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedTechnician.name}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                      {selectedTechnician.email}
                    </p>

                    {/* Status Badge */}
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${selectedTechnician.status === 'available'
                          ? 'bg-success-100 text-success-700 border-success-200'
                          : selectedTechnician.status === 'busy'
                            ? 'bg-warning-100 text-warning-700 border-warning-200'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                      >
                        {selectedTechnician.status || 'offline'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${selectedTechnician.workload === 'light'
                          ? 'text-success-700 bg-success-100 border border-success-200'
                          : selectedTechnician.workload === 'moderate'
                            ? 'text-primary-700 bg-primary-100 border border-primary-200'
                            : selectedTechnician.workload === 'heavy'
                              ? 'text-warning-700 bg-warning-100 border border-warning-200'
                              : 'text-error-700 bg-error-100 border border-error-200'
                          }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {selectedTechnician.workload.toUpperCase()} WORKLOAD
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg px-4 py-3 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Active Jobs</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{selectedTechnician.openTasks}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg px-4 py-3 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Completed</p>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{selectedTechnician.completedTasks}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Icon icon="heroicons:user" className="w-4 h-4 text-primary-500" />
                    Contact Information
                  </h3>
                  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 p-4 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                        <Icon icon="heroicons:envelope" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email Address</p>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{selectedTechnician.email}</p>
                      </div>
                    </div>

                    {selectedTechnician.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                          <Icon icon="heroicons:phone" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Phone Number</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedTechnician.phone}</p>
                        </div>
                      </div>
                    )}

                    {selectedTechnician.location && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                          <Icon icon="heroicons:map-pin" className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Location</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{selectedTechnician.location.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Specializations */}
                  {selectedTechnician.specializations && selectedTechnician.specializations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Icon icon="heroicons:academic-cap" className="w-4 h-4 text-primary-500" />
                        Specializations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTechnician.specializations.map((spec, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700"
                          >
                            <Icon icon="heroicons:wrench-screwdriver" className="w-3.5 h-3.5 text-neutral-500" />
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status & Workload */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Icon icon="heroicons:chart-bar" className="w-4 h-4 text-primary-500" />
                      Status & Workload
                    </h3>
                    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 p-4 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Current Status</span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${selectedTechnician.status === 'available'
                            ? 'bg-success-100 text-success-700 border-success-200'
                            : selectedTechnician.status === 'busy'
                              ? 'bg-warning-100 text-warning-700 border-warning-200'
                              : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                            }`}
                        >
                          {selectedTechnician.status || 'offline'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Workload Level</span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedTechnician.workload === 'light'
                            ? 'text-success-700 bg-success-100 border border-success-200'
                            : selectedTechnician.workload === 'moderate'
                              ? 'text-primary-700 bg-primary-100 border border-primary-200'
                              : selectedTechnician.workload === 'heavy'
                                ? 'text-warning-700 bg-warning-100 border border-warning-200'
                                : 'text-error-700 bg-error-100 border border-error-200'
                            }`}
                        >
                          {selectedTechnician.workload.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Efficiency Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${selectedTechnician.efficiency}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                            {Math.round(selectedTechnician.efficiency)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Work Orders */}
                  {selectedTechnician.openTasks > 0 && workOrders && (
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <Icon icon="heroicons:clipboard-document-list" className="w-4 h-4 text-primary-500" />
                        Active Work Orders
                      </h3>
                      <div className="space-y-3">
                        {workOrders
                          .filter(wo => wo.assignedTechnicianId === selectedTechnician.id && (wo.status === 'Open' || wo.status === 'In Progress'))
                          .slice(0, 5)
                          .map(wo => (
                            <div
                              key={wo.id}
                              className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                    {wo.workOrderNumber || `WO-${wo.id.substring(0, 6)}`}
                                  </p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1">
                                    {wo.service || wo.description || 'General Service'}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${wo.status === 'Open'
                                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                                    : 'bg-warning-100 text-warning-700 border border-warning-200'
                                    }`}
                                >
                                  {wo.status}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <TechnicianFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTechnician(null);
        }}
        onSave={handleSaveTechnician}
        technician={editingTechnician}
        locations={locations || []}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Technician"
        message={`Are you sure you want to delete ${technicianToDelete?.name}? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div >
  );
};

export default TechniciansPage;