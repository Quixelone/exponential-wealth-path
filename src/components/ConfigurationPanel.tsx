
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
import { Settings } from 'lucide-react';

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
      {/* Header */}
      <div className="config-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 success-gradient rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurazione</h2>
            <p className="text-sm text-gray-600">Personalizza i parametri di investimento</p>
          </div>
        </div>

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
      </div>

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
