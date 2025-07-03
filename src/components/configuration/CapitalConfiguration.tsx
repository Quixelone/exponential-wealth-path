
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { DollarSign } from 'lucide-react';
import { formatCurrencyWhole, Currency } from '@/lib/utils';

interface CapitalConfigurationProps {
  initialCapital: number;
  currency: Currency;
  onCapitalChange: (capital: number) => void;
}

const CapitalConfiguration: React.FC<CapitalConfigurationProps> = ({
  initialCapital,
  currency,
  onCapitalChange
}) => {
  return (
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
            Importo: {formatCurrencyWhole(initialCapital, currency)}
          </Label>
          <Slider
            id="initial-capital"
            value={[initialCapital]}
            onValueChange={(value) => onCapitalChange(value[0])}
            min={50}
            max={5000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrencyWhole(50, currency)}</span>
            <span>{formatCurrencyWhole(5000, currency)}</span>
          </div>
        </div>
        <Input
          type="number"
          value={initialCapital}
          onChange={(e) => {
            console.log('🔧 Capital change:', e.target.value);
            onCapitalChange(Number(e.target.value));
          }}
          min={50}
          max={5000}
          step={50}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};

export default CapitalConfiguration;
