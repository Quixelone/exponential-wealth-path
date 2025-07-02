
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Bell,
  TrendingUp 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    description: 'Panoramica principale'
  },
  {
    title: 'Configurazioni',
    url: '/configurations',
    icon: Settings,
    description: 'Gestisci configurazioni'
  },
  {
    title: 'Report',
    url: '/reports', 
    icon: FileText,
    description: 'Analisi dettagliate'
  },
  {
    title: 'Promemoria',
    url: '/reminders',
    icon: Bell,
    description: 'Gestisci pagamenti'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="clean-sidebar">
      <SidebarContent>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-slate-900">Finanza Creativa</h2>
                <p className="text-xs text-slate-500">Dashboard Investimenti</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <div>
                          <span className="font-medium">{item.title}</span>
                          <p className="text-xs opacity-70">{item.description}</p>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
