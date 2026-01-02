import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import ModernHeader from '@/components/dashboard/ModernHeader';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import BottomNavigation from '@/components/mobile/BottomNavigation';
import UnsavedChangesAlert from '@/components/configuration/UnsavedChangesAlert';

interface AppLayoutProps {
  children: React.ReactNode;
  hasUnsavedChanges?: boolean;
  activeTab?: string; // For bottom navigation active state
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, hasUnsavedChanges = false, activeTab = 'dashboard' }) => {
  const { user, userProfile, loading: authLoading, signOut, isAdmin } = useAuth();
  const { isMobile, isTablet } = useDeviceInfo();
  const { lastDatabaseSync } = useInvestmentCalculator();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Use navigation guard hook
  const { guardedNavigate, showAlert, confirmNavigation, cancelNavigation } = useNavigationGuard({
    hasUnsavedChanges,
  });

  const handleLogout = async () => {
    if (hasUnsavedChanges) {
      const confirmLogout = window.confirm(
        'Hai modifiche non salvate. Sei sicuro di voler uscire senza salvare?'
      );
      if (!confirmLogout) return;
    }
    
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dati utente...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth via useEffect
  }

  return (
    <ModernTooltipProvider>
      <div className="min-h-screen bg-dashboard-bg">
        {/* Desktop Layout */}
        {!isMobile && !isTablet && (
          <div className="flex min-h-screen w-full">
            <ModernSidebar 
              isAdmin={isAdmin}
              onCollapseChange={setIsSidebarCollapsed}
              onNavigate={guardedNavigate}
            />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
              <ModernHeader 
                userProfile={userProfile}
                onLogout={handleLogout}
                onSettings={() => guardedNavigate('/settings')}
                isAdmin={isAdmin}
                hasUnsavedChanges={hasUnsavedChanges}
                lastDatabaseSync={lastDatabaseSync}
              />
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        {(isMobile || isTablet) && (
          <>
            <MobileHeader 
              userProfile={userProfile}
              onMenuClick={() => setIsMobileDrawerOpen(true)}
              onLogout={handleLogout}
              isAdmin={isAdmin}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            <MobileDrawer 
              isOpen={isMobileDrawerOpen}
              onClose={() => setIsMobileDrawerOpen(false)}
              isAdmin={isAdmin}
              onNavigate={guardedNavigate}
            />
            <main className="pt-16 pb-24 px-3 sm:px-4 min-h-[calc(100vh-4rem)] overflow-x-hidden">
              {children}
            </main>
            <BottomNavigation 
              isAdmin={isAdmin}
              onNavigate={guardedNavigate}
              activeTab={activeTab}
            />
          </>
        )}

        <UnsavedChangesAlert
          open={showAlert}
          onContinue={confirmNavigation}
          onCancel={cancelNavigation}
        />
      </div>
    </ModernTooltipProvider>
  );
};

export default AppLayout;