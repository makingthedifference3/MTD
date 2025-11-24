// =====================================================================
// MTD CSR PLATFORM - SUPABASE INTEGRATION EXAMPLES
// React Hooks & Helper Functions for Database Operations
// =====================================================================

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// =====================================================================
// 1. USER AUTHENTICATION & ROLE MANAGEMENT
// =====================================================================

export const useUserRole = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, full_name, email, role, department, permissions')
            .eq('auth_id', authUser.id)
            .single();

          if (error) throw error;
          setUser(userData);
          setRole(userData.role);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return { user, role, loading };
};

// =====================================================================
// 2. PROJECTS - RETRIEVE & MANAGE
// =====================================================================

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`
            id,
            project_code,
            name,
            description,
            status,
            total_budget,
            utilized_budget,
            completion_percentage,
            csr_partner_id,
            project_manager_id,
            csr_partners(name),
            users!project_manager_id(full_name)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, loading, error };
};

// Create new project
export const useCreateProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = async (projectData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            created_by: user.id,
            updated_by: user.id,
          }
        ])
        .select();

      if (insertError) throw insertError;
      return { data: data[0], error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { createProject, loading, error };
};

// =====================================================================
// 3. TASKS - RETRIEVE, CREATE, UPDATE
// =====================================================================

export const useUserTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            id,
            task_code,
            title,
            description,
            status,
            priority,
            due_date,
            completion_percentage,
            project_id,
            projects(name),
            assigned_to,
            users!assigned_to(full_name)
          `)
          .eq('assigned_to', userId)
          .order('due_date', { ascending: true });

        if (error) throw error;
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchTasks();
  }, [userId]);

  return { tasks, loading };
};

// Update task status
export const useUpdateTaskStatus = () => {
  const updateStatus = async (taskId, newStatus) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error };
    }
  };

  return { updateStatus };
};

// Log time for a task
export const useLogTaskTime = () => {
  const [loading, setLoading] = useState(false);

  const logTime = async (taskId, startTime, endTime, description) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const durationMinutes = Math.floor(
        (new Date(endTime) - new Date(startTime)) / (1000 * 60)
      );

      const { error } = await supabase
        .from('task_time_logs')
        .insert([
          {
            task_id: taskId,
            user_id: user.id,
            start_time: startTime,
            end_time: endTime,
            duration_minutes: durationMinutes,
            description,
          }
        ]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging time:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { logTime, loading };
};

// =====================================================================
// 4. EXPENSES - RETRIEVE, SUBMIT, APPROVE
// =====================================================================

export const useProjectExpenses = (projectId, status = null) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        let query = supabase
          .from('project_expenses')
          .select(`
            id,
            expense_code,
            merchant_name,
            date,
            category,
            total_amount,
            status,
            submitted_by,
            users!submitted_by(full_name),
            projects(name)
          `)
          .eq('project_id', projectId);

        if (status) {
          query = query.eq('status', status);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchExpenses();
  }, [projectId, status]);

  return { expenses, loading };
};

// Submit expense
export const useSubmitExpense = () => {
  const [loading, setLoading] = useState(false);

  const submitExpense = async (expenseData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('project_expenses')
        .insert([
          {
            ...expenseData,
            status: 'submitted',
            submitted_by: user.id,
            submitted_date: new Date().toISOString().split('T')[0],
            created_by: user.id,
          }
        ])
        .select();

      if (error) throw error;
      
      // Create activity log
      await supabase.from('activity_logs').insert([
        {
          user_id: user.id,
          action: 'INSERT',
          action_type: 'create',
          entity_type: 'project_expenses',
          entity_id: data[0].id,
          description: `Submitted expense: ${expenseData.merchant_name}`,
        }
      ]);

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error submitting expense:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { submitExpense, loading };
};

// Approve expense (Accountant/Admin only)
export const useApproveExpense = () => {
  const approveExpense = async (expenseId, comments = '') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update expense status
      const { error: updateError } = await supabase
        .from('project_expenses')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_date: new Date().toISOString().split('T')[0],
          updated_by: user.id,
        })
        .eq('id', expenseId);

      if (updateError) throw updateError;

      // Create approval record
      const expenseData = await supabase
        .from('project_expenses')
        .select('*')
        .eq('id', expenseId)
        .single();

      await supabase.from('expense_approvals').insert([
        {
          expense_id: expenseId,
          approver_id: user.id,
          action: 'approved',
          previous_status: expenseData.data.status,
          new_status: 'approved',
          comments,
        }
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error approving expense:', error);
      return { success: false, error };
    }
  };

  return { approveExpense };
};

// =====================================================================
// 5. REAL-TIME UPDATES - PUBLISH & RETRIEVE
// =====================================================================

export const useRealTimeUpdates = (projectId) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data, error } = await supabase
          .from('real_time_updates')
          .select(`
            id,
            update_code,
            title,
            description,
            date,
            location_name,
            beneficiaries_count,
            is_public,
            is_sent_to_client,
            images,
            participants,
            created_by
          `)
          .eq('project_id', projectId)
          .eq('is_public', true)
          .order('date', { ascending: false });

        if (error) throw error;
        setUpdates(data);
      } catch (error) {
        console.error('Error fetching updates:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchUpdates();
  }, [projectId]);

  return { updates, loading };
};

// Submit real-time update
export const useSubmitRealTimeUpdate = () => {
  const [loading, setLoading] = useState(false);

  const submitUpdate = async (updateData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('real_time_updates')
        .insert([
          {
            ...updateData,
            created_by: user.id,
            date: new Date().toISOString().split('T')[0],
          }
        ])
        .select();

      if (error) throw error;

      // If sending to client, create notification
      if (updateData.is_sent_to_client) {
        // Get project's CSR partner contact
        const projectData = await supabase
          .from('projects')
          .select('csr_partner_id')
          .eq('id', updateData.project_id)
          .single();

        // Send notification to partner (if setup)
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error submitting update:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { submitUpdate, loading };
};

// =====================================================================
// 6. MEDIA ARTICLES - UPLOAD & MANAGE
// =====================================================================

export const useMediaArticles = (projectId) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('media_articles')
          .select(`
            id,
            media_code,
            title,
            media_type,
            drive_link,
            thumbnail_link,
            captured_at,
            is_public
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setArticles(data);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchArticles();
  }, [projectId]);

  return { articles, loading };
};

// =====================================================================
// 7. CALENDAR EVENTS - CREATE & RETRIEVE
// =====================================================================

export const useCalendarEvents = (projectId, dateRange = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let query = supabase
          .from('calendar_events')
          .select(`
            id,
            event_code,
            title,
            event_date,
            start_time,
            end_time,
            location,
            event_type,
            status,
            organizer_id,
            users!organizer_id(full_name)
          `)
          .eq('project_id', projectId);

        if (dateRange) {
          query = query
            .gte('event_date', dateRange.start)
            .lte('event_date', dateRange.end);
        }

        const { data, error } = await query.order('event_date', { ascending: true });

        if (error) throw error;
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchEvents();
  }, [projectId, dateRange]);

  return { events, loading };
};

// =====================================================================
// 8. BUDGET ALLOCATION - VIEW & TRACK
// =====================================================================

export const useBudgetAllocation = (projectId) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const { data, error } = await supabase
          .from('budget_allocation')
          .select(`
            id,
            category_name,
            allocated_amount,
            utilized_amount,
            pending_amount,
            available_amount,
            fiscal_year
          `)
          .eq('project_id', projectId);

        if (error) throw error;

        // Calculate totals
        const totals = data.reduce(
          (acc, cat) => ({
            allocated: acc.allocated + cat.allocated_amount,
            utilized: acc.utilized + cat.utilized_amount,
            pending: acc.pending + cat.pending_amount,
            available: acc.available + cat.available_amount,
          }),
          { allocated: 0, utilized: 0, pending: 0, available: 0 }
        );

        setBudget({ categories: data, totals });
      } catch (error) {
        console.error('Error fetching budget:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchBudget();
  }, [projectId]);

  return { budget, loading };
};

// =====================================================================
// 9. DAILY REPORTS - SUBMIT
// =====================================================================

export const useSubmitDailyReport = () => {
  const [loading, setLoading] = useState(false);

  const submitReport = async (reportData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('daily_reports')
        .insert([
          {
            ...reportData,
            user_id: user.id,
            submitted_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error submitting report:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { submitReport, loading };
};

// =====================================================================
// 10. TEAM MEMBERS - MANAGE ASSIGNMENTS
// =====================================================================

export const useProjectTeamMembers = (projectId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('project_team_members')
          .select(`
            id,
            user_id,
            role,
            designation,
            is_lead,
            can_approve_expenses,
            users(full_name, email, mobile_number, department)
          `)
          .eq('project_id', projectId)
          .eq('is_active', true);

        if (error) throw error;
        setMembers(data);
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchMembers();
  }, [projectId]);

  return { members, loading };
};

// Add team member
export const useAddTeamMember = () => {
  const addMember = async (projectId, userId, roleData) => {
    try {
      const { error } = await supabase
        .from('project_team_members')
        .insert([
          {
            project_id: projectId,
            user_id: userId,
            ...roleData,
            is_active: true,
          }
        ]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding team member:', error);
      return { success: false, error };
    }
  };

  return { addMember };
};

// =====================================================================
// 11. NOTIFICATIONS - RETRIEVE & MARK AS READ
// =====================================================================

export const useUserNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchNotifications();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return { notifications, unreadCount, loading, markAsRead };
};

// =====================================================================
// 12. REPORTS - GENERATE & RETRIEVE
// =====================================================================

export const useReports = (projectId, reportType = null) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let query = supabase
          .from('reports')
          .select(`
            id,
            report_code,
            title,
            report_type,
            status,
            generated_date,
            report_drive_link
          `)
          .eq('project_id', projectId);

        if (reportType) {
          query = query.eq('report_type', reportType);
        }

        const { data, error } = await query
          .eq('status', 'approved')
          .order('generated_date', { ascending: false });

        if (error) throw error;
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchReports();
  }, [projectId, reportType]);

  return { reports, loading };
};

// =====================================================================
// 13. ADMIN FUNCTIONS - USER MANAGEMENT
// =====================================================================

export const useAssignUserRole = () => {
  const [loading, setLoading] = useState(false);

  const assignRole = async (userId, newRole) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Log this admin action
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      await supabase.from('activity_logs').insert([
        {
          user_id: adminUser.id,
          action: 'UPDATE',
          action_type: 'edit',
          entity_type: 'users',
          entity_id: userId,
          description: `Assigned role: ${newRole}`,
        }
      ]);

      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { assignRole, loading };
};

// =====================================================================
// 14. SEARCH & FILTER UTILITIES
// =====================================================================

export const useSearchProjects = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (searchTerm, filters = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select(`
          id,
          project_code,
          name,
          status,
          csr_partners(name)
        `)
        .eq('is_active', true);

      // Apply text search
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,project_code.ilike.%${searchTerm}%`
        );
      }

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.partnerId) query = query.eq('csr_partner_id', filters.partnerId);

      const { data, error } = await query;

      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, search };
};

// =====================================================================
// 15. REAL-TIME SUBSCRIPTIONS (WebSocket)
// =====================================================================

export const useRealtimeExpenseUpdates = (projectId, callback) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`expenses:project_id=eq.${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_expenses',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [projectId, callback]);
};

// =====================================================================
// END OF INTEGRATION EXAMPLES
// =====================================================================

/*
USAGE EXAMPLES IN COMPONENTS:

1. GET USER PROJECTS:
   const { projects, loading } = useProjects();
   
2. SUBMIT EXPENSE:
   const { submitExpense } = useSubmitExpense();
   await submitExpense({
     project_id: 'uuid',
     category_id: 'uuid',
     merchant_name: 'Store',
     total_amount: 5000,
     // ... other fields
   });

3. GET USER TASKS:
   const { user } = useUserRole();
   const { tasks } = useUserTasks(user?.id);

4. UPDATE TASK STATUS:
   const { updateStatus } = useUpdateTaskStatus();
   await updateStatus('task-id', 'completed');

5. APPROVE EXPENSE (ADMIN):
   const { approveExpense } = useApproveExpense();
   await approveExpense('expense-id', 'Looks good!');

6. REAL-TIME UPDATES:
   const { projects } = useProjects();
   useRealtimeExpenseUpdates(projectId, (payload) => {
     // Refresh expenses list
   });
*/
