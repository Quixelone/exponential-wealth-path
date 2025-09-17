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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      actual_trades: {
        Row: {
          btc_amount: number
          config_id: string
          created_at: string
          day: number
          fill_price_usd: number
          id: string
          notes: string | null
          trade_date: string
          trade_type: string
          updated_at: string
        }
        Insert: {
          btc_amount: number
          config_id: string
          created_at?: string
          day: number
          fill_price_usd: number
          id?: string
          notes?: string | null
          trade_date: string
          trade_type?: string
          updated_at?: string
        }
        Update: {
          btc_amount?: number
          config_id?: string
          created_at?: string
          day?: number
          fill_price_usd?: number
          id?: string
          notes?: string | null
          trade_date?: string
          trade_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      btc_prices: {
        Row: {
          created_at: string
          date: string
          id: string
          price_usd: number
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          price_usd: number
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          price_usd?: number
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_pac_overrides: {
        Row: {
          config_id: string
          created_at: string
          day: number
          id: string
          pac_amount: number
        }
        Insert: {
          config_id: string
          created_at?: string
          day: number
          id?: string
          pac_amount: number
        }
        Update: {
          config_id?: string
          created_at?: string
          day?: number
          id?: string
          pac_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_pac_overrides_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_returns: {
        Row: {
          config_id: string
          created_at: string
          day: number
          id: string
          return_rate: number
        }
        Insert: {
          config_id: string
          created_at?: string
          day: number
          id?: string
          return_rate: number
        }
        Update: {
          config_id?: string
          created_at?: string
          day?: number
          id?: string
          return_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_returns_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_configs: {
        Row: {
          created_at: string
          currency: string
          daily_return_rate: number
          id: string
          initial_capital: number
          name: string
          pac_amount: number
          pac_custom_days: number | null
          pac_frequency: string
          pac_start_date: string
          time_horizon: number
          updated_at: string
          use_real_btc_prices: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          daily_return_rate: number
          id?: string
          initial_capital: number
          name?: string
          pac_amount: number
          pac_custom_days?: number | null
          pac_frequency: string
          pac_start_date: string
          time_horizon: number
          updated_at?: string
          use_real_btc_prices?: boolean | null
          user_id?: string
        }
        Update: {
          created_at?: string
          currency?: string
          daily_return_rate?: number
          id?: string
          initial_capital?: number
          name?: string
          pac_amount?: number
          pac_custom_days?: number | null
          pac_frequency?: string
          pac_start_date?: string
          time_horizon?: number
          updated_at?: string
          use_real_btc_prices?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_investment_configs_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          id: string
          notifications_enabled: boolean | null
          preferred_method: string | null
          telegram_chat_id: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          preferred_method?: string | null
          telegram_chat_id?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean | null
          preferred_method?: string | null
          telegram_chat_id?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pac_payments: {
        Row: {
          config_id: string
          created_at: string
          executed_amount: number | null
          executed_date: string | null
          execution_notes: string | null
          id: string
          is_executed: boolean
          payment_method: string | null
          scheduled_amount: number
          scheduled_date: string
          updated_at: string
        }
        Insert: {
          config_id: string
          created_at?: string
          executed_amount?: number | null
          executed_date?: string | null
          execution_notes?: string | null
          id?: string
          is_executed?: boolean
          payment_method?: string | null
          scheduled_amount: number
          scheduled_date: string
          updated_at?: string
        }
        Update: {
          config_id?: string
          created_at?: string
          executed_amount?: number | null
          executed_date?: string | null
          execution_notes?: string | null
          id?: string
          is_executed?: boolean
          payment_method?: string | null
          scheduled_amount?: number
          scheduled_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_reminder_date: string
          payment_day: number
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_reminder_date: string
          payment_day: number
          reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_reminder_date?: string
          payment_day?: number
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          accessed_fields: string[] | null
          action: string
          admin_user_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_fields?: string[] | null
          action: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_fields?: string[] | null
          action?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          admin_role: Database["public"]["Enums"]["admin_role_type"] | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          google_id: string | null
          id: string
          last_login: string | null
          last_name: string | null
          login_count: number | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          admin_role?: Database["public"]["Enums"]["admin_role_type"] | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          google_id?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          login_count?: number | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_role?: Database["public"]["Enums"]["admin_role_type"] | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          google_id?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          login_count?: number | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          login_time: string
          logout_time: string | null
          session_duration: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          login_time?: string
          logout_time?: string | null
          session_duration?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          login_time?: string
          logout_time?: string | null
          session_duration?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_with_role: {
        Args: { required_role?: Database["public"]["Enums"]["admin_role_type"] }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_sensitive_access: {
        Args: {
          accessed_fields?: string[]
          action_type: string
          record_id: string
          table_name: string
          target_user_id?: string
        }
        Returns: undefined
      }
      update_user_login: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      admin_role_type: "admin_readonly" | "admin_full" | "super_admin"
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
    Enums: {
      admin_role_type: ["admin_readonly", "admin_full", "super_admin"],
    },
  },
} as const
