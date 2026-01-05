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
      customers: {
        Row: {
          created_at: string
          customer_type: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_type?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_type?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      emergency_bike_assignments: {
        Row: {
          assigned_at: string
          created_at: string
          customer_asset_id: string
          emergency_bike_asset_id: string
          id: string
          notes: string | null
          returned_at: string | null
          updated_at: string
          work_order_id: string
        }
        Insert: {
          assigned_at?: string
          created_at?: string
          customer_asset_id: string
          emergency_bike_asset_id: string
          id?: string
          notes?: string | null
          returned_at?: string | null
          updated_at?: string
          work_order_id: string
        }
        Update: {
          assigned_at?: string
          created_at?: string
          customer_asset_id?: string
          emergency_bike_asset_id?: string
          id?: string
          notes?: string | null
          returned_at?: string | null
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_bike_assignments_customer_asset_id_fkey"
            columns: ["customer_asset_id"]
            isOneToOne: false
            referencedRelation: "available_emergency_bikes_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_bike_assignments_customer_asset_id_fkey"
            columns: ["customer_asset_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_bike_assignments_emergency_bike_asset_id_fkey"
            columns: ["emergency_bike_asset_id"]
            isOneToOne: false
            referencedRelation: "available_emergency_bikes_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_bike_assignments_emergency_bike_asset_id_fkey"
            columns: ["emergency_bike_asset_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_bike_assignments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          quantity_on_hand: number
          reorder_level: number
          sku: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity_on_hand?: number
          reorder_level?: number
          sku: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity_on_hand?: number
          reorder_level?: number
          sku?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string | null
          work_order_id: string | null
          work_order_number: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id?: string | null
          work_order_id?: string | null
          work_order_number?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string | null
          work_order_id?: string | null
          work_order_number?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          first_name: string | null
          id: string
          is_admin: boolean | null
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
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
        Relationships: [
          {
            foreignKeyName: "technicians_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          battery_capacity: number | null
          created_at: string
          customer_id: string | null
          date_of_manufacture: string | null
          id: string
          is_company_asset: boolean | null
          is_emergency_bike: boolean | null
          license_plate: string
          make: string
          mileage: number | null
          model: string
          motor_number: string | null
          release_date: string | null
          updated_at: string
          vin: string
          year: number
          status: string | null
          warranty_start_date: string | null
          warranty_end_date: string | null
          warranty_months: number | null
        }
        Insert: {
          battery_capacity?: number | null
          created_at?: string
          customer_id?: string | null
          date_of_manufacture?: string | null
          id?: string
          is_company_asset?: boolean | null
          is_emergency_bike?: boolean | null
          license_plate: string
          make: string
          mileage?: number | null
          model: string
          motor_number?: string | null
          release_date?: string | null
          updated_at?: string
          vin: string
          year: number
          status?: string | null
          warranty_start_date?: string | null
          warranty_end_date?: string | null
          warranty_months?: number | null
        }
        Update: {
          battery_capacity?: number | null
          created_at?: string
          customer_id?: string | null
          date_of_manufacture?: string | null
          id?: string
          is_company_asset?: boolean | null
          is_emergency_bike?: boolean | null
          license_plate?: string
          make?: string
          mileage?: number | null
          model?: string
          motor_number?: string | null
          release_date?: string | null
          updated_at?: string
          vin?: string
          year?: number
          status?: string | null
          warranty_start_date?: string | null
          warranty_end_date?: string | null
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "available_emergency_bikes_v"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      available_emergency_bikes_v: {
        Row: {
          battery_capacity: number | null
          created_at: string | null
          customer_id: string | null
          date_of_manufacture: string | null
          id: string | null
          is_company_asset: boolean | null
          is_emergency_bike: boolean | null
          license_plate: string | null
          make: string | null
          mileage: number | null
          model: string | null
          motor_number: string | null
          release_date: string | null
          updated_at: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          battery_capacity?: number | null
          created_at?: string | null
          customer_id?: string | null
          date_of_manufacture?: string | null
          id?: string | null
          is_company_asset?: boolean | null
          is_emergency_bike?: boolean | null
          license_plate?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          motor_number?: string | null
          release_date?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          battery_capacity?: number | null
          created_at?: string | null
          customer_id?: string | null
          date_of_manufacture?: string | null
          id?: string | null
          is_company_asset?: boolean | null
          is_emergency_bike?: boolean | null
          license_plate?: string | null
          make?: string | null
          mileage?: number | null
          model?: string | null
          motor_number?: string | null
          release_date?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_work_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Custom interfaces for better type safety and compatibility
export interface Location {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string | null;
  status: 'available' | 'busy' | 'offline' | null;
  email: string | null;
  phone: string | null;
  specializations: string[] | null;
  lat: number | null;
  lng: number | null;
  max_concurrent_orders: number | null;
  location_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  // Prefer camelCase in app code; keep snake_case for raw queries
  customerType?: 'WATU' | 'Cash' | 'B2B' | null;
  customer_type?: 'WATU' | 'Cash' | 'B2B' | null;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id?: string;
  vin: string; // Required in database
  make: string; // Required in database
  model: string; // Required in database
  year: number; // Required in database
  license_plate: string; // Required in database
  registration_number?: string | null; // Alias for license_plate in some contexts
  battery_capacity?: number | null;
  customer_id?: string | null;
  // Ownership flags
  is_company_asset?: boolean | null;
  is_emergency_bike?: boolean | null;
  created_at?: string;
  updated_at?: string;
  date_of_manufacture?: string | null;
  release_date?: string | null;
  motor_number?: string | null;
  mileage?: number | null;
  customers?: Customer | null;
  image_url?: string | null;
  status?: 'Normal' | 'Available' | 'In Repair' | 'Decommissioned' | null;
  // Warranty fields
  warranty_start_date?: string | null;
  warranty_end_date?: string | null;
  warranty_months?: number | null;
  // Additional fields that might be in database
  customerId?: string | null;
  locationId?: string | null;
  purchaseDate?: string | null;
}

// Track emergency bike assignments linking an emergency bike to a work order
export interface EmergencyBikeAssignment {
  id: string;
  work_order_id: string;
  emergency_bike_id: string;
  assigned_at: string;
  returned_at: string | null;
  assignment_notes: string | null;
  return_notes: string | null;
  created_by: string | null;
  returned_by: string | null;
  created_at?: string;
  vehicles?: Vehicle; // For joined queries to get bike details
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  is_admin: boolean | null;
  // Department for default channel assignment (e.g., Call Center, Maintenance)
  department?: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
}

export interface SlaPolicy {
  id: string;
  service_category_id: string;
  first_response_minutes: number | null;
  response_hours: number | null;
  resolution_hours: number | null;
  expected_repair_hours: number | null;
  created_at?: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  title: string | null;
  description: string | null;
  service: string | null;
  serviceNotes: string | null;
  status: 'Open' | 'Confirmation' | 'On Hold' | 'Ready' | 'In Progress' | 'Completed' | 'Cancelled' | null;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low' | null;
  channel: string | null;
  technicianId: string | null;
  assignedTechnicianId: string | null;
  locationId: string | null;
  scheduledDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  activityLog: { timestamp: string; activity: string; userId: string | null }[] | null;
  slaDue: string | null;
  completedAt: string | null;
  customerLat: number | null;
  customerLng: number | null;
  customerAddress: string | null;
  customerName: string | null;
  customerPhone: string | null;
  onHoldReason: string | null;
  created_at?: string;
  updated_at?: string;
  customerId: string | null;
  vehicleId: string | null;
  created_by?: string | null;
  service_category_id: string | null;
  confirmation_status_entered_at?: string | null;
  confirmed_at: string | null;
  ready_at: string | null;
  work_started_at: string | null;
  sla_timers_paused_at: string | null;
  total_paused_duration_seconds: number | null;
  initialDiagnosis: string | null;
  issueType: string | null;
  faultCode: string | null;
  maintenanceNotes: string | null;
  hasActiveLoaner?: boolean | null;
  has_active_loaner?: boolean | null;
  emergency_bike_notified_at?: string | null;
  active_emergency_bike_assignment?: EmergencyBikeAssignment | null;
  is_emergency_bike_eligible?: boolean;
  appointmentDate?: string | null;
  confirmation_call_completed?: boolean | null;
  confirmation_call_notes?: string | null;
  confirmation_call_by?: string | null;
  confirmation_call_at?: string | null;
  last_call_attempt_at?: string | null;
}

// Item Categories
export type ItemCategory =
  | 'electrical'
  | 'mechanical'
  | 'consumables'
  | 'fluids'
  | 'safety'
  | 'tools'
  | 'fasteners'
  | 'filters'
  | 'batteries'
  | 'tires'
  | 'other';

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  electrical: 'Electrical',
  mechanical: 'Mechanical',
  consumables: 'Consumables',
  fluids: 'Fluids',
  safety: 'Safety',
  tools: 'Tools',
  fasteners: 'Fasteners',
  filters: 'Filters',
  batteries: 'Batteries',
  tires: 'Tires',
  other: 'Other',
};

// Units of Measure
export type UnitOfMeasure =
  | 'each'
  | 'pair'
  | 'box'
  | 'case'
  | 'pack'
  | 'roll'
  | 'gallon'
  | 'liter'
  | 'pound'
  | 'kilogram';

export const UNIT_OF_MEASURE_LABELS: Record<UnitOfMeasure, string> = {
  each: 'Each',
  pair: 'Pair',
  box: 'Box',
  case: 'Case',
  pack: 'Pack',
  roll: 'Roll',
  gallon: 'Gallon',
  liter: 'Liter',
  pound: 'Pound',
  kilogram: 'Kilogram',
};

// Supplier
export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity_on_hand: number;
  reorder_level: number;
  unit_price: number;
  // Categorization fields
  categories?: ItemCategory[];
  supplier_id?: string | null;
  unit_of_measure?: UnitOfMeasure;
  units_per_package?: number;
  // Storage location fields
  warehouse?: string | null;
  zone?: string | null;
  aisle?: string | null;
  bin?: string | null;
  shelf?: string | null;
  // Joined data
  supplier?: Supplier;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  notes: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  inventory_items?: InventoryItem;
  work_orders?: WorkOrder;
  profiles?: { first_name: string | null; last_name: string | null };
}

// Part Reservation Types
export type ReservationStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'expired';

export interface PartReservation {
  id: string;
  work_order_id: string;
  inventory_item_id: string;
  quantity_reserved: number;
  status: ReservationStatus;
  reserved_by: string | null;
  reserved_at: string;
  expires_at: string | null;
  fulfilled_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  inventory_items?: InventoryItem;
  work_orders?: WorkOrder;
  profiles?: { first_name: string | null; last_name: string | null };
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

// Parts Usage Analytics Types
export interface PartsUsageAnalytics {
  inventory_item_id: string;
  item_name: string;
  sku: string | null;
  vehicle_id: string | null;
  vehicle_name: string | null;
  service_category_id: string | null;
  service_category_name: string | null;
  work_orders_count: number;
  total_quantity_used: number;
  total_cost: number;
  avg_quantity_per_order: number;
  first_used_at: string;
  last_used_at: string;
}


// Stock Adjustment Types
export type AdjustmentReason =
  | 'received'
  | 'damaged'
  | 'returned'
  | 'cycle_count'
  | 'theft'
  | 'expired'
  | 'transfer_out'
  | 'transfer_in'
  | 'initial_stock'
  | 'other';

export interface StockAdjustment {
  id: string;
  inventory_item_id: string | null;
  quantity_delta: number;
  quantity_before: number;
  quantity_after: number;
  reason: AdjustmentReason;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Joined data for queries
  inventory_items?: InventoryItem;
  profiles?: { first_name: string | null; last_name: string | null };
}

export interface BatchAdjustmentInput {
  items: Array<{
    inventory_item_id: string;
    quantity_delta: number;
  }>;
  reason: AdjustmentReason;
  notes?: string;
}

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  received: 'Received',
  damaged: 'Damaged',
  returned: 'Returned',
  cycle_count: 'Cycle Count',
  theft: 'Theft',
  expired: 'Expired',
  transfer_out: 'Transfer Out',
  transfer_in: 'Transfer In',
  initial_stock: 'Initial Stock',
  other: 'Other',
};


// Inventory Transaction Types

// Stock Receipt Types
export type ReceiptStatus = 'pending' | 'partial' | 'complete' | 'cancelled';

export interface StockReceipt {
  id: string;
  receipt_number: string;
  supplier_id: string | null;
  received_date: string;
  po_number: string | null;
  invoice_number: string | null;
  status: ReceiptStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  supplier?: Supplier;
  items?: StockReceiptItem[];
  profiles?: { first_name: string | null; last_name: string | null };
}

export interface StockReceiptItem {
  id: string;
  receipt_id: string;
  inventory_item_id: string;
  quantity_expected: number;
  quantity_received: number;
  unit_cost: number | null;
  notes: string | null;
  created_at: string;
  // Joined data
  inventory_items?: InventoryItem;
}

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  pending: 'Pending',
  partial: 'Partial',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

// Stock Transfer Types
export type TransferStatus = 'pending' | 'in_transit' | 'complete' | 'cancelled';

export interface StockTransfer {
  id: string;
  transfer_number: string;
  from_warehouse: string;
  to_warehouse: string;
  transfer_date: string;
  status: TransferStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  items?: StockTransferItem[];
  profiles?: { first_name: string | null; last_name: string | null };
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  inventory_item_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  // Joined data
  inventory_items?: InventoryItem;
}

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

// Cycle Count Types
export type CycleCountStatus = 'in_progress' | 'pending_review' | 'complete' | 'cancelled';

export interface CycleCount {
  id: string;
  count_number: string;
  count_date: string;
  warehouse: string | null;
  status: CycleCountStatus;
  notes: string | null;
  created_by: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  items?: CycleCountItem[];
  profiles?: { first_name: string | null; last_name: string | null };
}

export interface CycleCountItem {
  id: string;
  cycle_count_id: string;
  inventory_item_id: string;
  system_quantity: number;
  counted_quantity: number | null;
  variance: number;
  counted_by: string | null;
  counted_at: string | null;
  notes: string | null;
  created_at: string;
  // Joined data
  inventory_items?: InventoryItem;
}

export const CYCLE_COUNT_STATUS_LABELS: Record<CycleCountStatus, string> = {
  in_progress: 'In Progress',
  pending_review: 'Pending Review',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

// Shrinkage Types
export type LossType = 'theft' | 'damage' | 'expired' | 'spoilage' | 'unknown' | 'other';

export interface ShrinkageRecord {
  id: string;
  inventory_item_id: string;
  quantity_lost: number;
  loss_type: LossType;
  discovered_date: string;
  estimated_value: number | null;
  notes: string | null;
  reported_by: string | null;
  created_at: string;
  // Joined data
  inventory_items?: InventoryItem;
  profiles?: { first_name: string | null; last_name: string | null };
}

export const LOSS_TYPE_LABELS: Record<LossType, string> = {
  theft: 'Theft',
  damage: 'Damage',
  expired: 'Expired',
  spoilage: 'Spoilage',
  unknown: 'Unknown',
  other: 'Other',
};
