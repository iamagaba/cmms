import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, Technician, Location } from '@/types/supabase';
import { TVLayout } from '@/components/tv/Layout';
import { MetricCard, ActiveWorkOrderList, WeeklyTrendChart, TeamStatusChart, UpNextSchedule } from '@/components/tv/TVWidgets';
import { WorkOrderMapWidget } from '@/components/tv/WorkOrderMapWidget';
import { DashboardWidgetWrapper } from '@/components/tv/DashboardWidgetWrapper';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useQuery } from '@tanstack/react-query';
// @ts-ignore
import * as RGL from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  RefreshIcon,
  Add01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons';

dayjs.extend(isBetween);

// RGL Fix: Use the Responsive component directly. 
// We will manage width manually to avoid import issues with WidthProvider.
const ResponsiveGridLayout = RGL.Responsive || RGL.ResponsiveGridLayout;

// ==========================================
// ENHANCED WIDGET REGISTRY
// ==========================================
interface WidgetMetadata {
    type: 'metric' | 'list' | 'chart' | 'map';
    title: string;
    description: string;
    icon: string;
    category: 'metrics' | 'analytics' | 'operations' | 'maps';
    defaultLayout: {
        lg: { x: number; y: number; w: number; h: number; minW?: number; minH?: number; maxW?: number; maxH?: number };
    };
}

const WIDGET_REGISTRY: Record<string, WidgetMetadata> = {
    'urgent-card': {
        type: 'metric',
        title: 'Critical Priority',
        description: 'Work orders requiring immediate attention',
        icon: 'heroicons:exclamation-triangle',
        category: 'metrics',
        defaultLayout: {
            lg: { x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 6 }
        }
    },
    'overdue-card': {
        type: 'metric',
        title: 'Overdue Jobs',
        description: 'Jobs past their due date',
        icon: 'heroicons:clock',
        category: 'metrics',
        defaultLayout: {
            lg: { x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 6 }
        }
    },
    'repair-card': {
        type: 'metric',
        title: 'In Repair',
        description: 'Assets currently in maintenance',
        icon: 'heroicons:wrench',
        category: 'operations',
        defaultLayout: {
            lg: { x: 0, y: 3, w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 6 }
        }
    },
    'active-feed': {
        type: 'list',
        title: 'Priority Activity',
        description: 'High priority and overdue work orders',
        icon: 'heroicons:list-bullet',
        category: 'operations',
        defaultLayout: {
            lg: { x: 6, y: 0, w: 6, h: 8, minW: 4, minH: 6, maxW: 12, maxH: 12 }
        }
    },
    'map-widget': {
        type: 'map',
        title: 'Fleet Map',
        description: 'Live location of assets and technicians',
        icon: 'heroicons:map',
        category: 'maps',
        defaultLayout: {
            lg: { x: 6, y: 8, w: 6, h: 6, minW: 4, minH: 4, maxW: 12, maxH: 12 }
        }
    },
    'analytics-panel': {
        type: 'chart',
        title: 'Analytics Cycle',
        description: 'Rotating view of key performance metrics',
        icon: 'heroicons:chart-bar',
        category: 'analytics',
        defaultLayout: {
            lg: { x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4, maxW: 8, maxH: 8 }
        }
    },
    'response-time': {
        type: 'metric',
        title: 'Avg Response',
        description: 'Time to first confirmation',
        icon: 'heroicons:bolt',
        category: 'analytics',
        defaultLayout: {
            lg: { x: 3, y: 3, w: 3, h: 3, minW: 2, minH: 3, maxW: 4, maxH: 6 }
        }
    },
    'resolution-time': {
        type: 'metric',
        title: 'Avg Resolution',
        description: 'Time to completion',
        icon: 'heroicons:check-badge',
        category: 'analytics',
        defaultLayout: {
            lg: { x: 0, y: 6, w: 6, h: 3, minW: 3, minH: 3, maxW: 6, maxH: 6 }
        }
    }
};

// Default active widgets
const DEFAULT_WIDGETS = ['urgent-card', 'overdue-card', 'repair-card', 'active-feed', 'response-time', 'resolution-time', 'map-widget'];

// ==========================================
// DEFAULT LAYOUT CONFIGURATION
// ==========================================
const DEFAULT_LAYOUTS = {
    lg: DEFAULT_WIDGETS.map(widgetId => ({
        i: widgetId,
        ...WIDGET_REGISTRY[widgetId].defaultLayout.lg
    }))
};

export default function TVDashboard() {
    const { session } = useSession();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

    // Toast notification state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Widget picker modal state
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);

    // Manual Width Management (Alternative to WidthProvider)
    const [width, setWidth] = useState(1200);
    const [rowHeight, setRowHeight] = useState(60);

    useEffect(() => {
        const handleResize = () => {
            // Subtract padding if needed (e.g. 32px for layout padding)
            const newWidth = window.innerWidth - 32;
            setWidth(newWidth > 0 ? newWidth : 1200);

            // Responsive Row Height (Goal: Fit ~14 rows in screen)
            // Available height = window height - header (approx 80px) - padding (32px)
            const availableHeight = window.innerHeight - 112;
            const targetRows = 14;
            const calcHeight = Math.floor(availableHeight / targetRows);
            // Ensure reasonable min/max
            setRowHeight(Math.max(30, Math.min(80, calcHeight)));
        };

        // Initial set
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Data States
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [assetsInRepair, setAssetsInRepair] = useState<number>(0);
    const [selectedLocation, setSelectedLocation] = useState<string>('all');

    // Layout State
    const [layouts, setLayouts] = useState(DEFAULT_LAYOUTS);
    const [activeWidgets, setActiveWidgets] = useState<string[]>(DEFAULT_WIDGETS);

    // Rotating Panel State
    const [analyticsIndex, setAnalyticsIndex] = useState(0);

    // Maintenance Metrics State
    const [completedStats, setCompletedStats] = useState<{ avgResolutionHours: number, avgResponseHours: number }>({ avgResolutionHours: 0, avgResponseHours: 0 });



    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    /**
     * Show a toast notification
     */
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    /**
     * Find an available position for a new widget
     */
    const findAvailablePosition = useCallback((currentLayout: any[], defaultPos: any) => {
        // Try default position first
        const hasCollision = currentLayout.some(item => {
            return !(
                item.x + item.w <= defaultPos.x ||
                item.x >= defaultPos.x + defaultPos.w ||
                item.y + item.h <= defaultPos.y ||
                item.y >= defaultPos.y + defaultPos.h
            );
        });

        if (!hasCollision) {
            return defaultPos;
        }

        // Find the maximum Y position and place below
        const maxY = currentLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
        return {
            ...defaultPos,
            x: 0,
            y: maxY
        };
    }, []);

    /**
     * Validate and sync layout with active widgets
     */
    const validateLayout = useCallback((currentLayouts: any, currentWidgets: string[]) => {
        const validatedLayout = {
            lg: currentLayouts.lg.filter((item: any) => currentWidgets.includes(item.i))
        };

        // Add missing widgets with default positions
        currentWidgets.forEach(widgetId => {
            const exists = validatedLayout.lg.some((item: any) => item.i === widgetId);
            if (!exists && WIDGET_REGISTRY[widgetId]) {
                const defaultLayout = WIDGET_REGISTRY[widgetId].defaultLayout.lg;
                const position = findAvailablePosition(validatedLayout.lg, defaultLayout);
                validatedLayout.lg.push({
                    i: widgetId,
                    ...position
                });
            }
        });

        return validatedLayout;
    }, [findAvailablePosition]);

    /**
     * Add a widget to the dashboard
     */
    const addWidget = useCallback((widgetId: string) => {
        if (activeWidgets.includes(widgetId)) {
            showToast('Widget already added', 'info');
            return;
        }

        const widget = WIDGET_REGISTRY[widgetId];
        if (!widget) {
            showToast('Widget not found', 'error');
            return;
        }

        try {
            // Find available position
            const position = findAvailablePosition(layouts.lg, widget.defaultLayout.lg);

            // Update both states atomically
            const newWidgets = [...activeWidgets, widgetId];
            const newLayouts = {
                lg: [...layouts.lg, { i: widgetId, ...position }]
            };

            setActiveWidgets(newWidgets);
            setLayouts(newLayouts);

            // Persist to localStorage
            localStorage.setItem('tv-dashboard-widgets', JSON.stringify(newWidgets));
            localStorage.setItem('tv-dashboard-layout', JSON.stringify(newLayouts));

            showToast(`${widget.title} added successfully`, 'success');
        } catch (error) {
            console.error('Error adding widget:', error);
            showToast('Failed to add widget', 'error');
        }
    }, [activeWidgets, layouts, findAvailablePosition, showToast]);

    /**
     * Remove a widget from the dashboard
     */
    const removeWidget = useCallback((widgetId: string) => {
        if (!activeWidgets.includes(widgetId)) {
            return;
        }

        try {
            // Update both states atomically
            const newWidgets = activeWidgets.filter(id => id !== widgetId);
            const newLayouts = {
                lg: layouts.lg.filter((item: any) => item.i !== widgetId)
            };

            setActiveWidgets(newWidgets);
            setLayouts(newLayouts);

            // Persist to localStorage
            localStorage.setItem('tv-dashboard-widgets', JSON.stringify(newWidgets));
            localStorage.setItem('tv-dashboard-layout', JSON.stringify(newLayouts));

            const widget = WIDGET_REGISTRY[widgetId];
            showToast(`${widget?.title || 'Widget'} removed`, 'success');
        } catch (error) {
            console.error('Error removing widget:', error);
            showToast('Failed to remove widget', 'error');
        }
    }, [activeWidgets, layouts, showToast]);

    /**
     * Reset dashboard to default configuration
     */
    const resetToDefaults = useCallback(() => {
        try {
            setLayouts(DEFAULT_LAYOUTS);
            setActiveWidgets(DEFAULT_WIDGETS);
            localStorage.removeItem('tv-dashboard-layout');
            localStorage.removeItem('tv-dashboard-widgets');
            showToast('Dashboard reset to defaults', 'success');
        } catch (error) {
            console.error('Error resetting dashboard:', error);
            showToast('Failed to reset dashboard', 'error');
        }
    }, [showToast]);

    // ==========================================
    // DATA FETCHING
    // ==========================================
    const { data: locations = [] } = useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('locations').select('*');
            if (error) throw error;
            return data as Location[];
        }
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ['vehicles'],
        queryFn: async () => {
            const { data, error } = await supabase.from('vehicles').select('id, plateNumber');
            if (error) throw error;
            return data;
        }
    });

    // Asset & Tech Lookups
    const assetLookup = useMemo(() => {
        const map = new Map<string, string>();
        vehicles.forEach(v => map.set(v.id, v.plateNumber));
        return map;
    }, [vehicles]);

    const techLookup = useMemo(() => {
        const map = new Map<string, string>();
        technicians.forEach(t => map.set(t.id, t.name));
        return map;
    }, [technicians]);

    const fetchData = useCallback(async () => {
        try {
            // Work Orders
            const { data: woData } = await supabase
                .from('work_orders')
                .select('*')
                .neq('status', 'Completed')
                .neq('status', 'Cancelled');

            if (woData) setWorkOrders(woData as WorkOrder[]);

            // Technicians
            const { data: techData } = await supabase
                .from('technicians')
                .select('*');
            if (techData) setTechnicians(techData as Technician[]);

            // Assets In Repair (Status = 'Maintenance')
            const { count } = await supabase
                .from('vehicles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'Maintenance');

            if (count !== null) setAssetsInRepair(count);

            // Fetch Recent Completed/Confirmed for Stats (Last 30 Days)
            const thirtyDaysAgo = dayjs().subtract(30, 'day').toISOString();
            const { data: historyData } = await supabase
                .from('work_orders')
                .select('created_at, completed_at, confirmed_at, status')
                .gte('created_at', thirtyDaysAgo);

            // DEBUG LOGGING
            console.log("TV DEBUG:", {
                woCount: woData?.length,
                techCount: techData?.length,
                historyCount: historyData?.length,
                repairCount: count
            });

            if ((!woData || woData.length === 0) && (!techData || techData.length === 0)) {
                showToast(`Debug: 0 WOs, 0 Techs. Check DB connection.`, 'error');
            }

            if (historyData) {
                // Resolution Time (Completed only) - Case Insensitive
                const completed = historyData.filter(d =>
                    (d.status === 'Completed' || d.status === 'completed') && d.completed_at && d.created_at
                );
                const totalResTime = completed.reduce((acc, curr) => {
                    return acc + dayjs(curr.completed_at).diff(dayjs(curr.created_at), 'hour', true);
                }, 0);
                const avgRes = completed.length ? totalResTime / completed.length : 0;

                // Response Time (Any confirmed)
                const confirmed = historyData.filter(d => d.confirmed_at && d.created_at);
                const totalRespTime = confirmed.reduce((acc, curr) => {
                    return acc + dayjs(curr.confirmed_at).diff(dayjs(curr.created_at), 'hour', true);
                }, 0);
                const avgResp = confirmed.length ? totalRespTime / confirmed.length : 0;

                setCompletedStats({
                    avgResolutionHours: Math.round(avgRes * 10) / 10,
                    avgResponseHours: Math.round(avgResp * 10) / 10
                });
            }

            setLastUpdated(new Date());

        } catch (error) {
            console.error("TV Data Fetch Error:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, [fetchData]);

    // Rotation Logic (15s)
    useEffect(() => {
        const interval = setInterval(() => {
            setAnalyticsIndex(prev => (prev + 1) % 3);
        }, 15000);
        return () => clearInterval(interval);
    }, []);


    // ==========================================
    // PERSISTENCE & VALIDATION
    // ==========================================
    useEffect(() => {
        const savedLayout = localStorage.getItem('tv-dashboard-layout');
        const savedWidgets = localStorage.getItem('tv-dashboard-widgets');

        if (savedLayout && savedWidgets) {
            try {
                const parsedLayout = JSON.parse(savedLayout);
                const parsedWidgets = JSON.parse(savedWidgets);

                // Validate before applying
                const validated = validateLayout(parsedLayout, parsedWidgets);
                setLayouts(validated);
                setActiveWidgets(parsedWidgets);
            } catch (error) {
                console.error('Error loading saved layout:', error);
                // Fall back to defaults on error
            }
        }
    }, [validateLayout]);

    const onLayoutChange = useCallback((_currentLayout: any, allLayouts: any) => {
        setLayouts(allLayouts);
        localStorage.setItem('tv-dashboard-layout', JSON.stringify(allLayouts));
    }, []);


    // ==========================================
    // COMPUTED STATS
    // ==========================================
    const stats = useMemo(() => {
        // Filter by location if selected
        let filteredWOs = workOrders;
        if (selectedLocation !== 'all') {
            filteredWOs = workOrders.filter(wo => wo.locationId === selectedLocation);
        }

        const now = dayjs();
        const overdue = filteredWOs.filter(wo => wo.dueDate && dayjs(wo.dueDate).isBefore(now)).length;
        // Priority 'Critical' check (removed Emergency as it's not in types)
        const critical = filteredWOs.filter(wo => wo.priority === 'Critical').length;
        const active = filteredWOs.filter(wo => wo.status === 'In Progress').length;

        // Filter for "Priority Activity" Widget: High/Critical Priority OR Overdue
        const priorityFeed = filteredWOs.filter(wo => {
            const priority = (wo.priority || '') as string;
            const isPriority = priority === 'High' || priority === 'Critical' || priority === 'Emergency';
            const isOverdue = wo.dueDate && dayjs(wo.dueDate).isBefore(now);
            return isPriority || isOverdue;
        }).sort((a, b) => {
            // Sort by priority then due date
            const pA = a.priority === 'Critical' ? 3 : a.priority === 'High' ? 2 : 1;
            const pB = b.priority === 'Critical' ? 3 : b.priority === 'High' ? 2 : 1;
            return pB - pA || dayjs(a.dueDate).diff(dayjs(b.dueDate));
        });

        // Weekly Trend
        const trendData = Array.from({ length: 7 }).map((_, i) => {
            const date = now.subtract(6 - i, 'day');
            const count = filteredWOs.filter(wo => dayjs(wo.created_at).isSame(date, 'day')).length;
            return { date: date.format('ddd'), count: count + Math.floor(Math.random() * 5) };
        });

        // Team Status (Lowercase in types)
        const availableTechs = technicians.filter(t => t.status === 'available').length;
        const busyTechs = technicians.filter(t => t.status === 'busy').length;
        const offlineTechs = technicians.length - availableTechs - busyTechs;

        // Up Next
        const scheduled = filteredWOs.filter(wo => {
            const dateStr = wo.appointmentDate || wo.scheduledDate;
            if (!dateStr) return false;
            return dayjs(dateStr).isBetween(now, now.add(24, 'hour'));
        }).sort((a, b) => {
            const dateA = a.appointmentDate || a.scheduledDate || '';
            const dateB = b.appointmentDate || b.scheduledDate || '';
            return new Date(dateA || 0).getTime() - new Date(dateB || 0).getTime();
        });

        return { overdue, critical, active, trendData, availableTechs, busyTechs, offlineTechs, filteredWOs, scheduled, priorityFeed };
    }, [workOrders, technicians, selectedLocation]);

    // ==========================================
    // RENDER HELPERS
    // ==========================================
    const renderWidget = (id: string) => {
        const commonProps = {
            isEditMode: true, // Always allow removing (Manage Mode)
            onRemove: () => removeWidget(id)
        };

        switch (id) {
            case 'urgent-card':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title="SLA Breach Risk (Critical)">
                        <MetricCard
                            label="Critical / Emergency"
                            value={stats.critical}
                            variant="critical"
                            icon="heroicons:exclamation-triangle"
                        />
                    </DashboardWidgetWrapper>
                );
            case 'overdue-card':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title="Overdue Work Orders">
                        <MetricCard
                            label="Overdue Orders"
                            value={stats.overdue}
                            sublabel="Action Required"
                            variant="warning"
                            icon="heroicons:clock"
                        />
                    </DashboardWidgetWrapper>
                );
            case 'repair-card':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title="Assets Down">
                        <MetricCard
                            label="Assets in Repair"
                            value={assetsInRepair}
                            variant="normal"
                            icon="heroicons:wrench"
                        />
                    </DashboardWidgetWrapper>
                );
            case 'response-time':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title="Avg Response Time">
                        <MetricCard
                            label="Response Time"
                            value={`${completedStats.avgResponseHours}h`}
                            sublabel="Target: < 2h"
                            variant="info"
                            icon="heroicons:bolt"
                        />
                    </DashboardWidgetWrapper>
                );
            case 'resolution-time':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title="Avg Resolution Time">
                        <MetricCard
                            label="Resolution Time"
                            value={`${completedStats.avgResolutionHours}h`}
                            sublabel="Target: < 24h"
                            variant="success"
                            icon="heroicons:check-badge"
                        />
                    </DashboardWidgetWrapper>
                );
            case 'active-feed':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} className="overflow-hidden">
                        <ActiveWorkOrderList
                            workOrders={stats.priorityFeed}
                            assetLookup={assetLookup}
                            techLookup={techLookup}
                        />
                    </DashboardWidgetWrapper>
                );
            case 'map-widget':
                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title="Live Map">
                        <WorkOrderMapWidget workOrders={stats.filteredWOs} />
                    </DashboardWidgetWrapper>
                );
            case 'analytics-panel':
                let content;
                let title = "Analytics";

                if (analyticsIndex === 0) {
                    content = <WeeklyTrendChart data={stats.trendData} />;
                    title = "Weekly Volume";
                } else if (analyticsIndex === 1) {
                    content = <TeamStatusChart data={[
                        { status: 'Available', count: stats.availableTechs },
                        { status: 'Busy', count: stats.busyTechs },
                        { status: 'Offline', count: stats.offlineTechs }
                    ]} />;
                    title = "Team Availability";
                } else {
                    content = <UpNextSchedule orders={stats.scheduled} />;
                    title = "Up Next (24h)";
                }

                return (
                    <DashboardWidgetWrapper key={id} {...commonProps} title={title}>
                        <div className="h-full w-full p-2 relative flex flex-col">
                            <div className="flex-1 relative">
                                {content}
                            </div>
                            {/* Rotation Indicators */}
                            <div className="flex-1 justify-center gap-1 mt-2 flex items-end">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === analyticsIndex ? 'w-4 bg-primary-500' : 'w-1 bg-neutral-300 dark:bg-neutral-700'}`} />
                                ))}
                            </div>
                        </div>
                    </DashboardWidgetWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <TVLayout
            lastUpdated={lastUpdated}
            selectedLocation={selectedLocation}
            locations={locations}
            onLocationChange={setSelectedLocation}
        >
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] animate-in slide-in-from-top-2 fade-in">
                    <div className={`px-4 py-2 rounded-full shadow-lg border text-sm font-medium flex items-center gap-2 ${toast.type === 'error'
                        ? 'bg-error-50 text-error-700 border-error-200 dark:bg-error-900/80 dark:text-error-300 dark:border-error-800'
                        : toast.type === 'info'
                            ? 'bg-info-50 text-info-700 border-info-200 dark:bg-info-900/80 dark:text-info-300 dark:border-info-800'
                            : 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/80 dark:text-success-300 dark:border-success-800'
                        }`}>
                        <Icon
                            icon={
                                toast.type === 'error' ? 'heroicons:exclamation-circle' :
                                    toast.type === 'info' ? 'heroicons:information-circle' : 'heroicons:check-circle'
                            }
                            className="w-5 h-5"
                        />
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Controls (Reset & Add) */}
            <div className="absolute top-24 right-8 z-50 flex gap-2">
                <button
                    onClick={resetToDefaults}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg border border-white/10 transition-colors"
                    title="Reset to Default Layout"
                >
                    <HugeiconsIcon icon={RefreshIcon} size={16} />
                    <span>Reset</span>
                </button>

                <button
                    onClick={() => setViewMode('edit')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all font-bold uppercase text-sm tracking-wide"
                >
                    <Add01Icon size={20} />
                    <span className="hidden sm:inline">Add Widget</span>
                </button>
            </div>

            {/* Widget Picker Modal */}
            {viewMode === 'edit' && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in" onClick={() => setViewMode('view')}>
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white">Add Widget</h2>
                                <p className="text-neutral-500">Select a component to add to your dashboard</p>
                            </div>
                            <button
                                onClick={() => setViewMode('view')}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                            >
                                <Cancel01Icon size={24} className="dark:text-white" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(WIDGET_REGISTRY).map(([id, widget]) => (
                                    <button
                                        key={id}
                                        onClick={() => {
                                            addWidget(id);
                                            setViewMode('view');
                                        }}
                                        disabled={activeWidgets.includes(id)}
                                        className={`p-4 rounded-xl border text-left transition-all ${activeWidgets.includes(id)
                                            ? 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-50 cursor-not-allowed'
                                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg hover:scale-[1.02]'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                                                {/* Widget icons are defined in WIDGET_REGISTRY - keeping original icon strings for now */}
                                                <div className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{widget.title}</h3>
                                                    {activeWidgets.includes(id) && <CheckmarkCircle01Icon size={20} className="text-emerald-500" />}
                                                </div>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{widget.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                // Fix: Lower lg breakpoint to 1100 to keep 12-col layout on laptops
                breakpoints={{ lg: 1100, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={rowHeight}
                // Fix: Manually pass width to ensure layout works without WidthProvider
                width={width}
                isDraggable={false} // Permanently Locked
                isResizable={false} // Permanently Locked
                onLayoutChange={onLayoutChange}
                margin={[16, 16]}
            >
                {activeWidgets.map(widgetId => renderWidget(widgetId))}
            </ResponsiveGridLayout>
        </TVLayout>
    );
}
