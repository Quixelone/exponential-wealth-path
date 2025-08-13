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
    // In a production environment, you might want to send this to a dedicated security logging service
    console.log('🔒 Security Event:', {
      timestamp: new Date().toISOString(),
      ...event
    });

    // For now, we'll just log to console. In production, consider:
    // - Sending to external security service (e.g., Datadog, Splunk)
    // - Storing in dedicated security audit table
    // - Triggering alerts for critical events
    
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