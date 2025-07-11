import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  Users, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onStrategiesClick?: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, isAdmin, onStrategiesClick }) => {
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
    navigate(path);
    onClose();
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh] px-0">
        <DrawerHeader className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <DrawerTitle className="gradient-text-primary font-bold text-lg">
              Finanza Creativa
            </DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <nav className="flex-1 px-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left",
                  isActive && !item.isButton
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <Icon className={cn("h-6 w-6", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <div className="flex flex-col">
                  <span className="font-medium text-base">{item.label}</span>
                  <span className="text-sm opacity-70">{item.description}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            © 2024 Finanza Creativa
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;