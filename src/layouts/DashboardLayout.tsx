import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header fisso */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex pt-16"> {/* pt-16 per compensare header fisso */}
        {/* Sidebar Desktop */}
        <div className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 transition-all duration-300",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64"
        )}>
          <DashboardSidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Sidebar Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 pt-16">
              <DashboardSidebar 
                mobile 
                onClose={() => setSidebarOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          "lg:pl-64", // Spazio per sidebar desktop
          sidebarCollapsed && "lg:pl-16" // Spazio ridotto quando collapsed
        )}>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;