import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp,
  Bell, 
  Settings, 
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  isAdmin?: boolean;
  onStrategiesClick?: () => void;
  onNavigate?: (path: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ isAdmin, onStrategiesClick, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/app',
    },
    {
      icon: TrendingUp,
      label: 'Strategie',
      path: '/strategies',
    },
    {
      icon: Bell,
      label: 'Notifiche',
      path: '/app#reminders',
      onClick: () => {
        navigate('/app');
        // Trigger tab change to reminders
        setTimeout(() => {
          const reminderTab = document.querySelector('[value="reminders"]') as HTMLElement;
          if (reminderTab) reminderTab.click();
        }, 100);
      }
    },
    {
      icon: Settings,
      label: 'Impostazioni',
      path: '/settings',
    }
  ];

  if (isAdmin) {
    mainItems.splice(-1, 0, {
      icon: Users,
      label: 'Utenti',
      path: '/user-management',
    });
  }

  const handleNavigation = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(item.path);
    } else {
      navigate(item.path);
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    if (path.includes('#')) {
      return location.pathname === '/app' && path.includes('reminders');
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 touch-target-lg",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive && "text-primary")} />
              <span className={cn("text-xs font-medium truncate", isActive && "text-primary")}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-2 h-0.5 bg-primary rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;