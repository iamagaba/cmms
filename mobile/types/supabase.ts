export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      work_orders: {
        Row: {
          activity_log: Json | null
          appointment_date: string | null
          assigned_technician_id: string | null
          channel: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_id: string | null
          customer_lat: number | null
          customer_lng: number | null
          customer_name: string | null
          customer_phone: string | null
          fault_code: string | null
          has_active_loaner: boolean | null
          id: string
          initial_diagnosis: string | null
          issue_type: string | null
          location_id: string | null
          maintenance_notes: string | null
          on_hold_reason: string | null
          parts_used: Json | null
          priority: string | null
          service: string | null
          service_category_id: string | null
          service_notes: string | null
          sla_due: string | null
          sla_timers_paused_at: string | null
          status: string | null
          total_paused_duration_seconds: number | null
          updated_at: string
          vehicle_id: string | null
          vehicle_model: string | null
          work_order_number: string | null
          work_started_at: string | null
        }
        Insert: {
          activity_log?: Json | null
          appointment_date?: string | null
          assigned_technician_id?: string | null
          channel?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          fault_code?: string | null
          has_active_loaner?: boolean | null
          id?: string
          initial_diagnosis?: string | null
          issue_type?: string | null
          location_id?: string | null
          maintenance_notes?: string | null
          on_hold_reason?: string | null
          parts_used?: Json | null
          priority?: string | null
          service?: string | null
          service_category_id?: string | null
          service_notes?: string | null
          sla_due?: string | null
          sla_timers_paused_at?: string | null
          status?: string | null
          total_paused_duration_seconds?: number | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_model?: string | null
          work_order_number?: string | null
          work_started_at?: string | null
        }
        Update: {
          activity_log?: Json | null
          appointment_date?: string | null
          assigned_technician_id?: string | null
          channel?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_id?: string | null
          customer_lat?: number | null
          customer_lng?: number | null
          customer_name?: string | null
          customer_phone?: string | null
          fault_code?: string | null
          has_active_loaner?: boolean | null
          id?: string
          initial_diagnosis?: string | null
          issue_type?: string | null
          location_id?: string | null
          maintenance_notes?: string | null
          on_hold_reason?: string | null
          parts_used?: Json | null
          priority?: string | null
          service?: string | null
          service_category_id?: string | null
          service_notes?: string | null
          sla_due?: string | null
          sla_timers_paused_at?: string | null
          status?: string | null
          total_paused_duration_seconds?: number | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_model?: string | null
          work_order_number?: string | null
          work_started_at?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          location_id: string | null
          max_concurrent_orders: number | null
          name: string
          phone: string | null
          specializations: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_id?: string | null
          max_concurrent_orders?: number | null
          name: string
          phone?: string | null
          specializations?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_id?: string | null
          max_concurrent_orders?: number | null
          name?: string
          phone?: string | null
          specializations?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      // Add other tables as needed for native mobile
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']