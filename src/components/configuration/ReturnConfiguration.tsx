
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TrendingUp } from 'lucide-react';

interface ReturnConfigurationProps {
  dailyReturnRate: number;
  onReturnRateChange: (rate: number) => void;
}

const ReturnConfiguration: React.FC<ReturnConfigurationProps> = ({
  dailyReturnRate = 0,
  onReturnRateChange
}) => {
  // Ensure dailyReturnRate is always a valid number
  const safeReturnRate = typeof dailyReturnRate === 'number' && !isNaN(dailyReturnRate) ? dailyReturnRate : 0;

  return (
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
            Tasso: {safeReturnRate.toFixed(3)}% al giorno
          </Label>
          <Slider
            id="daily-return"
            value={[safeReturnRate]}
            onValueChange={(value) => onReturnRateChange(value[0])}
            min={0.1}
            max={10}
            step={0.01}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.1%</span>
            <span>10%</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <p><strong>Rendimento annuale stimato:</strong> {((1 + safeReturnRate / 100) ** 365 - 1) * 100).toFixed(2)}%</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReturnConfiguration;
