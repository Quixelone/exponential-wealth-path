
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            Importo: {formatCurrency(initialCapital)}
          </Label>
          <Slider
            id="initial-capital"
            value={[initialCapital]}
            onValueChange={(value) => onCapitalChange(value[0])}
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
          value={initialCapital}
          onChange={(e) => onCapitalChange(Number(e.target.value))}
          min={0}
          step={100}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
};

export default CapitalConfiguration;
