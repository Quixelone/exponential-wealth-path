
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import { PACConfig } from '@/types/investment';

interface PACConfigurationProps {
  pacConfig: PACConfig;
  onPACConfigChange: (config: Partial<PACConfig>) => void;
}

const PACConfiguration: React.FC<PACConfigurationProps> = ({
  pacConfig,
  onPACConfigChange
}) => {
  return (
    <div className="config-card animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 danger-gradient rounded-lg flex items-center justify-center">
          <Settings className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Piano di Accumulo (PAC)</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pac-amount" className="text-sm font-medium text-gray-700">Importo Rata</Label>
          <Input
            id="pac-amount"
            type="number"
            value={pacConfig.amount}
            onChange={(e) => onPACConfigChange({ amount: Number(e.target.value) })}
            min={0}
            step={10}
            className="modern-input"
            placeholder="€0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pac-frequency" className="text-sm font-medium text-gray-700">Frequenza Versamenti</Label>
          <Select
            value={pacConfig.frequency}
            onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => 
              onPACConfigChange({ frequency: value })
            }
          >
            <SelectTrigger className="modern-input">
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
            <Label htmlFor="custom-days" className="text-sm font-medium text-gray-700">Ogni N giorni</Label>
            <Input
              id="custom-days"
              type="number"
              value={pacConfig.customDays || 10}
              onChange={(e) => onPACConfigChange({ customDays: Number(e.target.value) })}
              min={1}
              max={365}
              className="modern-input"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PACConfiguration;
