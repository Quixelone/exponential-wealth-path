import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration_minutes: number;
  thumbnail_url?: string;
  prerequisites?: string[];
  is_published: boolean;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content?: string;
  video_url?: string;
  lesson_type: 'text' | 'video' | 'interactive' | 'practical' | 'quiz';
  order_index: number;
  estimated_duration_minutes?: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  completion_percentage: number;
  started_at: string;
  completed_at?: string;
  last_accessed_at?: string;
}

export const useEducation = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCourses();
      loadUserProgress();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('educational_courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Errore nel caricamento dei corsi');
    }
  };

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map<string, UserProgress>();
      data?.forEach(progress => {
        progressMap.set(progress.course_id, progress);
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          course_id: courseId,
          completion_percentage: 0,
          started_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUserProgress(prev => new Map(prev).set(courseId, data));
      toast.success('Corso iniziato!');
      return data;
    } catch (error) {
      console.error('Error starting course:', error);
      toast.error('Errore nell\'avvio del corso');
    }
  };

  const updateProgress = async (courseId: string, percentage: number) => {
    if (!user) return;

    try {
      const progressRecord = userProgress.get(courseId);
      
      if (!progressRecord) {
        await startCourse(courseId);
        return;
      }

      const updates: any = {
        completion_percentage: percentage,
        last_accessed_at: new Date().toISOString()
      };

      if (percentage >= 100 && !progressRecord.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('id', progressRecord.id)
        .select()
        .single();

      if (error) throw error;

      setUserProgress(prev => new Map(prev).set(courseId, data));
      
      if (percentage >= 100) {
        toast.success('Corso completato! 🎉');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const completeLesson = async (lessonId: string, timeSpent?: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_completions')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          time_spent_seconds: timeSpent
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const loadCourseModules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading modules:', error);
      return [];
    }
  };

  const loadModuleLessons = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading lessons:', error);
      return [];
    }
  };

  return {
    courses,
    userProgress,
    loading,
    startCourse,
    updateProgress,
    completeLesson,
    loadCourseModules,
    loadModuleLessons,
    refreshCourses: loadCourses,
    refreshProgress: loadUserProgress
  };
};
