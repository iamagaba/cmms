/**
 * Professional CMMS Dashboard
 * 
 * A comprehensive, modern dashboard design with improved visual hierarchy,
 * better information architecture, and enhanced user experience patterns
 * specifically designed for CMMS workflows.
 */

import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Home01Icon, 
  RefreshIcon, 
  TimelineIcon, 
  ClipboardIcon, 
  FolderOpenIcon, 
  CheckmarkCircle01Icon, 
  Clock01Icon, 
  ActivityIcon, 
  TagIcon, 
  MenuIcon, 
  TableIcon, 
  Settings01Icon, 
  ArrowRight01Icon, 
  Add01Icon, 
  CalendarAdd01Icon, 
  Search01Icon, 
  FileIcon, 
  AlertCircleIcon, 
  Calendar01Icon 
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

// Professional Components
import ProfessionalButton from '@/components/ui/ProfessionalButton';
import ProfessionalCard from '@/components/ui/ProfessionalCard';
import { ProfessionalDataTable } from '@/components/advanced';
import { ProfessionalPageLayout } from '@/components/layout';

// Dashboard Components
import ModernKPICard from './ModernKPICard';
import DashboardSection from './DashboardSection';
import QuickActionsPanel from './QuickActionsPanel';
import ActivityFeed from './ActivityFeed';
import AssetStatusOverview from './AssetStatusOverview';



// ============================================
// DASHBOARD SECTIONS
// ============================================

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  children: React.ReactNode;
  className?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  icon,
  action,
  children,
  className
}) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 bg-steel-100 rounded-lg">
            <HugeiconsIcon icon={icon} size={20} className="text-steel-600" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-machinery-900">{title}</h2>
          {subtitle && (
            <p className="text-sm text-machinery-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      {action && (
        <ProfessionalButton
          variant="outline"
          size="sm"
          icon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </ProfessionalButton>
      )}
    </div>
    
    {children}
  </div>
);

// ============================================
// QUICK ACTIONS PANEL
// ============================================

const QuickActionsPanel: React.FC = () => {
  const quickActions = [
    {
      id: 'new-work-order',
      label: 'New Work Order',
      icon: Add01Icon,
      color: 'bg-steel-500 hover:bg-steel-600',
      onClick: () => console.log('New work order')
    },
    {
      id: 'schedule-maintenance',
      label: 'Schedule Maintenance',
      icon: CalendarAdd01Icon,
      color: 'bg-industrial-500 hover:bg-industrial-600',
      onClick: () => console.log('Schedule maintenance')
    },
    {
      id: 'asset-inspection',
      label: 'Asset Inspection',
      icon: Search01Icon,
      color: 'bg-maintenance-500 hover:bg-maintenance-600',
      onClick: () => console.log('Asset inspection')
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileIcon,
      color: 'bg-machinery-500 hover:bg-machinery-600',
      onClick: () => console.log('Generate report')
    }
  ];

  return (
    <ProfessionalCard className="p-6">
      <h3 className="text-lg font-semibold text-machinery-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={cn(
              'p-4 rounded-lg text-white text-left transition-colors',
              action.color
            )}
          >
            <HugeiconsIcon icon={action.icon} size={24} className="mb-2" />
            <div className="text-sm font-medium">{action.label}</div>
          </motion.button>
        ))}
      </div>
    </ProfessionalCard>
  );
};

// ============================================
// ACTIVITY FEED
// ============================================

const ActivityFeed: React.FC = () => {
  const activities = [
    {
      id: 1,
      type: 'work_order_completed',
      title: 'Work Order #WO-2024-001 completed',
      description: 'Pump maintenance completed by John Smith',
      timestamp: '2 minutes ago',
      icon: CheckmarkCircle01Icon,
      color: 'text-industrial-600'
    },
    {
      id: 2,
      type: 'asset_alert',
      title: 'High temperature alert',
      description: 'Motor B-202 temperature exceeds threshold',
      timestamp: '15 minutes ago',
      icon: AlertCircleIcon,
      color: 'text-warning-600'
    },
    {
      id: 3,
      type: 'maintenance_scheduled',
      title: 'Preventive maintenance scheduled',
      description: 'Valve C-303 scheduled for next week',
      timestamp: '1 hour ago',
      icon: Calendar01Icon,
      color: 'text-steel-600'
    }
  ];

  return (
    <ProfessionalCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-machinery-900">Recent Activity</h3>
        <ProfessionalButton variant="ghost" size="sm">
          View All
        </ProfessionalButton>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn('p-1.5 rounded-full bg-machinery-100', activity.color)}>
              <HugeiconsIcon icon={activity.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-machinery-900">{activity.title}</p>
              <p className="text-xs text-machinery-600 mt-1">{activity.description}</p>
              <p className="text-xs text-machinery-500 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </ProfessionalCard>
  );
};

// ============================================
// MAIN PROFESSIONAL DASHBOARD
// ============================================

interface ProfessionalDashboardProps {
  className?: string;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  // Mock data - replace with real data
  const kpiData = {
    totalWorkOrders: { value: 156, trend: { value: 12, direction: 'up' as const, label: 'vs last week' } },
    openOrders: { value: 23, trend: { value: 8, direction: 'down' as const, label: 'vs last week' } },
    completedToday: { value: 8, trend: { value: 15, direction: 'up' as const, label: 'vs yesterday' } },
    avgResponseTime: { value: '2.4h', trend: { value: 12, direction: 'down' as const, label: 'vs last week' } },
    assetUptime: { value: '98.5%', trend: { value: 2, direction: 'up' as const, label: 'vs last month' } },
    maintenanceCosts: { value: '$12.4K', trend: { value: 5, direction: 'down' as const, label: 'vs last month' } }
  };

  return (
    <ProfessionalPageLayout
      title="Dashboard Overview"
      subtitle="Monitor your CMMS operations and key performance indicators"
      icon={Home01Icon}
      className={className}
      actions={
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-machinery-100 rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                  timeRange === range
                    ? 'bg-white text-machinery-900 shadow-sm'
                    : 'text-machinery-600 hover:text-machinery-900'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          
          <ProfessionalButton
            variant="outline"
            size="sm"
            icon={RefreshIcon}
            onClick={() => window.location.reload()}
          >
            Refresh
          </ProfessionalButton>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPI Grid */}
        <DashboardSection
          title="Key Performance Indicators"
          subtitle="Real-time metrics for your maintenance operations"
          icon={TimelineIcon}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <ModernKPICard
              title="Total Work Orders"
              value={kpiData.totalWorkOrders.value}
              icon={ClipboardIcon}
              color="primary"
              trend={kpiData.totalWorkOrders.trend}
              subtitle="All time"
              actionLabel="View All"
              onAction={() => console.log('View all work orders')}
            />
            
            <ModernKPICard
              title="Open Orders"
              value={kpiData.openOrders.value}
              icon={FolderOpenIcon}
              color="warning"
              trend={kpiData.openOrders.trend}
              subtitle="Pending completion"
              actionLabel="Manage"
              onAction={() => console.log('Manage open orders')}
            />
            
            <ModernKPICard
              title="Completed Today"
              value={kpiData.completedToday.value}
              icon={CheckmarkCircle01Icon}
              color="success"
              trend={kpiData.completedToday.trend}
              subtitle="Since midnight"
            />
            
            <ModernKPICard
              title="Avg Response Time"
              value={kpiData.avgResponseTime.value}
              icon={Clock01Icon}
              color="info"
              trend={kpiData.avgResponseTime.trend}
              subtitle="Time to first response"
            />
            
            <ModernKPICard
              title="Asset Uptime"
              value={kpiData.assetUptime.value}
              icon={ActivityIcon}
              color="success"
              trend={kpiData.assetUptime.trend}
              subtitle="Overall availability"
            />
            
            <ModernKPICard
              title="Maintenance Costs"
              value={kpiData.maintenanceCosts.value}
              icon={TagIcon}
              color="primary"
              trend={kpiData.maintenanceCosts.trend}
              subtitle="This month"
            />
          </div>
        </DashboardSection>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Work Orders Table */}
            <DashboardSection
              title="Recent Work Orders"
              subtitle="Latest maintenance requests and their current status"
              icon={MenuIcon}
              action={{
                label: 'View All',
                onClick: () => console.log('View all work orders'),
                icon: ArrowRight01Icon
              }}
            >
              <ProfessionalCard>
                <div className="p-6">
                  {/* Work orders table would go here */}
                  <div className="text-center py-12 text-machinery-500">
                    <HugeiconsIcon icon={TableIcon} size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Work Orders Table</p>
                    <p className="text-sm">Integration with existing UrgentWorkOrdersTable component</p>
                  </div>
                </div>
              </ProfessionalCard>
            </DashboardSection>

            {/* Asset Status Overview */}
            <DashboardSection
              title="Asset Status Overview"
              subtitle="Current status of critical assets"
              icon={Settings01Icon}
            >
              <AssetStatusOverview 
                onStatusClick={(status) => console.log('Navigate to assets:', status.id)}
              />
            </DashboardSection>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <QuickActionsPanel />
            <ActivityFeed 
              onActivityClick={(activity) => console.log('View activity:', activity.id)}
              onViewAll={() => console.log('View all activities')}
            />
            
            {/* Upcoming Maintenance */}
            <ProfessionalCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-machinery-900">
                  Upcoming Maintenance
                </h3>
                <ProfessionalButton variant="ghost" size="sm">
                  View Schedule
                </ProfessionalButton>
              </div>
              <div className="space-y-3">
                {[
                  { asset: 'Pump A-101', date: 'Tomorrow', type: 'Preventive', priority: 'high' },
                  { asset: 'Motor B-202', date: 'Dec 20', type: 'Inspection', priority: 'medium' },
                  { asset: 'Valve C-303', date: 'Dec 22', type: 'Repair', priority: 'low' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-machinery-50 rounded-lg hover:bg-machinery-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        item.priority === 'high' && 'bg-warning-500',
                        item.priority === 'medium' && 'bg-maintenance-500',
                        item.priority === 'low' && 'bg-industrial-500'
                      )} />
                      <div>
                        <div className="font-medium text-machinery-900">{item.asset}</div>
                        <div className="text-sm text-machinery-600">{item.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-steel-600">{item.date}</div>
                      <HugeiconsIcon 
                        icon={ArrowRight01Icon} 
                        size={16}
                        className="text-machinery-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ProfessionalCard>
          </div>
        </div>
      </div>
    </ProfessionalPageLayout>
  );
};

export default ProfessionalDashboard;