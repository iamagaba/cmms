/**
 * Timeline Integration Example
 * Shows how to integrate the TimelineContainer into existing work order views
 * This is an example component demonstrating the integration pattern
 */

import React from 'react';
import { TimelineContainer } from './TimelineContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimelineIntegrationExampleProps {
  workOrderId: string;
  workOrderTitle?: string;
}

/**
 * Example of how to integrate the timeline into a work order details page
 * This shows the timeline as a tab alongside other work order information
 */
export function TimelineIntegrationExample({ 
  workOrderId, 
  workOrderTitle = 'Work Order Details' 
}: TimelineIntegrationExampleProps) {
  return (
    <div className="space-y-6">
      {/* Work Order Header */}
      <Card>
        <CardHeader>
          <CardTitle>{workOrderTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Work Order ID: {workOrderId}
          </p>
        </CardContent>
      </Card>

      {/* Tabbed Interface with Timeline */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Work order details would go here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          {/* Timeline Integration */}
          <TimelineContainer
            workOrderId={workOrderId}
            onActivityAdd={(activity) => {
              console.log('New activity added:', activity);
              // Handle activity addition if needed
            }}
          />
        </TabsContent>
        
        <TabsContent value="parts" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Parts information would go here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Notes section would go here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Alternative integration as a sidebar or drawer
 */
export function TimelineSidebarExample({ workOrderId }: { workOrderId: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Main work order content goes here...
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Timeline Sidebar */}
      <div className="lg:col-span-1">
        <TimelineContainer
          workOrderId={workOrderId}
          className="h-fit max-h-[800px]"
        />
      </div>
    </div>
  );
}

export default TimelineIntegrationExample;