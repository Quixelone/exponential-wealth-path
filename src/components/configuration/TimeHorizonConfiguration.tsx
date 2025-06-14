
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from 'lucide-react';

interface TimeHorizonConfigurationProps {
  timeHorizon: number;
  onTimeHorizonChange: (timeHorizon: number) => void;
}

const TimeHorizonConfiguration: React.FC<TimeHorizonConfigurationProps> = ({
  timeHorizon,
  onTimeHorizonChange
}) => {
  return (
    <div className="config-card animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 info-gradient rounded-lg flex items-center justify-center">
          <Calendar className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Orizzonte Temporale</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="time-horizon" className="text-sm font-medium text-gray-700">
            Durata: {timeHorizon} giorni ({Math.round(timeHorizon / 365 * 10) / 10} anni)
          </Label>
          <Slider
            id="time-horizon"
            value={[timeHorizon]}
            onValueChange={(value) => onTimeHorizonChange(value[0])}
            min={30}
            max={3650}
            step={30}
            className="modern-slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>30 giorni</span>
            <span>10 anni</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 bg-sky-50 p-4 rounded-xl border border-sky-100">
          <p><strong>Periodo selezionato:</strong> {Math.round(timeHorizon / 30)} mesi</p>
        </div>
      </div>
    </div>
  );
};

export default TimeHorizonConfiguration;
