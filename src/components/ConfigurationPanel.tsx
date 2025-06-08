
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { InvestmentConfig } from '@/types/investment';
import { Settings, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface ConfigurationPanelProps {
  config: InvestmentConfig;
  onConfigChange: (config: Partial<InvestmentConfig>) => void;
  onExportCSV: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onExportCSV
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Capitale Iniziale */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Capitale Iniziale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initial-capital">
              Importo: {formatCurrency(config.initialCapital)}
            </Label>
            <Slider
              id="initial-capital"
              value={[config.initialCapital]}
              onValueChange={(value) => onConfigChange({ initialCapital: value[0] })}
              min={1000}
              max={100000}
              step={500}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€1.000</span>
              <span>€100.000</span>
            </div>
          </div>
          <Input
            type="number"
            value={config.initialCapital}
            onChange={(e) => onConfigChange({ initialCapital: Number(e.target.value) })}
            min={0}
            step={100}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Orizzonte Temporale */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Orizzonte Temporale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="time-horizon">
              Durata: {config.timeHorizon} giorni ({Math.round(config.timeHorizon / 365 * 10) / 10} anni)
            </Label>
            <Slider
              id="time-horizon"
              value={[config.timeHorizon]}
              onValueChange={(value) => onConfigChange({ timeHorizon: value[0] })}
              min={30}
              max={3650}
              step={30}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 giorni</span>
              <span>10 anni</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rendimento */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rendimento Giornaliero
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily-return">
              Tasso: {config.dailyReturnRate.toFixed(3)}% al giorno
            </Label>
            <Slider
              id="daily-return"
              value={[config.dailyReturnRate]}
              onValueChange={(value) => onConfigChange({ dailyReturnRate: value[0] })}
              min={0.001}
              max={0.1}
              step={0.001}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.001%</span>
              <span>0.1%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p><strong>Rendimento annuale stimato:</strong> {((1 + config.dailyReturnRate / 100) ** 365 - 1) * 100}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Configurazione PAC */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Piano di Accumulo (PAC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pac-amount">Importo Rata</Label>
            <Input
              id="pac-amount"
              type="number"
              value={config.pacConfig.amount}
              onChange={(e) => onConfigChange({
                pacConfig: { ...config.pacConfig, amount: Number(e.target.value) }
              })}
              min={0}
              step={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pac-frequency">Frequenza Versamenti</Label>
            <Select
              value={config.pacConfig.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => 
                onConfigChange({
                  pacConfig: { ...config.pacConfig, frequency: value }
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

          {config.pacConfig.frequency === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-days">Ogni N giorni</Label>
              <Input
                id="custom-days"
                type="number"
                value={config.pacConfig.customDays || 10}
                onChange={(e) => onConfigChange({
                  pacConfig: { ...config.pacConfig, customDays: Number(e.target.value) }
                })}
                min={1}
                max={365}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <CardContent className="pt-6">
          <Button onClick={onExportCSV} className="w-full wealth-gradient">
            Esporta Dati CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationPanel;
