import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { usePaperTrading } from "@/hooks/usePaperTrading";
import { useGamification } from "@/hooks/useGamification";
import { useBTCPrice } from "@/hooks/useBTCPrice";
import { Mascot } from "./Mascot";
import { toast } from "sonner";

export const TradingSimulator = () => {
  const { portfolio, positions, openPosition, closePosition, loading } = usePaperTrading();
  const { addXP, addBadge } = useGamification();
  const { price: currentPrice } = useBTCPrice(new Date().toISOString().split('T')[0]);
  
  const [positionType, setPositionType] = useState<'put' | 'call'>('put');
  const [strikePrice, setStrikePrice] = useState('');
  const [premium, setPremium] = useState('');
  const [btcAmount, setBtcAmount] = useState('');
  const [mascotMood, setMascotMood] = useState<'normal' | 'disappointed' | 'excited'>('normal');
  const [mascotMessage, setMascotMessage] = useState('');

  useEffect(() => {
    if (currentPrice) {
      setStrikePrice(currentPrice.toString());
    }
  }, [currentPrice]);

  const handleOpenPosition = async () => {
    if (!strikePrice || !premium || !btcAmount) {
      toast.error("Compila tutti i campi!");
      return;
    }

    await openPosition(
      positionType,
      parseFloat(strikePrice),
      parseFloat(premium),
      parseFloat(btcAmount)
    );

    await addXP(50, "Posizione aperta");
    
    if (positions.length === 0) {
      await addBadge("Paper Trader");
    }

    setMascotMood('normal');
    setMascotMessage('Ottimo! La tua posizione è aperta. Ora monitora il prezzo di BTC!');
    
    // Reset form
    setPremium('');
    setBtcAmount('');
  };

  const handleClosePosition = async (positionId: string) => {
    if (!currentPrice) {
      toast.error("Impossibile ottenere il prezzo corrente");
      return;
    }

    const profitLoss = await closePosition(positionId, currentPrice);
    
    if (profitLoss !== undefined) {
      const position = positions.find(p => p.id === positionId);
      const profitPercentage = position ? (profitLoss / position.premium_collected) * 100 : 0;

      if (profitLoss > 0) {
        await addXP(100, "Posizione chiusa in profitto");
        
        if (profitPercentage >= 80) {
          setMascotMood('excited');
          setMascotMessage('INCREDIBILE! Hai chiuso con un profitto eccellente!');
          await addXP(100, "Profitto eccellente");
        } else {
          setMascotMood('normal');
          setMascotMessage('Bene! Posizione chiusa in profitto!');
        }

        // Check for Profitable Trader badge
        const profitablePositions = positions.filter(
          p => p.status === 'closed' && (p.profit_loss || 0) > 0
        ).length;
        
        if (profitablePositions >= 2) {
          await addBadge("Profitable Trader");
        }
      } else {
        setMascotMood('disappointed');
        setMascotMessage('Non preoccuparti! Le perdite fanno parte del trading. Impara e migliora!');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const openPositions = positions.filter(p => p.status === 'open');
  const closedPositions = positions.filter(p => p.status === 'closed').slice(0, 10);

  return (
    <div className="min-h-screen bg-background p-6">
      <Mascot mood={mascotMood} message={mascotMessage} />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Simulatore Paper Trading</h1>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance USDT</p>
                <p className="text-3xl font-bold">${portfolio?.balance_usdt.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profitto/Perdita</p>
                <p className={`text-3xl font-bold ${(portfolio?.total_profit_loss || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${portfolio?.total_profit_loss.toFixed(2)}
                </p>
              </div>
              {(portfolio?.total_profit_loss || 0) >= 0 ? (
                <TrendingUp className="w-12 h-12 text-success opacity-20" />
              ) : (
                <TrendingDown className="w-12 h-12 text-destructive opacity-20" />
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">BTC Price</p>
                <p className="text-3xl font-bold">${currentPrice?.toFixed(2)}</p>
              </div>
              <Target className="w-12 h-12 text-secondary opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Position Form */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Apri Nuova Posizione</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Tipo Posizione</Label>
                <RadioGroup value={positionType} onValueChange={(value: any) => setPositionType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="put" id="put" />
                    <Label htmlFor="put">PUT (Vendi sotto strike)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="call" id="call" />
                    <Label htmlFor="call">CALL (Vendi sopra strike)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="strike">Strike Price (USD)</Label>
                <Input
                  id="strike"
                  type="number"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  placeholder="50000"
                />
              </div>

              <div>
                <Label htmlFor="premium">Premium Collected (USDT)</Label>
                <Input
                  id="premium"
                  type="number"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="btc">BTC Amount</Label>
                <Input
                  id="btc"
                  type="number"
                  step="0.01"
                  value={btcAmount}
                  onChange={(e) => setBtcAmount(e.target.value)}
                  placeholder="0.01"
                />
              </div>

              <Button onClick={handleOpenPosition} className="w-full" size="lg">
                Apri Posizione {positionType.toUpperCase()}
              </Button>
            </div>
          </Card>

          {/* Open Positions */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Posizioni Aperte</h2>
            
            <div className="space-y-3">
              {openPositions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nessuna posizione aperta
                </p>
              ) : (
                openPositions.map((position) => (
                  <Card key={position.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={position.position_type === 'put' ? 'default' : 'secondary'}>
                        {position.position_type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(position.open_date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Strike:</span>
                        <span className="font-semibold">${position.strike_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Premium:</span>
                        <span className="font-semibold">${position.premium_collected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BTC:</span>
                        <span className="font-semibold">{position.btc_amount}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleClosePosition(position.id)}
                      variant="outline"
                      className="w-full mt-3"
                      size="sm"
                    >
                      Chiudi Posizione
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Closed Positions History */}
        {closedPositions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Storico Posizioni Chiuse</h2>
            
            <div className="space-y-2">
              {closedPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={position.position_type === 'put' ? 'default' : 'secondary'}>
                      {position.position_type.toUpperCase()}
                    </Badge>
                    <div className="text-sm">
                      <div>Strike: ${position.strike_price.toFixed(2)}</div>
                      <div className="text-muted-foreground">
                        Chiusa: {position.close_date && new Date(position.close_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-lg font-bold ${(position.profit_loss || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(position.profit_loss || 0) >= 0 ? '+' : ''}${position.profit_loss?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
