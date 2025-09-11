import React, { useState, useMemo } from 'react';
import { Row, Col, Typography, Space, Button, Skeleton, Empty } from 'antd';
import { SettingOutlined } from '@ant-design/icons'; // Corrected import from SettingsOutlined
import PageHeader from '@/components/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { Profile } from '@/types/supabase';
import { DashboardCustomizationDialog } from '@/components/DashboardCustomizationDialog';
import { getWidgetComponent, widgetRegistry } from '@/components/dashboard-widgets/widgetRegistry';

const { Title, Text } = Typography;

const CustomDashboard: React.FC = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single(); // Select all fields
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });

  const userDashboardLayout = useMemo(() => {
    if (isLoadingProfile) return [];
    if (profile?.dashboard_layout && profile.dashboard_layout.length > 0) {
      return profile.dashboard_layout;
    }
    // Default layout if none is saved
    return [
      { id: 'kpi-total-work-orders' },
      { id: 'kpi-open-work-orders' },
      { id: 'kpi-sla-performance' },
      { id: 'kpi-avg-completion-time' },
      { id: 'urgent-work-orders' },
      { id: 'technician-status-list' },
      { id: 'recent-work-orders-summary' },
    ];
  }, [profile, isLoadingProfile]);

  if (isLoadingProfile) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title="My Dashboard"
        hideSearch
        actions={
          <Button type="default" icon={<SettingOutlined />} onClick={() => setIsCustomizationDialogOpen(true)}>
            Customize Dashboard
          </Button>
        }
      />
      <Row gutter={[16, 16]}>
        {userDashboardLayout.length > 0 ? (
          userDashboardLayout.map((widgetData, index) => {
            const widgetConfig = widgetRegistry.find(w => w.id === widgetData.id);
            const WidgetComponent = widgetConfig ? widgetConfig.component : null;
            if (!WidgetComponent) return null;

            // Merge default props with any saved config props
            const props = { ...widgetConfig?.props, ...widgetData.config, widgetId: widgetData.id };

            // Determine column span based on widget type or a default
            let colSpan = 24; // Default to full width
            if (widgetData.id.startsWith('kpi-')) {
              colSpan = 6; // KPI cards are smaller
            } else if (widgetData.id === 'urgent-work-orders') {
              colSpan = 16;
            } else if (widgetData.id === 'technician-status-list') {
              colSpan = 8;
            }

            return (
              <Col key={widgetData.id || index} xs={24} sm={colSpan}>
                <WidgetComponent {...props} />
              </Col>
            );
          })
        ) : (
          <Col span={24}>
            <Empty
              description={
                <Space direction="vertical">
                  <Text>Your dashboard is empty.</Text>
                  <Button type="primary" onClick={() => setIsCustomizationDialogOpen(true)}>
                    Add Widgets
                  </Button>
                </Space>
              }
            />
          </Col>
        )}
      </Row>
      <DashboardCustomizationDialog
        isOpen={isCustomizationDialogOpen}
        onClose={() => setIsCustomizationDialogOpen(false)}
      />
    </Space>
  );
};

export default CustomDashboard;