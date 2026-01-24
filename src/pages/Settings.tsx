import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';

import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserIcon,
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

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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

  const { register, handleSubmit } = useForm({
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
      showSuccess('Profile updated.');
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
        <Card>
          <CardContent className="h-32 pt-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-purple-100 flex items-center justify-center">
                  <HugeiconsIcon icon={UserIcon} size={40} className="text-purple-600" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.first_name} {profile?.last_name || user?.email}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profile?.is_admin ? 'default' : 'secondary'}>
                  {profile?.is_admin ? 'Administrator' : 'User'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <HugeiconsIcon icon={UserIcon} size={16} className="text-purple-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  {...register('first_name')}
                  placeholder="First name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  {...register('last_name')}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && (
                  <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};



// Notifications Tab Component
const NotificationsTab = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={markAllAsRead}>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
            Mark all as read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={NotificationOffIcon} size={32} className="text-gray-400" />
            </div>
            <h4 className="text-base font-medium text-gray-900 mb-1">No notifications yet</h4>
            <p className="text-sm text-gray-600">We'll let you know when something arrives</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isRead = notification.is_read;
            return (
              <Card
                key={notification.id}
                className={`transition-all ${isRead
                  ? 'hover:border-gray-300'
                  : 'border-purple-200 bg-purple-50/30 hover:border-purple-300'
                  }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${isRead
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-purple-100 text-purple-600'
                        }`}
                    >
                      <HugeiconsIcon
                        icon={isRead ? Notification01Icon : Notification02Icon}
                        size={20}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// System Tab Component
const SystemTab = () => {
  const { settings, updateSettings } = useSystemSettings() as any;
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
        showSuccess('Settings updated.');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <HugeiconsIcon icon={Settings01Icon} size={16} className="text-purple-600" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-xs text-gray-600">
                Receive alerts for important updates and activities
              </p>
            </div>
            <Controller
              name="notifications"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch
                  id="notifications"
                  checked={!!value}
                  onCheckedChange={onChange}
                />
              )}
            />
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-xs text-gray-600">
                Toggle between light and dark theme
              </p>
            </div>
            <Controller
              name="darkMode"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch
                  id="darkMode"
                  checked={!!value}
                  onCheckedChange={onChange}
                />
              )}
            />
          </div>

          {/* SLA Threshold */}
          <div className="space-y-2">
            <Label htmlFor="slaThreshold">SLA Warning Threshold (Days)</Label>
            <Input
              id="slaThreshold"
              type="number"
              min={0}
              {...register('slaThreshold')}
              placeholder="e.g., 3"
            />
            <p className="text-xs text-gray-600">
              Days before due date to flag work order as 'At Risk'
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          Save Settings
        </Button>
      </div>
    </form>
  );
};

// Simple breadcrumb for Settings page
const SettingsBreadcrumb = () => (
  <header className="w-full sticky top-0 px-4 py-3 bg-white/85 backdrop-blur-md backdrop-saturate-150 border-b border-gray-200 z-50">
    <div className="flex items-center gap-2 text-sm">
      <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
        <HugeiconsIcon icon={Home01Icon} size={16} />
        <span>Home</span>
      </Link>
      <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-gray-400" />
      <span className="font-medium text-gray-900 flex items-center gap-1">
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
  const [activeTab, setActiveTab] = useState('profile');

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

  return (
    <>
      <SettingsBreadcrumb />

      <div className="w-full px-6 pt-2 pb-6 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Top Navigation Tabs */}
          <Card className="sticky top-[60px] z-40">
            <CardContent className="pt-6">
              <TabsList className="w-full justify-start">
                {availableTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="min-h-[600px]">
            <TabsContent value="profile" className="space-y-6">
              <p className="text-sm text-gray-600">
                Manage your personal information and preferences
              </p>
              <ProfileTab />
            </TabsContent>



            <TabsContent value="notifications" className="space-y-6">
              <p className="text-sm text-gray-600">
                View and manage your notifications
              </p>
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <p className="text-sm text-gray-600">
                Configure diagnostics and application workflows
              </p>
              <ConfigurationTab />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <p className="text-sm text-gray-600">
                Configure system-wide settings and preferences
              </p>
              <SystemTab />
            </TabsContent>

            <TabsContent value="help" className="space-y-6">
              <p className="text-sm text-gray-600">
                Guides and documentation for using GOGO CMMS
              </p>
              <HelpTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;
