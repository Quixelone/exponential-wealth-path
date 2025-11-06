import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Position {
  id: string;
  position_type: 'put' | 'call';
  strike_price: number;
  premium_collected: number;
  btc_amount: number;
  open_date: string;
  close_date?: string;
  close_price?: number;
  profit_loss?: number;
  status: 'open' | 'closed' | 'expired';
}

export interface Portfolio {
  id: string;
  balance_usdt: number;
  total_profit_loss: number;
  positions_opened: number;
  positions_closed: number;
}

export const usePaperTrading = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPortfolio();
      loadPositions();
    }
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("paper_trading_portfolios")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        const { data: newPortfolio, error: insertError } = await supabase
          .from("paper_trading_portfolios")
          .insert({
            user_id: user.id,
            balance_usdt: 10000,
            total_profit_loss: 0,
            positions_opened: 0,
            positions_closed: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPortfolio(newPortfolio);
      } else {
        setPortfolio(data);
      }
    } catch (error) {
      console.error("Error loading portfolio:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("paper_trading_positions")
        .select("*")
        .eq("user_id", user.id)
        .order("open_date", { ascending: false });

      if (error) throw error;
      setPositions((data || []) as Position[]);
    } catch (error) {
      console.error("Error loading positions:", error);
    }
  };

  const openPosition = async (
    type: 'put' | 'call',
    strikePrice: number,
    premium: number,
    btcAmount: number
  ) => {
    if (!user || !portfolio) return;

    try {
      const { data, error } = await supabase
        .from("paper_trading_positions")
        .insert({
          portfolio_id: portfolio.id,
          user_id: user.id,
          position_type: type,
          strike_price: strikePrice,
          premium_collected: premium,
          btc_amount: btcAmount,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("paper_trading_portfolios")
        .update({
          balance_usdt: portfolio.balance_usdt + premium,
          positions_opened: portfolio.positions_opened + 1
        })
        .eq("id", portfolio.id);

      toast.success(`${type.toUpperCase()} position opened!`);
      await loadPortfolio();
      await loadPositions();
    } catch (error) {
      console.error("Error opening position:", error);
      toast.error("Failed to open position");
    }
  };

  const closePosition = async (positionId: string, closePrice: number) => {
    if (!user || !portfolio) return;

    try {
      const position = positions.find(p => p.id === positionId);
      if (!position) return;

      const profitLoss = position.premium_collected - 
        (position.position_type === 'put' && closePrice < position.strike_price
          ? (position.strike_price - closePrice) * position.btc_amount
          : position.position_type === 'call' && closePrice > position.strike_price
          ? (closePrice - position.strike_price) * position.btc_amount
          : 0);

      await supabase
        .from("paper_trading_positions")
        .update({
          close_date: new Date().toISOString(),
          close_price: closePrice,
          profit_loss: profitLoss,
          status: 'closed'
        })
        .eq("id", positionId);

      await supabase
        .from("paper_trading_portfolios")
        .update({
          balance_usdt: portfolio.balance_usdt + profitLoss,
          total_profit_loss: portfolio.total_profit_loss + profitLoss,
          positions_closed: portfolio.positions_closed + 1
        })
        .eq("id", portfolio.id);

      toast.success(profitLoss > 0 ? `Profit: $${profitLoss.toFixed(2)}!` : `Loss: $${Math.abs(profitLoss).toFixed(2)}`);
      await loadPortfolio();
      await loadPositions();

      return profitLoss;
    } catch (error) {
      console.error("Error closing position:", error);
      toast.error("Failed to close position");
    }
  };

  return {
    portfolio,
    positions,
    loading,
    openPosition,
    closePosition,
    reload: () => {
      loadPortfolio();
      loadPositions();
    }
  };
};
