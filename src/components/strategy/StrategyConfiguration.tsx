import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStrategiesManager } from '@/hooks/useStrategiesManager';

interface StrategyConfigurationProps {
  strategiesManager: ReturnType<typeof useStrategiesManager>;
}

const StrategyConfiguration: React.FC<StrategyConfigurationProps> = ({ strategiesManager }) => {
  const { strategyConfig, updateStrategyConfig } = strategiesManager;

  return (
    <div className="space-y-6">
      {/* Configurazioni di Base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="initialCapital">Capitale Iniziale</Label>
          <div className="relative">
            <Input
              id="initialCapital"
              type="number"
              min="0"
              step="100"
              value={strategyConfig.initialCapital}
              onChange={(e) => updateStrategyConfig({ initialCapital: Number(e.target.value) })}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              {strategyConfig.currency}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeHorizon">Orizzonte Temporale</Label>
          <div className="relative">
            <Input
              id="timeHorizon"
              type="number"
              min="1"
              max="10000"
              value={strategyConfig.timeHorizon}
              onChange={(e) => updateStrategyConfig({ timeHorizon: Number(e.target.value) })}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              giorni
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dailyReturnRate">Tasso Rendimento Giornaliero</Label>
          <div className="relative">
            <Input
              id="dailyReturnRate"
              type="number"
              min="0"
              max="100"
              step="0.001"
              value={strategyConfig.dailyReturnRate}
              onChange={(e) => updateStrategyConfig({ dailyReturnRate: Number(e.target.value) })}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Valuta</Label>
          <Select
            value={strategyConfig.currency}
            onValueChange={(value: 'EUR' | 'USD' | 'USDT') => updateStrategyConfig({ currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configurazione PAC */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Configurazione PAC (Piano di Accumulo)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pacAmount">Importo PAC</Label>
            <div className="relative">
              <Input
                id="pacAmount"
                type="number"
                min="0"
                step="10"
                value={strategyConfig.pacConfig.amount}
                onChange={(e) => updateStrategyConfig({ 
                  pacConfig: { 
                    ...strategyConfig.pacConfig, 
                    amount: Number(e.target.value) 
                  } 
                })}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                {strategyConfig.currency}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pacFrequency">Frequenza</Label>
            <Select
              value={strategyConfig.pacConfig.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => 
                updateStrategyConfig({ 
                  pacConfig: { 
                    ...strategyConfig.pacConfig, 
                    frequency: value 
                  } 
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Giornaliera</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="custom">Personalizzata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {strategyConfig.pacConfig.frequency === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDays">Ogni N giorni</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                max="365"
                value={strategyConfig.pacConfig.customDays || 7}
                onChange={(e) => updateStrategyConfig({ 
                  pacConfig: { 
                    ...strategyConfig.pacConfig, 
                    customDays: Number(e.target.value) 
                  } 
                })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pacStartDate">Data Inizio</Label>
            <Input
              id="pacStartDate"
              type="date"
              value={strategyConfig.pacConfig.startDate.toISOString().split('T')[0]}
              onChange={(e) => updateStrategyConfig({ 
                pacConfig: { 
                  ...strategyConfig.pacConfig, 
                  startDate: new Date(e.target.value) 
                } 
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyConfiguration;