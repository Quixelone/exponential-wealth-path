import { Sparkles, Crown, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { SubscriptionTier } from "@/hooks/useSubscriptionGate";

interface UpgradePromptProps {
  tier: SubscriptionTier;
  message?: string;
}

const tierDetails = {
  pro: {
    icon: <Sparkles className="w-5 h-5" />,
    name: 'Pro',
    price: '€29',
    features: [
      'Corsi avanzati sbloccati',
      'Simulazioni illimitate',
      'AI Coach FinGenius',
      'Supporto prioritario'
    ],
    gradient: 'from-primary to-secondary'
  },
  enterprise: {
    icon: <Crown className="w-5 h-5" />,
    name: 'Enterprise',
    price: '€99',
    features: [
      'Tutto di Pro +',
      'Analisi personalizzate',
      'Dashboard avanzate',
      'Supporto dedicato 24/7'
    ],
    gradient: 'from-secondary to-accent'
  }
};

export const UpgradePrompt = ({ tier, message }: UpgradePromptProps) => {
  const navigate = useNavigate();

  if (tier === 'free') return null;

  const details = tierDetails[tier];

  return (
    <Card className={`relative overflow-hidden border-2 bg-gradient-to-br ${details.gradient}`}>
      <div className="absolute inset-0 bg-background/95" />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {details.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">Passa a {details.name}</h3>
              <p className="text-sm text-muted-foreground">{details.price}/mese</p>
            </div>
          </div>
        </div>

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}

        <ul className="space-y-2">
          {details.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>

        <Button 
          className="w-full gap-2"
          onClick={() => navigate('/settings?tab=subscription')}
        >
          Inizia Ora
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
