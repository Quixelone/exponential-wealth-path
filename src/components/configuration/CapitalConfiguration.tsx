
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { DollarSign } from 'lucide-react';

interface CapitalConfigurationProps {
  initialCapital: number;
  onCapitalChange: (capital: number) => void;
}

const CapitalConfiguration: React.FC<CapitalConfigurationProps> = ({
  initialCapital,
  onCapitalChange
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
    <div className="config-card animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 success-gradient rounded-lg flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Capitale Iniziale</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="initial-capital" className="text-sm font-medium text-gray-700">
            Importo: {formatCurrency(initialCapital)}
          </Label>
          <Slider
            id="initial-capital"
            value={[initialCapital]}
            onValueChange={(value) => onCapitalChange(value[0])}
            min={50}
            max={5000}
            step={50}
            className="modern-slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>€50</span>
            <span>€5.000</span>
          </div>
        </div>
        <Input
          type="number"
          value={initialCapital}
          onChange={(e) => onCapitalChange(Number(e.target.value))}
          min={50}
          max={5000}
          step={50}
          className="modern-input"
          placeholder="Inserisci importo"
        />
      </div>
    </div>
  );
};

export default CapitalConfiguration;
