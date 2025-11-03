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
          btc_amount: number | null
          config_id: string
          created_at: string
          day: number
          expiration_date: string | null
          fill_price_usd: number | null
          id: string
          notes: string | null
          option_sold_date: string | null
          option_status: string | null
          premium_currency: string | null
          premium_received_usdt: number | null
          strike_price: number | null
          trade_date: string
          trade_type: string
          updated_at: string
        }
        Insert: {
          btc_amount?: number | null
          config_id: string
          created_at?: string
          day: number
          expiration_date?: string | null
          fill_price_usd?: number | null
          id?: string
          notes?: string | null
          option_sold_date?: string | null
          option_status?: string | null
          premium_currency?: string | null
          premium_received_usdt?: number | null
          strike_price?: number | null
          trade_date: string
          trade_type?: string
          updated_at?: string
        }
        Update: {
          btc_amount?: number | null
          config_id?: string
          created_at?: string
          day?: number
          expiration_date?: string | null
          fill_price_usd?: number | null
          id?: string
          notes?: string | null
          option_sold_date?: string | null
          option_status?: string | null
          premium_currency?: string | null
          premium_received_usdt?: number | null
          strike_price?: number | null
          trade_date?: string
          trade_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_trading_signals: {
        Row: {
          bollinger_position: string | null
          btc_price_source: string | null
          btc_price_usd: number
          confidence_score: number | null
          config_id: string
          created_at: string
          current_expiration: string | null
          current_position_type: string | null
          current_strike_price: number | null
          fill_probability: number | null
          id: string
          insurance_activated: boolean | null
          is_premium_too_low: boolean | null
          macd_signal: string | null
          reasoning: string | null
          recommended_action: string
          recommended_premium_pct: number | null
          recommended_strike_price: number | null
          resistance_level: number | null
          rsi_14: number | null
          signal_date: string
          signal_time: string
          support_level: number | null
          telegram_chat_id: string | null
          telegram_sent: boolean | null
          telegram_sent_at: string | null
          updated_at: string
          user_id: string
          volatility_24h: number | null
          will_be_filled: boolean | null
        }
        Insert: {
          bollinger_position?: string | null
          btc_price_source?: string | null
          btc_price_usd: number
          confidence_score?: number | null
          config_id: string
          created_at?: string
          current_expiration?: string | null
          current_position_type?: string | null
          current_strike_price?: number | null
          fill_probability?: number | null
          id?: string
          insurance_activated?: boolean | null
          is_premium_too_low?: boolean | null
          macd_signal?: string | null
          reasoning?: string | null
          recommended_action: string
          recommended_premium_pct?: number | null
          recommended_strike_price?: number | null
          resistance_level?: number | null
          rsi_14?: number | null
          signal_date: string
          signal_time?: string
          support_level?: number | null
          telegram_chat_id?: string | null
          telegram_sent?: boolean | null
          telegram_sent_at?: string | null
          updated_at?: string
          user_id: string
          volatility_24h?: number | null
          will_be_filled?: boolean | null
        }
        Update: {
          bollinger_position?: string | null
          btc_price_source?: string | null
          btc_price_usd?: number
          confidence_score?: number | null
          config_id?: string
          created_at?: string
          current_expiration?: string | null
          current_position_type?: string | null
          current_strike_price?: number | null
          fill_probability?: number | null
          id?: string
          insurance_activated?: boolean | null
          is_premium_too_low?: boolean | null
          macd_signal?: string | null
          reasoning?: string | null
          recommended_action?: string
          recommended_premium_pct?: number | null
          recommended_strike_price?: number | null
          resistance_level?: number | null
          rsi_14?: number | null
          signal_date?: string
          signal_time?: string
          support_level?: number | null
          telegram_chat_id?: string | null
          telegram_sent?: boolean | null
          telegram_sent_at?: string | null
          updated_at?: string
          user_id?: string
          volatility_24h?: number | null
          will_be_filled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_trading_signals_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_trading_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      insurance_coverage_periods: {
        Row: {
          base_capital_for_premium: number
          config_id: string
          created_at: string
          daily_fictitious_premium_pct: number | null
          days_covered: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          payout_address: string | null
          payout_amount_usdt: number | null
          payout_completed_at: string | null
          payout_requested: boolean | null
          payout_tx_hash: string | null
          start_date: string
          total_premium_accumulated_usdt: number | null
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_capital_for_premium: number
          config_id: string
          created_at?: string
          daily_fictitious_premium_pct?: number | null
          days_covered?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          payout_address?: string | null
          payout_amount_usdt?: number | null
          payout_completed_at?: string | null
          payout_requested?: boolean | null
          payout_tx_hash?: string | null
          start_date: string
          total_premium_accumulated_usdt?: number | null
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_capital_for_premium?: number
          config_id?: string
          created_at?: string
          daily_fictitious_premium_pct?: number | null
          days_covered?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          payout_address?: string | null
          payout_amount_usdt?: number | null
          payout_completed_at?: string | null
          payout_requested?: boolean | null
          payout_tx_hash?: string | null
          start_date?: string
          total_premium_accumulated_usdt?: number | null
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_coverage_periods_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_coverage_periods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_payments: {
        Row: {
          created_at: string
          grace_period_until: string | null
          id: string
          is_paid: boolean | null
          last_check_at: string | null
          paid_at: string | null
          payment_amount_eur: number | null
          payment_due_date: string
          payment_method: string | null
          payment_month: string
          payment_provider: string | null
          payment_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          grace_period_until?: string | null
          id?: string
          is_paid?: boolean | null
          last_check_at?: string | null
          paid_at?: string | null
          payment_amount_eur?: number | null
          payment_due_date: string
          payment_method?: string | null
          payment_month: string
          payment_provider?: string | null
          payment_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          grace_period_until?: string | null
          id?: string
          is_paid?: boolean | null
          last_check_at?: string | null
          paid_at?: string | null
          payment_amount_eur?: number | null
          payment_due_date?: string
          payment_method?: string | null
          payment_month?: string
          payment_provider?: string | null
          payment_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
          is_insured: boolean | null
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
          is_insured?: boolean | null
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
          is_insured?: boolean | null
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
      notification_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: string | null
          notification_method: string
          reminder_id: string
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string | null
          notification_method: string
          reminder_id: string
          sent_at?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string | null
          notification_method?: string
          reminder_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      telegram_notifications_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_text: string
          message_type: string
          priority: number | null
          related_coverage_id: string | null
          related_signal_id: string | null
          retry_count: number | null
          scheduled_send_time: string | null
          sent: boolean | null
          sent_at: string | null
          telegram_chat_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_text: string
          message_type: string
          priority?: number | null
          related_coverage_id?: string | null
          related_signal_id?: string | null
          retry_count?: number | null
          scheduled_send_time?: string | null
          sent?: boolean | null
          sent_at?: string | null
          telegram_chat_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_text?: string
          message_type?: string
          priority?: number | null
          related_coverage_id?: string | null
          related_signal_id?: string | null
          retry_count?: number | null
          scheduled_send_time?: string | null
          sent?: boolean | null
          sent_at?: string | null
          telegram_chat_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_notifications_queue_related_coverage_id_fkey"
            columns: ["related_coverage_id"]
            isOneToOne: false
            referencedRelation: "insurance_coverage_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_notifications_queue_related_signal_id_fkey"
            columns: ["related_signal_id"]
            isOneToOne: false
            referencedRelation: "ai_trading_signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_notifications_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          login_time: string
          logout_time: string | null
          session_duration: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown
          login_time?: string
          logout_time?: string | null
          session_duration?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          login_time?: string
          logout_time?: string | null
          session_duration?: unknown
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
      check_admin_level: {
        Args: {
          _required_role?: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      check_user_role_bypass: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          check_user_id: string
        }
        Returns: boolean
      }
      delete_user_safely: { Args: { target_user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_safe: { Args: never; Returns: boolean }
      is_admin_via_roles: { Args: never; Returns: boolean }
      is_admin_with_role: {
        Args: { required_role?: Database["public"]["Enums"]["admin_role_type"] }
        Returns: boolean
      }
      is_user_admin: { Args: never; Returns: boolean }
      is_user_admin_new: { Args: never; Returns: boolean }
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
      reset_user_strategy_state: {
        Args: { target_user_email: string }
        Returns: Json
      }
      update_user_login: { Args: { user_uuid: string }; Returns: undefined }
    }
    Enums: {
      admin_role_type: "admin_readonly" | "admin_full" | "super_admin"
      app_role: "admin_readonly" | "admin_full" | "super_admin" | "user"
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
      app_role: ["admin_readonly", "admin_full", "super_admin", "user"],
    },
  },
} as const
