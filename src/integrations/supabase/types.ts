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
          config_id: string | null
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
          config_id?: string | null
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
          config_id?: string | null
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
      backup_logs: {
        Row: {
          backup_date: string
          configs_backed_up: number | null
          configs_failed: number | null
          created_at: string | null
          error_details: Json | null
          execution_time_ms: number | null
          id: string
          old_backups_deleted: number | null
          status: string
        }
        Insert: {
          backup_date: string
          configs_backed_up?: number | null
          configs_failed?: number | null
          created_at?: string | null
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          old_backups_deleted?: number | null
          status: string
        }
        Update: {
          backup_date?: string
          configs_backed_up?: number | null
          configs_failed?: number | null
          created_at?: string | null
          error_details?: Json | null
          execution_time_ms?: number | null
          id?: string
          old_backups_deleted?: number | null
          status?: string
        }
        Relationships: []
      }
      balance_history: {
        Row: {
          api_response_raw: Json | null
          api_response_time_ms: number | null
          btc_free: number | null
          btc_locked: number | null
          check_timestamp: string | null
          created_at: string | null
          id: string
          total_value_usd: number | null
          usdt_free: number | null
          usdt_locked: number | null
          user_id: string
        }
        Insert: {
          api_response_raw?: Json | null
          api_response_time_ms?: number | null
          btc_free?: number | null
          btc_locked?: number | null
          check_timestamp?: string | null
          created_at?: string | null
          id?: string
          total_value_usd?: number | null
          usdt_free?: number | null
          usdt_locked?: number | null
          user_id: string
        }
        Update: {
          api_response_raw?: Json | null
          api_response_time_ms?: number | null
          btc_free?: number | null
          btc_locked?: number | null
          check_timestamp?: string | null
          created_at?: string | null
          id?: string
          total_value_usd?: number | null
          usdt_free?: number | null
          usdt_locked?: number | null
          user_id?: string
        }
        Relationships: []
      }
      broker_connections: {
        Row: {
          api_key: string
          api_passphrase: string | null
          api_secret: string
          auto_sync_enabled: boolean | null
          broker_name: string
          connection_status: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_error_message: string | null
          last_sync_date: string | null
          sync_frequency: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          api_passphrase?: string | null
          api_secret: string
          auto_sync_enabled?: boolean | null
          broker_name: string
          connection_status?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_error_message?: string | null
          last_sync_date?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          api_passphrase?: string | null
          api_secret?: string
          auto_sync_enabled?: boolean | null
          broker_name?: string
          connection_status?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_error_message?: string | null
          last_sync_date?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      btc_positions: {
        Row: {
          avg_cost_basis_usd: number | null
          btc_quantity: number
          config_id: string
          created_at: string | null
          id: string
          last_fill_date: string | null
          last_fill_price_usd: number | null
          last_fill_type: string | null
          total_assignments_count: number | null
          total_premium_earned_usdt: number | null
          total_trades_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_cost_basis_usd?: number | null
          btc_quantity?: number
          config_id: string
          created_at?: string | null
          id?: string
          last_fill_date?: string | null
          last_fill_price_usd?: number | null
          last_fill_type?: string | null
          total_assignments_count?: number | null
          total_premium_earned_usdt?: number | null
          total_trades_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_cost_basis_usd?: number | null
          btc_quantity?: number
          config_id?: string
          created_at?: string | null
          id?: string
          last_fill_date?: string | null
          last_fill_price_usd?: number | null
          last_fill_type?: string | null
          total_assignments_count?: number | null
          total_premium_earned_usdt?: number | null
          total_trades_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "btc_positions_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btc_positions_user_id_fkey"
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
      challenges: {
        Row: {
          badge_reward: string | null
          challenge_type: string
          created_at: string | null
          description: string
          end_date: string
          id: string
          is_active: boolean | null
          start_date: string
          target_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          badge_reward?: string | null
          challenge_type: string
          created_at?: string | null
          description: string
          end_date: string
          id?: string
          is_active?: boolean | null
          start_date: string
          target_value: number
          title: string
          xp_reward: number
        }
        Update: {
          badge_reward?: string | null
          challenge_type?: string
          created_at?: string | null
          description?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "educational_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_options_log: {
        Row: {
          api_sync_status: string | null
          balance_current_day: number | null
          balance_previous_day: number | null
          broker_source: string | null
          broker_transaction_id: string | null
          btc_current_day: number | null
          btc_locked_current: number | null
          btc_locked_previous: number | null
          btc_previous_day: number | null
          btc_price_at_settlement: number | null
          config_id: string | null
          created_at: string | null
          id: string
          option_date: string
          option_type: string | null
          premium_earned: number | null
          premium_in_eur: number | null
          premium_in_usd: number | null
          recorded_at: string | null
          sync_error_message: string | null
          sync_method: string | null
          synced_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_sync_status?: string | null
          balance_current_day?: number | null
          balance_previous_day?: number | null
          broker_source?: string | null
          broker_transaction_id?: string | null
          btc_current_day?: number | null
          btc_locked_current?: number | null
          btc_locked_previous?: number | null
          btc_previous_day?: number | null
          btc_price_at_settlement?: number | null
          config_id?: string | null
          created_at?: string | null
          id?: string
          option_date: string
          option_type?: string | null
          premium_earned?: number | null
          premium_in_eur?: number | null
          premium_in_usd?: number | null
          recorded_at?: string | null
          sync_error_message?: string | null
          sync_method?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_sync_status?: string | null
          balance_current_day?: number | null
          balance_previous_day?: number | null
          broker_source?: string | null
          broker_transaction_id?: string | null
          btc_current_day?: number | null
          btc_locked_current?: number | null
          btc_locked_previous?: number | null
          btc_previous_day?: number | null
          btc_price_at_settlement?: number | null
          config_id?: string | null
          created_at?: string | null
          id?: string
          option_date?: string
          option_type?: string | null
          premium_earned?: number | null
          premium_in_eur?: number | null
          premium_in_usd?: number | null
          recorded_at?: string | null
          sync_error_message?: string | null
          sync_method?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_options_log_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
        ]
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
      educational_courses: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          level: Database["public"]["Enums"]["course_level"]
          prerequisites: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          level?: Database["public"]["Enums"]["course_level"]
          prerequisites?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          level?: Database["public"]["Enums"]["course_level"]
          prerequisites?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      investor_inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          data: Json | null
          email: string
          id: string
          investor_type: string
          name: string
          notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          data?: Json | null
          email: string
          id?: string
          investor_type: string
          name: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          data?: Json | null
          email?: string
          id?: string
          investor_type?: string
          name?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kv_store_7c0f82ca: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          badge_count: number
          created_at: string | null
          id: string
          last_updated: string | null
          level: number
          total_xp: number
          user_id: string
          username: string
          week_start: string
          weekly_xp: number
        }
        Insert: {
          badge_count?: number
          created_at?: string | null
          id?: string
          last_updated?: string | null
          level?: number
          total_xp?: number
          user_id: string
          username: string
          week_start: string
          weekly_xp?: number
        }
        Update: {
          badge_count?: number
          created_at?: string | null
          id?: string
          last_updated?: string | null
          level?: number
          total_xp?: number
          user_id?: string
          username?: string
          week_start?: string
          weekly_xp?: number
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          notes: string | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          notes?: string | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          notes?: string | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          module_id: string
          order_index: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          module_id: string
          order_index: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
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
      options_trades: {
        Row: {
          apy_equivalent: number | null
          btc_received: number | null
          capital_employed_usdt: number
          closed_at: string | null
          config_id: string
          confirmation_source: string | null
          created_at: string | null
          duration_days: number
          expiration_date: string
          id: string
          is_assigned: boolean | null
          opened_at: string
          option_type: string
          premium_percentage: number
          premium_usdt: number
          settlement_price_usd: number | null
          status: string
          strike_price_usd: number
          updated_at: string | null
          user_confirmed: boolean | null
          user_confirmed_at: string | null
          user_id: string
        }
        Insert: {
          apy_equivalent?: number | null
          btc_received?: number | null
          capital_employed_usdt: number
          closed_at?: string | null
          config_id: string
          confirmation_source?: string | null
          created_at?: string | null
          duration_days?: number
          expiration_date: string
          id?: string
          is_assigned?: boolean | null
          opened_at?: string
          option_type: string
          premium_percentage: number
          premium_usdt: number
          settlement_price_usd?: number | null
          status?: string
          strike_price_usd: number
          updated_at?: string | null
          user_confirmed?: boolean | null
          user_confirmed_at?: string | null
          user_id: string
        }
        Update: {
          apy_equivalent?: number | null
          btc_received?: number | null
          capital_employed_usdt?: number
          closed_at?: string | null
          config_id?: string
          confirmation_source?: string | null
          created_at?: string | null
          duration_days?: number
          expiration_date?: string
          id?: string
          is_assigned?: boolean | null
          opened_at?: string
          option_type?: string
          premium_percentage?: number
          premium_usdt?: number
          settlement_price_usd?: number | null
          status?: string
          strike_price_usd?: number
          updated_at?: string | null
          user_confirmed?: boolean | null
          user_confirmed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_trades_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "investment_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "options_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      paper_trading_portfolios: {
        Row: {
          balance_usdt: number
          created_at: string | null
          id: string
          positions_closed: number
          positions_opened: number
          total_profit_loss: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_usdt?: number
          created_at?: string | null
          id?: string
          positions_closed?: number
          positions_opened?: number
          total_profit_loss?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_usdt?: number
          created_at?: string | null
          id?: string
          positions_closed?: number
          positions_opened?: number
          total_profit_loss?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      paper_trading_positions: {
        Row: {
          btc_amount: number
          close_date: string | null
          close_price: number | null
          created_at: string | null
          id: string
          open_date: string
          portfolio_id: string
          position_type: string
          premium_collected: number
          profit_loss: number | null
          status: string
          strike_price: number
          user_id: string
        }
        Insert: {
          btc_amount: number
          close_date?: string | null
          close_price?: number | null
          created_at?: string | null
          id?: string
          open_date?: string
          portfolio_id: string
          position_type: string
          premium_collected: number
          profit_loss?: number | null
          status?: string
          strike_price: number
          user_id: string
        }
        Update: {
          btc_amount?: number
          close_date?: string | null
          close_price?: number | null
          created_at?: string | null
          id?: string
          open_date?: string
          portfolio_id?: string
          position_type?: string
          premium_collected?: number
          profit_loss?: number | null
          status?: string
          strike_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paper_trading_positions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "paper_trading_portfolios"
            referencedColumns: ["id"]
          },
        ]
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
      quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          completed_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          attempt_number?: number
          completed_at?: string
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          completed_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          max_attempts: number | null
          passing_score: number
          questions: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number
          questions: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          max_attempts?: number | null
          passing_score?: number
          questions?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
      strategy_backups: {
        Row: {
          backup_data: Json
          backup_date: string
          config_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          backup_data: Json
          backup_date: string
          config_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          backup_data?: Json
          backup_date?: string
          config_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      strike_prices_cache: {
        Row: {
          apy_percentage: number
          btc_price_at_fetch: number
          created_at: string | null
          duration_days: number
          fetch_date: string
          fetch_time: string | null
          id: string
          is_active: boolean | null
          option_type: string
          rise_fall_percentage: number
          source: string | null
          strike_price_usd: number
        }
        Insert: {
          apy_percentage: number
          btc_price_at_fetch: number
          created_at?: string | null
          duration_days: number
          fetch_date: string
          fetch_time?: string | null
          id?: string
          is_active?: boolean | null
          option_type: string
          rise_fall_percentage: number
          source?: string | null
          strike_price_usd: number
        }
        Update: {
          apy_percentage?: number
          btc_price_at_fetch?: number
          created_at?: string | null
          duration_days?: number
          fetch_date?: string
          fetch_time?: string | null
          id?: string
          is_active?: boolean | null
          option_type?: string
          rise_fall_percentage?: number
          source?: string | null
          strike_price_usd?: number
        }
        Relationships: []
      }
      telegram_link_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
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
      user_challenges: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          badges: Json | null
          created_at: string | null
          id: string
          last_activity_date: string | null
          level: number
          streak_days: number
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          badges?: Json | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          badges?: Json | null
          created_at?: string | null
          id?: string
          last_activity_date?: string | null
          level?: number
          streak_days?: number
          updated_at?: string | null
          user_id?: string
          xp?: number
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
      user_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          course_id: string
          created_at: string
          id: string
          last_accessed_at: string | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          course_id: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          course_id?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "educational_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_risk_profiles: {
        Row: {
          ai_assessment: Json | null
          created_at: string
          crypto_experience: string | null
          id: string
          investment_goals: string[] | null
          quiz_responses: Json | null
          recommended_courses: string[] | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_assessment?: Json | null
          created_at?: string
          crypto_experience?: string | null
          id?: string
          investment_goals?: string[] | null
          quiz_responses?: Json | null
          recommended_courses?: string[] | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_assessment?: Json | null
          created_at?: string
          crypto_experience?: string | null
          id?: string
          investment_goals?: string[] | null
          quiz_responses?: Json | null
          recommended_courses?: string[] | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          updated_at?: string
          user_id?: string
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
      calculate_avg_cost_basis: {
        Args: { p_config_id: string }
        Returns: number
      }
      calculate_unrealized_pnl: {
        Args: { p_config_id: string; p_current_btc_price: number }
        Returns: {
          avg_cost: number
          btc_quantity: number
          current_value: number
          unrealized_pnl: number
          unrealized_pnl_percentage: number
        }[]
      }
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
      cleanup_expired_telegram_codes: { Args: never; Returns: undefined }
      delete_user_safely: { Args: { target_user_id: string }; Returns: boolean }
      get_backup_stats: { Args: { user_uuid: string }; Returns: Json }
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
      course_level: "beginner" | "intermediate" | "advanced" | "expert"
      lesson_type: "video" | "text" | "interactive" | "quiz" | "practical"
      risk_level: "conservative" | "moderate" | "aggressive" | "expert"
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
      course_level: ["beginner", "intermediate", "advanced", "expert"],
      lesson_type: ["video", "text", "interactive", "quiz", "practical"],
      risk_level: ["conservative", "moderate", "aggressive", "expert"],
    },
  },
} as const
