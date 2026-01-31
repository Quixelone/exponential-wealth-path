-- Security fix: prevent public access to telegram_notifications_queue (contains telegram_chat_id + trading signals)

-- Ensure RLS is enabled
ALTER TABLE public.telegram_notifications_queue ENABLE ROW LEVEL SECURITY;

-- Optional hardening: enforce RLS for table owners too
ALTER TABLE public.telegram_notifications_queue FORCE ROW LEVEL SECURITY;

-- Remove overly permissive policy that grants SELECT/WRITE to public (anon/authenticated)
DROP POLICY IF EXISTS "System can manage notifications" ON public.telegram_notifications_queue;

-- Replace admin policy to use safe, roles-table-based admin check (avoids legacy role column)
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.telegram_notifications_queue;
CREATE POLICY "Admins can view all notifications"
ON public.telegram_notifications_queue
FOR SELECT
TO authenticated
USING (public.is_admin_safe());

-- Ensure users can only read their own queued notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.telegram_notifications_queue;
CREATE POLICY "Users can view their own notifications"
ON public.telegram_notifications_queue
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- NOTE:
-- Edge Functions that use the Supabase service role key keep working because service_role bypasses RLS.
-- We intentionally do NOT add INSERT/UPDATE/DELETE policies for client roles so the queue cannot be tampered with from the browser.
