import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GamificationData {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string | null;
  badges: any;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    } else {
      setGamificationData(null);
      setLoading(false);
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        // Create initial gamification data
        const { data: newData, error: insertError } = await supabase
          .from("user_gamification")
          .insert({
            user_id: user!.id,
            xp: 0,
            level: 1,
            streak_days: 0,
            badges: []
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setGamificationData(newData);
      } else {
        setGamificationData(data);
      }
    } catch (error) {
      console.error("Error loading gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (xpAmount: number, reason?: string) => {
    if (!user || !gamificationData) return;

    const newXP = gamificationData.xp + xpAmount;
    const newLevel = Math.floor(newXP / 1000) + 1;

    const { error } = await supabase
      .from("user_gamification")
      .update({
        xp: newXP,
        level: newLevel,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error adding XP:", error);
      return;
    }

    setGamificationData({
      ...gamificationData,
      xp: newXP,
      level: newLevel
    });

    toast.success(`+${xpAmount} XP${reason ? ` - ${reason}` : ''}!`);

    if (newLevel > gamificationData.level) {
      toast.success(`🎉 Level Up! You're now Level ${newLevel}!`);
    }

    // Update leaderboard
    await updateLeaderboard(newXP, newLevel);
  };

  const updateStreak = async () => {
    if (!user || !gamificationData) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = gamificationData.last_activity_date;

    if (lastActivity === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newStreak = lastActivity === yesterdayStr 
      ? gamificationData.streak_days + 1 
      : 1;

    const { error } = await supabase
      .from("user_gamification")
      .update({
        streak_days: newStreak,
        last_activity_date: today
      })
      .eq("user_id", user.id);

    if (!error) {
      setGamificationData({
        ...gamificationData,
        streak_days: newStreak,
        last_activity_date: today
      });

      if (newStreak > 1) {
        toast.success(`🔥 ${newStreak} day streak!`);
      }
    }
  };

  const addBadge = async (badgeName: string) => {
    if (!user || !gamificationData) return;

    const currentBadges = Array.isArray(gamificationData.badges) ? gamificationData.badges : [];
    if (currentBadges.includes(badgeName)) return;

    const newBadges = [...currentBadges, badgeName];

    const { error } = await supabase
      .from("user_gamification")
      .update({ badges: newBadges })
      .eq("user_id", user.id);

    if (!error) {
      setGamificationData({
        ...gamificationData,
        badges: newBadges
      });
      toast.success(`🏆 New badge unlocked: ${badgeName}!`);
    }
  };

  const updateLeaderboard = async (totalXP: number, level: number) => {
    if (!user) return;

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const username = profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous'
      : 'Anonymous';

    const currentBadges = Array.isArray(gamificationData?.badges) ? gamificationData.badges : [];
    
    await supabase
      .from("leaderboard_entries")
      .upsert({
        user_id: user.id,
        username,
        total_xp: totalXP,
        level,
        badge_count: currentBadges.length,
        week_start: weekStartStr
      });
  };

  return {
    gamificationData,
    loading,
    addXP,
    updateStreak,
    addBadge,
    reload: loadGamificationData
  };
};
