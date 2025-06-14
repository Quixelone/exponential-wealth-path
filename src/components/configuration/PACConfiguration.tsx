
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Info } from 'lucide-react';
import { PACConfig } from '@/types/investment';

interface PACConfigurationProps {
  pacConfig: PACConfig;
  onPACConfigChange: (config: Partial<PACConfig>) => void;
  nextPACInfo?: { nextPACDay: number; description: string };
}

const PACConfiguration: React.FC<PACConfigurationProps> = ({
  pacConfig,
  onPACConfigChange,
  nextPACInfo
}) => {
  return (
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
            value={pacConfig.amount}
            onChange={(e) => onPACConfigChange({ amount: Number(e.target.value) })}
            min={0}
            step={10}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pac-frequency">Frequenza Versamenti</Label>
          <Select
            value={pacConfig.frequency}
            onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => 
              onPACConfigChange({ frequency: value })
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

        {pacConfig.frequency === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-days">Ogni N giorni</Label>
            <Input
              id="custom-days"
              type="number"
              value={pacConfig.customDays || 10}
              onChange={(e) => onPACConfigChange({ customDays: Number(e.target.value) })}
              min={1}
              max={365}
            />
          </div>
        )}

        {nextPACInfo && (
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Calendario Versamenti</p>
                <p className="text-blue-700">{nextPACInfo.description}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PACConfiguration;
