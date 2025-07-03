import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PaymentReminders from '@/components/PaymentReminders';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';

const RemindersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento promemoria...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ModernTooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Promemoria Pagamenti
          </h1>
          <p className="text-slate-600">
            Configura i promemoria per i tuoi pagamenti PAC e altre scadenze importanti
          </p>
        </div>

        {/* Payment Reminders */}
        <div className="animate-fade-in">
          <PaymentReminders />
        </div>
      </div>
    </ModernTooltipProvider>
  );
};

export default RemindersPage;