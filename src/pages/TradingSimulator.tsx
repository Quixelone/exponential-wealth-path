import { TradingSimulator } from "@/components/education/TradingSimulator";
import AppLayout from "@/components/layout/AppLayout";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import { FeatureLockedCard } from "@/components/subscription/FeatureLockedCard";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";

const TradingSimulatorPage = () => {
  const { hasAccess, upgradeTier } = useSubscriptionGate('unlimited_simulations');

  if (!hasAccess) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <FeatureLockedCard 
              feature="Simulatore Paper Trading"
              description="Pratica con simulazioni illimitate senza rischiare capitale reale"
              requiredTier={upgradeTier!}
            />
            {upgradeTier && (
              <UpgradePrompt 
                tier={upgradeTier} 
                message="Sblocca simulazioni illimitate per perfezionare la tua strategia"
              />
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TradingSimulator />
    </AppLayout>
  );
};

export default TradingSimulatorPage;
