import { ModernDashboardLayout } from '@/components/modern-dashboard/ModernDashboardLayout';
import { SEO } from '@/components/SEO';

const ModernDashboard = () => {
  return (
    <>
      <SEO 
        title="Dashboard Moderna - FinGenius"
        description="Dashboard moderna con statistiche in tempo reale, grafici interattivi e monitoraggio portfolio"
      />
      <ModernDashboardLayout />
    </>
  );
};

export default ModernDashboard;
