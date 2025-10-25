import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Target, Users, Calendar, Zap, Book, TrendingUp, Award, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FinanzaPointsDemo = () => {
  const mockPoints = 2450;
  const mockLevel = "Advanced";
  const mockProgress = 67;
  const nextMilestone = 2500;
  
  const earningActivities = [
    { icon: Target, label: "Simulazioni giornaliere", points: 50, description: "Completa le operazioni quotidiane" },
    { icon: Book, label: "Quiz settimanali", points: 100, description: "Testa le tue conoscenze" },
    { icon: Users, label: "Webinar live", points: 200, description: "Partecipa alle sessioni formative" },
    { icon: Calendar, label: "Streak 30 giorni", points: 500, description: "Mantieni la costanza" },
    { icon: Zap, label: "Referral amici", points: 300, description: "Invita nuovi utenti" },
  ];

  const rewards = [
    { icon: Book, label: "Modulo Advanced", points: 1000, unlocked: true },
    { icon: TrendingUp, label: "AI Analytics", points: 2500, unlocked: false, next: true },
    { icon: Award, label: "Sessione 1:1", points: 5000, unlocked: false },
  ];

  const stats = [
    { label: "Simulazioni completate", value: 45 },
    { label: "Quiz superati", value: 12 },
    { label: "Giorni streak", value: 23 },
    { label: "Certificati ottenuti", value: 3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Finanza Points™ Demo</h1>
          </div>
          <Link to="/">
            <Button variant="outline">Torna alla Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Main Points Card */}
        <Card className="mb-8 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold mb-2">
              {mockPoints.toLocaleString()} Punti
            </CardTitle>
            <CardDescription className="text-lg">
              Livello: <Badge variant="secondary" className="text-base">{mockLevel}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progresso verso AI Analytics</span>
                <span>{mockProgress}%</span>
              </div>
              <Progress value={mockProgress} className="h-3" />
              <p className="text-xs text-center text-muted-foreground">
                Ti mancano {nextMilestone - mockPoints} punti per sbloccare AI Analytics
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Earning Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Come Guadagnare Punti
              </CardTitle>
              <CardDescription>
                Completa queste attività per accumulare Finanza Points™
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {earningActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <activity.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{activity.label}</p>
                      <Badge variant="secondary">+{activity.points} pt</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Sblocca Ricompense
              </CardTitle>
              <CardDescription>
                Usa i tuoi punti per accedere a contenuti esclusivi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewards.map((reward, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    reward.unlocked
                      ? "bg-primary/5 border-primary/20"
                      : reward.next
                      ? "bg-accent/50 border-accent"
                      : "bg-card/50 opacity-60"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${reward.unlocked ? "bg-primary/20" : "bg-muted"}`}>
                    <reward.icon className={`h-5 w-5 ${reward.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{reward.label}</p>
                    <p className="text-sm text-muted-foreground">{reward.points.toLocaleString()} punti</p>
                  </div>
                  {reward.unlocked && (
                    <Badge variant="default">Sbloccato</Badge>
                  )}
                  {reward.next && (
                    <Badge variant="secondary">Prossimo</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong className="font-semibold">Nota importante:</strong> Finanza Points™ è un sistema di gamification educativa 
            progettato per motivare l'apprendimento. I punti non hanno valore monetario e non costituiscono 
            alcuna forma di assicurazione o garanzia di investimento. Questo è un ambiente formativo per 
            sviluppare competenze nel trading e nella gestione del capitale.
          </AlertDescription>
        </Alert>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              Inizia a Guadagnare Punti
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanzaPointsDemo;
