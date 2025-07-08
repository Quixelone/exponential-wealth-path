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
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModernSidebarProps {
  isAdmin?: boolean;
  onNavigate?: (path: string) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ isAdmin, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
      description: 'Dashboard principale'
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
    navigate(path);
    onNavigate?.(path);
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || path.includes(location.pathname);
  };

  return (
    <div className={cn(
      "modern-sidebar flex flex-col bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text-primary">
              Finanza Creativa
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{item.label}</span>
                  {!isActive && (
                    <span className="text-xs opacity-70">{item.description}</span>
                  )}
                </div>
              )}
            </button>
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