import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import * as taskService from '../services/taskService';
import type { TaskWithProject, TaskStats } from '../services/taskService';
import { useFilter } from '../context/useFilter';
import { useAuth } from '../context/useAuth';

const TeamMemberDashboard = () => {
  const { selectedProject } = useFilter();
  const { currentUser } = useAuth();
  const [allTasks, setAllTasks] = useState<TaskWithProject[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    highPriority: 0,
    overdue: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load tasks on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      loadUserTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const loadUserTasks = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      // Load user's tasks
      const tasks = await taskService.getTasksForUser(currentUser.id);
      setAllTasks(tasks);

      // Get task statistics
      const taskStats = await taskService.getTaskStats(currentUser.id);
      setStats(taskStats);

      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
    }
  };

  // Filter and format tasks based on selectedProject
  const tasks = useMemo(() => {
    let filtered = allTasks;

    // Filter by selected project if applicable
    if (selectedProject) {
      filtered = filtered.filter((task) => task.project_id === selectedProject);
    }

    // Show first 4 tasks or less
    return filtered.slice(0, 4).map((task) => ({
      id: task.id,
      title: task.title,
      project: task.project_name || task.project_id,
      projectCode: task.project_code,
      dueDate: taskService.formatDueDate(task.due_date),
      priority: task.priority === 'On Priority' || task.priority === 'on_priority' ? 'high' : task.priority?.toLowerCase() === 'high' ? 'high' : task.priority?.toLowerCase() || 'low',
      status: task.status === 'completed' ? 'completed' : task.status === 'in_progress' ? 'in-progress' : 'pending',
      completionPercentage: task.completion_percentage || 0,
      rawStatus: task.status,
    }));
  }, [selectedProject, allTasks]);

  const statCards = [
    { label: 'Assigned Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'emerald' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'emerald' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
    { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'emerald' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Member Dashboard</h1>
        <p className="text-gray-600 mt-2">Your tasks and assignments</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="ml-3 text-gray-600">Loading your tasks...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <stat.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Completion Rate Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Overall Completion Rate</p>
                <h3 className="text-4xl font-bold text-emerald-600">{stats.completionRate}%</h3>
              </div>
              <div className="w-24 h-24 rounded-full bg-linear-to-r from-emerald-100 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Rate</p>
                  <p className="text-xl font-bold text-emerald-600">{stats.completionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="p-6 hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Project: {task.project}</span>
                            <span>Due: {task.dueDate}</span>
                            {task.completionPercentage > 0 && (
                              <span>Progress: {task.completionPercentage}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : task.status === 'in-progress'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No tasks found</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default TeamMemberDashboard;
