import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  event_type: 'admin_role_change' | 'config_access' | 'auth_failure' | 'suspicious_activity';
  user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    console.log('🔒 Security Event:', {
      timestamp: new Date().toISOString(),
      ...event
    });

    // Log to our security audit table
    const { error } = await supabase
      .from('security_audit_log')
      .insert({
        user_id: event.user_id || (await supabase.auth.getUser()).data.user?.id,
        action: event.event_type,
        table_name: 'security_events',
        record_id: crypto.randomUUID(),
        accessed_fields: Object.keys(event.details),
        ip_address: event.ip_address,
        user_agent: event.user_agent
      });

    if (error) {
      console.error('Failed to log security event to database:', error);
    }
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const logAdminRoleChange = async (targetUserId: string, newRole: string, adminUserId: string) => {
  await logSecurityEvent({
    event_type: 'admin_role_change',
    user_id: adminUserId,
    details: {
      target_user_id: targetUserId,
      new_role: newRole,
      action: 'role_change'
    }
  });
};

export const logConfigurationAccess = async (configId: string, action: 'view' | 'edit' | 'delete') => {
  const { data: { user } } = await supabase.auth.getUser();
  
  await logSecurityEvent({
    event_type: 'config_access',
    user_id: user?.id,
    details: {
      configuration_id: configId,
      action
    }
  });
};

export const logAuthFailure = async (email: string, reason: string) => {
  await logSecurityEvent({
    event_type: 'auth_failure',
    details: {
      email,
      reason,
      attempt_time: new Date().toISOString()
    }
  });
};