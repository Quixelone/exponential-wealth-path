
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, Plus } from 'lucide-react';
import PaymentReminders from '@/components/PaymentReminders';

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          Promemoria Pagamenti
        </h1>
        <p className="text-slate-600 mt-1">
          Gestisci i tuoi promemoria per i pagamenti periodici
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="clean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Promemoria Attivi
            </CardTitle>
            <Bell className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              0
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Notifiche programmate
            </p>
          </CardContent>
        </Card>

        <Card className="clean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Prossimo Pagamento
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900">
              -
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Nessun pagamento programmato
            </p>
          </CardContent>
        </Card>

        <Card className="clean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Azioni Rapide
            </CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
              Nuovo Promemoria
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Reminders Component */}
      <Card className="clean-card">
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
