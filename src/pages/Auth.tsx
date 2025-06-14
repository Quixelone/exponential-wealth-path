
import React from 'react';
import AuthIllustration from '@/components/auth/AuthIllustration';
import AuthForm from '@/components/auth/AuthForm';

const Auth: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-[Inter] grid lg:grid-cols-2">
      <AuthIllustration />
      <AuthForm />
    </div>
  );
};

export default Auth;
