import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  Users, 
  Bell,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ModernHeaderProps {
  userProfile?: any;
  isAdmin?: boolean;
  hasUnsavedChanges?: boolean;
  onLogout: () => void;
  onSettings: () => void;
  onUserManagement?: (e: React.MouseEvent) => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  userProfile,
  isAdmin,
  hasUnsavedChanges,
  onLogout,
  onSettings,
  onUserManagement
}) => {
  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            className="pl-10 w-80 modern-input"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Bell className="h-4 w-4" />
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="sm" className="hover:bg-accent">
          <Sun className="h-4 w-4" />
        </Button>

        {/* Status badges */}
        <div className="flex gap-2">
          {isAdmin && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Admin
            </Badge>
          )}
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="animate-pulse">
              Modifiche non salvate
            </Badge>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{displayName}</div>
            <div className="text-xs text-muted-foreground">
              {userProfile?.role || 'Utente'}
            </div>
          </div>
          
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            className="hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {isAdmin && onUserManagement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onUserManagement(e)}
              className="hover:bg-accent"
            >
              <Users className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;