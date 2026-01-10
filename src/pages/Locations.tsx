import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Stack, Text, Skeleton, SimpleGrid } from '@/components/tailwind-components';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings02Icon,
  Search01Icon,
  Cancel01Icon,
  UserIcon,
  NoteIcon,
  Tick01Icon,
  Delete01Icon,
  Location03Icon,
  ListViewIcon,
  MapsIcon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons';
import { useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@/hooks/tailwind';
import { supabase } from '@/integrations/supabase/client';
import { Location, Technician, WorkOrder } from '@/types/supabase';
import { snakeToCamelCase } from '@/utils/data-helpers';
import mapboxgl from 'mapbox-gl';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_API_KEY || '';
import { useDensitySpacing } from '@/hooks/useDensitySpacing';
import { useDensity } from '@/context/DensityContext';

type ViewMode = 'list' | 'map';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Open': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'In Progress': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
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
  const spacing = useDensitySpacing();
  const { isCompact } = useDensity();

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
      el.innerHTML = `<div style="width:36px;height:36px;background:#7c3aed;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg size={16}  viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>${(stats?.openOrders || 0) > 0 ? `<div style="position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;background:#ef4444;border:2px solid white;border-radius:9999px;font-size:9px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;">${stats?.openOrders}</div>` : ''}`;
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
      <div className="flex h-screen bg-white">
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <Skeleton height={24} width={120} radius="md" className="mb-3" />
            <Skeleton height={36} radius="md" />
          </div>
          <div className="flex-1 p-4 space-y-3">
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
      <div className="flex h-screen bg-white dark:bg-gray-900">
        {/* Left Panel - Location List */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service Centers</h1>
              <button
                onClick={toggleFilters}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <HugeiconsIcon icon={Settings02Icon} className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search locations..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Location List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredLocations.map((location) => {
                const stats = locationStats.get(location.id);
                const isSelected = selectedLocation?.id === location.id;

                return (
                  <div
                    key={location.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30 border-r-2 border-primary-500' : ''
                      }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-700 dark:text-primary-300 flex-shrink-0">
                        <HugeiconsIcon icon={Location03Icon} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {location.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span>{stats?.technicians.length || 0} techs</span>
                          <span>{stats?.workOrders.length || 0} orders</span>
                          {(stats?.openOrders || 0) > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">{stats?.openOrders} open</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Location Details */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-700 dark:text-primary-300">
                  <HugeiconsIcon icon={Location03Icon} className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedLocation.name}</h2>
                  {selectedLocation.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation.address}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Ribbon */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Technicians</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedStats?.technicians.length || 0}</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <HugeiconsIcon icon={NoteIcon} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Open Orders</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedStats?.openOrders || 0}</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completed</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(selectedStats?.workOrders.length || 0) - (selectedStats?.openOrders || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Map */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Location</h3>
                </div>
                {selectedLocation.lat && selectedLocation.lng ? (
                  <div ref={detailMapContainer} className="h-[300px]" />
                ) : (
                  <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div className="text-center">
                      <HugeiconsIcon icon={Location03Icon} className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No coordinates available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Technicians */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Assigned Technicians</h3>
                </div>
                <div className="p-4">
                  {(selectedStats?.technicians.length || 0) === 0 ? (
                    <div className="text-center py-8">
                      <HugeiconsIcon icon={UserIcon} className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No technicians assigned</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedStats?.technicians.map(tech => (
                        <div key={tech.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 transition-all">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                            {tech.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{tech.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tech.email || tech.phone || 'No contact'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${tech.status === 'available' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            tech.status === 'busy' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}>
                            {tech.status || 'offline'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Work Orders */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Work Orders</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{selectedStats?.workOrders.length || 0} total</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {(selectedStats?.workOrders.length || 0) === 0 ? (
                    <div className="text-center py-12">
                      <HugeiconsIcon icon={NoteIcon} className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No work orders at this location</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedStats?.workOrders.map(wo => {
                        const statusStyle = STATUS_COLORS[wo.status || 'Open'] || STATUS_COLORS['Open'];
                        return (
                          <div key={wo.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{wo.workOrderNumber || wo.id.substring(0, 8)}</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                {wo.status || 'Open'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{wo.title || wo.service || '-'}</p>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{wo.created_at ? dayjs(wo.created_at).fromNow() : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // List View
  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Left Panel - Location List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Service Centers</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <HugeiconsIcon icon={ListViewIcon} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <HugeiconsIcon icon={MapsIcon} className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search locations..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto">
          {filteredLocations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <HugeiconsIcon icon={Location03Icon} className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No locations found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add your first service center</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredLocations.map((location) => {
                const stats = locationStats.get(location.id);

                return (
                  <div
                    key={location.id}
                    className="p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-700 dark:text-primary-300 flex-shrink-0">
                        <HugeiconsIcon icon={Location03Icon} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {location.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <span>{stats?.technicians.length || 0} techs</span>
                          <span>{stats?.workOrders.length || 0} orders</span>
                          {(stats?.openOrders || 0) > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">{stats?.openOrders} open</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'map' ? (
          <>
            {/* Map Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Location Map</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click on markers to view location details</p>
            </div>

            {/* Stats Ribbon */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={Location03Icon} className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Centers</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.total}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">With Technicians</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.withTechnicians}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={NoteIcon} className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Orders</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.withOpenOrders}</p>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Technicians</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overallStats.totalTechnicians}</p>
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
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={Location03Icon} className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Service Center</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
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
