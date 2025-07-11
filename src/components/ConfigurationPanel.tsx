
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
import ExportSection from './configuration/ExportSection';
import UndoRedoControls from './configuration/UndoRedoControls';
import { Badge } from '@/components/ui/badge';

interface ConfigurationPanelProps {
  config: InvestmentConfig;
  onConfigChange: (newConfig: Partial<InvestmentConfig>, reset?: boolean) => void;
  customReturns: { [day: number]: number };
  onUpdateDailyReturn: (day: number, returnRate: number) => void;
  onRemoveDailyReturn: (day: number) => void;
  onExportCSV: () => void;
  isAdmin?: boolean;
  dailyPACOverrides: { [day: number]: number };
  onUpdatePACForDay: (day: number, pacAmount: number) => void;
  onRemovePACOverride: (day: number) => void;
  hasUnsavedChanges?: boolean;
  // History operations
  onUndo?: () => any;
  onRedo?: () => any;
  canUndo?: boolean;
  canRedo?: boolean;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onConfigChange,
  customReturns,
  onUpdateDailyReturn,
  onRemoveDailyReturn,
  onExportCSV,
  isAdmin = false,
  dailyPACOverrides,
  onUpdatePACForDay,
  onRemovePACOverride,
  hasUnsavedChanges = false,
  // History operations
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {

  return (
    <div className="space-y-6 h-fit">
      {/* Enhanced Header con titolo configurazione */}
      <Card className="animate-fade-in border-primary/20">
        <CardHeader className="pb-3">
          <div className="space-y-3">
            {/* Titolo configurazione attiva */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-primary">
                  Configurazione Attiva
                </h2>
              </div>
              
              {/* Undo/Redo Controls */}
              {onUndo && onRedo && (
                <UndoRedoControls
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={onUndo}
                  onRedo={onRedo}
                />
              )}
            </div>
            
            {/* Sottotitolo configurazione */}
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Parametri di Configurazione</span>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <CapitalConfiguration
              initialCapital={config.initialCapital}
              onCapitalChange={(value) => onConfigChange({ initialCapital: value })}
              currency={config.currency || 'EUR'}
            />
            <TimeHorizonConfiguration
              timeHorizon={config.timeHorizon}
              onTimeHorizonChange={(value) => onConfigChange({ timeHorizon: value }, true)}
            />
            <ReturnConfiguration
              dailyReturnRate={config.dailyReturnRate || 0}
              onReturnRateChange={(value) => onConfigChange({ dailyReturnRate: value })}
            />
            <CurrencyConfiguration
              selectedCurrency={config.currency || 'EUR'}
              onCurrencyChange={(value) => onConfigChange({ currency: value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurazione PAC */}
      <PACConfiguration
        pacConfig={config.pacConfig}
        onPACConfigChange={(pacConfigUpdate) => onConfigChange({ pacConfig: { ...config.pacConfig, ...pacConfigUpdate } }, true)}
      />

      {/* Export */}
      <ExportSection onExportCSV={onExportCSV} />
    </div>
  );
};

export default ConfigurationPanel;
