import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Flame, Star, TrendingUp, Award } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useEducation } from "@/hooks/useEducation";
import { Mascot } from "./Mascot";

export const EducationHomePage = () => {
  const navigate = useNavigate();
  const { gamificationData, loading: gamificationLoading, updateStreak } = useGamification();
  const { courses, userProgress, loading: coursesLoading } = useEducation();

  useEffect(() => {
    updateStreak();
  }, []);

  const lessons = [
    { id: 1, title: "Introduction to Bitcoin", status: "completed", xp: 100 },
    { id: 2, title: "Wheel Strategy Basics", status: "completed", xp: 150 },
    { id: 3, title: "Put Options Explained", status: "current", xp: 200 },
    { id: 4, title: "Call Options Explained", status: "locked", xp: 200 },
    { id: 5, title: "Premium Collection", status: "locked", xp: 250 },
    { id: 6, title: "Strike Price Selection", status: "locked", xp: 250 },
    { id: 7, title: "Risk Management", status: "locked", xp: 300 },
    { id: 8, title: "Market Analysis", status: "locked", xp: 300 },
    { id: 9, title: "Position Sizing", status: "locked", xp: 350 },
    { id: 10, title: "Exit Strategies", status: "locked", xp: 350 },
    { id: 11, title: "Portfolio Management", status: "locked", xp: 400 },
    { id: 12, title: "Tax Implications", status: "locked", xp: 400 },
    { id: 13, title: "Advanced Techniques", status: "locked", xp: 500 },
    { id: 14, title: "Paper Trading Practice", status: "locked", xp: 500 },
    { id: 15, title: "Real Trading Preparation", status: "locked", xp: 1000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "current":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "current":
        return "▶";
      default:
        return "🔒";
    }
  };

  if (gamificationLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const progressPercentage = (lessons.filter(l => l.status === "completed").length / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Mascot 
        mood="normal" 
        message="Ciao! Sono qui per guidarti nel tuo percorso di apprendimento sulla Wheel Strategy! 🚀" 
      />
      
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Il Tuo Percorso di Apprendimento</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">{gamificationData?.xp || 0}</div>
                  <div className="text-xs opacity-80">XP Totali</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold">Livello {gamificationData?.level || 1}</div>
                  <div className="text-xs opacity-80">Attuale</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold">{gamificationData?.streak_days || 0}</div>
                  <div className="text-xs opacity-80">Giorni Consecutivi</div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 p-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold">
                    {Array.isArray(gamificationData?.badges) ? gamificationData.badges.length : 0}
                  </div>
                  <div className="text-xs opacity-80">Badge</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Progressione Corso</h2>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {Math.round(progressPercentage)}% Completato
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </Card>

        {/* Lessons Path */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card
              key={lesson.id}
              className={`p-6 transition-all duration-300 ${
                lesson.status === "current" 
                  ? "border-2 border-primary shadow-lg scale-105" 
                  : lesson.status === "locked"
                  ? "opacity-60"
                  : ""
              } ${lesson.status !== "locked" ? "cursor-pointer hover:shadow-xl hover:scale-102" : "cursor-not-allowed"}`}
              onClick={() => {
                if (lesson.status !== "locked") {
                  navigate(`/education/lesson/${lesson.id}`);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getStatusColor(lesson.status)}`}>
                  {getStatusIcon(lesson.status)}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{lesson.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    <span>{lesson.xp} XP</span>
                    {lesson.status === "current" && (
                      <Badge variant="default" className="ml-2">IN CORSO</Badge>
                    )}
                    {lesson.status === "completed" && (
                      <Badge variant="outline" className="ml-2 bg-success/10">COMPLETATA</Badge>
                    )}
                  </div>
                </div>

                {lesson.status !== "locked" && (
                  <Button>
                    {lesson.status === "completed" ? "Rivedi" : "Inizia"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-primary/10 to-primary/5"
            onClick={() => navigate("/education/simulation")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Simulatore Paper Trading</h3>
                <p className="text-sm text-muted-foreground">Pratica senza rischi</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-br from-secondary/10 to-secondary/5"
            onClick={() => navigate("/education/leaderboard")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Classifica</h3>
                <p className="text-sm text-muted-foreground">Vedi il tuo ranking</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
