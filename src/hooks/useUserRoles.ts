import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'user' | 'admin_readonly' | 'admin_full' | 'super_admin';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export const useUserRoles = (userId?: string) => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setRoles([]);
      return;
    }

    let mounted = true;

    const fetchUserRoles = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (fetchError) throw fetchError;

        if (mounted) {
          const userRoles = (data || []).map((r: { role: AppRole }) => r.role);
          setRoles(userRoles);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching user roles:', err);
        if (mounted) {
          setError(err as Error);
          setRoles([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUserRoles();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole('admin_readonly') || hasRole('admin_full') || hasRole('super_admin');
  const isSuperAdmin = hasRole('super_admin');

  return {
    roles,
    loading,
    error,
    hasRole,
    isAdmin,
    isSuperAdmin,
  };
};
