import React, { useState, useEffect } from 'react';
import { Modal, Button, Checkbox, Space, Typography, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/context/SessionContext';
import { Profile } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { widgetRegistry, WidgetConfig } from '@/components/dashboard-widgets/widgetRegistry'; // Updated import path
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Title, Text } = Typography;

interface DashboardCustomizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardCustomizationDialog: React.FC<DashboardCustomizationDialogProps> = ({ isOpen, onClose }) => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId && isOpen,
  });

  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.dashboard_layout) {
      setSelectedWidgets(profile.dashboard_layout.map(w => w.id));
    } else {
      // Default widgets if no layout is saved
      setSelectedWidgets(widgetRegistry.map(w => w.id));
    }
  }, [profile]);

  const updateDashboardLayoutMutation = useMutation({
    mutationFn: async (layout: { id: string; config?: Record<string, any> }[]) => {
      if (!userId) throw new Error("User not authenticated.");
      const { error } = await supabase.from('profiles').update({ dashboard_layout: layout }).eq('id', userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      showSuccess('Dashboard layout updated successfully.');
      onClose();
    },
    onError: (error) => showError(error.message),
  });

  const handleCheckboxChange = (checkedValues: CheckboxChangeEvent['target']['value'][]) => {
    setSelectedWidgets(checkedValues as string[]);
  };

  const handleSave = () => {
    const newLayout = selectedWidgets.map(widgetId => {
      const widgetConfig = widgetRegistry.find(w => w.id === widgetId);
      return { id: widgetId, config: widgetConfig?.props };
    });
    updateDashboardLayoutMutation.mutate(newLayout);
  };

  if (isLoadingProfile) {
    return (
      <Modal title="Customize Dashboard" open={isOpen} onCancel={onClose} footer={null}>
        <Spin tip="Loading profile..." />
      </Modal>
    );
  }

  return (
    <Modal
      title="Customize Dashboard"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={updateDashboardLayoutMutation.isPending}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSave}
          loading={updateDashboardLayoutMutation.isPending}
        >
          Save Layout
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">Select the widgets you want to see on your dashboard.</Text>
        <Checkbox.Group
          options={widgetRegistry.map(widget => ({ label: widget.title, value: widget.id }))}
          value={selectedWidgets}
          onChange={handleCheckboxChange}
          style={{ width: '100%' }}
        />
      </Space>
    </Modal>
  );
};