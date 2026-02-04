
import { WorkOrder } from '@/types/supabase';

export type TimelineViewMode = 'day' | 'week' | 'month';
export type TimelineGroupBy = 'technician' | 'location' | 'status' | 'priority' | 'asset_model' | 'none';

export interface DateRange {
    from: Date;
    to: Date;
}

export interface StatusSegment {
    status: string;
    start: Date;
    end: Date;
    durationMs: number;
}

export interface TimelineWorkOrder extends WorkOrder {
    statusHistory: StatusSegment[];
    totalDurationMs: number;
    currentStatusDurationMs: number;
}

export interface TimelineGroup {
    id: string;
    label: string;
    items: TimelineWorkOrder[];
    meta?: any; // Extra data like technician avatar or location capacity
}

export interface TimelineFilterState {
    searchQuery: string;
    locationIds: string[];
    technicianIds: string[];
    assetModels: string[];
    statuses: string[];
}
