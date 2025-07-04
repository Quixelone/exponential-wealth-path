import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStrategiesManager } from '@/hooks/useStrategiesManager';
import StrategyPanel from '@/components/strategy/StrategyPanel';

const StrategiesPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const strategiesManager = useStrategiesManager();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Avviso per modifiche non salvate
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (strategiesManager.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [strategiesManager.hasUnsavedChanges]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento strategie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentStrategyName = strategiesManager.currentStrategy?.name || 'Nuova Strategia';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestione Strategie di Investimento
        </h1>
        <p className="text-muted-foreground">
          Crea, modifica e gestisci le tue strategie di investimento personalizzate
        </p>
        {strategiesManager.hasUnsavedChanges && (
          <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-warning-foreground text-sm font-medium">
              ⚠️ Hai modifiche non salvate per "{currentStrategyName}". Ricordati di salvare prima di uscire.
            </p>
          </div>
        )}
      </div>

      {/* Strategy Panel */}
      <div className="animate-fade-in">
        <StrategyPanel strategiesManager={strategiesManager} />
      </div>
    </div>
  );
};

export default StrategiesPage;