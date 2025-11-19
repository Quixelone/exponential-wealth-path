import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 'experience',
    question: 'Qual è la tua esperienza con il trading di criptovalute?',
    options: [
      { value: 'none', label: 'Nessuna esperienza', score: 1 },
      { value: 'basic', label: 'Ho fatto qualche operazione', score: 2 },
      { value: 'intermediate', label: 'Trading da 6-12 mesi', score: 3 },
      { value: 'advanced', label: 'Trading da oltre 1 anno', score: 4 },
    ],
  },
  {
    id: 'options_knowledge',
    question: 'Quanto conosci le opzioni e la strategia Wheel?',
    options: [
      { value: 'none', label: 'Non so cosa siano', score: 1 },
      { value: 'heard', label: 'Ne ho sentito parlare', score: 2 },
      { value: 'basic', label: 'Ho studiato i concetti base', score: 3 },
      { value: 'practiced', label: 'Ho già operato con opzioni', score: 4 },
    ],
  },
  {
    id: 'risk_tolerance',
    question: 'Come reagiresti a una perdita del 20% in un mese?',
    options: [
      { value: 'panic', label: 'Venderei immediatamente tutto', score: 1 },
      { value: 'worried', label: 'Mi preoccuperei molto', score: 2 },
      { value: 'calm', label: 'Manterei la calma e aspetterei', score: 3 },
      { value: 'opportunity', label: 'Vedrei un\'opportunità di acquisto', score: 4 },
    ],
  },
  {
    id: 'capital',
    question: 'Quanto capitale pensi di allocare per la Wheel Strategy?',
    options: [
      { value: 'small', label: 'Meno di €1.000', score: 1 },
      { value: 'medium', label: '€1.000 - €5.000', score: 2 },
      { value: 'large', label: '€5.000 - €20.000', score: 3 },
      { value: 'very_large', label: 'Oltre €20.000', score: 4 },
    ],
  },
  {
    id: 'time_commitment',
    question: 'Quanto tempo puoi dedicare settimanalmente al trading?',
    options: [
      { value: 'minimal', label: 'Meno di 1 ora', score: 1 },
      { value: 'few_hours', label: '1-3 ore', score: 2 },
      { value: 'several_hours', label: '3-7 ore', score: 3 },
      { value: 'significant', label: 'Oltre 7 ore', score: 4 },
    ],
  },
];

interface RiskAssessmentQuizProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const RiskAssessmentQuiz = ({ onComplete, onSkip }: RiskAssessmentQuizProps) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const hasAnswer = !!answers[currentQ.id];

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateRiskLevel = () => {
    let totalScore = 0;
    questions.forEach(q => {
      const answer = answers[q.id];
      const option = q.options.find(opt => opt.value === answer);
      if (option) {
        totalScore += option.score;
      }
    });

    const avgScore = totalScore / questions.length;
    
    if (avgScore <= 1.5) return 'conservative';
    if (avgScore <= 2.5) return 'moderate';
    if (avgScore <= 3.5) return 'aggressive';
    return 'expert';
  };

  const submitAssessment = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const riskLevel = calculateRiskLevel();
      const quizResponses = Object.entries(answers).map(([questionId, answer]) => {
        const question = questions.find(q => q.id === questionId);
        return {
          question: question?.question,
          answer: question?.options.find(opt => opt.value === answer)?.label,
        };
      });

      // Call edge function for AI assessment
      const { data: aiData, error: aiError } = await supabase.functions.invoke('assess-risk-profile', {
        body: { 
          quizResponses,
          calculatedRiskLevel: riskLevel
        }
      });

      if (aiError) throw aiError;

      // Save to database
      const { error: dbError } = await supabase
        .from('user_risk_profiles')
        .upsert([{
          user_id: user.id,
          risk_level: riskLevel,
          quiz_responses: answers,
          crypto_experience: answers.experience,
          ai_assessment: aiData
        }], {
          onConflict: 'user_id'
        });

      if (dbError) throw dbError;

      toast.success('Profilo di rischio salvato!');
      onComplete();
    } catch (error) {
      toast.error('Errore nel salvataggio del profilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Valutazione Profilo di Rischio</CardTitle>
          <CardDescription>
            Domanda {currentQuestion + 1} di {questions.length}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
            <RadioGroup
              value={answers[currentQ.id]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={currentQuestion === 0 ? onSkip : handleBack}
              disabled={loading}
            >
              {currentQuestion === 0 ? (
                'Salta'
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Indietro
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasAnswer || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                'Completa'
              ) : (
                <>
                  Avanti
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentQuiz;
