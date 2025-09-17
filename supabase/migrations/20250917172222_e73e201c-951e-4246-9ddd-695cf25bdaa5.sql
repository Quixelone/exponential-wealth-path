-- Grant super admin privileges to the first user to access security dashboard
UPDATE public.user_profiles 
SET 
  role = 'admin',
  admin_role = 'super_admin'
WHERE email = 'lcoccimiglio@gmail.com';