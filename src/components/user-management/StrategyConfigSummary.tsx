import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvestmentConfig } from '@/types/investment';
import { Calendar, DollarSign, TrendingUp, Repeat, Coins } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface StrategyConfigSummaryProps {
  config: InvestmentConfig;
  strategyName: string;
}

export const StrategyConfigSummary = ({ config, strategyName }: StrategyConfigSummaryProps) => {
  const formatFrequency = (freq: string) => {
    const map: Record<string, string> = {
      daily: 'Giornaliero',
      weekly: 'Settimanale',
      monthly: 'Mensile',
      custom: 'Personalizzato',
    };
    return map[freq] || freq;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Configurazione Strategia</h3>
          <Badge variant="outline">{strategyName}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Capitale iniziale
            </div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(config.initialCapital, config.currency)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Orizzonte temporale
            </div>
            <p className="text-lg font-semibold text-foreground">
              {config.timeHorizon} giorni
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Ritorno giornaliero
            </div>
            <p className="text-lg font-semibold text-foreground">
              {config.dailyReturnRate.toFixed(3)}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" />
              Valuta
            </div>
            <p className="text-lg font-semibold text-foreground">
              {config.currency}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Configurazione PAC</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Importo PAC
              </div>
              <p className="text-base font-semibold text-foreground">
                {formatCurrency(config.pacConfig.amount, config.currency)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Repeat className="h-4 w-4" />
                Frequenza
              </div>
              <p className="text-base font-semibold text-foreground">
                {formatFrequency(config.pacConfig.frequency)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data inizio PAC
              </div>
              <p className="text-base font-semibold text-foreground">
                {new Date(config.pacConfig.startDate).toLocaleDateString('it-IT')}
              </p>
            </div>

            {config.pacConfig.frequency === 'custom' && config.pacConfig.customDays && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Giorni personalizzati
                </div>
                <p className="text-base font-semibold text-foreground">
                  Ogni {config.pacConfig.customDays} giorni
                </p>
              </div>
            )}
          </div>

          {config.useRealBTCPrices && (
            <div className="mt-4 flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                Prezzi BTC Reali Attivi
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
