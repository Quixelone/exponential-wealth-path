
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, Plus } from 'lucide-react';
import PaymentReminders from '@/components/PaymentReminders';

export default function RemindersPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          Promemoria Pagamenti
        </h1>
        <p className="page-subtitle">
          Gestisci i tuoi promemoria per i pagamenti periodici
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Promemoria Attivi
            </CardTitle>
            <Bell className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Notifiche programmate
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Prossimo Pagamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-lg">
              -
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nessun pagamento programmato
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Azioni Rapide
            </CardTitle>
            <Plus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
              Nuovo Promemoria
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Reminders Component */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Gestione Promemoria</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentReminders />
        </CardContent>
      </Card>
    </div>
  );
}
