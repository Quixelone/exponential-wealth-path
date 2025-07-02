
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, Users, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';

export function AppHeader() {
  const navigate = useNavigate();
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const { hasUnsavedChanges } = useInvestmentCalculator();

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

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

  const handleUserManagement = () => {
    navigate('/user-management');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <header className="clean-header h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-md">
            <Bell className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Modifiche non salvate</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">{displayName}</span>
          {isAdmin && (
            <span className="clean-badge-info">Admin</span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSettings}
          className="clean-btn-secondary"
        >
          <User className="h-4 w-4 mr-2" />
          Impostazioni
        </Button>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUserManagement}
            className="clean-btn-secondary"
          >
            <Users className="h-4 w-4 mr-2" />
            Utenti
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="clean-btn-secondary"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
