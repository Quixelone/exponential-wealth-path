import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Bot,
  MessageCircle,
  BookOpen,
  Target,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import btcWheelLogo from '@/assets/btc-wheel-logo.png';

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
      icon: TrendingUp,
      label: 'Strategie',
      path: '/strategies',
      description: 'Gestione strategie',
      isButton: true
    },
    {
      icon: Target,
      label: 'Wheel Strategy',
      path: '/wheel-strategy',
      description: 'Analisi quantitativa'
    },
    {
      icon: Bot,
      label: 'AI Signals',
      path: '/ai-signals',
      description: 'Segnali AI Trading'
    },
    {
      icon: MessageCircle,
      label: 'Coach AI',
      path: '/coach-ai',
      description: 'Il tuo coach personale'
    },
    {
      icon: BookOpen,
      label: 'Educazione',
      path: '/education',
      description: 'Corsi e formazione'
    },
    {
      icon: Mail,
      label: 'Messaggi',
      path: '/messages',
      description: 'Centro notifiche',
      badge: 'NEW'
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
      "flex flex-col bg-dashboard-sidebar border-r border-dashboard-border transition-all duration-300 fixed left-0 top-0 h-full z-20",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-dashboard-border transition-all duration-300",
        collapsed ? "justify-center p-2" : "justify-between p-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={btcWheelLogo} 
              alt="BTCWheel" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-lg text-white truncate">
              BTCWheel
            </span>
          </div>
        )}
        {collapsed && (
          <img 
            src={btcWheelLogo} 
            alt="BTCWheel" 
            className="w-8 h-8 object-contain"
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapseToggle}
          className={cn(
            "hover:bg-dashboard-card text-white/70 hover:text-white transition-all duration-200",
            collapsed ? "absolute -right-3 top-4 bg-dashboard-sidebar border border-dashboard-border shadow-md rounded-full w-6 h-6 p-0 z-10" : ""
          )}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-1 transition-all duration-300",
        collapsed ? "p-2" : "p-3"
      )}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <div 
              key={item.path} 
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                  collapsed ? "p-3 justify-center" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-dashboard-accent-green/20 text-dashboard-accent-green border-l-4 border-dashboard-accent-green" 
                    : "hover:bg-dashboard-card text-white/70 hover:text-white"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "relative z-10 transition-all duration-300",
                  isActive ? "" : "group-hover:scale-110"
                )}>
                  <Icon className={cn(
                    "transition-all duration-300 flex-shrink-0 h-5 w-5",
                    isActive 
                      ? "text-dashboard-accent-green" 
                      : "text-white/60 group-hover:text-white"
                  )} />
                </div>
                
                {/* Text content */}
                {!collapsed && (
                  <div className="flex flex-col items-start min-w-0 relative z-10 flex-1">
                    <div className="flex items-center gap-2 w-full">
                      <span className={cn(
                        "font-medium text-sm truncate transition-all duration-200",
                        isActive ? "text-dashboard-accent-green font-semibold" : ""
                      )}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-dashboard-accent-orange text-white rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-dashboard-card text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap shadow-xl border border-dashboard-border group-hover:translate-x-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-white/60 mt-0.5">{item.description}</div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-dashboard-card" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-dashboard-border">
          <div className="text-xs text-white/40 text-center">
            Made with ❤️ by BTCWheel
          </div>
          <div className="text-xs text-white/30 text-center mt-1">
            © 2024 BTCWheel
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSidebar;