import React from 'react';
import KpiCardWidget from '@/components/dashboard-widgets/KpiCardWidget';
import UrgentWorkOrdersWidget from '@/components/dashboard-widgets/UrgentWorkOrdersWidget';
import TechnicianStatusListWidget from '@/components/dashboard-widgets/TechnicianStatusListWidget';
import WorkOrderSummaryWidget from '@/components/dashboard-widgets/WorkOrderSummaryWidget';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultSize?: { w: number; h: number };
  defaultPosition?: { x: number; y: number };
  props?: Record<string, any>;
}

export const widgetRegistry: WidgetConfig[] = [
  {
    id: 'kpi-total-work-orders',
    title: 'Total Work Orders',
    component: KpiCardWidget,
    props: { kpiType: 'totalWorkOrders', icon: <ToolOutlined /> },
  },
  {
    id: 'kpi-open-work-orders',
    title: 'Open Work Orders',
    component: KpiCardWidget,
    props: { kpiType: 'openWorkOrders', icon: <ExclamationCircleOutlined /> },
  },
  {
    id: 'kpi-sla-performance',
    title: 'SLA Performance',
    component: KpiCardWidget,
    props: { kpiType: 'slaPerformance', icon: <CheckCircleOutlined /> },
  },
  {
    id: 'kpi-avg-completion-time',
    title: 'Avg. Completion Time',
    component: KpiCardWidget,
    props: { kpiType: 'avgCompletionTime', icon: <ClockCircleOutlined /> },
  },
  {
    id: 'kpi-active-technicians',
    title: 'Active Technicians',
    component: KpiCardWidget,
    props: { kpiType: 'activeTechnicians', icon: <UserOutlined /> },
  },
  {
    id: 'urgent-work-orders',
    title: 'Urgent Work Orders',
    component: UrgentWorkOrdersWidget,
  },
  {
    id: 'technician-status-list',
    title: 'Technician Status',
    component: TechnicianStatusListWidget,
  },
  {
    id: 'recent-work-orders-summary',
    title: 'Recent Work Orders',
    component: WorkOrderSummaryWidget,
    props: { limit: 5 },
  },
];

export const getWidgetComponent = (widgetId: string) => {
  const widget = widgetRegistry.find(w => w.id === widgetId);
  return widget ? widget.component : null;
};

export const getWidgetConfig = (widgetId: string) => {
  return widgetRegistry.find(w => w.id === widgetId);
};