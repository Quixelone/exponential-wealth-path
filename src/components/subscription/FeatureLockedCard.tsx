import { Lock, Sparkles, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { SubscriptionTier } from "@/hooks/useSubscriptionGate";

interface FeatureLockedCardProps {
  feature: string;
  description: string;
  requiredTier: SubscriptionTier;
}

const tierLabels: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: null,
  pro: <Sparkles className="w-4 h-4" />,
  enterprise: <Crown className="w-4 h-4" />,
};

export const FeatureLockedCard = ({ feature, description, requiredTier }: FeatureLockedCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden border-2 border-dashed border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
      
      <div className="relative p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{feature}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <Badge variant="outline" className="gap-2">
          {tierIcons[requiredTier]}
          Richiede {tierLabels[requiredTier]}
        </Badge>

        <Button 
          size="lg" 
          className="w-full"
          onClick={() => navigate('/settings?tab=subscription')}
        >
          Sblocca con {tierLabels[requiredTier]}
        </Button>
      </div>
    </Card>
  );
};
