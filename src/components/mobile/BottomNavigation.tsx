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
  activeTab?: string; // For controlling which tab is active in dashboard
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  isAdmin, 
  onStrategiesClick, 
  onNavigate,
  activeTab 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/app',
      id: 'dashboard'
    },
    {
      icon: TrendingUp,
      label: 'Strategie',
      path: '/strategies',
      id: 'strategies'
    },
    {
      icon: Bell,
      label: 'Notifiche',
      path: '/app',
      id: 'reminders',
      onClick: () => {
        navigate('/app');
        // Trigger tab change to reminders after navigation
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
      id: 'settings'
    }
  ];

  if (isAdmin) {
    mainItems.splice(-1, 0, {
      icon: Users,
      label: 'Utenti',
      path: '/user-management',
      id: 'users'
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

  const isActivePath = (item: any) => {
    // Special case: Notifiche is active only when on /app AND activeTab is 'reminders'
    if (item.id === 'reminders') {
      return location.pathname === '/app' && activeTab === 'reminders';
    }
    
    // Dashboard is active only when on /app AND activeTab is NOT 'reminders'
    if (item.id === 'dashboard') {
      return location.pathname === '/app' && activeTab !== 'reminders';
    }
    
    // Other paths: simple match
    return location.pathname === item.path;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around max-w-screen-xl mx-auto">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-3 transition-all duration-200 flex-1 touch-target group",
                "hover:bg-muted/50 active:scale-95",
                isActive && "text-primary"
              )}
            >
              {/* Active indicator bar at top */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              
              <div className={cn(
                "relative transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-105"
              )}>
                <Icon className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                
                {/* Glow effect when active */}
                {isActive && (
                  <div className="absolute inset-0 -z-10 blur-lg bg-primary/30 rounded-full" />
                )}
              </div>
              
              <span className={cn(
                "text-[11px] font-medium transition-colors truncate max-w-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;