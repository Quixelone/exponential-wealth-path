import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
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
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, hasUnsavedChanges = false }) => {
  const { user, userProfile, loading: authLoading, signOut, isAdmin } = useAuth();
  const { isMobile, isTablet } = useDeviceInfo();
  const { lastDatabaseSync } = useInvestmentCalculator();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNavigationAlert, setShowNavigationAlert] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Enhanced unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Navigation guard
  const guardedNavigate = (path: string) => {
    if (hasUnsavedChanges && location.pathname !== path) {
      setPendingNavigation(path);
      setShowNavigationAlert(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
      setShowNavigationAlert(false);
    }
  };

  const cancelNavigation = () => {
    setPendingNavigation(null);
    setShowNavigationAlert(false);
  };

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
      <div className="min-h-screen bg-background">
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
            <div className="pt-14 pb-20 px-4">
              {children}
            </div>
            <BottomNavigation 
              isAdmin={isAdmin}
              onNavigate={guardedNavigate}
            />
          </>
        )}

        <UnsavedChangesAlert
          open={showNavigationAlert}
          onContinue={confirmNavigation}
          onCancel={cancelNavigation}
        />
      </div>
    </ModernTooltipProvider>
  );
};

export default AppLayout;