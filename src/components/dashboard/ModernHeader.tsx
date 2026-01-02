import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  User, 
  LogOut, 
  Settings, 
  Users, 
  Bell,
  Search,
  Database
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface ModernHeaderProps {
  userProfile?: any;
  isAdmin?: boolean;
  hasUnsavedChanges?: boolean;
  lastDatabaseSync?: Date | null;
  onLogout: () => void;
  onSettings: () => void;
  onUserManagement?: (e: React.MouseEvent) => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  userProfile,
  isAdmin,
  hasUnsavedChanges,
  lastDatabaseSync,
  onLogout,
  onSettings,
  onUserManagement
}) => {
  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  const syncText = lastDatabaseSync
    ? `Sincronizzato ${formatDistanceToNow(lastDatabaseSync, { addSuffix: true, locale: it })}`
    : 'Nessuna sincronizzazione recente';

  return (
    <header className="h-16 bg-dashboard-card border-b border-dashboard-border px-6 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Cerca..."
            className="pl-10 w-80 bg-dashboard-sidebar border-dashboard-border text-white placeholder:text-white/40 focus:border-dashboard-accent-green"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="hover:bg-dashboard-sidebar text-white/70 hover:text-white">
          <Bell className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Status badges */}
        <div className="flex gap-2">
          {isAdmin && (
            <Badge variant="secondary" className="bg-dashboard-accent-blue/20 text-dashboard-accent-blue border-0">
              Admin
            </Badge>
          )}
          {lastDatabaseSync && (
            <Badge 
              variant="outline" 
              className="bg-dashboard-accent-green/10 text-dashboard-accent-green border-dashboard-accent-green/30 flex items-center gap-1"
              title={syncText}
            >
              <Database className="h-3 w-3" />
              <span className="text-xs">{syncText}</span>
            </Badge>
          )}
          {hasUnsavedChanges && (
            <Badge className="bg-dashboard-accent-orange/20 text-dashboard-accent-orange border-0 animate-pulse">
              Modifiche non salvate
            </Badge>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{displayName}</div>
            <div className="text-xs text-white/50">
              {userProfile?.role || 'Utente'}
            </div>
          </div>
          
          <div className="w-8 h-8 bg-dashboard-accent-blue rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="hover:bg-dashboard-sidebar text-white/70 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {isAdmin && onUserManagement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onUserManagement(e)}
              className="hover:bg-dashboard-sidebar text-white/70 hover:text-white"
            >
              <Users className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="hover:bg-dashboard-accent-red/20 text-white/70 hover:text-dashboard-accent-red"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;