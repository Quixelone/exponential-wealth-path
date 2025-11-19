import React, { useState } from 'react';
import { PACConfig } from '@/types/investment';
import PACPaymentModifier from './PACPaymentModifier';
import { PACPaymentTracker } from './PACPaymentTracker';
import { PACConfigSummary } from './PACConfigSummary';
import { PACConfigDialog } from './PACConfigDialog';

interface PACConfigurationProps {
  pacConfig: PACConfig;
  onPACConfigChange: (config: Partial<PACConfig>) => void;
  nextPACInfo?: { nextPACDay: number; description: string };
  currency?: 'EUR' | 'USD' | 'USDT';
  customReturns: { [day: number]: number };
  onUpdateDailyReturn: (day: number, returnRate: number) => void;
  onRemoveDailyReturn: (day: number) => void;
  dailyPACOverrides: { [day: number]: number };
  onUpdatePACForDay: (day: number, pacAmount: number | null) => void;
  onRemovePACOverride: (day: number) => void;
  configId?: string | null;
}

const PACConfiguration: React.FC<PACConfigurationProps> = ({
  pacConfig,
  onPACConfigChange,
  nextPACInfo,
  currency = 'EUR',
  customReturns,
  onUpdateDailyReturn,
  onRemoveDailyReturn,
  dailyPACOverrides,
  onUpdatePACForDay,
  onRemovePACOverride,
  configId
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Calculate overdue payments for summary
  const overduePayments = Object.values(dailyPACOverrides).filter(amount => amount === 0).length;

  const handleSaveConfig = (newConfig: Partial<PACConfig>) => {
    onPACConfigChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* PAC Summary Card */}
      <PACConfigSummary
        pacConfig={pacConfig}
        onOpenDialog={() => setDialogOpen(true)}
        currency={currency}
        nextPACInfo={nextPACInfo}
        overduePayments={overduePayments}
      />

      {/* PAC Configuration Dialog */}
      <PACConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pacConfig={pacConfig}
        onSave={handleSaveConfig}
        currency={currency}
        timeHorizon={365}
      />

      {/* PAC Payment Tracker - Display and track payments */}
      {pacConfig.amount > 0 && pacConfig.startDate && configId && (
        <PACPaymentTracker
          config={{
            pacConfig,
            timeHorizon: 365,
            initialCapital: 0,
            dailyReturnRate: 0,
            currency,
            useRealBTCPrices: false
          }}
          configId={configId}
          dailyPACOverrides={dailyPACOverrides}
          onUpdatePACForDay={onUpdatePACForDay}
        />
      )}
    </div>
  );
};

export default PACConfiguration;
