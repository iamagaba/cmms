import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Location } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { TechnicianFormDrawer } from '@/components/TechnicianFormDrawer';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Tabs, Badge } from '@/components/tailwind-components';
import { Input } from '@/components/ui/enterprise';

dayjs.extend(relativeTime);
import { cn } from '@/lib/utils';

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

  const [filters, setFilters] = useState<TechnicianFilters>({
    status: [],
    specialization: [],
    location: [],
    workloadRange: [0, 10],
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

      const location = locations?.find(loc => loc.id === tech.location_id);
      const skillsCount = tech.specializations?.length || 0;

      return {
        ...tech,
        location,
        openTasks,
        completedTasks,
        averageCompletionTime: 0,
        efficiency: completedTasks > 0 ? (completedTasks / (completedTasks + openTasks)) * 100 : 0,
        workload,
        lastActivity: techWorkOrders[0]?.updated_at,
        skillsCount,
        rating: 4.5,
      };
    });
  }, [technicians, workOrders, locations]);



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
      result = result.filter(tech => tech.location_id && filters.location.includes(tech.location_id));
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

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = enhancedTechnicians.length;
    const available = enhancedTechnicians.filter(t => t.status === 'available').length;
    const busy = enhancedTechnicians.filter(t => t.status === 'busy').length;
    const offline = enhancedTechnicians.filter(t => t.status === 'offline').length;
    return { total, available, busy, offline };
  }, [enhancedTechnicians]);

  const hasActiveFilters = searchQuery || filters.status.length > 0 || filters.specialization.length > 0 || filters.location.length > 0;

  // Loading state
  if (isLoadingTechnicians) {
    return (
      <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden">
        <div className="w-80 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-950">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* Left Column - Technician List */}
      <div className="w-80 flex-none border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Stat Ribbon */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          {/* Page Title */}
          <div className="p-4 pb-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Technicians</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Team management and assignments</p>
          </div>

          {/* Stat Ribbon */}
          <div className="info-bar">
            <div className="info-bar-item">
              <span className="text-gray-500">Total:</span>
              <span className="font-semibold text-gray-900">{metrics.total ?? 0}</span>
            </div>
            <div className="info-bar-divider" />
            <div className="info-bar-item">
              <span className="font-semibold text-industrial-700">{metrics.available ?? 0}</span>
            </div>
            <div className="info-bar-divider" />
            <div className="info-bar-item">
              <span className="font-semibold text-maintenance-700">{metrics.busy ?? 0}</span>
            </div>
            <div className="info-bar-divider" />
            <div className="info-bar-item">
              <span className="font-semibold text-gray-500">{metrics.offline ?? 0}</span>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 pt-3">
            <Input
              placeholder="Search technicians..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Icon icon="tabler:search" className="w-3.5 h-3.5 text-gray-400" />}
            />
          </div>

          {/* Filters Toggle */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${filtersOpen || hasActiveFilters
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <Icon icon="tabler:adjustments-horizontal" className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
            <button
              onClick={handleAddTechnician}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
            >
              <Icon icon="tabler:plus" className="w-3.5 h-3.5" />
              Add Technician
            </button>
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={filters.status[0] || 'all'}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? [] : [e.target.value] })}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-2.5 py-1 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <select
                    value={filters.location[0] || 'all'}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value === 'all' ? [] : [e.target.value] })}
                    className="h-9 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 px-2.5 py-1 text-xs"
                  >
                    <option value="all">All</option>
                    {locations?.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ status: [], specialization: [], location: [], workloadRange: [0, 10] });
                  }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Technician List */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredTechnicians.length === 0 ? (
            <div className="empty-state">
              <Icon icon="tabler:user-off" className="empty-state-icon" />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No technicians found</p>
              <p className="empty-state-text">
                {hasActiveFilters ? "Try adjusting your filters" : "Add your first technician to get started"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredTechnicians.map((tech) => {
                const isSelected = selectedTechnician?.id === tech.id;
                return (
                  <div
                    key={tech.id}
                    className={`list-row cursor-pointer ${isSelected ? 'list-row-active' : ''}`}
                    onClick={() => setSelectedTechnician(tech)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                          {tech.avatar ? (
                            <img src={tech.avatar} alt="" className="w-full h-full rounded-md object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                              {tech.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {tech.name}
                          </p>
                          {tech.specializations && tech.specializations.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {tech.specializations.slice(0, 2).join(', ')}
                              {tech.specializations.length > 2 && ` +${tech.specializations.length - 2}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${tech.status === 'available' ? 'bg-industrial-50 dark:bg-industrial-900/30 text-industrial-700 dark:text-industrial-300 border-industrial-200 dark:border-industrial-800' :
                          tech.status === 'busy' ? 'bg-maintenance-50 dark:bg-maintenance-900/30 text-maintenance-700 dark:text-maintenance-300 border-maintenance-200 dark:border-maintenance-800' :
                            'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                          }`}>
                          {tech.status || 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{tech.email}</span>
                      {tech.openTasks > 0 && (
                        <span className="flex items-center gap-1">
                          <Icon icon="tabler:clipboard-list" className="w-3 h-3" />
                          {tech.openTasks} WO{tech.openTasks !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Detail View */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-950 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {selectedTechnician ? (
          <div className="p-6">
            {/* Header: Title, Status, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                  {selectedTechnician.avatar ? (
                    <img src={selectedTechnician.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {selectedTechnician.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedTechnician.name}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedTechnician.status === 'available' ? 'bg-industrial-50 text-industrial-700 border-industrial-200 dark:bg-industrial-900/20 dark:text-industrial-400 dark:border-industrial-800' :
                      selectedTechnician.status === 'busy' ? 'bg-maintenance-50 text-maintenance-700 border-maintenance-200 dark:bg-maintenance-900/20 dark:text-maintenance-400 dark:border-maintenance-800' :
                        'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedTechnician.status === 'available' ? 'bg-industrial-500' :
                        selectedTechnician.status === 'busy' ? 'bg-maintenance-500' :
                          'bg-gray-500'
                        }`} />
                      {selectedTechnician.status || 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTechnician.location?.name || 'Unassigned'}
                    {selectedTechnician.specializations && selectedTechnician.specializations.length > 0 && (
                      <> • {selectedTechnician.specializations.slice(0, 2).join(', ')}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditTechnician(selectedTechnician)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Icon icon="tabler:edit" className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(selectedTechnician)}
                  className="px-3 py-1.5 text-sm font-medium text-error-600 dark:text-error-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Icon icon="tabler:trash" className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Active WOs</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{selectedTechnician.openTasks}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Icon icon="tabler:clipboard-list" className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{selectedTechnician.completedTasks}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-industrial-50 dark:bg-industrial-900/30 flex items-center justify-center">
                    <Icon icon="tabler:check" className="w-4 h-4 text-industrial-600 dark:text-industrial-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Efficiency</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{Math.round(selectedTechnician.efficiency)}%</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-maintenance-50 dark:bg-maintenance-900/30 flex items-center justify-center">
                    <Icon icon="tabler:chart-line" className="w-4 h-4 text-maintenance-600 dark:text-maintenance-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                      {selectedTechnician.location?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <Icon icon="tabler:map-pin" className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Contact Information</h3>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-medium">{selectedTechnician.email}</p>
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{selectedTechnician.phone || 'Not provided'}</p>
                  </div>
                  <div className="p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Employee ID</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 font-mono">#{selectedTechnician.id.substring(0, 8)}</p>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Expertise & Skills</h3>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  {selectedTechnician.specializations && selectedTechnician.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTechnician.specializations.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 rounded text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No specializations listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Work Orders</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {workOrders?.filter(wo => wo.assignedTechnicianId === selectedTechnician.id).length || 0} total
                </span>
              </div>

              {(() => {
                const techWorkOrders = workOrders?.filter(wo => wo.assignedTechnicianId === selectedTechnician.id) || [];

                return techWorkOrders.length > 0 ? (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="px-4 py-3 font-medium">Work Order</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Priority</th>
                            <th className="px-4 py-3 font-medium text-right">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {techWorkOrders.slice(0, 10).map((wo) => (
                            <tr key={wo.id} className="hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                {wo.workOrderNumber || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                                {wo.description || wo.service || 'General Service'}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${wo.status === 'Completed' ? 'bg-industrial-50 dark:bg-industrial-900/30 text-industrial-700 dark:text-industrial-300 border-industrial-200 dark:border-industrial-800' :
                                  wo.status === 'In Progress' ? 'bg-maintenance-50 dark:bg-maintenance-900/30 text-maintenance-700 dark:text-maintenance-300 border-maintenance-200 dark:border-maintenance-800' :
                                    'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                                  }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${wo.status === 'Completed' ? 'bg-industrial-500' :
                                    wo.status === 'In Progress' ? 'bg-maintenance-500' :
                                      'bg-primary-500'
                                    }`} />
                                  {wo.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {wo.priority && (
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${wo.priority === 'High' ? 'bg-error-50 text-error-700 border-error-100 dark:bg-error-900/20 dark:text-error-400 dark:border-error-900/30' :
                                    wo.priority === 'Medium' ? 'bg-maintenance-50 text-maintenance-700 border-maintenance-100 dark:bg-maintenance-900/20 dark:text-maintenance-400 dark:border-maintenance-900/30' :
                                      'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                    }`}>
                                    {wo.priority}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {dayjs(wo.created_at).fromNow()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {techWorkOrders.length > 10 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          View {techWorkOrders.length - 10} more work orders
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8">
                    <div className="text-center">
                      <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3">
                        <Icon icon="tabler:clipboard-off" className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No work orders</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">This technician has no assigned work orders</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon icon="tabler:user" className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Select a Technician</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a technician from the list to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <TechnicianFormDrawer
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTechnician(null);
        }}
        onSubmit={handleSaveTechnician}
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
    </div>
  );
};

export default TechniciansPage;