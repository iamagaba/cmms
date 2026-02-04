import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/context/SessionContext';
import { useSystemSettings } from '@/context/SystemSettingsContext';

import { useNotifications } from '@/context/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Loader2,
  Grid,
  Check,
  Info,
  FileText,
  CheckCircle,
  Bell,
  BellOff,
  Settings,
  Settings2,
  Palette,
  HelpCircle,
  Server,
  Home,
  ArrowRight,
  Clock // Added Clock icon
} from 'lucide-react';
import { useWorkOrderData } from "@/hooks/useWorkOrderData"; // Added hook import

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
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
                  className="w-20 h-20 rounded-full border-2 border-border object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-border bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.first_name} {profile?.last_name || user?.email}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
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
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
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
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save
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
            <CheckCircle className="w-4 h-4" />
            Mark all as read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-base font-medium text-foreground mb-1">No notifications yet</h4>
            <p className="text-sm text-muted-foreground">We'll let you know when something arrives</p>
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
                  ? 'hover:border-border'
                  : 'border-primary/20 bg-primary/5 hover:border-primary/30'
                  }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${isRead
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary'
                        }`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
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
  const { serviceCategories } = useWorkOrderData();

  // Helper to convert stored hours to UI value/unit
  const toUiValue = (hours: number) => {
    if (!hours) return { value: '', unit: 'hours' };
    if (hours % 24 === 0) return { value: (hours / 24).toString(), unit: 'days' };
    return { value: hours.toString(), unit: 'hours' };
  };

  // Helper to convert UI value/unit to stored hours
  const toStoredHours = (value: string, unit: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return unit === 'days' ? num * 24 : num;
  };

  // Parse initial SLA config
  const initialSlaConfig = useMemo(() => {
    try {
      const parsed = settings?.sla_config ? JSON.parse(settings.sla_config) : {};

      // Convert stored hours to UI state
      const uiState: Record<string, any> = {};

      // If service categories are loaded, ensure we have entries for them
      // If parsed is empty or old format (which was days), we need to adapt
      // Assuming old format was "days", so we treat existing values as days * 24 if they seem small?
      // Actually, simplest is to assume new format implies upgrading.
      // Let's iterate keys and convert.
      Object.keys(parsed).forEach(key => {
        const entry = parsed[key];
        uiState[key] = {
          high: toUiValue(entry.high),
          medium: toUiValue(entry.medium),
          low: toUiValue(entry.low),
        };
      });
      return uiState;
    } catch (e) {
      console.error('Failed to parse SLA config', e);
      return {};
    }
  }, [settings?.sla_config]);

  // Local state structure: { categoryId: { high: { value: '1', unit: 'days' }, ... } }
  const [slaConfigs, setSlaConfigs] = useState<Record<string, { high: { value: string, unit: string }; medium: { value: string, unit: string }; low: { value: string, unit: string } }>>(initialSlaConfig);

  // Initialize defaults for new categories
  React.useEffect(() => {
    if (serviceCategories.length > 0) {
      setSlaConfigs(prev => {
        const next = { ...prev };
        let changed = false;
        serviceCategories.forEach(cat => {
          if (!next[cat.id]) {
            next[cat.id] = {
              high: { value: '24', unit: 'hours' },
              medium: { value: '3', unit: 'days' },
              low: { value: '7', unit: 'days' }
            };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [serviceCategories]);

  const { control, handleSubmit, register } = useForm({
    defaultValues: {
      notifications: settings?.notifications_enabled ?? true,
      darkMode: settings?.dark_mode ?? false,
      slaThreshold: settings?.sla_threshold ?? 3,
    },
  });

  // Update local state when inputs change
  const handleSlaChange = (categoryId: string, priority: 'high' | 'medium' | 'low', field: 'value' | 'unit', val: string) => {
    setSlaConfigs(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {
          high: { value: '24', unit: 'hours' },
          medium: { value: '3', unit: 'days' },
          low: { value: '7', unit: 'days' }
        }),
        [priority]: {
          ...prev[categoryId][priority],
          [field]: val
        }
      }
    }));
  };

  const onSubmit = async (data: any) => {
    console.log('=== Settings Save Started ===');
    console.log('Form data:', data);
    console.log('SLA Configs:', slaConfigs);

    try {
      // Convert UI state back to stored format (total hours)
      const storedConfig: Record<string, { high: number; medium: number; low: number }> = {};

      Object.entries(slaConfigs).forEach(([catId, priorities]) => {
        storedConfig[catId] = {
          high: toStoredHours(priorities.high.value, priorities.high.unit),
          medium: toStoredHours(priorities.medium.value, priorities.medium.unit),
          low: toStoredHours(priorities.low.value, priorities.low.unit),
        };
      });

      console.log('Stored config to save:', storedConfig);
      console.log('updateSettings function exists:', !!updateSettings);

      if (updateSettings) {
        const updates = {
          notifications_enabled: data.notifications,
          dark_mode: data.darkMode,
          sla_threshold: data.slaThreshold,
          sla_config: JSON.stringify(storedConfig),
        };
        console.log('Calling updateSettings with:', updates);

        await updateSettings(updates);
        console.log('Settings updated successfully');
        showSuccess('Settings updated.');
      } else {
        console.error('updateSettings function not available');
        showError('Settings update function not available');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showError(error.message || 'Failed to update settings');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
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
              <p className="text-xs text-muted-foreground">
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


        </CardContent>
      </Card>

      {/* SLA Configuration */}
      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                SLA Policies
              </CardTitle>
              <CardDescription className="text-sm">
                Set target resolution times. Use <span className="font-medium text-foreground">Hours</span> for quick fixes and <span className="font-medium text-foreground">Days</span> for larger jobs.
              </CardDescription>
            </div>
            {/* Legend/Helper could go here */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                  <TableHead className="w-[200px] text-xs font-bold text-muted-foreground pl-6 h-12">Service Category</TableHead>
                  <TableHead className="text-center h-12">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      <span className="text-xs font-bold text-destructive">High Priority</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center h-12">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-amber-600">Medium Priority</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center h-12">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600">Low Priority</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceCategories.map((category) => {
                  const config = slaConfigs[category.id] || {
                    high: { value: '24', unit: 'hours' },
                    medium: { value: '3', unit: 'days' },
                    low: { value: '7', unit: 'days' }
                  };

                  return (
                    <TableRow key={category.id} className="hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0">
                      <TableCell className="font-medium text-sm pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{category.label}</span>
                          <span className="text-[11px] text-muted-foreground font-normal">{category.name || category.description || 'General maintenance'}</span>
                        </div>
                      </TableCell>
                      {['high', 'medium', 'low'].map((priority) => (
                        <TableCell key={priority} className="p-3">
                          <div className="flex justify-center">
                            <div className="flex items-center w-[110px] border rounded-lg bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
                              <Input
                                type="number"
                                min={0}
                                className="h-9 border-0 focus-visible:ring-0 text-right px-2 font-mono text-sm bg-transparent shadow-none"
                                placeholder="0"
                                value={(config as any)[priority].value}
                                onChange={(e) => handleSlaChange(category.id, priority as any, 'value', e.target.value)}
                              />
                              <div className="h-5 w-px bg-border mx-1" />
                              <select
                                className="h-9 w-[60px] bg-transparent border-0 text-[11px] font-medium text-muted-foreground focus:ring-0 cursor-pointer outline-none pl-1"
                                value={(config as any)[priority].unit}
                                onChange={(e) => handleSlaChange(category.id, priority as any, 'unit', e.target.value)}
                              >
                                <option value="hours">Hrs</option>
                                <option value="days">Days</option>
                              </select>
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {serviceCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                          <Info className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p>No service categories found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
      icon: User,
      roles: ['user', 'admin'],
    },

    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      roles: ['user', 'admin'],
    },
    {
      key: 'configuration',
      label: 'Configuration',
      icon: Settings2,
      roles: ['admin'],
    },
    {
      key: 'system',
      label: 'System',
      icon: Server,
      roles: ['admin'],
    },
    {
      key: 'help',
      label: 'Help',
      icon: HelpCircle,
      roles: ['user', 'admin'],
    },
  ];

  const availableTabs = tabs.filter((tab) => tab.roles.includes(userRole));

  return (
    <>


      <div className="w-full px-6 pt-6 pb-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Top Navigation Tabs */}
          <div className="sticky top-[60px] z-40">
            <TabsList className="w-full justify-start">
              {availableTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Content */}
          <div className="min-h-[600px]">
            <TabsContent value="profile" className="space-y-6">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <ConfigurationTab />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <SystemTab />
            </TabsContent>

            <TabsContent value="help" className="space-y-6">
              <HelpTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;


