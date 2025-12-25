import { lazy, Suspense } from 'react';
import { createLazyComponent, LazyLoadingFallbacks } from '@/utils/performance';

// Lazy load heavy chart components
export const LazyChartComponents = {
  MaintenanceCostChart: createLazyComponent(
    () => import('@/components/MaintenanceCostChart'),
    LazyLoadingFallbacks.Chart
  ),
  
  ComponentFailureChart: createLazyComponent(
    () => import('@/components/ComponentFailureChart'),
    LazyLoadingFallbacks.Chart
  ),
  
  KpiSparkline: createLazyComponent(
    () => import('@/components/KpiSparkline'),
    LazyLoadingFallbacks.Chart
  ),
};

// Lazy load heavy table components
export const LazyTableComponents = {
  WorkOrderDataTable: createLazyComponent(
    () => import('@/components/WorkOrderDataTable'),
    LazyLoadingFallbacks.Table
  ),
  
  AssetDataTable: createLazyComponent(
    () => import('@/components/AssetDataTable'),
    LazyLoadingFallbacks.Table
  ),
  
  TechnicianDataTable: createLazyComponent(
    () => import('@/components/TechnicianDataTable'),
    LazyLoadingFallbacks.Table
  ),
  
  CustomerDataTable: createLazyComponent(
    () => import('@/components/CustomerDataTable'),
    LazyLoadingFallbacks.Table
  ),
  
  LocationDataTable: createLazyComponent(
    () => import('@/components/LocationDataTable'),
    LazyLoadingFallbacks.Table
  ),
  
  InventoryDataTable: createLazyComponent(
    () => import('@/components/InventoryDataTable'),
    LazyLoadingFallbacks.Table
  ),
};

// Lazy load form components
export const LazyFormComponents = {
  AssetFormDialog: createLazyComponent(
    () => import('@/components/AssetFormDialog'),
    LazyLoadingFallbacks.Form
  ),
  
  TechnicianFormDialog: createLazyComponent(
    () => import('@/components/TechnicianFormDialog'),
    LazyLoadingFallbacks.Form
  ),
  
  CustomerFormDialog: createLazyComponent(
    () => import('@/components/CustomerFormDialog'),
    LazyLoadingFallbacks.Form
  ),
  
  LocationFormDialog: createLazyComponent(
    () => import('@/components/LocationFormDialog'),
    LazyLoadingFallbacks.Form
  ),
  
  InventoryItemFormDialog: createLazyComponent(
    () => import('@/components/InventoryItemFormDialog'),
    LazyLoadingFallbacks.Form
  ),
  
  WorkOrderFormDrawer: createLazyComponent(
    () => import('@/components/WorkOrderFormDrawer'),
    LazyLoadingFallbacks.Form
  ),
};

// Lazy load calendar components
export const LazyCalendarComponents = {
  Calendar: createLazyComponent(
    () => import('@/components/LazyCalendar'),
    LazyLoadingFallbacks.Card
  ),
};

// Lazy load map components
export const LazyMapComponents = {
  MapView: createLazyComponent(
    () => import('@/components/LazyMapView'),
    LazyLoadingFallbacks.Card
  ),
  
  MapboxDisplayMap: createLazyComponent(
    () => import('@/components/MapboxDisplayMap'),
    LazyLoadingFallbacks.Card
  ),
};

// Lazy load complex workflow components
export const LazyWorkflowComponents = {
  DiagnosisWizard: createLazyComponent(
    () => import('@/components/DiagnosisWizard'),
    LazyLoadingFallbacks.Form
  ),
  
  BikeDiagnosisWizard: createLazyComponent(
    () => import('@/components/BikeDiagnosisWizard'),
    LazyLoadingFallbacks.Form
  ),
  
  RouteOptimizationPanel: createLazyComponent(
    () => import('@/components/RouteOptimizationPanel'),
    LazyLoadingFallbacks.Card
  ),
  
  RoutePlanningPanel: createLazyComponent(
    () => import('@/components/RoutePlanningPanel'),
    LazyLoadingFallbacks.Card
  ),
};

// Lazy load resource planning components
export const LazyResourcePlanningComponents = {
  ResourcePlanningDemo: createLazyComponent(
    () => import('@/components/ResourcePlanning/ResourcePlanningDemo'),
    LazyLoadingFallbacks.Card
  ),
};

// Lazy load cost tracking components
export const LazyCostTrackingComponents = {
  CostTrackingDashboard: createLazyComponent(
    () => import('@/components/CostTracking/CostTrackingDashboard'),
    LazyLoadingFallbacks.Card
  ),
};

// Export all lazy components for easy access
export const LazyComponents = {
  ...LazyChartComponents,
  ...LazyTableComponents,
  ...LazyFormComponents,
  ...LazyCalendarComponents,
  ...LazyMapComponents,
  ...LazyWorkflowComponents,
  ...LazyResourcePlanningComponents,
  ...LazyCostTrackingComponents,
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  import('@/components/WorkOrderDataTable');
  import('@/components/AssetDataTable');
  import('@/components/TechnicianDataTable');
};

// Preload components based on route
export const preloadRouteComponents = (route: string) => {
  switch (route) {
    case '/work-orders':
      import('@/components/WorkOrderDataTable');
      import('@/components/WorkOrderFormDrawer');
      break;
    case '/assets':
      import('@/components/AssetDataTable');
      import('@/components/AssetFormDialog');
      break;
    case '/technicians':
      import('@/components/TechnicianDataTable');
      import('@/components/TechnicianFormDialog');
      break;
    case '/customers':
      import('@/components/CustomerDataTable');
      import('@/components/CustomerFormDialog');
      break;
    case '/locations':
      import('@/components/LocationDataTable');
      import('@/components/LocationFormDialog');
      break;
    case '/inventory':
      import('@/components/InventoryDataTable');
      import('@/components/InventoryItemFormDialog');
      break;
    case '/dashboard':
      import('@/components/MaintenanceCostChart');
      import('@/components/ComponentFailureChart');
      import('@/components/KpiSparkline');
      break;
    case '/calendar':
      import('@/components/LazyCalendar');
      break;
    default:
      // Preload common components
      preloadCriticalComponents();
  }
};