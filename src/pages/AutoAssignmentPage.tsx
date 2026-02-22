import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ListChecks, History } from 'lucide-react';
import { AutoAssignmentRules } from '@/components/automation/AutoAssignmentRules';
import { AutoAssignmentSettings } from '@/components/automation/AutoAssignmentSettings';
import { AutoAssignmentLogs } from '@/components/automation/AutoAssignmentLogs';

export default function AutoAssignmentPage() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auto-Assignment Engine</h1>
        <p className="text-muted-foreground mt-2">
          Configure automated work order assignment rules and monitor assignment activity
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Assignment Rules
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Rules</CardTitle>
              <CardDescription>
                Configure rules that determine how work orders are automatically assigned to technicians
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoAssignmentRules />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>
                Configure global auto-assignment behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoAssignmentSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Activity Log</CardTitle>
              <CardDescription>
                View history of automated assignments and their scoring details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutoAssignmentLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
