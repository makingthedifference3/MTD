import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, Calendar, MapPin, Loader, User, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/NotificationContext';

interface Task {
  id: string;
  task_code: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  completed_date: string | null;
  assigned_by_user: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  project: {
    id: string;
    name: string;
    location: string | null;
    csr_partner: {
      id: string;
      name: string;
    } | null;
    toll: {
      id: string;
      toll_name: string;
    } | null;
  };
}

interface CSRPartner {
  id: string;
  name: string;
}

interface Toll {
  id: string;
  toll_name: string;
}

interface Project {
  id: string;
  name: string;
}

const MyTasks = () => {
  const { currentUser } = useAuth();
  const { markTaskAsSeen } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Filters
  const [selectedCsrPartner, setSelectedCsrPartner] = useState<string>('all');
  const [selectedToll, setSelectedToll] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedDueDate, setSelectedDueDate] = useState<string>('all');
  
  // Filter options
  const [csrPartners, setCsrPartners] = useState<CSRPartner[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadFilterOptions();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
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
          created_at,
          completed_date,
          assigned_by_user:users!tasks_assigned_by_fkey (
            id,
            full_name,
            email
          ),
          project:projects!tasks_project_id_fkey (
            id,
            name,
            location,
            csr_partner:csr_partners!projects_csr_partner_id_fkey (
              id,
              name
            ),
            toll:csr_partner_tolls!projects_toll_id_fkey (
              id,
              toll_name
            )
          )
        `)
        .eq('assigned_to', currentUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data as unknown as Task[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    if (!currentUser) return;
    
    try {
      // Get unique CSR partners from user's tasks
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          project:projects!tasks_project_id_fkey (
            csr_partner_id,
            toll_id,
            id,
            name
          )
        `)
        .eq('assigned_to', currentUser.id)
        .eq('is_active', true);

      if (taskError) throw taskError;

      // Extract unique CSR partner IDs
      const csrPartnerIds = new Set<string>();
      const tollIds = new Set<string>();
      const projectList: Project[] = [];

      taskData?.forEach((task: any) => {
        if (task.project?.csr_partner_id) {
          csrPartnerIds.add(task.project.csr_partner_id);
        }
        if (task.project?.toll_id) {
          tollIds.add(task.project.toll_id);
        }
        if (task.project?.id && task.project?.name) {
          projectList.push({
            id: task.project.id,
            name: task.project.name,
          });
        }
      });

      // Fetch CSR partners
      if (csrPartnerIds.size > 0) {
        const { data: csrData, error: csrError } = await supabase
          .from('csr_partners')
          .select('id, name')
          .in('id', Array.from(csrPartnerIds));

        if (!csrError && csrData) {
          setCsrPartners(csrData);
        }
      }

      // Fetch tolls
      if (tollIds.size > 0) {
        const { data: tollData, error: tollError } = await supabase
          .from('csr_partner_tolls')
          .select('id, toll_name')
          .in('id', Array.from(tollIds));

        if (!tollError && tollData) {
          setTolls(tollData);
        }
      }

      // Remove duplicate projects
      const uniqueProjects = projectList.filter(
        (proj, index, self) => index === self.findIndex((p) => p.id === proj.id)
      );
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // CSR Partner filter
      if (selectedCsrPartner !== 'all' && task.project?.csr_partner?.id !== selectedCsrPartner) {
        return false;
      }

      // Toll filter
      if (selectedToll !== 'all' && task.project?.toll?.id !== selectedToll) {
        return false;
      }

      // Project filter
      if (selectedProject !== 'all' && task.project?.id !== selectedProject) {
        return false;
      }

      // Due date filter
      if (selectedDueDate !== 'all' && task.due_date) {
        const dueDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (selectedDueDate) {
          case 'overdue':
            if (dueDate >= today || task.status === 'completed') return false;
            break;
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (dueDate < today || dueDate >= tomorrow) return false;
            break;
          case 'week':
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            if (dueDate < today || dueDate > nextWeek) return false;
            break;
          case 'month':
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            if (dueDate < today || dueDate > nextMonth) return false;
            break;
        }
      }

      return true;
    });
  }, [tasks, selectedCsrPartner, selectedToll, selectedProject, selectedDueDate]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      not_started: filteredTasks.filter(t => t.status === 'not_started'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      on_priority: filteredTasks.filter(t => t.status === 'on_priority'),
      completed: filteredTasks.filter(t => t.status === 'completed'),
      blocked: filteredTasks.filter(t => t.status === 'blocked'),
    };
  }, [filteredTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_priority':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'On Priority':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'in_progress':
        return <Clock className="w-5 h-5" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatProjectName = (task: Task) => {
    const projectName = task.project?.name || 'Unknown Project';
    const tollName = task.project?.toll?.toll_name;
    const partnerName = task.project?.csr_partner?.name;
    const location = task.project?.location || 'N/A';

    const middlePart = tollName || partnerName || 'Unknown';
    return `${projectName} - ${middlePart} - ${location}`;
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-red-600', bgColor: 'bg-red-50' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} day(s)`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    }
    return null;
  };

  const handleTaskClick = async (taskId: string) => {
    // Mark task as seen when clicked
    await markTaskAsSeen(taskId);
  };

  const handleMarkComplete = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task card click event
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error marking task as complete:', error);
        alert('Failed to mark task as complete. Please try again.');
        return;
      }

      // Reload tasks to reflect changes
      await loadTasks();
      
      // Mark as seen to clear notification
      await markTaskAsSeen(taskId);
    } catch (error) {
      console.error('Exception marking task as complete:', error);
      alert('Failed to mark task as complete. Please try again.');
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const dueDateStatus = getDueDateStatus(task.due_date);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleTaskClick(task.id)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{task.task_code}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)} flex items-center gap-1`}>
            {getStatusIcon(task.status)}
            {task.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{formatProjectName(task)}</span>
        </div>

        {task.assigned_by_user && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <User className="w-4 h-4" />
            <span className="truncate">Assigned by: {task.assigned_by_user.full_name}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {dueDateStatus && (
          <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${dueDateStatus.color} ${dueDateStatus.bgColor}`}>
            {dueDateStatus.text}
          </div>
        )}

        {/* Mark Complete Button */}
        {task.status !== 'completed' && (
          <button
            onClick={(e) => handleMarkComplete(task.id, e)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Complete
          </button>
        )}

        {/* Completed Date */}
        {task.status === 'completed' && task.completed_date && (
          <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">Completed on {new Date(task.completed_date).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">View and manage tasks assigned to you</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CSR Partner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSR Partner
              </label>
              <select
                value={selectedCsrPartner}
                onChange={(e) => setSelectedCsrPartner(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Partners</option>
                {csrPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toll Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcompany
              </label>
              <select
                value={selectedToll}
                onChange={(e) => setSelectedToll(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Tolls</option>
                {tolls.map((toll) => (
                  <option key={toll.id} value={toll.id}>
                    {toll.toll_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <select
                value={selectedDueDate}
                onChange={(e) => setSelectedDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Tasks</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
                <option value="month">Due This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-500">{tasksByStatus.not_started.length}</div>
            <div className="text-sm text-gray-600">Not Started</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{tasksByStatus.in_progress.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">{tasksByStatus.on_priority.length}</div>
            <div className="text-sm text-gray-600">Priority</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">{tasksByStatus.completed.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {tasks.length === 0
                ? "You don't have any tasks assigned yet."
                : "No tasks match your current filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;
