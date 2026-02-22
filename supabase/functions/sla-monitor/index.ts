// SLA Monitoring Edge Function
// Monitors work orders for SLA violations and triggers escalations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SLAStatus {
  work_order_id: string;
  work_order_number: string;
  status: 'on-track' | 'at-risk' | 'overdue' | 'no-sla';
  sla_consumed_percent: number;
  time_remaining_hours?: number;
  time_overdue_hours?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if SLA monitoring is enabled
    const { data: settings } = await supabaseClient
      .from('automation_settings')
      .select('setting_value')
      .eq('setting_key', 'sla_monitoring_enabled')
      .single();

    if (!settings || settings.setting_value !== true) {
      return new Response(
        JSON.stringify({ 
          message: 'SLA monitoring is disabled',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Get active escalation rules
    const { data: rules } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('rule_type', 'sla_escalation')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No active SLA escalation rules',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Get work orders with SLA (not completed or cancelled)
    const { data: workOrders, error: woError } = await supabaseClient
      .from('work_orders')
      .select('*')
      .not('sla_due', 'is', null)
      .not('status', 'in', '(Completed,Cancelled)');

    if (woError) throw woError;

    if (!workOrders || workOrders.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No work orders with active SLA',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Calculate SLA status for each work order
    const slaStatuses: SLAStatus[] = workOrders.map(wo => calculateSLAStatus(wo));

    // Process escalations
    const results = [];

    for (const rule of rules) {
      const triggerConditions = rule.trigger_conditions || {};
      const escalationSettings = rule.escalation_settings || {};
      const actions = rule.actions || [];

      // Filter work orders matching trigger conditions
      const matchingWorkOrders = slaStatuses.filter(sla => {
        if (triggerConditions.sla_status) {
          if (!triggerConditions.sla_status.includes(sla.status)) {
            return false;
          }
        }
        
        const workOrder = workOrders.find(wo => wo.id === sla.work_order_id);
        if (triggerConditions.status) {
          if (!triggerConditions.status.includes(workOrder?.status)) {
            return false;
          }
        }

        return true;
      });

      // Execute actions for matching work orders
      for (const sla of matchingWorkOrders) {
        const workOrder = workOrders.find(wo => wo.id === sla.work_order_id);
        if (!workOrder) continue;

        const actionResults = [];

        for (const action of actions) {
          try {
            switch (action.type) {
              case 'send_notification':
                // TODO: Implement notification sending
                actionResults.push({
                  action: 'send_notification',
                  success: true,
                  message: 'Notification sent (placeholder)'
                });
                break;

              case 'add_activity_log':
                const message = action.parameters?.message || 
                  `SLA ${sla.status} - escalated by automation`;
                
                const currentLog = workOrder.activity_log || [];
                const newLog = [
                  ...currentLog,
                  {
                    timestamp: new Date().toISOString(),
                    activity: message,
                    userId: null,
                    automated: true
                  }
                ];

                await supabaseClient
                  .from('work_orders')
                  .update({ activity_log: newLog })
                  .eq('id', workOrder.id);

                actionResults.push({
                  action: 'add_activity_log',
                  success: true,
                  message: 'Activity log updated'
                });
                break;

              case 'update_priority':
                const newPriority = action.parameters?.new_priority || 'High';
                
                await supabaseClient
                  .from('work_orders')
                  .update({ priority: newPriority })
                  .eq('id', workOrder.id);

                actionResults.push({
                  action: 'update_priority',
                  success: true,
                  message: `Priority updated to ${newPriority}`
                });
                break;

              default:
                actionResults.push({
                  action: action.type,
                  success: false,
                  message: 'Action type not implemented'
                });
            }
          } catch (error) {
            actionResults.push({
              action: action.type,
              success: false,
              message: error.message
            });
          }
        }

        // Log escalation
        await supabaseClient
          .from('automation_logs')
          .insert({
            rule_id: rule.id,
            rule_name: rule.name,
            rule_type: 'sla_escalation',
            work_order_id: workOrder.id,
            action_type: 'escalated',
            action_details: {
              work_order_number: workOrder.work_order_number,
              sla_status: sla.status,
              actions_taken: actionResults
            },
            status: actionResults.every(a => a.success) ? 'success' : 'partial',
            execution_time_ms: Date.now() - startTime,
            trigger_context: {
              sla_consumed_percent: sla.sla_consumed_percent,
              time_remaining_hours: sla.time_remaining_hours,
              time_overdue_hours: sla.time_overdue_hours
            },
            decision_factors: {
              sla_consumed_percent: sla.sla_consumed_percent,
              escalation_level: 1
            }
          });

        results.push({
          work_order_id: workOrder.id,
          work_order_number: workOrder.work_order_number,
          sla_status: sla.status,
          rule_applied: rule.name,
          actions: actionResults
        });
      }

      // Update rule execution
      await supabaseClient
        .from('automation_rules')
        .update({
          last_executed_at: new Date().toISOString(),
          execution_count: rule.execution_count + 1
        })
        .eq('id', rule.id);
    }

    const totalTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        message: 'SLA monitoring completed',
        work_orders_checked: workOrders.length,
        escalations_triggered: results.length,
        execution_time_ms: totalTime,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('SLA monitoring error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Calculate SLA status for a work order
function calculateSLAStatus(workOrder: any): SLAStatus {
  if (!workOrder.sla_due) {
    return {
      work_order_id: workOrder.id,
      work_order_number: workOrder.work_order_number,
      status: 'no-sla',
      sla_consumed_percent: 0
    };
  }

  const now = new Date();
  const slaDue = new Date(workOrder.sla_due);
  const createdAt = new Date(workOrder.created_at);

  // Calculate total SLA time
  const totalSLATime = slaDue.getTime() - createdAt.getTime();
  
  // Calculate time elapsed (accounting for paused time)
  const pausedSeconds = workOrder.total_paused_duration_seconds || 0;
  const pausedMs = pausedSeconds * 1000;
  const elapsedTime = now.getTime() - createdAt.getTime() - pausedMs;

  // Calculate percentage consumed
  const percentConsumed = (elapsedTime / totalSLATime) * 100;

  // Determine status
  if (now > slaDue) {
    const overdueMs = now.getTime() - slaDue.getTime();
    const overdueHours = overdueMs / (1000 * 60 * 60);
    
    return {
      work_order_id: workOrder.id,
      work_order_number: workOrder.work_order_number,
      status: 'overdue',
      sla_consumed_percent: percentConsumed,
      time_overdue_hours: overdueHours
    };
  } else if (percentConsumed >= 75) {
    const remainingMs = slaDue.getTime() - now.getTime();
    const remainingHours = remainingMs / (1000 * 60 * 60);
    
    return {
      work_order_id: workOrder.id,
      work_order_number: workOrder.work_order_number,
      status: 'at-risk',
      sla_consumed_percent: percentConsumed,
      time_remaining_hours: remainingHours
    };
  } else {
    const remainingMs = slaDue.getTime() - now.getTime();
    const remainingHours = remainingMs / (1000 * 60 * 60);
    
    return {
      work_order_id: workOrder.id,
      work_order_number: workOrder.work_order_number,
      status: 'on-track',
      sla_consumed_percent: percentConsumed,
      time_remaining_hours: remainingHours
    };
  }
}
