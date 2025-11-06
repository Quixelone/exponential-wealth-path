import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  total_xp: number;
  weekly_xp: number;
  level: number;
  badge_count: number;
}

export const useLeaderboard = () => {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);

      // Get current week start
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Load global leaderboard
      const { data: globalData, error: globalError } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .order("total_xp", { ascending: false })
        .limit(100);

      if (globalError) throw globalError;

      // Load weekly leaderboard
      const { data: weeklyData, error: weeklyError } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("week_start", weekStartStr)
        .order("weekly_xp", { ascending: false })
        .limit(100);

      if (weeklyError) throw weeklyError;

      setGlobalLeaderboard(globalData || []);
      setWeeklyLeaderboard(weeklyData || []);
    } catch (error) {
      console.error("Error loading leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    globalLeaderboard,
    weeklyLeaderboard,
    loading,
    reload: loadLeaderboards
  };
};
