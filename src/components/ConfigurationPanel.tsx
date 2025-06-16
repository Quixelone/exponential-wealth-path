
import React from 'react';
import { InvestmentConfig } from '@/types/investment';
import { SavedConfiguration } from '@/types/database';
import { Currency } from '@/lib/utils';
import CapitalConfiguration from '@/components/configuration/CapitalConfiguration';
import TimeHorizonConfiguration from '@/components/configuration/TimeHorizonConfiguration';
import ReturnConfiguration from '@/components/configuration/ReturnConfiguration';
import PACConfiguration from '@/components/configuration/PACConfiguration';
import CurrencyConfiguration from '@/components/configuration/CurrencyConfiguration';
import DailyReturnTracker from '@/components/configuration/DailyReturnTracker';
import ExportSection from '@/components/configuration/ExportSection';
import SavedConfigurationsPanel from '@/components/configuration/SavedConfigurationsPanel';

interface ConfigurationPanelProps {
  config: InvestmentConfig & { currency: Currency };
  onConfigChange: (config: Partial<InvestmentConfig & { currency: Currency }>) => void;
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
  
  // Nuova prop per informazioni PAC
  nextPACInfo?: { nextPACDay: number; description: string };
  
  // NEW PROP
  hasUnsavedChanges?: boolean;
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
  isAdmin = false,
  nextPACInfo,
  hasUnsavedChanges = false
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
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <CurrencyConfiguration
        selectedCurrency={config.currency}
        onCurrencyChange={(currency) => onConfigChange({ currency })}
      />

      <CapitalConfiguration
        initialCapital={config.initialCapital}
        currency={config.currency}
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
        nextPACInfo={nextPACInfo}
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
