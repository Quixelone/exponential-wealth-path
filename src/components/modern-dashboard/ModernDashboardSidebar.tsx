import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard-v2', color: 'text-[hsl(174,100%,42%)]' },
  { icon: Target, label: 'Strategie', path: '/strategies', color: 'text-primary' },
  { icon: TrendingUp, label: 'Portfolio', path: '/', color: 'text-[hsl(280,65%,60%)]' },
  { icon: Activity, label: 'Operazioni', path: '/dashboard-v2/trades', color: 'text-[hsl(340,82%,60%)]' },
  { icon: PieChart, label: 'Analisi', path: '/dashboard-v2/analytics', color: 'text-warning' },
  { icon: Settings, label: 'Impostazioni', path: '/settings', color: 'text-muted-foreground' },
];

export const ModernDashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border z-50 transition-all duration-300",
          collapsed ? "-translate-x-full md:translate-x-0 md:w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setCollapsed(true)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/10 border-l-4 border-primary text-primary font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    collapsed && "md:justify-center md:px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && item.color)} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Welcome Widget */}
          {!collapsed && (
            <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
              <p className="text-sm font-medium text-foreground mb-1">
                Bentornato! 👋
              </p>
              <p className="text-xs text-muted-foreground">
                Monitora le tue strategie in tempo reale
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-30 md:hidden shadow-lg"
        onClick={() => setCollapsed(false)}
      >
        <LayoutDashboard className="h-5 w-5" />
      </Button>
    </>
  );
};
