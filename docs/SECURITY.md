# Security Documentation

## Security Model Overview

This application implements a comprehensive security model with the following key components:

### Authentication & Authorization
- **Supabase Auth**: Handles user authentication with JWT tokens
- **Row Level Security (RLS)**: Enforced on all database tables
- **Role-based Access**: Admin and user roles with appropriate permissions

### Database Security

#### RLS Policies
All tables have proper RLS policies that ensure users can only access their own data:

- `investment_configurations`: Users can only access their own configurations
- `daily_pac_overrides`: Users can only access their own PAC overrides
- `notification_preferences`: Users can only access their own preferences
- `user_profiles`: Users can only access their own profile

#### Admin Access
- Admin users have elevated permissions for user management
- Admin role is stored in `user_profiles.role` field
- Admin access is validated through RLS policies

### API Security

#### Edge Functions
- `send-notifications`: JWT verification enabled
- `setup-cron`: JWT verification enabled  
- `test-whatsapp`: JWT verification enabled
- `check-auth-config`: JWT verification enabled
- `custom-smtp-auth`: JWT verification disabled (intentional for auth flows)

### Data Protection

#### Sensitive Data Handling
- No sensitive financial data stored (calculations only)
- User emails and profiles protected by RLS
- Configuration data isolated per user

#### Client-side Security
- Authentication state managed securely
- No sensitive data in localStorage (only UI preferences)
- Proper error handling without data leakage

## Security Checklist

### Current Status ✅
- [x] RLS enabled on all tables
- [x] Proper authentication flows
- [x] User data isolation
- [x] Admin role protection
- [x] Secure API endpoints
- [x] Error handling without data exposure

### Manual Configuration Required ⚠️
- [ ] **Enable Leaked Password Protection** in Supabase Dashboard
  - Go to: Dashboard → Authentication → Settings
  - Enable "Leaked Password Protection"
  - This prevents users from using commonly compromised passwords

### Best Practices

1. **Regular Security Reviews**
   - Run security scans periodically
   - Review RLS policies when adding new features
   - Monitor authentication logs

2. **Development Guidelines**
   - Always enable RLS on new tables
   - Test policies with different user roles
   - Use proper error handling
   - Validate user input

3. **Deployment Security**
   - Use environment variables for secrets
   - Enable HTTPS in production
   - Regular dependency updates

## Emergency Procedures

If a security issue is discovered:

1. Assess the scope and severity
2. Implement immediate fixes for critical issues
3. Review and update affected RLS policies
4. Notify users if data exposure is possible
5. Document the incident and prevention measures

## Contact

For security concerns, contact the development team immediately.