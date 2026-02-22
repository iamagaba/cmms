
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { useSession } from '@/context/SessionContext';
import { useActiveSystem } from '@/context/ActiveSystemContext';

// Components
import ProfileTab from '@/components/settings/ProfileTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import ConfigurationTab from '@/components/settings/ConfigurationTab';
import AutomationTab from '@/components/settings/AutomationTab';
import SystemTab from '@/components/settings/SystemTab';
import HelpTab from '@/components/settings/HelpTab';
import TicketingSettings from '@/components/settings/ticketing/TicketingSettings';
import UserManagementTab from '@/components/settings/UserManagementTab';

// UI
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  User,
  Bell,
  Settings2,
  Bot,
  Server,
  HelpCircle,
  ShieldAlert,
  Users,
} from 'lucide-react';

const Settings = () => {
  const { session } = useSession();
  const { activeSystem } = useActiveSystem();
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

  // If in Ticketing system, show Ticketing Settings
  if (activeSystem === 'ticketing') {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TicketingSettings />
      </div>
    );
  }

  // CMMS Settings
  const userRole = profile?.is_admin ? 'admin' : 'user';

  const tabs = [
    {
      key: 'profile',
      label: 'Profile',
      icon: User,
      roles: ['user', 'admin'],
      component: <ProfileTab />,
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell,
      roles: ['user', 'admin'],
      component: <NotificationsTab />,
    },
    {
      key: 'configuration',
      label: 'Configuration',
      icon: Settings2,
      roles: ['admin'],
      component: <ConfigurationTab />,
    },
    {
      key: 'automation',
      label: 'Automation',
      icon: Bot,
      roles: ['admin'],
      component: <AutomationTab />,
    },
    {
      key: 'system',
      label: 'System',
      icon: Server,
      roles: ['admin'],
      component: <SystemTab />,
    },
    {
      key: 'users',
      label: 'Users',
      icon: Users,
      roles: ['admin'],
      component: <UserManagementTab />,
    },
    {
      key: 'help',
      label: 'Help',
      icon: HelpCircle,
      roles: ['user', 'admin'],
      component: <HelpTab />,
    },
  ];

  const availableTabs = tabs.filter((tab) => tab.roles.includes(userRole));

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Top Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-background pt-4 pb-2">
          <TabsList className="w-full justify-start overflow-x-auto">
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
          {availableTabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
