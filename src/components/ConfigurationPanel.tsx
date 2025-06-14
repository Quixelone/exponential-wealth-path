import React from 'react';
import { InvestmentConfig } from '@/types/investment';
import { SavedConfiguration } from '@/types/database';
import CapitalConfiguration from '@/components/configuration/CapitalConfiguration';
import TimeHorizonConfiguration from '@/components/configuration/TimeHorizonConfiguration';
import ReturnConfiguration from '@/components/configuration/ReturnConfiguration';
import PACConfiguration from '@/components/configuration/PACConfiguration';
import DailyReturnTracker from '@/components/configuration/DailyReturnTracker';
import ExportSection from '@/components/configuration/ExportSection';
import SavedConfigurationsPanel from '@/components/configuration/SavedConfigurationsPanel';

interface ConfigurationPanelProps {
  config: InvestmentConfig;
  onConfigChange: (config: Partial<InvestmentConfig>) => void;
  customReturns: { [day: number]: number };
  onUpdateDailyReturn: (day: number, returnRate: number) => void;
  onRemoveDailyReturn: (day: number) => void;
  onExportCSV: () => void;
  
  // Props per Supabase
  savedConfigs: SavedConfiguration[];
  onLoadConfiguration: (config: SavedConfiguration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onSaveConfiguration: (name: string) => void;
  onUpdateConfiguration: (configId: string, name: string) => void;
  currentConfigId: string | null;
  currentConfigName: string;
  supabaseLoading: boolean;
  isAdmin?: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  customReturns,
  onUpdateDailyReturn,
  onRemoveDailyReturn,
  onExportCSV,
  savedConfigs,
  onLoadConfiguration,
  onDeleteConfiguration,
  onSaveConfiguration,
  onUpdateConfiguration,
  currentConfigId,
  currentConfigName,
  supabaseLoading,
  isAdmin = false
}) => {
  return (
    <div className="space-y-6">
      <SavedConfigurationsPanel
        savedConfigs={savedConfigs}
        onLoadConfiguration={onLoadConfiguration}
        onDeleteConfiguration={onDeleteConfiguration}
        onSaveConfiguration={onSaveConfiguration}
        onUpdateConfiguration={onUpdateConfiguration}
        currentConfigId={currentConfigId}
        currentConfigName={currentConfigName}
        loading={supabaseLoading}
        isAdmin={isAdmin}
      />

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

      <DailyReturnTracker
        timeHorizon={config.timeHorizon}
        customReturns={customReturns}
        onUpdateDailyReturn={onUpdateDailyReturn}
        onRemoveDailyReturn={onRemoveDailyReturn}
      />

      <ExportSection onExportCSV={onExportCSV} />
    </div>
  );
};

export default ConfigurationPanel;
