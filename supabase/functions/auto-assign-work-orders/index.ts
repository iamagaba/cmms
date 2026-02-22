// Auto-Assignment Edge Function
// Processes assignment queue and assigns work orders to best-match technicians

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignmentCandidate {
  technician_id: string;
  technician_name: string;
  total_score: number;
  distance_km: number;
  current_workload: number;
  specialization_match: boolean;
}

interface AssignmentResult {
  work_order_id: string;
  success: boolean;
  assigned_technician_id?: string;
  assigned_technician_name?: string;
  score?: number;
  error?: string;
  execution_time_ms: number;
  candidates_evaluated: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();

    // Create Supabase client
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

    // Check if auto-assignment is enabled
    const { data: settings } = await supabaseClient
      .from('automation_settings')
      .select('setting_value')
      .eq('setting_key', 'auto_assignment_enabled')
      .single();

    if (!settings || settings.setting_value !== true) {
      return new Response(
        JSON.stringify({ 
          message: 'Auto-assignment is disabled',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Get max assignments per run
    const { data: maxSettings } = await supabaseClient
      .from('automation_settings')
      .select('setting_value')
      .eq('setting_key', 'max_auto_assignments_per_run')
      .single();

    const maxAssignments = maxSettings?.setting_value || 50;

    // Get pending work orders from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('assignment_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('added_at', { ascending: true })
      .limit(maxAssignments);

    if (queueError) throw queueError;

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No work orders in queue',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Get active auto-assignment rule
    const { data: rules } = await supabaseClient
      .from('automation_rules')
      .select('*')
      .eq('rule_type', 'auto_assignment')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1);

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No active auto-assignment rules found',
          results: []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const rule = rules[0];
    const criteria = rule.assignment_criteria || {};

    // Get work orders details
    const workOrderIds = queueItems.map(item => item.work_order_id);
    const { data: workOrders, error: woError } = await supabaseClient
      .from('work_orders')
      .select('*')
      .in('id', workOrderIds);

    if (woError) throw woError;

    // Get available technicians
    const { data: technicians, error: techError } = await supabaseClient
      .from('technicians')
      .select('*')
      .eq('status', 'active');

    if (techError) throw techError;

    // Get technician availability cache
    const technicianIds = technicians?.map(t => t.id) || [];
    const { data: availability, error: availError } = await supabaseClient
      .from('technician_availability_cache')
      .select('*')
      .in('technician_id', technicianIds);

    if (availError) throw availError;

    // Create availability map
    const availabilityMap = new Map(
      availability?.map(a => [a.technician_id, a]) || []
    );

    // Process each work order
    const results: AssignmentResult[] = [];

    for (const workOrder of workOrders || []) {
      const assignmentStart = Date.now();
      
      try {
        // Find best technician
        const assignment = await findBestTechnician(
          workOrder,
          technicians || [],
          availabilityMap,
          criteria
        );

        if (assignment.technician_id) {
          // Assign work order
          const { error: updateError } = await supabaseClient
            .from('work_orders')
            .update({
              assigned_technician_id: assignment.technician_id,
              status: 'In Progress',
              updated_at: new Date().toISOString()
            })
            .eq('id', workOrder.id);

          if (updateError) throw updateError;

          // Update queue status
          await supabaseClient
            .from('assignment_queue')
            .update({
              status: 'assigned',
              assigned_at: new Date().toISOString()
            })
            .eq('work_order_id', workOrder.id);

          // Log success
          await supabaseClient
            .from('automation_logs')
            .insert({
              rule_id: rule.id,
              rule_name: rule.name,
              rule_type: 'auto_assignment',
              work_order_id: workOrder.id,
              technician_id: assignment.technician_id,
              action_type: 'assigned',
              action_details: {
                work_order_number: workOrder.work_order_number,
                technician_name: assignment.technician_name
              },
              status: 'success',
              execution_time_ms: Date.now() - assignmentStart,
              trigger_context: {
                queue_priority: queueItems.find(q => q.work_order_id === workOrder.id)?.priority
              },
              decision_factors: assignment.decision_factors
            });

          results.push({
            work_order_id: workOrder.id,
            success: true,
            assigned_technician_id: assignment.technician_id,
            assigned_technician_name: assignment.technician_name,
            score: assignment.score,
            execution_time_ms: Date.now() - assignmentStart,
            candidates_evaluated: assignment.candidates.length
          });

        } else {
          // No suitable technician found
          const queueItem = queueItems.find(q => q.work_order_id === workOrder.id);
          const retryCount = (queueItem?.retry_count || 0) + 1;
          const maxRetries = queueItem?.max_retries || 3;

          if (retryCount >= maxRetries) {
            // Mark as failed
            await supabaseClient
              .from('assignment_queue')
              .update({
                status: 'failed',
                failed_reason: 'No suitable technician found after max retries'
              })
              .eq('work_order_id', workOrder.id);
          } else {
            // Schedule retry
            const retryDelay = 15; // minutes
            await supabaseClient
              .from('assignment_queue')
              .update({
                retry_count: retryCount,
                next_retry_at: new Date(Date.now() + retryDelay * 60 * 1000).toISOString()
              })
              .eq('work_order_id', workOrder.id);
          }

          // Log failure
          await supabaseClient
            .from('automation_logs')
            .insert({
              rule_id: rule.id,
              rule_name: rule.name,
              rule_type: 'auto_assignment',
              work_order_id: workOrder.id,
              action_type: 'assignment_failed',
              action_details: {
                work_order_number: workOrder.work_order_number,
                retry_count: retryCount
              },
              status: 'failed',
              error_message: 'No suitable technician found',
              execution_time_ms: Date.now() - assignmentStart,
              trigger_context: {},
              decision_factors: assignment.decision_factors
            });

          results.push({
            work_order_id: workOrder.id,
            success: false,
            error: 'No suitable technician found',
            execution_time_ms: Date.now() - assignmentStart,
            candidates_evaluated: assignment.candidates.length
          });
        }

      } catch (error) {
        console.error(`Error assigning work order ${workOrder.id}:`, error);
        
        results.push({
          work_order_id: workOrder.id,
          success: false,
          error: error.message,
          execution_time_ms: Date.now() - assignmentStart,
          candidates_evaluated: 0
        });
      }
    }

    // Update rule execution count
    await supabaseClient
      .from('automation_rules')
      .update({
        last_executed_at: new Date().toISOString(),
        execution_count: rule.execution_count + 1
      })
      .eq('id', rule.id);

    const totalTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        message: 'Auto-assignment completed',
        total_processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        execution_time_ms: totalTime,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Auto-assignment error:', error);
    
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

// Helper function to find best technician (simplified location-based)
async function findBestTechnician(
  workOrder: any,
  technicians: any[],
  availabilityMap: Map<string, any>,
  criteria: any
): Promise<{
  technician_id: string | null;
  technician_name: string | null;
  score: number;
  decision_factors: any;
  candidates: AssignmentCandidate[];
}> {
  // Filter technicians by location match
  const eligible = technicians.filter(tech => {
    const avail = availabilityMap.get(tech.id);
    if (!avail) return false;
    if (!avail.is_available) return false;
    if (avail.active_work_orders_count >= avail.max_concurrent_orders) return false;
    
    // Must match location
    if (tech.location_id !== workOrder.location_id) return false;
    
    return true;
  });

  if (eligible.length === 0) {
    return {
      technician_id: null,
      technician_name: null,
      score: 0,
      decision_factors: {
        reason: 'No available technicians at this location',
        location_match: false,
        alternatives_considered: technicians.length
      },
      candidates: []
    };
  }

  // Score by workload (prefer technicians with less work)
  const candidates: AssignmentCandidate[] = eligible.map(tech => {
    const avail = availabilityMap.get(tech.id)!;
    const utilization = (avail.active_work_orders_count / avail.max_concurrent_orders) * 100;
    const workloadScore = Math.max(0, 100 - utilization);

    return {
      technician_id: tech.id,
      technician_name: tech.name,
      total_score: workloadScore,
      distance_km: 0,
      current_workload: avail.active_work_orders_count,
      specialization_match: true
    };
  });

  // Sort by workload (lowest first)
  candidates.sort((a, b) => a.current_workload - b.current_workload);

  const best = candidates[0];

  return {
    technician_id: best.technician_id,
    technician_name: best.technician_name,
    score: best.total_score,
    decision_factors: {
      location_match: true,
      current_workload: best.current_workload,
      final_score: best.total_score,
      alternatives_considered: candidates.length
    },
    candidates
  };
}
