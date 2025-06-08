
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            Durata: {timeHorizon} giorni ({Math.round(timeHorizon / 365 * 10) / 10} anni)
          </Label>
          <Slider
            id="time-horizon"
            value={[timeHorizon]}
            onValueChange={(value) => onTimeHorizonChange(value[0])}
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
  );
};

export default TimeHorizonConfiguration;
