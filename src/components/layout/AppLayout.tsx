
import React from 'react';
import AppHeader from './AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
