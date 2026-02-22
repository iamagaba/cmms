/**
 * Simplified Location-Based Assignment Algorithm
 * Assigns work orders to technicians based on matching locations
 */

import { WorkOrder, Technician } from '@/types/supabase';
import { TechnicianAvailability, AssignmentCandidate, AssignmentCriteria, DecisionFactors } from '@/types/automation';

export interface AssignmentContext {
  workOrder: WorkOrder;
  availableTechnicians: Technician[];
  technicianAvailability: Map<string, TechnicianAvailability>;
  criteria: AssignmentCriteria;
}

export interface AssignmentDecision {
  technician_id: string | null;
  technician_name: string | null;
  score: number;
  decision_factors: DecisionFactors;
  candidates: AssignmentCandidate[];
}

/**
 * Main assignment algorithm - finds technician at same location
 */
export function findBestTechnician(context: AssignmentContext): AssignmentDecision {
  const { workOrder, availableTechnicians, technicianAvailability } = context;
  
  // Filter technicians by location match
  const eligibleTechnicians = availableTechnicians.filter(tech => {
    const avail = technicianAvailability.get(tech.id);
    if (!avail) return false;
    
    // Must be available
    if (!avail.is_available) return false;
    
    // Must have capacity
    if (avail.active_work_orders_count >= avail.max_concurrent_orders) return false;
    
    // Must match location
    if (tech.location_id !== workOrder.location_id) return false;
    
    return true;
  });

  if (eligibleTechnicians.length === 0) {
    return {
      technician_id: null,
      technician_name: null,
      score: 0,
      decision_factors: {
        reason: 'No available technicians at this location',
        alternatives_considered: availableTechnicians.length,
        location_match: false
      },
      candidates: []
    };
  }

  // Score candidates by workload (prefer technicians with less work)
  const candidates = eligibleTechnicians.map(tech => {
    const avail = technicianAvailability.get(tech.id)!;
    
    // Calculate workload score (lower workload = higher score)
    const utilization = (avail.active_work_orders_count / avail.max_concurrent_orders) * 100;
    const workloadScore = Math.max(0, 100 - utilization);

    return {
      technician_id: tech.id,
      technician_name: tech.name,
      specialization_match: true,
      distance_km: 0,
      current_workload: avail.active_work_orders_count,
      availability_score: workloadScore,
      performance_score: avail.completion_rate || 100,
      total_score: workloadScore,
      on_shift: avail.on_shift,
      has_capacity: avail.active_work_orders_count < avail.max_concurrent_orders,
      same_location: true
    };
  });

  // Sort by workload (lowest workload first)
  candidates.sort((a, b) => a.current_workload - b.current_workload);

  const bestCandidate = candidates[0];

  return {
    technician_id: bestCandidate.technician_id,
    technician_name: bestCandidate.technician_name,
    score: bestCandidate.total_score,
    decision_factors: {
      location_match: true,
      current_workload: bestCandidate.current_workload,
      availability_score: bestCandidate.availability_score,
      final_score: bestCandidate.total_score,
      reason: `Assigned to technician at ${workOrder.location_id} with lowest workload`,
      alternatives_considered: candidates.length
    },
    candidates
  };
}

/**
 * Get default assignment criteria (simplified)
 */
export function getDefaultAssignmentCriteria(): AssignmentCriteria {
  return {
    match_location: true,
    match_specialization: false,
    consider_workload: true,
    prefer_same_location: true,
    max_concurrent_orders: 5
  };
}
