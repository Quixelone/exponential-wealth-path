// Registration test utilities for debugging
export const logRegistrationAttempt = (email: string, formData: any) => {
  console.group('🧪 Registration Test Debug');
  console.log('📧 Email:', email);
  console.log('📋 Form Data:', formData);
  console.log('🌐 Current URL:', window.location.href);
  console.log('🔗 Origin:', window.location.origin);
  console.groupEnd();
};

export const validateRegistrationForm = (formData: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}) => {
  const errors: string[] = [];
  
  if (!formData.email || !formData.email.includes('@')) {
    errors.push('Email non valida');
  }
  
  if (!formData.password || formData.password.length < 6) {
    errors.push('Password deve essere di almeno 6 caratteri');
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.push('Le password non coincidono');
  }
  
  if (!formData.firstName?.trim()) {
    errors.push('Nome obbligatorio');
  }
  
  if (!formData.lastName?.trim()) {
    errors.push('Cognome obbligatorio');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test if we can reach Supabase
    const response = await fetch('https://rsmvjsokqolxgczclqjv.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo'
      }
    });
    
    console.log('✅ Supabase connection status:', response.status);
    return response.ok;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};