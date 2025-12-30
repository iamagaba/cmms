import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';
import { useDensity } from '@/context/DensityContext';
import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
  UserIcon as UserCircleIcon,
  Loading01Icon,
  GridIcon,
  GridIcon as GridViewIcon,
  Tick01Icon,
  InformationCircleIcon,
  FileIcon,
  CheckmarkCircle01Icon,
  Notification01Icon,
  Notification01Icon as NotificationOffIcon,
  Notification01Icon as Notification02Icon,
  Settings01Icon,
  Settings02Icon,
  Settings01Icon as ColorsIcon,
  InformationCircleIcon as HelpCircleIcon,
  GridIcon as ServerStackIcon,
  Home01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { useForm, Controller } from 'react-hook-form';
import { Link } from 'react-router-dom';
import ConfigurationTab from '@/components/settings/ConfigurationTab';
import HelpTab from '@/components/settings/HelpTab';

// Custom Toggle Component
const Toggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </button>
);

// Profile Tab Component
const ProfileTab = () => {
  const { session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { first_name?: string; last_name?: string }) => {
      if (!user?.id) throw new Error("User not authenticated.");
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showSuccess('Profile updated successfully');
    },
    onError: (error: any) => {
      showError(error.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <HugeiconsIcon icon={UserIcon} size={40} className="text-primary-600 dark:text-primary-400" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {profile?.first_name} {profile?.last_name || user?.email}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 rounded text-xs font-medium ${profile?.is_admin
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                {profile?.is_admin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <HugeiconsIcon icon={UserCircleIcon} size={20} className="text-primary-600 dark:text-primary-400" />
          Personal Information
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                {...register('first_name')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                {...register('last_name')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {updateProfileMutation.isPending && (
                <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Appearance Tab Component
const AppearanceTab = () => {
  const { densityMode, setDensityMode } = useDensity();

  return (
    <div className="space-y-6">
      {/* Density Mode Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Density</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Control how much information is displayed on screen
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cozy Mode */}
          <button
            onClick={() => setDensityMode('cozy')}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${densityMode === 'cozy'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
          >
            <div className={`p-2 rounded-lg ${densityMode === 'cozy' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
              <HugeiconsIcon icon={GridIcon} size={24} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cozy</h4>
                {densityMode === 'cozy' && (
                  <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                More spacing and larger elements for comfortable viewing
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <HugeiconsIcon icon={Tick01Icon} size={16} />
                <span>Better readability</span>
              </div>
            </div>
          </button>

          {/* Compact Mode */}
          <button
            onClick={() => setDensityMode('compact')}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${densityMode === 'compact'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }`}
          >
            <div className={`p-2 rounded-lg ${densityMode === 'compact' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
              <HugeiconsIcon icon={GridViewIcon} size={24} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Compact</h4>
                {densityMode === 'compact' && (
                  <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Reduced spacing to display more information on screen
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <HugeiconsIcon icon={Tick01Icon} size={16} />
                <span>More data visible</span>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <HugeiconsIcon icon={InformationCircleIcon} size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Density affects all pages</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Your preference is saved and will apply across the entire application including tables, cards, and forms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Preview</h3>
        <div className="space-y-3">
          <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${densityMode === 'cozy' ? 'p-4' : 'p-2'}`}>
            <div className="flex items-center gap-3">
              <div className={`${densityMode === 'cozy' ? 'w-10 h-10' : 'w-8 h-8'} rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center`}>
                <HugeiconsIcon icon={FileIcon} size={densityMode === 'cozy' ? 20 : 16} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className={`${densityMode === 'cozy' ? 'text-sm' : 'text-xs'} font-medium text-gray-900 dark:text-gray-100`}>
                  Sample Item
                </p>
                <p className={`${densityMode === 'cozy' ? 'text-xs' : 'text-[10px]'} text-gray-500 dark:text-gray-400`}>
                  This is how content will appear
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Stay updated with important alerts and activities
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors flex items-center gap-2"
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon icon={NotificationOffIcon} size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">No notifications yet</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">We'll let you know when something arrives</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isRead = notification.is_read;
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-900 border rounded-lg p-4 transition-all ${isRead
                  ? 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  : 'border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full ${isRead ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      }`}
                  >
                    <HugeiconsIcon
                      icon={isRead ? Notification01Icon : Notification02Icon}
                      size={20}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// System Tab Component
const SystemTab = () => {
  const { settings, updateSettings } = useSystemSettings() as any; // Type assertion as quick fix, better to fix context definition
  const { control, handleSubmit, register } = useForm({
    defaultValues: {
      notifications: settings?.notifications_enabled ?? true,
      darkMode: settings?.dark_mode ?? false,
      slaThreshold: settings?.sla_threshold ?? 3,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (updateSettings) {
        await updateSettings({
          notifications_enabled: data.notifications,
          dark_mode: data.darkMode,
          sla_threshold: data.slaThreshold,
        });
        showSuccess('Settings updated successfully');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update settings');
    }
  };

  return (
    <div className="space-y-6"> {/* Changed from form to div to avoid nesting issues with button type="button" inside form being tricky if not handled, though here it's fine. Keeping form logic but ensuring structure */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <HugeiconsIcon icon={Settings01Icon} size={20} className="text-primary-600 dark:text-primary-400" />
            General Settings
          </h3>

          <div className="space-y-4">
            {/* Notifications Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Enable Notifications</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Receive alerts for important updates and activities
                </p>
              </div>
              <Controller
                name="notifications"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Toggle checked={!!value} onChange={onChange} />
                )}
              />
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Toggle between light and dark theme
                </p>
              </div>
              <Controller
                name="darkMode"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Toggle checked={!!value} onChange={onChange} />
                )}
              />
            </div>

            {/* SLA Threshold */}
            <div className="py-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                SLA Warning Threshold (Days)
              </label>
              <input
                type="number"
                min={0}
                {...register('slaThreshold')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 3"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Days before due date to flag work order as 'At Risk'
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

// Simple breadcrumb for Settings page - avoids ModernBreadcrumbs keyboard listeners
const SettingsBreadcrumb = () => (
  <header className="w-full sticky top-0 px-4 py-3 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md backdrop-saturate-150 border-b border-gray-200 dark:border-gray-800 z-50">
    <div className="flex items-center gap-2 text-sm">
      <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1">
        <HugeiconsIcon icon={Home01Icon} size={16} />
        <span>Home</span>
      </Link>
      <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-gray-400 dark:text-gray-500" />
      <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
        <HugeiconsIcon icon={Settings01Icon} size={16} />
        Settings
      </span>
    </div>
  </header>
);

// Main Settings Page Component
const SettingsPage = () => {
  const { session } = useSession();
  const user = session?.user;
  const [activeTabKey, setActiveTabKey] = useState('profile');

  const { data: profile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const userRole = profile?.is_admin ? 'admin' : 'user';

  const tabs = [
    {
      key: 'profile',
      label: 'Profile',
      icon: UserIcon,
      roles: ['user', 'admin'],
    },
    {
      key: 'appearance',
      label: 'Appearance',
      icon: ColorsIcon,
      roles: ['user', 'admin'],
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Notification01Icon,
      roles: ['user', 'admin'],
    },
    {
      key: 'configuration',
      label: 'Configuration',
      icon: Settings02Icon,
      roles: ['admin'],
    },
    {
      key: 'system',
      label: 'System',
      icon: ServerStackIcon,
      roles: ['admin'],
    },
    {
      key: 'help',
      label: 'Help',
      icon: HelpCircleIcon,
      roles: ['user', 'admin'],
    },
  ];

  const availableTabs = tabs.filter((tab) => tab.roles.includes(userRole));
  const activeTab = availableTabs.find((tab) => tab.key === activeTabKey) || availableTabs[0];

  // Render the appropriate component based on active tab
  const renderTabContent = () => {
    switch (activeTabKey) {
      case 'profile':
        return <ProfileTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'configuration':
        return <ConfigurationTab />;
      case 'system':
        return <SystemTab />;
      case 'help':
        return <HelpTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <>
      <SettingsBreadcrumb />

      <div className="w-full px-6 pt-2 pb-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Top Navigation Tabs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2 sticky top-[60px] z-40">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {availableTabs.map((tab) => {
                const isActive = activeTab.key === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTabKey(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-fit ${isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <HugeiconsIcon icon={tab.icon} size={20} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[600px]">
            {/* Header Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{activeTab.label}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activeTab.key === 'profile' && 'Manage your personal information and preferences'}
                {activeTab.key === 'appearance' && 'Customize the look and feel of your interface'}
                {activeTab.key === 'notifications' && 'View and manage your notifications'}
                {activeTab.key === 'system' && 'Configure system-wide settings and preferences'}
                {activeTab.key === 'configuration' && 'Configure diagnostics and application workflows'}
                {activeTab.key === 'help' && 'Guides and documentation for using GOGO CMMS'}
              </p>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
