
import React from 'react';
import { InvestmentConfig } from '@/types/investment';
import CapitalConfiguration from '@/components/configuration/CapitalConfiguration';
import TimeHorizonConfiguration from '@/components/configuration/TimeHorizonConfiguration';
import ReturnConfiguration from '@/components/configuration/ReturnConfiguration';
import PACConfiguration from '@/components/configuration/PACConfiguration';
import ExportSection from '@/components/configuration/ExportSection';

interface ConfigurationPanelProps {
  config: InvestmentConfig;
  onConfigChange: (config: Partial<InvestmentConfig>) => void;
  onExportCSV: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onExportCSV
}) => {
  return (
    <div className="space-y-6">
      <CapitalConfiguration
        initialCapital={config.initialCapital}
        onCapitalChange={(capital) => onConfigChange({ initialCapital: capital })}
      />

      <TimeHorizonConfiguration
        timeHorizon={config.timeHorizon}
        onTimeHorizonChange={(timeHorizon) => onConfigChange({ timeHorizon })}
      />

      <ReturnConfiguration
        dailyReturnRate={config.dailyReturnRate}
        onReturnRateChange={(rate) => onConfigChange({ dailyReturnRate: rate })}
      />

      <PACConfiguration
        pacConfig={config.pacConfig}
        onPACConfigChange={(pacConfig) => onConfigChange({ pacConfig: { ...config.pacConfig, ...pacConfig } })}
      />

      <ExportSection onExportCSV={onExportCSV} />
    </div>
  );
};

export default ConfigurationPanel;
