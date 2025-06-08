
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
  dailyReturnRate,
  onReturnRateChange
}) => {
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
            Tasso: {dailyReturnRate.toFixed(3)}% al giorno
          </Label>
          <Slider
            id="daily-return"
            value={[dailyReturnRate]}
            onValueChange={(value) => onReturnRateChange(value[0])}
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
          <p><strong>Rendimento annuale stimato:</strong> {((1 + dailyReturnRate / 100) ** 365 - 1) * 100}%</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReturnConfiguration;
