import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  History,
  Settings,
  Bell,
  X,
  Target,
  Calculator,
  Briefcase
} from 'lucide-react';

interface DashboardSidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
  onClose?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed = false,
  mobile = false,
  onClose
}) => {
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Panoramica',
      href: '/',
      icon: BarChart3,
      description: 'Dashboard principale'
    },
    {
      title: 'Grafici',
      href: '/charts',
      icon: TrendingUp,
      description: 'Analisi visiva'
    },
    {
      title: 'Storico',
      href: '/history',
      icon: History,
      description: 'Rendimenti storici'
    },
    {
      title: 'Configurazioni',
      href: '/configurations',
      icon: Calculator,
      description: 'Parametri investimento'
    },
    {
      title: 'Strategie',
      href: '/strategies',
      icon: Briefcase,
      description: 'Strategie investimento'
    },
    {
      title: 'Promemoria',
      href: '/reminders',
      icon: Bell,
      description: 'Pagamenti PAC'
    },
    {
      title: 'Impostazioni',
      href: '/settings',
      icon: Settings,
      description: 'Preferenze utente'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={cn(
      "bg-white border-r border-slate-200 h-full flex flex-col",
      mobile && "shadow-lg"
    )}>
      {/* Mobile Header */}
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold text-slate-900">Menu</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-slate-100 hover:text-slate-900",
                active 
                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                  : "text-slate-600",
                collapsed && !mobile && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                active ? "text-blue-600" : "text-slate-500"
              )} />
              
              {(!collapsed || mobile) && (
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {!collapsed && (
                    <span className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      {(!collapsed || mobile) && (
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 text-center">
            Finanza Creativa v2.0
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;