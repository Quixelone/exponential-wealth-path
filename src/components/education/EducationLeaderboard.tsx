import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/contexts/AuthContext";

export const EducationLeaderboard = () => {
  const { globalLeaderboard, weeklyLeaderboard, loading } = useLeaderboard();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const renderLeaderboard = (entries: typeof globalLeaderboard, type: 'global' | 'weekly') => (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = entry.user_id === user?.id;
        
        return (
          <Card
            key={entry.id}
            className={`p-4 transition-all ${
              isCurrentUser 
                ? "border-2 border-primary bg-primary/5 shadow-lg" 
                : "hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12">
                {getMedalIcon(rank)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{entry.username}</p>
                  {isCurrentUser && (
                    <Badge variant="default">Tu</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {type === 'global' ? entry.total_xp : entry.weekly_xp} XP
                  </span>
                  <span>Livello {entry.level}</span>
                  {entry.badge_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {entry.badge_count} badge
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      {entries.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nessun utente in classifica ancora.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Completa le lezioni per essere il primo!
          </p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Classifica</h1>
          <p className="text-muted-foreground">
            Competi con altri studenti e scala la classifica!
          </p>
        </div>

        <Tabs defaultValue="global" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="global">
              <Trophy className="w-4 h-4 mr-2" />
              Globale
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <Star className="w-4 h-4 mr-2" />
              Settimanale
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            {renderLeaderboard(globalLeaderboard, 'global')}
          </TabsContent>

          <TabsContent value="weekly">
            {renderLeaderboard(weeklyLeaderboard, 'weekly')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
