import { Check, CheckCircle, Map, MapPin, Search, Settings, User, X, FileText, List, ChevronRight } from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Stack, Text, Skeleton, SimpleGrid } from '@/components/tailwind-components';
import PageHeader from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';


import { useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@/hooks/tailwind';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedWorkOrderDataTable } from '@/components/EnhancedWorkOrderDataTable';
import { Location, Technician, WorkOrder, Vehicle, Customer, Profile } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MasterListShell from '@/components/layout/MasterListShell';
import MasterListRow from '@/components/layout/MasterListRow';
import MasterListShell from '@/components/layout/MasterListShell';
import MasterListRow from '@/components/layout/MasterListRow';
import mapboxgl from 'mapbox-gl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';


type ViewMode = 'list' | 'map';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Open': { bg: 'bg-muted', text: 'text-muted-foreground' },
  'In Progress': { bg: 'bg-muted', text: 'text-muted-foreground' },
  'Completed': { bg: 'bg-muted', text: 'text-foreground' },
  'On Hold': { bg: 'bg-amber-50', text: 'text-amber-700' },
};

const LocationsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showFilters, { toggle: toggleFilters }] = useDisclosure(false);
  const [searchTerm, setSearchTerm] = useState('');
  const mapContainer = useRef<HTMLDivElement>(null);
  const detailMapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const detailMap = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);


  // Fetch locations
  const { data: locations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*').order('name');
      if (error) throw new Error(error.message);
      return (data || []).map(loc => snakeToCamelCase(loc) as Location);
    }
  });

  // Fetch technicians
  const { data: technicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(tech => snakeToCamelCase(tech) as Technician);
    }
  });

  // Fetch work orders
  const { data: workOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(wo => snakeToCamelCase(wo) as WorkOrder);
    }
  });

  // Fetch vehicles
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(v => snakeToCamelCase(v) as Vehicle);
    }
  });

  // Fetch customers
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(c => snakeToCamelCase(c) as Customer);
    }
  });

  // Fetch profiles
  const { data: profiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return (data || []).map(p => snakeToCamelCase(p) as Profile);
    }
  });

  // Calculate stats per location
  const locationStats = useMemo(() => {
    const stats = new Map<string, { technicians: Technician[]; workOrders: WorkOrder[]; openOrders: number }>();
    locations?.forEach(loc => {
      const locTechnicians = technicians?.filter(t => t.location_id === loc.id) || [];
      const locWorkOrders = workOrders?.filter(wo => wo.locationId === loc.id) || [];
      const openOrders = locWorkOrders.filter(wo => wo.status !== 'Completed').length;
      stats.set(loc.id, { technicians: locTechnicians, workOrders: locWorkOrders, openOrders });
    });
    return stats;
  }, [locations, technicians, workOrders]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (!searchTerm) return locations;
    const query = searchTerm.toLowerCase();
    return locations.filter(loc => loc.name?.toLowerCase().includes(query) || loc.address?.toLowerCase().includes(query));
  }, [locations, searchTerm]);

  // Overall stats
  const overallStats = useMemo(() => ({
    total: locations?.length || 0,
    withTechnicians: locations?.filter(loc => (locationStats.get(loc.id)?.technicians.length || 0) > 0).length || 0,
    withOpenOrders: locations?.filter(loc => (locationStats.get(loc.id)?.openOrders || 0) > 0).length || 0,
    totalTechnicians: technicians?.length || 0
  }), [locations, locationStats, technicians]);

  // Initialize list view map
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainer.current || map.current || selectedLocation) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [36.8219, -1.2921],
      zoom: 10,
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('load', () => setMapLoaded(true));
    return () => { map.current?.remove(); map.current = null; setMapLoaded(false); };
  }, [viewMode, selectedLocation]);

  // Add markers to list map
  useEffect(() => {
    if (!map.current || !mapLoaded || viewMode !== 'map' || selectedLocation) return;
    const locationsWithCoords = filteredLocations.filter(loc => loc.lat && loc.lng);
    document.querySelectorAll('.location-marker').forEach(el => el.remove());
    locationsWithCoords.forEach(loc => {
      const stats = locationStats.get(loc.id);
      const el = document.createElement('div');
      el.className = 'location-marker';
      el.style.cssText = 'position:relative;cursor:pointer;';
      el.innerHTML = `<div style="width:36px;height:36px;background:#7c3aed;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg className="w-4 h-4"  viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>${(stats?.openOrders || 0) > 0 ? `<div style="position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;background:#ef4444;border:2px solid white;border-radius:9999px;font-size:9px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;">${stats?.openOrders}</div>` : ''}`;
      el.addEventListener('click', () => setSelectedLocation(loc));
      new mapboxgl.Marker({ element: el }).setLngLat([loc.lng!, loc.lat!]).addTo(map.current!);
    });
    if (locationsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locationsWithCoords.forEach(loc => bounds.extend([loc.lng!, loc.lat!]));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [filteredLocations, locationStats, mapLoaded, viewMode, selectedLocation]);

  // Initialize detail map
  useEffect(() => {
    if (!selectedLocation || !detailMapContainer.current) return;
    if (detailMap.current) { detailMap.current.remove(); detailMap.current = null; }
    if (selectedLocation.lat && selectedLocation.lng) {
      detailMap.current = new mapboxgl.Map({
        container: detailMapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 14,
      });
      new mapboxgl.Marker({ color: '#7c3aed' }).setLngLat([selectedLocation.lng, selectedLocation.lat]).addTo(detailMap.current);
    }
    return () => { detailMap.current?.remove(); detailMap.current = null; };
  }, [selectedLocation]);

  const isLoading = isLoadingLocations;
  const selectedStats = selectedLocation ? locationStats.get(selectedLocation.id) : null;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-80 border-r border-border flex flex-col">
          <div className="px-4 py-4 border-b border-border">
            <Skeleton height={24} width={120} radius="md" className="mb-3" />
            <Skeleton height={36} radius="md" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton height={40} width={40} radius="lg" />
                <div className="flex-1">
                  <Skeleton height={16} width="60%" radius="md" className="mb-1" />
                  <Skeleton height={12} width="80%" radius="md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Skeleton height={48} width={48} radius="full" className="mx-auto mb-3" />
            <Skeleton height={20} width={160} radius="md" className="mx-auto mb-2" />
            <Skeleton height={16} width={240} radius="md" className="mx-auto" />
          </div>
        </div>
      </div>
    );
  }


  // Detail View
  if (selectedLocation) {
    return (
      <div className="flex h-screen bg-background">
        {/* Left Panel - Location List */}
        <MasterListShell
          title="Service Centers"
          subtitle="Manage service locations"
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search locations..."
          showFilters={true}
          onToggleFilters={toggleFilters}
          filtersActive={showFilters}
          itemCount={filteredLocations.length}
        >
          {filteredLocations.map((location) => {
            const stats = locationStats.get(location.id);
            const isSelected = selectedLocation?.id === location.id;

            return (
              <MasterListRow
                key={location.id}
                title={location.name}
                subtitle={location.address}
                icon={<MapPin className="w-5 h-5 text-primary" />}
                isSelected={isSelected}
                onClick={() => setSelectedLocation(location)}
                metadata={[
                  {
                    label: 'Techs',
                    value: stats?.technicians.length || 0,
                    icon: <User className="w-3 h-3" />
                  },
                  {
                    label: 'Orders',
                    value: stats?.workOrders.length || 0,
                    icon: <ClipboardList className="w-3 h-3" />
                  },
                  ...(stats?.openOrders && stats.openOrders > 0 ? [{
                    label: 'Open',
                    value: stats.openOrders,
                    icon: <AlertCircle className="w-3 h-3" />
                  }] : [])
                ]}
              />
            );
          })}
        </MasterListShell>

        {/* Right Panel - Location Details */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedLocation.name}</h2>
                  {selectedLocation.address && (
                    <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground bg-background border border-input rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Ribbon */}
          <div className="bg-background border-b border-border">
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Technicians</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{selectedStats?.technicians.length || 0}</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Open Orders</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{selectedStats?.openOrders || 0}</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {(selectedStats?.workOrders.length || 0) - (selectedStats?.openOrders || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedLocation.lat && selectedLocation.lng ? (
                    <div ref={detailMapContainer} className="h-[300px]" />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <MapPin className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No coordinates available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Technicians */}
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Technicians</CardTitle>
                </CardHeader>
                <CardContent>
                  {(selectedStats?.technicians.length || 0) === 0 ? (
                    <EmptyState
                      icon={<User className="w-6 h-6 text-muted-foreground" />}
                      title="No technicians assigned"
                      description="Technicians will appear here when assigned to this location"
                    />
                  ) : (
                    <div className="space-y-2">
                      {selectedStats?.technicians.map(tech => (
                        <div key={tech.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                            {tech.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                            <p className="text-xs text-muted-foreground">{tech.email || tech.phone || 'No contact'}</p>
                          </div>
                          <Badge 
                            variant={
                              tech.status === 'available' ? 'success' :
                              tech.status === 'busy' ? 'warning' : 'secondary'
                            }
                          >
                            {tech.status || 'offline'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Orders */}
              <Card className="flex flex-col h-[500px]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Work Orders</CardTitle>
                  <span className="text-xs text-muted-foreground">{selectedStats?.workOrders.length || 0} total</span>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <EnhancedWorkOrderDataTable
                    workOrders={selectedStats?.workOrders || []}
                    technicians={technicians || []}
                    locations={locations || []}
                    vehicles={vehicles || []}
                    customers={customers || []}
                    profiles={profiles || []}
                    onEdit={(wo) => console.log('Edit WO', wo)}
                    onDelete={(wo) => console.log('Delete WO', wo)}
                    onViewDetails={(id) => console.log('View WO', id)}
                    onUpdateWorkOrder={(id, updates) => console.log('Update WO', id, updates)}
                    loading={isLoading}
                    visibleColumns={['workOrderNumber', 'service', 'status', 'technician', 'priority']}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // List View
  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Location List */}
      <MasterListShell
        title="Service Centers"
        subtitle="Manage service locations"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search locations..."
        showFilters={false}
        itemCount={filteredLocations.length}
        emptyState={
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No locations found</p>
            <p className="text-xs text-muted-foreground">Add your first service center</p>
          </div>
        }
        className="w-80"
      >
        {filteredLocations.map((location) => {
          const stats = locationStats.get(location.id);

          return (
            <MasterListRow
              key={location.id}
              title={location.name}
              subtitle={location.address}
              badge={
                (stats?.openOrders || 0) > 0 ? {
                  text: `${stats?.openOrders} open`,
                  variant: 'warning'
                } : undefined
              }
              icon={<MapPin className="w-5 h-5 text-primary" />}
              onClick={() => setSelectedLocation(location)}
              metadata={[
                {
                  label: 'Techs',
                  value: stats?.technicians.length || 0,
                  icon: <User className="w-3 h-3" />
                },
                {
                  label: 'Orders',
                  value: stats?.workOrders.length || 0,
                  icon: <FileText className="w-3 h-3" />
                }
              ]}
            />
          );
        })}
      </MasterListShell>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'map' ? (
          <>
            {/* Map Header */}
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Location Map</h2>
              <p className="text-sm text-muted-foreground">Click on markers to view location details</p>
            </div>

            {/* Stats Ribbon */}
            <div className="bg-background border-b border-border">
              <div className="grid grid-cols-4 divide-x divide-border">
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Centers</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.total}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">With Technicians</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.withTechnicians}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Orders</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.withOpenOrders}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-muted-foreground dark:text-blue-400" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Technicians</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{overallStats.totalTechnicians}</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="flex-1">
              <div ref={mapContainer} className="w-full h-full" />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Select a Service Center</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a location from the list to view its details, technicians, and work orders.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;


