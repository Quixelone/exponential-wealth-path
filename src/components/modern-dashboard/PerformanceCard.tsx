import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { formatCurrency } from '@/utils/currency';

export const PerformanceCard = () => {
  const { config, summary } = useInvestmentCalculator();
  const { savedConfigs } = useSupabaseConfig();

  const totalGain = summary.current.finalCapital - summary.current.totalInvested;
  const roiPercentage = summary.current.totalInvested > 0 
    ? (totalGain / summary.current.totalInvested) * 100 
    : 0;

  return (
    <div className="modern-card bg-[hsl(174,62%,25%)] dark:bg-[hsl(174,62%,15%)] text-white">
      <h3 className="text-lg font-semibold mb-6">
        Riepilogo Performance
      </h3>

      <div className="space-y-5">
        <div>
          <div className="text-sm text-white/70 mb-1">Strategie Totali</div>
          <div className="text-3xl font-bold">{savedConfigs.length}</div>
        </div>

        <div>
          <div className="text-sm text-white/70 mb-1">Capitale Investito</div>
          <div className="text-2xl font-semibold">
            {formatCurrency(summary.current.totalInvested, config.currency)}
          </div>
        </div>

        <div>
          <div className="text-sm text-white/70 mb-1">Guadagno Totale</div>
          <div className="text-2xl font-semibold">
            {formatCurrency(totalGain, config.currency)}
          </div>
        </div>

        <div className="pt-4 border-t border-white/20">
          <div className="text-sm text-white/70 mb-1">ROI Medio</div>
          <div className="text-xl font-semibold">
            {roiPercentage.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};
