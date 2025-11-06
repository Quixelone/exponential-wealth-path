import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Lesson } from '@/hooks/useEducation';
import { toast } from 'sonner';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: (timeSpent: number) => void;
  onBack: () => void;
}

const LessonViewer = ({ lesson, onComplete, onBack }: LessonViewerProps) => {
  const [startTime] = useState(Date.now());
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onComplete(timeSpent);
    setCompleted(true);
    toast.success('Lezione completata!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Torna al Corso
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            {completed && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {lesson.lesson_type === 'video' && lesson.video_url ? (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <iframe
                src={lesson.video_url}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}

          {lesson.content && (
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {lesson.lesson_type === 'interactive' && (
            <div className="p-6 bg-muted rounded-lg">
              <p className="text-center text-muted-foreground">
                Contenuto interattivo in arrivo...
              </p>
            </div>
          )}

          {!completed && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleComplete} size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Segna come Completata
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonViewer;
