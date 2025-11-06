import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Flame, Award, TrendingUp, Target } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { usePaperTrading } from "@/hooks/usePaperTrading";

export const EducationDashboard = () => {
  const { gamificationData, loading: gamificationLoading } = useGamification();
  const { portfolio, positions, loading: portfolioLoading } = usePaperTrading();

  if (gamificationLoading || portfolioLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const levelProgress = gamificationData ? (gamificationData.xp % 1000) / 1000 * 100 : 0;
  const openPositions = positions.filter(p => p.status === 'open').length;
  const closedPositions = positions.filter(p => p.status === 'closed').length;
  const badges = Array.isArray(gamificationData?.badges) ? gamificationData.badges : [];

  const availableBadges = [
    { name: "First Steps", icon: "🎯", earned: badges.includes("First Steps"), description: "Complete la prima lezione" },
    { name: "Quick Learner", icon: "⚡", earned: badges.includes("Quick Learner"), description: "Completa 5 lezioni in un giorno" },
    { name: "Perfect Score", icon: "💯", earned: badges.includes("Perfect Score"), description: "Ottieni 100% in un quiz" },
    { name: "Streak Master", icon: "🔥", earned: badges.includes("Streak Master"), description: "Raggiungi 7 giorni consecutivi" },
    { name: "Paper Trader", icon: "📊", earned: badges.includes("Paper Trader"), description: "Apri la tua prima posizione" },
    { name: "Profitable Trader", icon: "💰", earned: badges.includes("Profitable Trader"), description: "Chiudi 3 posizioni in profitto" },
    { name: "Risk Manager", icon: "🛡️", earned: badges.includes("Risk Manager"), description: "Completa la lezione sul Risk Management" },
    { name: "Wheel Expert", icon: "⭐", earned: badges.includes("Wheel Expert"), description: "Completa tutte le lezioni" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">La Tua Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">XP Totali</p>
                <p className="text-3xl font-bold">{gamificationData?.xp || 0}</p>
              </div>
              <Star className="w-12 h-12 text-primary opacity-20" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Livello {gamificationData?.level || 1}</span>
                <span>{Math.round(levelProgress)}%</span>
              </div>
              <Progress value={levelProgress} />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Streak</p>
                <p className="text-3xl font-bold">{gamificationData?.streak_days || 0}</p>
              </div>
              <Flame className="w-12 h-12 text-secondary opacity-20" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Giorni consecutivi attivi</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Livello</p>
                <p className="text-3xl font-bold">{gamificationData?.level || 1}</p>
              </div>
              <Trophy className="w-12 h-12 text-success opacity-20" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {1000 - (gamificationData?.xp || 0) % 1000} XP al prossimo livello
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Badge</p>
                <p className="text-3xl font-bold">{badges.length}</p>
              </div>
              <Award className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {availableBadges.length - badges.length} da sbloccare
            </p>
          </Card>
        </div>

        {/* Paper Trading Stats */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Paper Trading Portfolio
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-2xl font-bold text-primary">
                ${portfolio?.balance_usdt.toFixed(2) || '10,000.00'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Profitto/Perdita</p>
              <p className={`text-2xl font-bold ${(portfolio?.total_profit_loss || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${portfolio?.total_profit_loss.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Posizioni Aperte</p>
              <p className="text-2xl font-bold text-secondary">{openPositions}</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Posizioni Chiuse</p>
              <p className="text-2xl font-bold">{closedPositions}</p>
            </div>
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" />
            I Tuoi Badge
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableBadges.map((badge) => (
              <div
                key={badge.name}
                className={`p-4 rounded-lg text-center transition-all ${
                  badge.earned 
                    ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 scale-105" 
                    : "bg-muted/30 opacity-50 grayscale"
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {badge.earned && (
                  <Badge variant="secondary" className="mt-2">Sbloccato</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
