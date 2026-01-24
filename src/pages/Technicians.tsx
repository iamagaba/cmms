import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Settings02Icon,
  Add01Icon,
  UserIcon,
  NoteIcon,
  Edit01Icon,
  Delete01Icon,
  Tick01Icon,
  TimelineIcon,
  Location01Icon
} from '@hugeicons/core-free-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Location } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { TechnicianFormDrawer } from '@/components/TechnicianFormDrawer';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
      return (data || []) as Technician[];
    }
  });

  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []) as WorkOrder[];
    }
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return (data || []) as Location[];
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
      showSuccess(editingTechnician ? 'Technician updated.' : 'Technician created.');
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
      showSuccess('Technician deleted.');
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
      const techWorkOrders = workOrders.filter(wo => wo.assigned_technician_id === tech.id);
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

  const hasActiveFilters = searchQuery || filters.status.length > 0 || filters.specialization.length > 0 || filters.location.length > 0;

  // Loading state
  if (isLoadingTechnicians) {
    return (
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <div className="w-80 flex-none border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-6 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Column - Technician List */}
      <div className="w-full sm:w-80 flex-none flex flex-col bg-card">
        {/* Header */}
        {/* Header */}
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Technicians</h1>
            <div className="flex items-center gap-1">
              <Button
                variant={filtersOpen || hasActiveFilters ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="h-7 w-7 p-0"
                title="Filters"
              >
                <HugeiconsIcon icon={Settings02Icon} className="w-3.5 h-3.5" />
                {hasActiveFilters && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddTechnician}
                className="h-7 w-7 p-0"
                title="Add Technician"
              >
                <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={14} className="text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search technicians..."
              className="w-full pl-8 h-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Advanced Filters */}
          {filtersOpen && (
            <div className="mt-3 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-0.5">Status</Label>
                  <select
                    value={filters.status[0] || 'all'}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value === 'all' ? [] : [e.target.value] })}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-0.5">Location</Label>
                  <select
                    value={filters.location[0] || 'all'}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value === 'all' ? [] : [e.target.value] })}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All</option>
                    {locations?.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ status: [], specialization: [], location: [], workloadRange: [0, 10] });
                  }}
                  className="text-xs text-muted-foreground underline mt-1 h-8"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Technician List */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overscroll-y-contain">
          {filteredTechnicians.length === 0 ? (
            <div className="empty-state p-4">
              <HugeiconsIcon icon={UserIcon} size={32} className="empty-state-icon text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground mb-0.5 text-center">No technicians found</p>
              <p className="text-xs text-muted-foreground text-center">
                {hasActiveFilters ? "Try adjusting your filters" : "Add your first technician to get started"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTechnicians.map((tech) => {
                const isSelected = selectedTechnician?.id === tech.id;
                return (
                  <div
                    key={tech.id}
                    className={`p-3 cursor-pointer border-l-2 transition-all hover:bg-muted/50 ${isSelected
                      ? 'bg-muted border-l-primary'
                      : 'border-l-transparent'
                      }`}
                    onClick={() => setSelectedTechnician(tech)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                          {tech.avatar ? (
                            <img src={tech.avatar} alt="" className="w-full h-full rounded object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {tech.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {tech.name}
                          </p>
                          {tech.specializations && tech.specializations.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {tech.specializations.slice(0, 2).join(', ')}
                              {tech.specializations.length > 2 && ` +${tech.specializations.length - 2}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${tech.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          tech.status === 'busy' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-muted text-muted-foreground border-border'
                          }`}>
                          {tech.status || 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tech.email}</span>
                      {tech.openTasks > 0 && (
                        <span className="flex items-center gap-0.5">
                          <HugeiconsIcon icon={NoteIcon} size={12} />
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
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {selectedTechnician ? (
          <div className="flex flex-col h-full">
            <div className="flex-none px-4 py-2.5 bg-background z-10">
              {/* Header: Title, Status, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {selectedTechnician.avatar ? (
                      <img src={selectedTechnician.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {selectedTechnician.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold font-mono text-foreground">
                        {selectedTechnician.name}
                      </h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${selectedTechnician.status === 'available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        selectedTechnician.status === 'busy' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-muted text-muted-foreground border-border'
                        }`}>
                        <span className={`w-1 h-1 rounded-full ${selectedTechnician.status === 'available' ? 'bg-emerald-500' :
                          selectedTechnician.status === 'busy' ? 'bg-amber-500' :
                            'bg-muted-foreground'
                          }`} />
                        {selectedTechnician.status || 'Offline'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedTechnician.location?.name || 'Unassigned'}
                      {selectedTechnician.specializations && selectedTechnician.specializations.length > 0 && (
                        <> &bull; {selectedTechnician.specializations.slice(0, 2).join(', ')}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTechnician(selectedTechnician)}
                    className="px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 h-8"
                  >
                    <HugeiconsIcon icon={Edit01Icon} size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(selectedTechnician)}
                    className="px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1.5 h-8"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overscroll-y-contain">

              {/* Stats Grid */}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Active WOs</p>
                      <p className="text-lg font-bold font-mono text-foreground mt-0.5">{selectedTechnician.openTasks}</p>
                    </div>
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                      <HugeiconsIcon icon={NoteIcon} size={12} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold font-mono text-foreground mt-0.5">{selectedTechnician.completedTasks}</p>
                    </div>
                    <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center">
                      <HugeiconsIcon icon={Tick01Icon} size={12} className="text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Efficiency</p>
                      <p className="text-lg font-bold font-mono text-foreground mt-0.5">{Math.round(selectedTechnician.efficiency)}%</p>
                    </div>
                    <div className="w-6 h-6 rounded bg-amber-50 flex items-center justify-center">
                      <HugeiconsIcon icon={TimelineIcon} size={12} className="text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Location</p>
                      <p className="text-xs font-bold text-foreground mt-0.5 truncate">
                        {selectedTechnician.location?.name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                      <HugeiconsIcon icon={Location01Icon} size={12} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contact Information</h3>
                  <Card className="overflow-hidden rounded-md">
                    <CardContent className="p-4 grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                        <p className="text-xs mt-0.5 font-medium text-foreground">{selectedTechnician.email}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                        <p className="text-xs mt-0.5 text-foreground">{selectedTechnician.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Employee ID</Label>
                        <p className="text-xs mt-0.5 font-mono text-foreground">#{selectedTechnician.id.substring(0, 8)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Specializations */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Expertise & Skills</h3>
                  <Card className="overflow-hidden rounded-md h-full">
                    <CardContent className="p-4">
                      {selectedTechnician.specializations && selectedTechnician.specializations.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTechnician.specializations.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5 font-medium border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No specializations listed</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Work Orders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Work Orders</h3>
                  <span className="text-xs text-muted-foreground">
                    {workOrders?.filter(wo => wo.assigned_technician_id === selectedTechnician.id).length || 0} total
                  </span>
                </div>

                {(() => {
                  const techWorkOrders = workOrders?.filter(wo => wo.assigned_technician_id === selectedTechnician.id) || [];

                  return techWorkOrders.length > 0 ? (
                    <Card className="overflow-hidden rounded-md">
                      <CardContent className="p-4">
                        <div className="overflow-x-auto" style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}>
                          <Table>
                            <TableHeader className="bg-transparent border-none">
                              <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="px-3 py-2 font-medium h-auto text-xs">Work Order</TableHead>
                                <TableHead className="px-3 py-2 font-medium h-auto text-xs">Description</TableHead>
                                <TableHead className="px-3 py-2 font-medium h-auto text-xs">Status</TableHead>
                                <TableHead className="px-3 py-2 font-medium h-auto text-xs">Priority</TableHead>
                                <TableHead className="px-3 py-2 font-medium h-auto text-xs text-right">Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {techWorkOrders.slice(0, 10).map((wo) => (
                                <tr key={wo.id} className="hover:bg-muted/50 transition-colors">
                                  <td className="px-3 py-1.5 font-bold font-mono text-foreground text-xs">
                                    {wo.work_order_number || `WO-${wo.id.substring(0, 6).toUpperCase()}`}
                                  </td>
                                  <td className="px-3 py-1.5 text-muted-foreground max-w-[150px] truncate text-xs">
                                    {wo.service || wo.service_notes || 'General Service'}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border ${wo.status === 'Completed' ? 'bg-industrial-50 dark:bg-industrial-900/30 text-industrial-700 dark:text-industrial-300 border-industrial-200 dark:border-industrial-800' :
                                      wo.status === 'In Progress' ? 'bg-maintenance-50 dark:bg-maintenance-900/30 text-maintenance-700 dark:text-maintenance-300 border-maintenance-200 dark:border-maintenance-800' :
                                        'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                                      }`}>
                                      <span className={`w-1 h-1 rounded-full ${wo.status === 'Completed' ? 'bg-industrial-500' :
                                        wo.status === 'In Progress' ? 'bg-maintenance-500' :
                                          'bg-primary-500'
                                        }`} />
                                      {wo.status}
                                    </span>
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {wo.priority && (
                                      <span className={`inline-block px-1 py-0.5 rounded text-xs font-medium border ${wo.priority === 'High' ? 'bg-error-50 text-error-700 border-error-100 dark:bg-error-900/20 dark:text-error-400 dark:border-error-900/30' :
                                        wo.priority === 'Medium' ? 'bg-maintenance-50 text-maintenance-700 border-maintenance-100 dark:bg-maintenance-900/20 dark:text-maintenance-400 dark:border-maintenance-900/30' :
                                          'bg-muted text-muted-foreground border-border'
                                        }`}>
                                        {wo.priority}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-1.5 text-right text-muted-foreground whitespace-nowrap text-xs">
                                    {dayjs(wo.created_at).fromNow()}
                                  </td>
                                </tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        {techWorkOrders.length > 10 && (
                          <div className="p-2 bg-muted/30 text-center border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              View {techWorkOrders.length - 10} more work orders
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="bg-card border border-border rounded-md p-6">
                      <div className="text-center">
                        <div className="mx-auto w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-2">
                          <HugeiconsIcon icon={NoteIcon} size={18} className="text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium text-foreground mb-0.5">No work orders</p>
                        <p className="text-xs text-muted-foreground">This technician has no assigned work orders</p>
                      </div>
                    </div>
                  );
                })()
                }
              </div>
            </div>
          </div >
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <HugeiconsIcon icon={UserIcon} size={36} className="text-muted/50 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-0.5">Select a Technician</h3>
              <p className="text-xs text-muted-foreground">Choose a technician from the list to view details</p>
            </div>
          </div>
        )}
      </div >

      {/* Dialogs */}
      < TechnicianFormDrawer
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTechnician(null);
        }}
        onSubmit={handleSaveTechnician}
        technician={editingTechnician}
        locations={locations || []}
      />

      < DeleteConfirmationDialog
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
