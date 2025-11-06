import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEducation } from '@/hooks/useEducation';
import { BookOpen, Clock, Award, Play, CheckCircle } from 'lucide-react';
import RiskAssessmentQuiz from '@/components/education/RiskAssessmentQuiz';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Education = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, userProgress, loading } = useEducation();
  const [showRiskQuiz, setShowRiskQuiz] = useState(false);
  const [hasRiskProfile, setHasRiskProfile] = useState(false);

  useEffect(() => {
    checkRiskProfile();
  }, [user]);

  const checkRiskProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_risk_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setHasRiskProfile(!!data);
      
      // Show quiz automatically if no profile exists
      if (!data) {
        setShowRiskQuiz(true);
      }
    } catch (error) {
      console.error('Error checking risk profile:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzato';
      default:
        return level;
    }
  };

  if (showRiskQuiz && !hasRiskProfile) {
    return (
      <AppLayout>
        <RiskAssessmentQuiz
          onComplete={() => {
            setHasRiskProfile(true);
            setShowRiskQuiz(false);
          }}
          onSkip={() => setShowRiskQuiz(false)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Centro Educativo</h1>
          <p className="text-muted-foreground">
            Impara le strategie Wheel e migliora le tue competenze di trading
          </p>
        </div>

        {!hasRiskProfile && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Valuta il tuo profilo di rischio
              </CardTitle>
              <CardDescription>
                Completa il questionario per ricevere corsi personalizzati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowRiskQuiz(true)}>
                Inizia Questionario
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nessun corso disponibile al momento
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const progress = userProgress.get(course.id);
              const isStarted = !!progress;
              const isCompleted = progress?.completion_percentage === 100;

              return (
                <Card
                  key={course.id}
                  className="group hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/education/${course.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {getLevelLabel(course.level)}
                      </Badge>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_minutes} min</span>
                      </div>
                    </div>

                    {isStarted ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {Math.round(progress.completion_percentage)}%
                          </span>
                        </div>
                        <Progress value={progress.completion_percentage} />
                        <Button className="w-full mt-4" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Continua
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" variant="outline" size="sm">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Inizia Corso
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Education;
