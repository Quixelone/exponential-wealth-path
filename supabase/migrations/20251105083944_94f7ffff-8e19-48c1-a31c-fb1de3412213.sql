-- ============================================
-- Strategy Backups System
-- ============================================

-- 1. Tabella per memorizzare i backup delle strategie
CREATE TABLE IF NOT EXISTS public.strategy_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  config_id uuid NOT NULL,
  backup_date date NOT NULL,
  backup_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Constraint per evitare duplicati
  UNIQUE(user_id, config_id, backup_date)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_strategy_backups_date ON public.strategy_backups(backup_date DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_backups_user_config ON public.strategy_backups(user_id, config_id);
CREATE INDEX IF NOT EXISTS idx_strategy_backups_user_id ON public.strategy_backups(user_id);

-- 2. Tabella per logging delle operazioni di backup
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  configs_backed_up integer DEFAULT 0,
  configs_failed integer DEFAULT 0,
  old_backups_deleted integer DEFAULT 0,
  execution_time_ms integer,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_logs_date ON public.backup_logs(backup_date DESC);

-- 3. Enable RLS
ALTER TABLE public.strategy_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies per strategy_backups

-- Gli utenti possono vedere solo i propri backup
CREATE POLICY "Users can view their own backups"
  ON public.strategy_backups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo il sistema può creare backup (via edge function)
CREATE POLICY "System can create backups"
  ON public.strategy_backups
  FOR INSERT
  WITH CHECK (true);

-- Solo il sistema può aggiornare backup
CREATE POLICY "System can update backups"
  ON public.strategy_backups
  FOR UPDATE
  USING (true);

-- Solo il sistema può eliminare backup vecchi
CREATE POLICY "System can delete old backups"
  ON public.strategy_backups
  FOR DELETE
  USING (true);

-- Gli admin possono vedere tutti i backup
CREATE POLICY "Admins can view all backups"
  ON public.strategy_backups
  FOR SELECT
  USING (is_admin_safe());

-- 5. RLS Policies per backup_logs

-- Solo admin possono vedere i log
CREATE POLICY "Admins can view backup logs"
  ON public.backup_logs
  FOR SELECT
  USING (is_admin_safe());

-- Solo il sistema può inserire log
CREATE POLICY "System can insert backup logs"
  ON public.backup_logs
  FOR INSERT
  WITH CHECK (true);

-- 6. Function per ottenere statistiche backup utente
CREATE OR REPLACE FUNCTION public.get_backup_stats(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_backups', COUNT(*),
    'oldest_backup', MIN(backup_date),
    'newest_backup', MAX(backup_date),
    'total_size_bytes', SUM(pg_column_size(backup_data)),
    'configs_backed_up', COUNT(DISTINCT config_id),
    'available_dates', jsonb_agg(DISTINCT backup_date ORDER BY backup_date DESC)
  ) INTO stats
  FROM public.strategy_backups
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(stats, jsonb_build_object(
    'total_backups', 0,
    'oldest_backup', null,
    'newest_backup', null,
    'total_size_bytes', 0,
    'configs_backed_up', 0,
    'available_dates', '[]'::jsonb
  ));
END;
$$;