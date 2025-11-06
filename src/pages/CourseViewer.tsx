import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEducation, Course, CourseModule, Lesson } from '@/hooks/useEducation';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle, Circle, Play, BookOpen, Clock } from 'lucide-react';
import LessonViewer from '@/components/education/LessonViewer';
import { toast } from 'sonner';

const CourseViewer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { userProgress, startCourse, updateProgress, completeLesson } = useEducation();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Map<string, Lesson[]>>(new Map());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);

      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('educational_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Load lessons for each module
      const lessonsMap = new Map<string, Lesson[]>();
      for (const module of modulesData || []) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });

        if (lessonsData) {
          lessonsMap.set(module.id, lessonsData);
        }
      }
      setLessonsByModule(lessonsMap);

      // Load completed lessons
      const { data: completionsData } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (completionsData) {
        setCompletedLessons(new Set(completionsData.map(c => c.lesson_id)));
      }

      // Start course if not started
      const progress = userProgress.get(courseId);
      if (!progress) {
        await startCourse(courseId);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      toast.error('Errore nel caricamento del corso');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    let totalLessons = 0;
    lessonsByModule.forEach(lessons => {
      totalLessons += lessons.length;
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  const handleLessonComplete = async (lessonId: string, timeSpent: number) => {
    await completeLesson(lessonId, timeSpent);
    setCompletedLessons(prev => new Set(prev).add(lessonId));
    
    // Update course progress
    if (courseId) {
      const newProgress = calculateProgress();
      await updateProgress(courseId, newProgress);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Corso non trovato</p>
          <Button onClick={() => navigate('/education')} className="mt-4">
            Torna ai Corsi
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (currentLesson) {
    return (
      <AppLayout>
        <LessonViewer
          lesson={currentLesson}
          onComplete={(timeSpent) => handleLessonComplete(currentLesson.id, timeSpent)}
          onBack={() => setCurrentLesson(null)}
        />
      </AppLayout>
    );
  }

  const progress = calculateProgress();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/education')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai Corsi
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{course.level}</Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_minutes} min</span>
                  </div>
                </div>
                <CardTitle className="text-3xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso Corso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {modules.map((module) => {
                    const lessons = lessonsByModule.get(module.id) || [];
                    const completedCount = lessons.filter(l => completedLessons.has(l.id)).length;

                    return (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                              {module.order_index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {completedCount} / {lessons.length} lezioni completate
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {lessons.map((lesson) => {
                              const isCompleted = completedLessons.has(lesson.id);
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                                  onClick={() => setCurrentLesson(lesson)}
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium group-hover:text-primary transition-colors">
                                      {lesson.title}
                                    </p>
                                    {lesson.estimated_duration_minutes && (
                                      <p className="text-sm text-muted-foreground">
                                        {lesson.estimated_duration_minutes} min
                                      </p>
                                    )}
                                  </div>
                                  <Play className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Il Tuo Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {progress}%
                  </div>
                  <p className="text-sm text-muted-foreground">Completato</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lezioni completate</span>
                    <span className="font-medium">{completedLessons.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Totale lezioni</span>
                    <span className="font-medium">
                      {Array.from(lessonsByModule.values()).reduce((acc, l) => acc + l.length, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {course.prerequisites && course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prerequisiti</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CourseViewer;
