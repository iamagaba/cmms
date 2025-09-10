import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Tag, Timeline, Typography, List, Skeleton, Select, DatePicker, Input, Popconfirm, Table, Tabs, theme, Empty } from "antd";
import { ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, PhoneOutlined, CalendarOutlined, ToolOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined, UnorderedListOutlined, CompassOutlined, MailOutlined } from "@ant-design/icons"; // Import MailOutlined
import dayjs from "dayjs";
import NotFound from "./NotFound";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, Technician, Location, Customer, Vehicle, WorkOrderPart, Profile } from "@/types/supabase";
import { useState, useMemo } from "react";
import { showSuccess, showError, showInfo } from "@/utils/toast";
import { camelToSnakeCase } from "@/utils/data-helpers";
import { OnHoldReasonDialog } from "@/components/OnHoldReasonDialog";
import { GoogleLocationSearchInput } from "@/components/GoogleLocationSearchInput";
import { useSearchParams } from "react-router-dom";
import { AddPartToWorkOrderDialog } from "@/components/AddPartToWorkOrderDialog";
import PageHeader from "@/components/PageHeader";
import WorkOrderProgressTracker from "@/components/WorkOrderProgressTracker";
import { useSession } from "@/context/SessionContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { use<dyad-problem-report summary="3 problems">
<problem file="src/pages/Locations.tsx" line="118" column="27" code="2345">Argument of type '{ timestamp: string; activity: string; }' is not assignable to parameter of type '{ timestamp: string; activity: string; userId: string; }'.
  Property 'userId' is missing in type '{ timestamp: string; activity: string; }' but required in type '{ timestamp: string; activity: string; userId: string; }'.</problem>
<problem file="src/pages/LocationDetails.tsx" line="105" column="22" code="2552">Cannot find name 'allLocations'. Did you mean 'location'?</problem>
<problem file="src/pages/LocationDetails.tsx" line="106" column="22" code="2552">Cannot find name 'allLocations'. Did you mean 'location'?</problem>
</dyad-problem-report><dyad-problem-report summary="3 problems">
<problem file="src/pages/Locations.tsx" line="118" column="27" code="2345">Argument of type '{ timestamp: string; activity: string; }' is not assignable to parameter of type '{ timestamp: string; activity: string; userId: string; }'.
  Property 'userId' is missing in type '{ timestamp: string; activity: string; }' but required in type '{ timestamp: string; activity: string; userId: string; }'.</problem>
<problem file="src/pages/LocationDetails.tsx" line="105" column="22" code="2552">Cannot find name 'allLocations'. Did you mean 'location'?</problem>
<problem file="src/pages/LocationDetails.tsx" line="106" column="22" code="2552">Cannot find name 'allLocations'. Did you mean 'location'?</problem>
</dyad-problem-report><think>**Addressing TypeScript Errors**

I've pinpointed a missing `userId` property within the `activityLog` entry, crucial for fulfilling the `WorkOrder` interface's requirements. To resolve this, I'm integrating `userId: session?.user.id ?? null` directly into the `newActivityLog.push` call. Now I need to tackle the remaining errors.


**Analyzing Data Dependencies**

I've resolved the `userId` error in `Locations.tsx` by including the necessary property. Now, I'm focusing on the `LocationDetails.tsx` errors. I'll integrate a `useQuery` hook to fetch `allLocations` to provide the required data. This will allow the `handleUpdateWorkOrder` function to correctly compare locations.


</think>You're right, my apologies for those lingering issues! I'll fix these TypeScript errors right away.

Here's how I'll address them:

1.  **`src/pages/Locations.tsx`**: I'll ensure that when a new activity log entry is pushed, it includes the `userId` from the current session, or `null` if the user is not available.
2.  **`src/pages/LocationDetails.tsx`**: I'll add a `useQuery` hook to fetch all available locations, which is necessary for correctly logging changes to a work order's location. Then, I'll update the `handleUpdateWorkOrder` function to use this fetched list of `allLocations`.

Here are the corrected files:

<dyad-write path="src/pages/Locations.tsx" description="Adding userId to activity log entries.">
import { useState, useMemo } from "react";
import { Button, Typography, Space, Row, Col, Skeleton } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { LocationFormDialog } from "@/components/LocationFormDialog";
import { LocationCard } from "@/components/LocationCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Location, WorkOrder, Technician, Profile } from "@/types/supabase"; // Import Profile
import { showSuccess, showError, showInfo } from "@/utils/toast"; // Import showInfo
import { camelToSnakeCase } from "@/utils/data-helpers"; // Import the utility
import PageHeader from "@/components/PageHeader";
import dayjs from "dayjs";
import { useSession } from "@/context/SessionContext"; // Import useSession

const { Title } = Typography;

const LocationsPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { session } = useSession(); // Get session for userId

  const { data: allLocations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery<WorkOrder[]>({
    queryKey: ['work_orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('work_orders').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<Technician[]>({
    queryKey: ['technicians'],
    queryFn: async () => {
      const { data, error } = await supabase.from('technicians').select('*');
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const { data: profiles, isLoading: isLoadingProfiles } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*'); // Select all fields for Profile type
      if (error) throw new Error(error.message);
      return data || [];
    }
  });

  const locationMutation = useMutation({
    mutationFn: async (locationData: Partial<Location>) => {
      const { error } = await supabase.from('locations').upsert([locationData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      showSuccess('Location has been saved.');
    },
    onError: (error) => showError(error.message),
  });

  const workOrderMutation = useMutation({
    mutationFn: async (workOrderData: Partial<WorkOrder>) => {
      const { error } = await supabase.from('work_orders').upsert([workOrderData]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      showSuccess('Work order has been updated.');
    },
    onError: (error) => showError(error.message),
  });

  const handleUpdateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    const workOrder = workOrders?.find(wo => wo.id === id);
    if (!workOrder) return;

    const oldWorkOrder = { ...workOrder };
    const newActivityLog = [...(workOrder.activityLog || [])];

    const addActivity = (activity: string, userId: string | null = session?.user.id ?? null) => {
      newActivityLog.push({ timestamp: new Date().toISOString(), activity, userId });
    };

    // Status change
    if (updates.status && updates.status !== oldWorkOrder.status) {
      addActivity(`Status changed from '${oldWorkOrder.status || 'N/A'}' to '${updates.status}'.`);
    }

    // Assigned technician change
    if (updates.assignedTechnicianId && updates.assignedTechnicianId !== oldWorkOrder.assignedTechnicianId) {
      const oldTech = technicians?.find(t => t.id === oldWorkOrder.assignedTechnicianId)?.name || 'Unassigned';
      const newTech = technicians?.find(t => t.id === updates.assignedTechnicianId)?.name || 'Unassigned';
      addActivity(`Assigned technician changed from '${oldTech}' to '${newTech}'.`);
    }

    // SLA Due date update
    if (updates.slaDue && updates.slaDue !== oldWorkOrder.slaDue) {
      addActivity(`SLA due date updated to '${dayjs(updates.slaDue).format('MMM D, YYYY h:mm A')}'.`);
    }

    // Appointment date update
    if (updates.appointmentDate && updates.appointmentDate !== oldWorkOrder.appointmentDate) {
      addActivity(`Appointment date updated to '${dayjs(updates.appointmentDate).format('MMM D, YYYY h:mm A')}'.`);
    }

    // Service description update
    if (updates.service && updates.service !== oldWorkOrder.service) {
      addActivity(`Service description updated.`);
    }

    // Service notes update
    if (updates.serviceNotes && updates.serviceNotes !== oldWorkOrder.serviceNotes) {
      addActivity(`Service notes updated.`);
    }

    // Priority change
    if (updates.priority && updates.priority !== oldWorkOrder.priority) {
      addActivity(`Priority changed from '${oldWorkOrder.priority || 'N/A'}' to '${updates.priority}'.`);
    }

    // Location change
    if (updates.locationId && updates.locationId !== oldWorkOrder.locationId) {
      const oldLoc = allLocations?.find(l => l.id === oldWorkOrder.locationId)?.name || 'N/A';
      const newLoc = allLocations?.find(l => l.id === updates.locationId)?.name || 'N/A';
      addActivity(`Service location changed from '${oldLoc}' to '${newLoc}'.`);
    }

    // Customer address/coordinates update
    if (updates.customerAddress && updates.customerAddress !== oldWorkOrder.customerAddress) {
      addActivity(`Client address updated to '${updates.customerAddress}'.`);
    } else if (updates.customerLat !== oldWorkOrder.customerLat || updates.customerLng !== oldWorkOrder.customerLng) {
      addActivity(`Client coordinates updated.`);
    }

    // System-triggered status change from 'Ready' to 'In Progress'
    if ((updates.assignedTechnicianId || updates.appointmentDate) && workOrder.status === 'Ready') {
      updates.status = 'In Progress';
      addActivity(`Work order automatically moved to In Progress due to assignment/appointment.`, null); // System action
      showInfo(`Work Order ${workOrder.workOrderNumber} automatically moved to In Progress.`);
    }

    // If the status is being set to 'On Hold' by a user action, we need to intercept it
    // and open the dialog. The actual update will happen after the reason is provided.
    // This page doesn't directly handle 'On Hold' status changes, but the logic should be consistent.
    // If it were to, the logic would be similar to Dashboard/WorkOrders.

    workOrderMutation.mutate(camelToSnakeCase({ id, ...updates, activityLog: newActivityLog }));
  };

  const handleSave = (locationData: Location) => {
    locationMutation.mutate(camelToSnakeCase(locationData)); // Apply camelToSnakeCase here
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const isLoading = isLoadingLocations || isLoadingWorkOrders || isLoadingTechnicians || isLoadingProfiles;

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <PageHeader
        title="Service Locations"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingLocation(null); setIsDialogOpen(true); }}>
            Add Location
          </Button>
        }
      />
      
      {isLoading ? <Skeleton active /> : (
        <Row gutter={[16, 16]}>
          {(allLocations || []).map(location => (
            <Col key={location.id} xs={24} sm={12} md={8} lg={6}>
              <LocationCard location={location} workOrders={workOrders || []} />
            </Col>
          ))}
        </Row>
      )}

      {isDialogOpen && (
        <LocationFormDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
          location={editingLocation}
        />
      )}
    </Space>
  );
};

export default LocationsPage;