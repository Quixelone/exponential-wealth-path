import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Menu,
  Bell
} from 'lucide-react';

interface MobileHeaderProps {
  userProfile?: any;
  isAdmin?: boolean;
  hasUnsavedChanges?: boolean;
  onLogout: () => void;
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  userProfile,
  isAdmin,
  hasUnsavedChanges,
  onLogout,
  onMenuClick
}) => {
  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  const firstName = userProfile?.first_name || userProfile?.email?.charAt(0) || 'U';

  return (
    <header className="h-16 bg-card border-b border-border px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="h-10 w-10 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-32">
              {displayName.split(' ')[0]}
            </span>
            {isAdmin && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs h-4 px-1">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {hasUnsavedChanges && (
          <Badge variant="destructive" className="animate-pulse text-xs">
            Non salvato
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;