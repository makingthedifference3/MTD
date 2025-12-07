import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

export const useTaskNotifications = () => {
  const { currentUser } = useAuth();
  const [unseenTasksCount, setUnseenTasksCount] = useState(0);

  const calculateUnseenTasks = async () => {
    if (!currentUser) {
      setUnseenTasksCount(0);
      return;
    }

    try {
      // Fetch tasks assigned to current user (exclude completed tasks)
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, created_at')
        .eq('assigned_to', currentUser.id)
        .eq('is_active', true)
        .neq('status', 'completed'); // Exclude completed tasks from notifications

      if (tasksError) throw tasksError;

      if (!tasks || tasks.length === 0) {
        setUnseenTasksCount(0);
        return;
      }

      // Fetch viewed tasks from database
      const { data: viewedTasks, error: viewsError } = await supabase
        .from('task_views')
        .select('task_id')
        .eq('user_id', currentUser.id);

      if (viewsError) throw viewsError;

      // Create a set of viewed task IDs for quick lookup
      const viewedTaskIds = new Set(
        (viewedTasks || []).map(view => view.task_id)
      );

      // Filter out viewed tasks
      const unseenTasks = tasks.filter(
        task => !viewedTaskIds.has(task.id)
      );

      setUnseenTasksCount(unseenTasks.length);
    } catch (error) {
      console.error('Error calculating unseen tasks:', error);
      setUnseenTasksCount(0);
    }
  };

  const markTaskAsSeen = async (taskId: string) => {
    if (!currentUser) {
      console.warn('Cannot mark task as seen: No current user');
      return;
    }

    console.log('Marking task as seen:', { taskId, userId: currentUser.id });

    try {
      // Insert task view into database (upsert to handle duplicates)
      const { data, error } = await supabase
        .from('task_views')
        .upsert(
          {
            user_id: currentUser.id,
            task_id: taskId,
            viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,task_id',
            ignoreDuplicates: false,
          }
        )
        .select();

      if (error) {
        console.error('Error marking task as seen:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      console.log('Task marked as seen successfully:', data);

      // Update local count immediately for better UX
      setUnseenTasksCount(prev => Math.max(0, prev - 1));
      
      // Recalculate to ensure accuracy
      await calculateUnseenTasks();
    } catch (error) {
      console.error('Exception marking task as seen:', error);
    }
  };

  // Set up real-time subscription for new tasks
  useEffect(() => {
    if (!currentUser) return;

    // Initial calculation
    calculateUnseenTasks();

    // Subscribe to tasks table for new assignments
    const subscription = supabase
      .channel('task_assignments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${currentUser.id}`,
        },
        () => {
          console.log('New task assigned, recalculating unseen count');
          calculateUnseenTasks();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${currentUser.id}`,
        },
        () => {
          console.log('Task updated, recalculating unseen count');
          calculateUnseenTasks();
        }
      )
      .subscribe();

    // Subscribe to task_views table for when tasks are marked as seen
    const viewsSubscription = supabase
      .channel('task_views_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_views',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          console.log('Task marked as seen, recalculating count');
          calculateUnseenTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      viewsSubscription.unsubscribe();
    };
  }, [currentUser]);

  return {
    unseenTasksCount,
    markTaskAsSeen,
    refreshTaskNotifications: calculateUnseenTasks,
  };
};
