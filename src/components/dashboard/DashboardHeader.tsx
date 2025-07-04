import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  LogOut, 
  User, 
  Settings,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { formatCurrencyWhole } from '@/lib/utils';

interface DashboardHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuClick,
  sidebarCollapsed,
  onToggleSidebar
}) => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const { summary, config, hasUnsavedChanges } = useInvestmentCalculator();
  const navigate = useNavigate();

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  const currentBalance = summary?.current?.finalCapital || 0;
  const todayDate = new Date().toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
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

  const userInitials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex"
            onClick={onToggleSidebar}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Finanza Creativa
            </h1>
            {isAdmin && (
              <Badge variant="secondary" className="text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Center Section - Balance & Date */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm text-slate-600">Capitale Attuale</div>
            <div className="text-lg font-bold text-slate-900">
              {formatCurrencyWhole(currentBalance, config?.currency || 'EUR')}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-sm text-slate-600">Data</div>
            <div className="text-lg font-semibold text-slate-900">{todayDate}</div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="animate-pulse text-xs">
              Non salvato
            </Badge>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-slate-500">{userProfile?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Impostazioni</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/user-management')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Gestione Utenti</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;