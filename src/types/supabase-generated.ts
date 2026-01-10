export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          contact_phone: string
          content: string | null
          created_at: string
          direction: string
          id: string
          status: string | null
          type: string
          wa_message_id: string | null
        }
        Insert: {
          contact_phone: string
          content?: string | null
          created_at?: string
          direction: string
          id?: string
          status?: string | null
          type?: string
          wa_message_id?: string | null
        }
        Update: {
          contact_phone?: string
          content?: string | null
          created_at?: string
          direction?: string
          id?: string
          status?: string | null
          type?: string
          wa_message_id?: string | null
        }
        Relationships: []
      }
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
      cycle_count_items: {
        Row: {
          counted_at: string | null
          counted_by: string | null
          counted_quantity: number | null
          created_at: string
          cycle_count_id: string
          id: string
          inventory_item_id: string
          notes: string | null
          system_quantity: number
          variance: number | null
        }
        Insert: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string
          cycle_count_id: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          system_quantity: number
          variance?: number | null
        }
        Update: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string
          cycle_count_id?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          system_quantity?: number
          variance?: number | null
        }
        Relationships: []
      }
      cycle_counts: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          count_date: string
          count_number: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          warehouse: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          count_date?: string
          count_number: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          warehouse?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          count_date?: string
          count_number?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          warehouse?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          aisle: string | null
          bin: string | null
          categories: string[] | null
          created_at: string
          description: string | null
          id: string
          name: string
          quantity_on_hand: number
          reorder_level: number
          shelf: string | null
          sku: string
          supplier_id: string | null
          unit_of_measure: string
          unit_price: number
          units_per_package: number
          updated_at: string
          warehouse: string | null
          zone: string | null
        }
        Insert: {
          aisle?: string | null
          bin?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity_on_hand?: number
          reorder_level?: number
          shelf?: string | null
          sku: string
          supplier_id?: string | null
          unit_of_measure?: string
          unit_price?: number
          units_per_package?: number
          updated_at?: string
          warehouse?: string | null
          zone?: string | null
        }
        Update: {
          aisle?: string | null
          bin?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity_on_hand?: number
          reorder_level?: number
          shelf?: string | null
          sku?: string
          supplier_id?: string | null
          unit_of_measure?: string
          unit_price?: number
          units_per_package?: number
          updated_at?: string
          warehouse?: string | null
          zone?: string | null
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
      part_reservations: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          fulfilled_at: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          quantity_reserved: number
          reserved_at: string | null
          reserved_by: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string | null
          work_order_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          fulfilled_at?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          quantity_reserved: number
          reserved_at?: string | null
          reserved_by?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string | null
          work_order_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          fulfilled_at?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          quantity_reserved?: number
          reserved_at?: string | null
          reserved_by?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string | null
          work_order_id?: string
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
      schedule_events: {
        Row: {
          all_day: boolean | null
          created_at: string
          date: string
          description: string | null
          event_type: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string
          date: string
          description?: string | null
          event_type?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          created_at?: string
          date?: string
          description?: string | null
          event_type?: string | null
          id?: string
          title?: string
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
      shifts: {
        Row: {
          break_duration_minutes: number | null
          created_at: string
          created_by: string | null
          end_datetime: string
          id: string
          location_id: string | null
          notes: string | null
          published_at: string | null
          shift_type: string
          start_datetime: string
          status: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string
          created_by?: string | null
          end_datetime: string
          id?: string
          location_id?: string | null
          notes?: string | null
          published_at?: string | null
          shift_type?: string
          start_datetime: string
          status?: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string
          created_by?: string | null
          end_datetime?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          published_at?: string | null
          shift_type?: string
          start_datetime?: string
          status?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
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
          status: string | null
          updated_at: string
          vin: string
          warranty_end_date: string | null
          warranty_months: number | null
          warranty_start_date: string | null
          year: number
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
          status?: string | null
          updated_at?: string
          vin: string
          warranty_end_date?: string | null
          warranty_months?: number | null
          warranty_start_date?: string | null
          year: number
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
          status?: string | null
          updated_at?: string
          vin?: string
          warranty_end_date?: string | null
          warranty_months?: number | null
          warranty_start_date?: string | null
          year?: number
        }
        Relationships: []
      }
      work_order_parts: {
        Row: {
          added_by: string | null
          created_at: string | null
          id: string
          inventory_item_id: string
          notes: string | null
          quantity_used: number
          total_cost: number | null
          unit_cost: number
          updated_at: string | null
          work_order_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          inventory_item_id: string
          notes?: string | null
          quantity_used: number
          total_cost?: number | null
          unit_cost?: number
          updated_at?: string | null
          work_order_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          notes?: string | null
          quantity_used?: number
          total_cost?: number | null
          unit_cost?: number
          updated_at?: string | null
          work_order_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          activity_log: Json | null
          appointment_date: string | null
          assigned_technician_id: string | null
          category: string | null
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
          id: string
          location_id: string | null
          on_hold_reason: string | null
          parts_used: Json | null
          priority: string | null
          service: string | null
          service_category_id: string | null
          service_notes: string | null
          sla_due: string | null
          status: string | null
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
          category?: string | null
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
          id?: string
          location_id?: string | null
          on_hold_reason?: string | null
          parts_used?: Json | null
          priority?: string | null
          service?: string | null
          service_category_id?: string | null
          service_notes?: string | null
          sla_due?: string | null
          status?: string | null
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
          category?: string | null
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
          id?: string
          location_id?: string | null
          on_hold_reason?: string | null
          parts_used?: Json | null
          priority?: string | null
          service?: string | null
          service_category_id?: string | null
          service_notes?: string | null
          sla_due?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string | null
          vehicle_model?: string | null
          work_order_number?: string | null
          work_started_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      available_emergency_bikes_v: {
        Row: {
          id: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_work_order_number: { Args: Record<string, never>; Returns: string }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      reservation_status: "pending" | "confirmed" | "fulfilled" | "cancelled" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      reservation_status: ["pending", "confirmed", "fulfilled", "cancelled", "expired"],
    },
  },
} as const
