import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import WheelStrategyDashboard from '@/components/wheel-strategy/WheelStrategyDashboard';
import SEO from '@/components/SEO';

export default function WheelStrategy() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <SEO 
        title="Wheel Strategy - Analisi Quantitativa"
        description="Dashboard completa per analisi Wheel Strategy con indicatori tecnici, metriche on-chain e ottimizzazione strike automatica"
      />
      <WheelStrategyDashboard />
    </AppLayout>
  );
}
