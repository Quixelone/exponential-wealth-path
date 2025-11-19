import { ModernDashboardSidebar } from './ModernDashboardSidebar';
import { ModernDashboardHeader } from './ModernDashboardHeader';
import { StatsCards } from './StatsCards';
import { IncomeCard } from './IncomeCard';
import { DistributionChart } from './DistributionChart';
import { PerformanceCard } from './PerformanceCard';
import { TrendChart } from './TrendChart';
import { RecentTransactions } from './RecentTransactions';
import { useTheme } from '@/contexts/ThemeContext';

export const ModernDashboardLayout = () => {
  const { effectiveTheme } = useTheme();

  return (
    <div className={`min-h-screen w-full ${effectiveTheme === 'dark' ? 'modern-bg-dark' : 'modern-bg-light'}`}>
      <div className="flex">
        {/* Sidebar */}
        <ModernDashboardSidebar />
        
        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <ModernDashboardHeader />
          
          {/* Content */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column (Stats + Charts) */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <StatsCards />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <DistributionChart />
                  <PerformanceCard />
                </div>
                <TrendChart />
              </div>
              
              {/* Right Column (Income + Transactions) */}
              <div className="space-y-4 md:space-y-6">
                <IncomeCard />
                <RecentTransactions />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
