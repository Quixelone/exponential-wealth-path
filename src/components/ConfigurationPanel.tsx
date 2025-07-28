
import React, { useState } from 'react';
import { InvestmentConfig } from '@/types/investment';
import { SavedConfiguration } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CapitalConfiguration from './configuration/CapitalConfiguration';
import TimeHorizonConfiguration from './configuration/TimeHorizonConfiguration';
import ReturnConfiguration from './configuration/ReturnConfiguration';
import PACConfiguration from './configuration/PACConfiguration';
import CurrencyConfiguration from './configuration/CurrencyConfiguration';
import ExportSection from './configuration/ExportSection';
import UndoRedoControls from './configuration/UndoRedoControls';
import SaveConfigDialog from './configuration/SaveConfigDialog';
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
  // Strategy management
  currentConfigId?: string | null;
  currentConfigName?: string;
  onSaveStrategy?: (name: string) => void;
  onUpdateStrategy?: (configId: string, name: string) => void;
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
  // Strategy management
  currentConfigId,
  currentConfigName,
  onSaveStrategy,
  onUpdateStrategy,
  // History operations
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [configName, setConfigName] = useState(currentConfigName || '');

  const handleSaveStrategy = () => {
    if (configName.trim() && onSaveStrategy) {
      if (currentConfigId && onUpdateStrategy) {
        onUpdateStrategy(currentConfigId, configName.trim());
      } else {
        onSaveStrategy(configName.trim());
      }
      setSaveDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 h-fit">
      {/* Enhanced Header con titolo configurazione */}
      <Card className="animate-fade-in border-primary/20">
        <CardHeader className="pb-3">
          <div className="space-y-3">
            {/* Titolo configurazione attiva */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-primary">
                  Configurazione Attiva
                </h2>
                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="animate-pulse text-xs">
                    Modificato
                  </Badge>
                )}
              </div>
              
              {/* Save Strategy Button - Mobile optimized */}
              {onSaveStrategy && (
                <Button
                  onClick={() => setSaveDialogOpen(true)}
                  size="sm"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] text-sm"
                  variant={hasUnsavedChanges ? "default" : "outline"}
                >
                  <Save className="h-4 w-4" />
                  Salva
                </Button>
              )}
            </div>

            {/* Strategy Name */}
            {currentConfigName && (
              <div className="text-sm text-muted-foreground">
                Strategia: <span className="font-medium">{currentConfigName}</span>
              </div>
            )}
            
            {/* Sottotitolo configurazione */}
            <CardTitle className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span className="text-base sm:text-lg">Parametri di Configurazione</span>
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
        currency={config.currency || 'EUR'}
        customReturns={customReturns}
        onUpdateDailyReturn={onUpdateDailyReturn}
        onRemoveDailyReturn={onRemoveDailyReturn}
        dailyPACOverrides={dailyPACOverrides}
        onUpdatePACForDay={onUpdatePACForDay}
        onRemovePACOverride={onRemovePACOverride}
      />

      {/* Export */}
      <ExportSection onExportCSV={onExportCSV} />

      {/* Save Strategy Dialog */}
      {onSaveStrategy && (
        <SaveConfigDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          configName={configName}
          setConfigName={setConfigName}
          onSave={handleSaveStrategy}
          loading={false}
          isUpdate={!!currentConfigId}
          hasUnsavedChanges={hasUnsavedChanges}
          currentConfigName={currentConfigName || ''}
          currentConfigId={currentConfigId || null}
        />
      )}
    </div>
  );
};

export default ConfigurationPanel;
