
import React from 'react';
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
    <div className="config-card animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 warning-gradient rounded-lg flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Rendimento Giornaliero</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="daily-return" className="text-sm font-medium text-gray-700">
            Tasso: {dailyReturnRate.toFixed(3)}% al giorno
          </Label>
          <Slider
            id="daily-return"
            value={[dailyReturnRate]}
            onValueChange={(value) => onReturnRateChange(value[0])}
            min={0.1}
            max={10}
            step={0.01}
            className="modern-slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1%</span>
            <span>10%</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
          <p><strong>Rendimento annuale stimato:</strong> {((1 + dailyReturnRate / 100) ** 365 - 1) * 100}%</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnConfiguration;
