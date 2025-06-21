
import React from 'react';
import { InvestmentConfig } from '@/types/investment';
import { SavedConfiguration } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save } from 'lucide-react';
import CapitalConfiguration from './configuration/CapitalConfiguration';
import TimeHorizonConfiguration from './configuration/TimeHorizonConfiguration';
import ReturnConfiguration from './configuration/ReturnConfiguration';
import PACConfiguration from './configuration/PACConfiguration';
import CurrencyConfiguration from './configuration/CurrencyConfiguration';
import SavedConfigurationsPanel from './configuration/SavedConfigurationsPanel';
import NewConfigurationButton from './configuration/NewConfigurationButton';
import ExportSection from './configuration/ExportSection';
import { Badge } from '@/components/ui/badge';

interface ConfigurationPanelProps {
  config: InvestmentConfig;
  onConfigChange: (newConfig: Partial<InvestmentConfig>, reset?: boolean) => void;
  customReturns: { [day: number]: number };
  onUpdateDailyReturn: (day: number, returnRate: number) => void;
  onRemoveDailyReturn: (day: number) => void;
  onExportCSV: () => void;
  savedConfigs: SavedConfiguration[];
  onLoadConfiguration: (config: SavedConfiguration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onSaveConfiguration: (name: string) => void;
  onUpdateConfiguration: (configId: string, name: string) => void;
  currentConfigId: string | null;
  currentConfigName: string;
  supabaseLoading: boolean;
  isAdmin?: boolean;
  dailyPACOverrides: { [day: number]: number };
  onUpdatePACForDay: (day: number, pacAmount: number) => void;
  onRemovePACOverride: (day: number) => void;
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
  dailyPACOverrides,
  onUpdatePACForDay,
  onRemovePACOverride,
  hasUnsavedChanges = false,
}) => {
  return (
    <div className="space-y-6 h-fit">
      {/* Header con stato configurazione */}
      <Card className="animate-fade-in border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Configurazione</span>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Non salvato
                </Badge>
              )}
              {currentConfigId && !hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Salvato
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <CapitalConfiguration
              value={config.initialCapital}
              onChange={(value) => onConfigChange({ initialCapital: value })}
              currency={config.currency || 'EUR'}
            />
            <TimeHorizonConfiguration
              value={config.timeHorizon}
              onChange={(value) => onConfigChange({ timeHorizon: value }, true)}
            />
            <ReturnConfiguration
              value={config.dailyReturnRate}
              onChange={(value) => onConfigChange({ dailyReturnRate: value })}
            />
            <CurrencyConfiguration
              value={config.currency || 'EUR'}
              onChange={(value) => onConfigChange({ currency: value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurazione PAC */}
      <PACConfiguration
        pacConfig={config.pacConfig}
        onPACConfigChange={(pacConfig) => onConfigChange({ pacConfig }, true)}
        currency={config.currency || 'EUR'}
      />

      {/* Nuova Configurazione */}
      <NewConfigurationButton />

      {/* Configurazioni Salvate */}
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

      {/* Export */}
      <ExportSection onExportCSV={onExportCSV} />
    </div>
  );
};

export default ConfigurationPanel;
