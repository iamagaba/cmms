import React, { useState, useMemo } from 'react';
import {
  Search,
  Settings2,
  Plus,
  User,
  FileText,
  Edit,
  Trash2,
  Check,
  Clock,
  MapPin
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Technician, WorkOrder, Location } from '@/types/supabase';
import { snakeToCamelCase, camelToSnakeCase } from '@/utils/data-helpers';
import { showSuccess, showError } from '@/utils/toast';
import { TechnicianFormDrawer } from '@/components/TechnicianFormDrawer';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { EmptyState } from '@/components/ui/empty-state';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
            <Skeleton className="h-6 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
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
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">Technicians</h1>
            <div className="flex items-center gap-1">
              <Button
                variant={filtersOpen || hasActiveFilters ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-7 p-0"
                title="Filters"
              >
                <Settings2 className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddTechnician}
                className="w-7 p-0"
                title="Add Technician"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search technicians..."
              aria-label="Search technicians"
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
                  <Select
                    value={filters.status[0] || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? [] : [value] })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-xs font-medium text-muted-foreground mb-0.5">Location</Label>
                  <Select
                    value={filters.location[0] || 'all'}
                    onValueChange={(value) => setFilters({ ...filters, location: value === 'all' ? [] : [value] })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {locations?.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <EmptyState
              icon={<User className="w-6 h-6 text-muted-foreground" />}
              title="No technicians found"
              description={hasActiveFilters ? "Try adjusting your filters" : "Add your first technician to get started"}
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredTechnicians.map((tech) => {
                const isSelected = selectedTechnician?.id === tech.id;
                return (
                  <div
                    key={tech.id}
                    className={`p-3 cursor-pointer border-l-2 transition-colors hover:bg-muted/50 ${isSelected
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
                          <p className="text-sm font-semibold text-foreground">
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
                        <Badge variant={
                          tech.status === 'available' ? 'success' :
                            tech.status === 'busy' ? 'warning' :
                              'outline'
                        }>
                          {tech.status || 'Offline'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tech.email}</span>
                      {tech.openTasks > 0 && (
                        <span className="flex items-center gap-0.5">
                          <FileText className="w-4 h-4" />
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
                      <h2 className="text-base font-semibold text-foreground">
                        {selectedTechnician.name}
                      </h2>
                      <Badge variant={
                        selectedTechnician.status === 'available' ? 'success' :
                          selectedTechnician.status === 'busy' ? 'warning' :
                            'outline'
                      }>
                        <span className={`w-1 h-1 rounded-full mr-1 ${selectedTechnician.status === 'available' ? 'bg-success' :
                          selectedTechnician.status === 'busy' ? 'bg-warning' :
                            'bg-muted-foreground'
                          }`} />
                        {selectedTechnician.status || 'Offline'}
                      </Badge>
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
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(selectedTechnician)}
                    className="px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 flex items-center gap-1.5 h-8"
                  >
                    <Trash2 className="w-4 h-4" />
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
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold font-mono text-foreground mt-0.5">{selectedTechnician.completedTasks}</p>
                    </div>
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                      <Check className="w-4 h-4 text-foreground" />
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
                      <Clock className="w-4 h-4 text-amber-600" />
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
                      <MapPin className="w-4 h-4 text-primary" />
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
                                    <Badge variant={
                                      wo.status === 'Completed' ? 'completed' :
                                        wo.status === 'In Progress' ? 'in-progress' :
                                          'open'
                                    } className="inline-flex items-center gap-1">
                                      <span className={`w-1 h-1 rounded-full ${wo.status === 'Completed' ? 'bg-success' :
                                        wo.status === 'In Progress' ? 'bg-warning' :
                                          'bg-info'
                                        }`} />
                                      {wo.status}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-1.5">
                                    {wo.priority && (
                                      <Badge variant={
                                        wo.priority === 'Critical' ? 'critical' :
                                          wo.priority === 'High' ? 'high' :
                                            wo.priority === 'Medium' ? 'medium' :
                                              'low'
                                      }>
                                        {wo.priority}
                                      </Badge>
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
                    <EmptyState
                      icon={<FileText className="w-6 h-6 text-muted-foreground" />}
                      title="No work orders"
                      description="This technician has no assigned work orders"
                    />
                  );
                })()
                }
              </div>
            </div>
          </div >
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="w-9 h-9 text-muted-foreground/50 mx-auto mb-3" />
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


