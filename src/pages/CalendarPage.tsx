import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, X, User, Clock } from 'lucide-react';
import { getAllTasks, type Task } from '@/services/tasksService';
import { getUserById } from '@/services/usersService';
import * as taskService from '@/services/taskService';

interface TaskWithUser extends Task {
  assignedByName?: string;
  assignedToName?: string;
}

const CalendarPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [allTasks, setAllTasks] = useState<TaskWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [upcomingPage, setUpcomingPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  // Filter states
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const allDepartments = await taskService.getAllDepartments();
        setDepartments(allDepartments);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch tasks and user names on component mount
  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all tasks
        const allTasksData = await getAllTasks();
        
        // Fetch user names for assigned_by and assigned_to
        const tasksWithUsers = await Promise.all(
          allTasksData.map(async (task) => {
            let assignedByName = 'N/A';
            let assignedToName = 'N/A';
            
            if (task.assigned_by) {
              const assignedByUser = await getUserById(task.assigned_by);
              assignedByName = assignedByUser?.full_name || 'Unknown';
            }
            
            if (task.assigned_to) {
              const assignedToUser = await getUserById(task.assigned_to);
              assignedToName = assignedToUser?.full_name || 'Unknown';
            }
            
            return {
              ...task,
              assignedByName,
              assignedToName,
            };
          })
        );
        
        setTasks(tasksWithUsers);
        setAllTasks(tasksWithUsers);
      } catch (err) {
        console.error('Error fetching tasks data:', err);
        setError('Failed to load tasks');
        setTasks([]);
        setAllTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksData();
  }, []);

  // Apply filters to tasks
  useEffect(() => {
    let filtered = [...allTasks];

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(task => task.department === filterDepartment);
    }

    setTasks(filtered);
  }, [allTasks, filterPriority, filterStatus, filterDepartment]);

  // Get upcoming tasks (future tasks only)
  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks
      .filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  };

  // Get tasks for a specific day
  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return (
        dueDate.getDate() === day &&
        dueDate.getMonth() === currentMonth.getMonth() &&
        dueDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const handleDayClick = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length > 0) {
      setSelectedDay(day);
      setDayModalOpen(true);
    }
  };

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if date is overdue
  const isOverdueDate = (day: number) => {
    const dayTasks = getTasksForDay(day);
    const today = new Date();
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return dateToCheck < today && dayTasks.some((t) => t.status !== 'completed');
  };

  // Map status to color
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'in_progress':
        return 'bg-amber-500 text-white';
      case 'not_started':
        return 'bg-cyan-500 text-white';
      case 'on_priority':
        return 'bg-red-500 text-white';
      case 'blocked':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'in_progress':
        return 'bg-amber-500 text-white';
      case 'not_started':
        return 'bg-cyan-500 text-white';
      case 'on_priority':
        return 'bg-red-500 text-white';
      case 'blocked':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format status for display
  const formatStatus = (status?: string) => {
    if (!status) return 'N/A';
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const upcomingTasks = getUpcomingTasks();
  const paginatedUpcomingTasks = upcomingTasks.slice(
    upcomingPage * ITEMS_PER_PAGE,
    (upcomingPage + 1) * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(upcomingTasks.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-2">Track tasks and deadlines</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Priorities</option>
              <option value="On Priority">On Priority</option>
              <option value="High Priority">High Priority</option>
              <option value="Less Priority">Less Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(filterPriority !== 'all' || 
          filterStatus !== 'all' || 
          filterDepartment !== 'all') && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilterPriority('all');
                setFilterStatus('all');
                setFilterDepartment('all');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
            <h3 className="text-3xl font-bold text-gray-900">{tasks.length}</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {tasks.filter(t => t.status === 'completed').length}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {tasks.filter(t => t.status === 'in_progress').length}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">Not Started</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {tasks.filter(t => t.status === 'not_started').length}
            </h3>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-gray-600 mt-4">Loading tasks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {!loading && (
        <>
          {viewMode === 'list' ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Task List</h2>
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <p className="text-gray-600">No tasks found</p>
                ) : (
                  tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2 text-lg">{task.title}</h3>
                          {task.description && (
                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                              {formatStatus(task.status)}
                            </span>
                            {task.assignedByName && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 border border-blue-300 text-blue-700 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Assigned by: {task.assignedByName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Task List Above Calendar */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
                    Upcoming Tasks
                  </h2>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUpcomingPage(Math.max(0, upcomingPage - 1))}
                        disabled={upcomingPage === 0}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="text-sm text-gray-600">
                        {upcomingPage + 1} / {totalPages}
                      </span>
                      <button
                        onClick={() => setUpcomingPage(Math.min(totalPages - 1, upcomingPage + 1))}
                        disabled={upcomingPage >= totalPages - 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedUpcomingTasks.length > 0 ? (
                    paginatedUpcomingTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                      >
                        <h3 className="font-bold text-gray-900 mb-2 text-sm">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                            {formatStatus(task.status)}
                          </span>
                        </div>
                        {task.assignedByName && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Assigned by: <span className="font-medium">{task.assignedByName}</span>
                          </p>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No upcoming tasks</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900">{monthName}</h3>
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-bold text-gray-700 py-3 text-sm">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDay }).map((_, index) => (
                    <div key={`empty-${index}`}></div>
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayTasks = getTasksForDay(day);
                    const hasOverdue = isOverdueDate(day);

                    return (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: day * 0.01 }}
                        onClick={() => handleDayClick(day)}
                        className={`aspect-square border-2 rounded-xl p-2 hover:shadow-md cursor-pointer transition-all ${
                          hasOverdue
                            ? 'border-red-500 bg-red-50 hover:bg-red-100'
                            : dayTasks.length > 0
                              ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {/* Day Number with Red Circle for Overdue */}
                        <div className="flex items-center justify-center mb-1">
                          {hasOverdue ? (
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">{day}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">{day}</span>
                          )}
                        </div>

                        {/* Task Indicators */}
                        {dayTasks.length > 0 && (
                          <div className="space-y-1">
                            {dayTasks.slice(0, 2).map((task) => (
                              <div
                                key={task.id}
                                className={`text-xs px-1 py-0.5 rounded text-center font-medium ${getStatusColor(task.status)}`}
                                title={task.title}
                              >
                                {task.status === 'in_progress'
                                  ? 'IP'
                                  : task.status === 'completed'
                                    ? 'C'
                                    : task.status === 'on_priority'
                                      ? 'P'
                                      : 'NS'}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-emerald-600 font-medium text-center">
                                +{dayTasks.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">Overdue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-sm mr-2"></div>
                    <span className="text-gray-700">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-500 rounded-sm mr-2"></div>
                    <span className="text-gray-700">In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-cyan-500 rounded-sm mr-2"></div>
                    <span className="text-gray-700">Not Started</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Day Tasks Modal */}
      <AnimatePresence>
        {dayModalOpen && selectedDay && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setDayModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Tasks for {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDay}, {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => setDayModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                {getTasksForDay(selectedDay).map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-lg flex-1">{task.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                        {formatStatus(task.status)}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">Due:</span> {new Date(task.due_date).toLocaleDateString()}
                      </div>
                      
                      {task.assignedToName && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Assigned to:</span> {task.assignedToName}
                        </div>
                      )}
                      
                      {task.assignedByName && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Assigned by:</span> {task.assignedByName}
                        </div>
                      )}
                    </div>

                    {task.task_type && (
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {task.task_type}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarPage;
