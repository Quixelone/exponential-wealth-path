import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Settings, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { PACConfig } from '@/types/investment';

interface PACConfigSummaryProps {
  pacConfig: PACConfig;
  onOpenDialog: () => void;
  currency?: 'EUR' | 'USD' | 'USDT';
  nextPACInfo?: { nextPACDay: number; description: string };
  overduePayments?: number;
}

export const PACConfigSummary: React.FC<PACConfigSummaryProps> = ({
  pacConfig,
  onOpenDialog,
  currency = 'EUR',
  nextPACInfo,
  overduePayments = 0
}) => {
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'USDT': return '₮';
      default: return '€';
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'giornaliero';
      case 'weekly': return 'settimana';
      case 'monthly': return 'mese';
      case 'custom': return `${pacConfig.customDays || 1} giorni`;
      default: return frequency;
    }
  };

  const isActive = pacConfig.amount > 0;

  return (
    <Card className="animate-fade-in border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Piano di Accumulo (PAC)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenDialog}
            className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configura
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isActive ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span>💰</span>
                <span>{getCurrencySymbol(currency)}{pacConfig.amount.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  / {getFrequencyLabel(pacConfig.frequency)}
                </span>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <span className="animate-pulse">🟢</span>
                <span className="ml-1">Attivo</span>
              </Badge>
            </div>

            {nextPACInfo && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Prossimo versamento:</span>
                <span className="font-medium">{nextPACInfo.description}</span>
              </div>
            )}

            {pacConfig.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Inizio PAC:</span>
                <span className="font-medium">
                  {format(pacConfig.startDate, "PPP", { locale: it })}
                </span>
              </div>
            )}

            {overduePayments > 0 && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {overduePayments} {overduePayments === 1 ? 'versamento in ritardo' : 'versamenti in ritardo'}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>PAC non configurato</span>
            </div>
            <Badge variant="secondary">
              <span>⚪</span>
              <span className="ml-1">Inattivo</span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
