import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bell, 
  Settings, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModernSidebarProps {
  isAdmin?: boolean;
  onNavigate?: (path: string) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  onStrategiesClick?: () => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ isAdmin, onNavigate, onCollapseChange, onStrategiesClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
      description: 'Dashboard principale'
    },
    {
      icon: Bot,
      label: 'AI Signals',
      path: '/ai-signals',
      description: 'Segnali AI Trading'
    },
    {
      icon: TrendingUp,
      label: 'Strategie',
      path: '/strategies',
      description: 'Gestione strategie',
      isButton: true
    },
    {
      icon: Settings,
      label: 'Impostazioni',
      path: '/settings',
      description: 'Configurazioni sistema'
    }
  ];

  if (isAdmin) {
    menuItems.splice(-1, 0, {
      icon: Users,
      label: 'Utenti',
      path: '/user-management',
      description: 'Gestione utenti'
    });
  }

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || path.includes(location.pathname);
  };

  return (
    <div className={cn(
      "modern-sidebar flex flex-col bg-card border-r border-border transition-all duration-300 fixed left-0 top-0 h-full z-20",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-border transition-all duration-300",
        collapsed ? "justify-center p-2" : "justify-between p-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              Finanza Creativa
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapseToggle}
          className={cn(
            "hover:bg-accent transition-all duration-200",
            collapsed ? "absolute -right-3 top-4 bg-card border border-border shadow-md rounded-full w-6 h-6 p-0 z-10" : ""
          )}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-2 transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200 group relative",
                  collapsed ? "p-3 justify-center" : "gap-3 p-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <Icon className={cn(
                  "transition-colors flex-shrink-0",
                  collapsed ? "h-5 w-5" : "h-5 w-5",
                  isActive 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground group-hover:text-accent-foreground"
                )} />
                {!collapsed && (
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-medium text-sm truncate">{item.label}</span>
                    {!isActive && (
                      <span className="text-xs opacity-70 truncate">{item.description}</span>
                    )}
                  </div>
                )}
              </button>
              
              {/* Tooltip per collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-md border">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            © 2024 Finanza Creativa
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSidebar;