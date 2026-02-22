import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignmentCandidate {
  technician_id: string;
  technician_name: string;
  total_score: number;
  availability_score: number;
  specialization_score: number;
  proximity_score: number;
  workload_score: number;
  performance_score: number;
  distance_km?: number;
  reason: string;
}

interface AssignmentRule {
  id: string;
  weight_availability: number;
  weight_specialization: number;
  weight_proximity: number;
  weight_workload: number;
  weight_performance: number;
  max_distance_km: number | null;
  require_specialization_match: boolean;
  respect_max_concurrent_orders: boolean;
  allowed_locations: string[] | null;
  allowed_service_categories: string[] | null;
  priority_levels: string[] | null;
  fallback_action: string;
  fallback_user_id: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { work_order_id } = await req.json();

    if (!work_order_id) {
      throw new Error('work_order_id is required');
    }

    const startTime = Date.now();

    // 1. Fetch work order details
    const { data: workOrder, error: woError } = await supabase
      .from('work_orders')
      .select('*, service_categories(name, specialization_required)')
      .eq('id', work_order_id)
      .single();

    if (woError || !workOrder) {
      throw new Error(`Work order not found: ${woError?.message}`);
    }

    // Check if already assigned
    if (workOrder.assigned_technician_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Work order is already assigned',
          work_order_id,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch active assignment rules
    const { data: rules, error: rulesError } = await supabase
      .from('auto_assignment_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1);

    if (rulesError || !rules || rules.length === 0) {
      throw new Error('No active assignment rules found');
    }

    const rule: AssignmentRule = rules[0];

    // 3. Apply rule filters
    let technicianQuery = supabase
      .from('technicians')
      .select('*, shifts!inner(*)')
      .eq('status', 'active');

    if (rule.allowed_locations && rule.allowed_locations.length > 0) {
      technicianQuery = technicianQuery.in('location_id', rule.allowed_locations);
    }

    const { data: technicians, error: techError } = await technicianQuery;

    if (techError || !technicians || technicians.length === 0) {
      return await handleFallback(supabase, work_order_id, rule, 'No available technicians found');
    }

    // 4. Get current workload for each technician
    const { data: workloadData } = await supabase
      .from('work_orders')
      .select('assigned_technician_id')
      .in('status', ['In Progress', 'Ready'])
      .in('assigned_technician_id', technicians.map(t => t.id));

    const workloadMap = new Map<string, number>();
    workloadData?.forEach(wo => {
      const count = workloadMap.get(wo.assigned_technician_id) || 0;
      workloadMap.set(wo.assigned_technician_id, count + 1);
    });

    // 5. Calculate scores for each technician
    const candidates: AssignmentCandidate[] = [];
    const now = new Date();

    for (const tech of technicians) {
      // Check max concurrent orders
      const currentWorkload = workloadMap.get(tech.id) || 0;
      if (rule.respect_max_concurrent_orders && tech.max_concurrent_orders) {
        if (currentWorkload >= tech.max_concurrent_orders) {
          continue; // Skip this technician
        }
      }

      // Check specialization match
      if (rule.require_specialization_match) {
        const requiredSpec = workOrder.service_categories?.specialization_required;
        if (requiredSpec && (!tech.specializations || !tech.specializations.includes(requiredSpec))) {
          continue; // Skip this technician
        }
      }

      // Calculate individual scores
      const availabilityScore = calculateAvailabilityScore(tech, now);
      const specializationScore = calculateSpecializationScore(tech, workOrder);
      const proximityScore = calculateProximityScore(tech, workOrder, rule.max_distance_km);
      const workloadScore = calculateWorkloadScore(currentWorkload, tech.max_concurrent_orders || 10);
      const performanceScore = 75; // Placeholder - would use historical data

      // Skip if proximity check failed
      if (proximityScore === 0 && rule.max_distance_km) {
        continue;
      }

      // Calculate weighted total score
      const totalScore =
        (availabilityScore * rule.weight_availability +
          specializationScore * rule.weight_specialization +
          proximityScore * rule.weight_proximity +
          workloadScore * rule.weight_workload +
          performanceScore * rule.weight_performance) /
        (rule.weight_availability +
          rule.weight_specialization +
          rule.weight_proximity +
          rule.weight_workload +
          rule.weight_performance);

      candidates.push({
        technician_id: tech.id,
        technician_name: tech.name,
        total_score: Math.round(totalScore * 100) / 100,
        availability_score: Math.round(availabilityScore * 100) / 100,
        specialization_score: Math.round(specializationScore * 100) / 100,
        proximity_score: Math.round(proximityScore * 100) / 100,
        workload_score: Math.round(workloadScore * 100) / 100,
        performance_score: Math.round(performanceScore * 100) / 100,
        distance_km: calculateDistance(tech, workOrder),
        reason: `Score: ${Math.round(totalScore)}/100`,
      });
    }

    // 6. Sort by score and select best candidate
    candidates.sort((a, b) => b.total_score - a.total_score);

    if (candidates.length === 0) {
      return await handleFallback(supabase, work_order_id, rule, 'No suitable technicians found after scoring');
    }

    const bestCandidate = candidates[0];

    // 7. Assign work order
    const { error: assignError } = await supabase
      .from('work_orders')
      .update({
        assigned_technician_id: bestCandidate.technician_id,
        status: 'In Progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', work_order_id);

    if (assignError) {
      throw new Error(`Failed to assign work order: ${assignError.message}`);
    }

    // 8. Log the assignment
    const executionTime = Date.now() - startTime;
    await supabase.from('auto_assignment_logs').insert({
      work_order_id,
      rule_id: rule.id,
      assigned_technician_id: bestCandidate.technician_id,
      assignment_score: bestCandidate.total_score,
      availability_score: bestCandidate.availability_score,
      specialization_score: bestCandidate.specialization_score,
      proximity_score: bestCandidate.proximity_score,
      workload_score: bestCandidate.workload_score,
      performance_score: bestCandidate.performance_score,
      candidates_evaluated: candidates.length,
      candidates_data: candidates.slice(0, 10), // Store top 10
      status: 'success',
      execution_time_ms: executionTime,
    });

    // 9. Send notification (if enabled)
    // TODO: Integrate with send-push-notification function

    return new Response(
      JSON.stringify({
        success: true,
        work_order_id,
        assigned_technician_id: bestCandidate.technician_id,
        technician_name: bestCandidate.technician_name,
        assignment_score: bestCandidate.total_score,
        candidates_evaluated: candidates.length,
        execution_time_ms: executionTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auto-assignment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper Functions

function calculateAvailabilityScore(technician: any, now: Date): number {
  // Check if technician has an active shift
  if (!technician.shifts || technician.shifts.length === 0) {
    return 50; // No shift data, assume moderate availability
  }

  const activeShift = technician.shifts.find((shift: any) => {
    const start = new Date(shift.start_datetime);
    const end = new Date(shift.end_datetime);
    return now >= start && now <= end && shift.status === 'scheduled';
  });

  return activeShift ? 100 : 30; // High score if on shift, low if not
}

function calculateSpecializationScore(technician: any, workOrder: any): number {
  if (!workOrder.service_category_id) {
    return 50; // No category specified, neutral score
  }

  const requiredSpec = workOrder.service_categories?.specialization_required;
  if (!requiredSpec) {
    return 75; // No specific specialization required
  }

  if (technician.specializations && technician.specializations.includes(requiredSpec)) {
    return 100; // Perfect match
  }

  return 25; // No match
}

function calculateProximityScore(technician: any, workOrder: any, maxDistanceKm: number | null): number {
  const distance = calculateDistance(technician, workOrder);

  if (distance === null) {
    return 50; // No location data, neutral score
  }

  if (maxDistanceKm && distance > maxDistanceKm) {
    return 0; // Too far, disqualify
  }

  // Score inversely proportional to distance (closer = higher score)
  // 0 km = 100, 50 km = 0
  const maxDistance = maxDistanceKm || 50;
  const score = Math.max(0, 100 - (distance / maxDistance) * 100);
  return score;
}

function calculateWorkloadScore(currentWorkload: number, maxConcurrent: number): number {
  // Lower workload = higher score
  const utilizationRate = currentWorkload / maxConcurrent;
  return Math.max(0, 100 - utilizationRate * 100);
}

function calculateDistance(technician: any, workOrder: any): number | null {
  if (!technician.lat || !technician.lng || !workOrder.customer_lat || !workOrder.customer_lng) {
    return null;
  }

  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = toRad(workOrder.customer_lat - technician.lat);
  const dLon = toRad(workOrder.customer_lng - technician.lng);
  const lat1 = toRad(technician.lat);
  const lat2 = toRad(workOrder.customer_lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

async function handleFallback(
  supabase: any,
  workOrderId: string,
  rule: AssignmentRule,
  reason: string
): Promise<Response> {
  // Log the fallback
  await supabase.from('auto_assignment_logs').insert({
    work_order_id: workOrderId,
    rule_id: rule.id,
    status: 'fallback',
    failure_reason: reason,
    fallback_action_taken: rule.fallback_action,
    candidates_evaluated: 0,
  });

  // TODO: Implement fallback actions (escalate, queue, notify_manager)

  return new Response(
    JSON.stringify({
      success: false,
      work_order_id: workOrderId,
      message: reason,
      fallback_action: rule.fallback_action,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
