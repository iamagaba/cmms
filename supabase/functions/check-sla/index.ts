import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: workOrders, error: fetchError } = await supabaseClient
      .from('work_orders')
      .select('id, work_order_number, status, sla_due, last_sla_notification_at')
      .not('status', 'eq', 'Completed')
      .not('status', 'eq', 'On Hold')
      .not('sla_due', 'is', null);

    if (fetchError) {
      console.error('Error fetching work orders:', fetchError.message);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const now = new Date();
    const notificationsToCreate = [];
    const workOrdersToUpdate = [];

    for (const wo of workOrders) {
      const slaDue = new Date(wo.sla_due);
      const timeRemainingMs = slaDue.getTime() - now.getTime();
      const timeRemainingMinutes = Math.floor(timeRemainingMs / (1000 * 60));

      const lastNotificationAt = wo.last_sla_notification_at ? new Date(wo.last_sla_notification_at) : null;
      const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000)); // 1 hour threshold for re-notification

      let notificationMessage = null;
      let shouldNotify = false;

      // SLA breached
      if (timeRemainingMinutes <= 0) {
        notificationMessage = `Work Order ${wo.work_order_number} is OVERDUE! SLA was due on ${slaDue.toLocaleString()}.`;
        shouldNotify = !lastNotificationAt || lastNotificationAt.getTime() < oneHourAgo.getTime();
      } 
      // SLA approaching (within 1 hour)
      else if (timeRemainingMinutes <= 60) {
        notificationMessage = `Work Order ${wo.work_order_number} is approaching SLA! Due in ${timeRemainingMinutes} minutes.`;
        shouldNotify = !lastNotificationAt || lastNotificationAt.getTime() < oneHourAgo.getTime();
      }

      if (shouldNotify && notificationMessage) {
        notificationsToCreate.push({
          message: notificationMessage,
          work_order_id: wo.id,
          work_order_number: wo.work_order_number,
        });
        workOrdersToUpdate.push({
          id: wo.id,
          last_sla_notification_at: now.toISOString(),
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('notifications')
        .insert(notificationsToCreate);

      if (insertError) {
        console.error('Error inserting notifications:', insertError.message);
      }
    }

    if (workOrdersToUpdate.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('work_orders')
        .upsert(workOrdersToUpdate);

      if (updateError) {
        console.error('Error updating work orders with last_sla_notification_at:', updateError.message);
      }
    }

    return new Response(JSON.stringify({ message: 'SLA check completed successfully', notificationsCreated: notificationsToCreate.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});