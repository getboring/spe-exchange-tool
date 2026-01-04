npm warn exec The following package was not found and will be installed: supabase@2.70.5
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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deals: {
        Row: {
          actual_profit: number | null
          actual_revenue: number | null
          actual_roi: number | null
          created_at: string | null
          estimated_profit: number | null
          estimated_value: number | null
          id: string
          notes: string | null
          source: string | null
          status: string | null
          total_cost: number | null
          user_id: string | null
        }
        Insert: {
          actual_profit?: number | null
          actual_revenue?: number | null
          actual_roi?: number | null
          created_at?: string | null
          estimated_profit?: number | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          source?: string | null
          status?: string | null
          total_cost?: number | null
          user_id?: string | null
        }
        Update: {
          actual_profit?: number | null
          actual_revenue?: number | null
          actual_roi?: number | null
          created_at?: string | null
          estimated_profit?: number | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          source?: string | null
          status?: string | null
          total_cost?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          actual_profit: number | null
          cib_price: number | null
          condition: string | null
          created_at: string | null
          deal_id: string | null
          estimated_value: number | null
          id: string
          loose_price: number | null
          name: string
          new_price: number | null
          platform: string | null
          purchase_cost: number | null
          sale_date: string | null
          sale_fees: number | null
          sale_platform: string | null
          sale_price: number | null
          shipping_cost: number | null
          status: string | null
          thumbnail_url: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          weight: string | null
        }
        Insert: {
          actual_profit?: number | null
          cib_price?: number | null
          condition?: string | null
          created_at?: string | null
          deal_id?: string | null
          estimated_value?: number | null
          id?: string
          loose_price?: number | null
          name: string
          new_price?: number | null
          platform?: string | null
          purchase_cost?: number | null
          sale_date?: string | null
          sale_fees?: number | null
          sale_platform?: string | null
          sale_price?: number | null
          shipping_cost?: number | null
          status?: string | null
          thumbnail_url?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Update: {
          actual_profit?: number | null
          cib_price?: number | null
          condition?: string | null
          created_at?: string | null
          deal_id?: string | null
          estimated_value?: number | null
          id?: string
          loose_price?: number | null
          name?: string
          new_price?: number | null
          platform?: string | null
          purchase_cost?: number | null
          sale_date?: string | null
          sale_fees?: number | null
          sale_platform?: string | null
          sale_price?: number | null
          shipping_cost?: number | null
          status?: string | null
          thumbnail_url?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_guide: {
        Row: {
          cib_price: number | null
          id: string
          last_updated: string | null
          loose_price: number | null
          name: string
          new_price: number | null
          platform: string
          pricecharting_id: string | null
          search_name: string | null
          source: string | null
          variant: string | null
        }
        Insert: {
          cib_price?: number | null
          id?: string
          last_updated?: string | null
          loose_price?: number | null
          name: string
          new_price?: number | null
          platform: string
          pricecharting_id?: string | null
          search_name?: string | null
          source?: string | null
          variant?: string | null
        }
        Update: {
          cib_price?: number | null
          id?: string
          last_updated?: string | null
          loose_price?: number | null
          name?: string
          new_price?: number | null
          platform?: string
          pricecharting_id?: string | null
          search_name?: string | null
          source?: string | null
          variant?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          default_sell_platform: string | null
          default_weight: string | null
          ebay_store_type: string | null
          email: string | null
          id: string
          promoted_percent: number | null
          target_roi: number | null
          tier: string | null
        }
        Insert: {
          created_at?: string | null
          default_sell_platform?: string | null
          default_weight?: string | null
          ebay_store_type?: string | null
          email?: string | null
          id: string
          promoted_percent?: number | null
          target_roi?: number | null
          tier?: string | null
        }
        Update: {
          created_at?: string | null
          default_sell_platform?: string | null
          default_weight?: string | null
          ebay_store_type?: string | null
          email?: string | null
          id?: string
          promoted_percent?: number | null
          target_roi?: number | null
          tier?: string | null
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string | null
          id: string
          items_found: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          items_found?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          items_found?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
