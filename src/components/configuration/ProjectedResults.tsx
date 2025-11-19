import React from 'react';
import { InvestmentConfig } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { calculateInvestment } from '@/hooks/investmentCalculationUtils';

interface ProjectedResultsProps {
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  dailyPACOverrides: { [day: number]: number };
}

const ProjectedResults: React.FC<ProjectedResultsProps> = ({
  config,
  dailyReturns,
  dailyPACOverrides
}) => {
  const projectedData = React.useMemo(() => {
    const data = calculateInvestment({
      config,
      dailyReturns,
      dailyPACOverrides
    });
    return data[data.length - 1]; // Final day data
  }, [config, dailyReturns, dailyPACOverrides]);

  // Calculate metrics
  const finalCapital = projectedData?.finalCapital || 0;
  const totalInterest = projectedData?.totalInterest || 0;
  const totalInvested = config.initialCapital + (projectedData?.totalPACInvested || 0);
  const roi = totalInvested > 0 ? ((finalCapital - totalInvested) / totalInvested * 100) : 0;

  // Calculate duration
  const years = Math.floor(config.timeHorizon / 365);
  const months = Math.round((config.timeHorizon % 365) / 30);
  const durationText = years > 0 
    ? `${years} ${years === 1 ? 'anno' : 'anni'}${months > 0 ? ` e ${months} ${months === 1 ? 'mese' : 'mesi'}` : ''}`
    : `${months} ${months === 1 ? 'mese' : 'mesi'}`;

  return (
    <Card className="animate-fade-in border-primary/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Proiezione Finale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Result - Capitale Finale */}
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-muted-foreground mb-1">Capitale Finale Stimato</p>
          <p className="text-3xl sm:text-4xl font-bold text-primary">
            {formatCurrency(finalCapital, config.currency || 'EUR')}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Interesse Totale */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Interesse Generato</span>
            </div>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              +{formatCurrency(totalInterest, config.currency || 'EUR')}
            </p>
          </div>

          {/* Totale Investito */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Totale Investito</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(totalInvested, config.currency || 'EUR')}
            </p>
          </div>
        </div>

        {/* ROI and Duration */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">ROI:</span>
            <span className={`text-lg font-semibold ${roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{durationText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectedResults;
