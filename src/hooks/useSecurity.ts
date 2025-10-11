import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logSecurityEvent } from '@/utils/securityLogger';

interface SecurityAuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  accessed_fields: string[];
  ip_address?: string | null;
  user_agent?: string | null;
  admin_user_id?: string | null;
  created_at: string;
  user_profiles?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
}

interface SecurityMetrics {
  totalAccess: number;
  adminAccess: number;
  userAccess: number;
  sensitiveFieldAccess: number;
  recentAlerts: number;
}

export const useSecurity = () => {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAccess: 0,
    adminAccess: 0,
    userAccess: 0,
    sensitiveFieldAccess: 0,
    recentAlerts: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAuditLogs = async (limit = 100) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_audit_log')
        .select(`
          *,
          user_profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs((data || []) as SecurityAuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i log di sicurezza",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      // Get metrics for last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('action, admin_user_id, accessed_fields')
        .gte('created_at', yesterday.toISOString());

      if (error) throw error;

      const logs = data || [];
      const totalAccess = logs.length;
      const adminAccess = logs.filter(log => log.admin_user_id).length;
      const userAccess = totalAccess - adminAccess;
      const sensitiveFieldAccess = logs.filter(log => 
        log.accessed_fields?.some(field => 
          ['email', 'phone', 'google_id'].includes(field)
        )
      ).length;

      setMetrics({
        totalAccess,
        adminAccess,
        userAccess,
        sensitiveFieldAccess,
        recentAlerts: logs.filter(log => 
          log.action === 'SELECT' && log.admin_user_id
        ).length
      });
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  const updateUserAdminRole = async (userId: string, adminRole: 'admin_readonly' | 'admin_full' | 'super_admin' | null) => {
    try {
      // First, remove all existing admin roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .in('role', ['admin_readonly', 'admin_full', 'super_admin']);

      if (deleteError) throw deleteError;

      // If adminRole is provided, insert the new role
      if (adminRole) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: adminRole
          });

        if (insertError) throw insertError;
      } else {
        // If removing admin role, ensure user role exists
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'user'
          })
          .select()
          .single();

        // Ignore if user role already exists
        if (userRoleError && !userRoleError.message.includes('duplicate')) {
          throw userRoleError;
        }
      }

      // Log the role change
      await logSecurityEvent({
        event_type: 'admin_role_change',
        user_id: userId,
        details: {
          new_admin_role: adminRole,
          action: 'role_change'
        }
      });

      toast({
        title: "Ruolo Aggiornato",
        description: `Ruolo amministratore ${adminRole ? 'assegnato' : 'rimosso'} con successo`,
      });
    } catch (error) {
      console.error('Error updating admin role:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo amministratore",
        variant: "destructive",
      });
    }
  };

  const checkSuspiciousActivity = async () => {
    try {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('user_id, action, admin_user_id')
        .gte('created_at', oneHourAgo.toISOString());

      if (error) throw error;

      const logs = data || [];
      
      // Check for excessive admin access
      const adminAccesses = logs.filter(log => log.admin_user_id);
      if (adminAccesses.length > 50) {
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          details: {
            type: 'excessive_admin_access',
            count: adminAccesses.length,
            timeframe: '1_hour'
          }
        });
      }

      // Check for unusual user activity patterns
      const userActivity = logs.reduce((acc, log) => {
        const userId = log.user_id;
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      for (const [userId, count] of Object.entries(userActivity)) {
        if (count > 100) {
          await logSecurityEvent({
            event_type: 'suspicious_activity',
            user_id: userId,
            details: {
              type: 'excessive_user_activity',
              count,
              timeframe: '1_hour'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchSecurityMetrics();
    checkSuspiciousActivity();

    // Set up periodic monitoring
    const interval = setInterval(() => {
      fetchSecurityMetrics();
      checkSuspiciousActivity();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    auditLogs,
    metrics,
    loading,
    fetchAuditLogs,
    fetchSecurityMetrics,
    updateUserAdminRole,
    checkSuspiciousActivity
  };
};