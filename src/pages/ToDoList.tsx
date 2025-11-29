import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2, Loader } from 'lucide-react';
import * as taskService from '../services/taskService';
import { type Task, type TaskStats } from '../services/taskService';
import { supabase } from '../services/supabaseClient';
import { AuthContext } from '../context/AuthContext';

const ToDoList = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    department: '',
    priority: 'On Priority',
    status: 'not_started',
    due_date: '',
    task_type: 'Development',
  });
  const [projectTeamMembers, setProjectTeamMembers] = useState<Array<{user_id: string; role: string; full_name: string}> | null>(null);
  const [csrPartners, setCsrPartners] = useState<Array<{id: string; name: string; has_toll: boolean}>>([]);
  const [selectedCsrPartner, setSelectedCsrPartner] = useState('');
  const [hasToll, setHasToll] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Array<{id: string; name: string}>>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [tolls, setTolls] = useState<Array<{id: string; toll_name: string}>>([]);
  const [selectedToll, setSelectedToll] = useState('');
  const { currentRole } = useContext(AuthContext) || {};

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fix CSR Partner Dropdown
  useEffect(() => {
    fetchCsrPartners();
  }, []);

  // Fix Project Dropdown
  useEffect(() => {
    if (selectedCsrPartner) {
      const partner = csrPartners.find(p => p.id === selectedCsrPartner);
      const partnerHasToll = partner?.has_toll || false;
      setHasToll(partnerHasToll);
      
      fetchProjectsForPartner(selectedCsrPartner);
      
      if (partnerHasToll) {
        fetchTollsForPartner(selectedCsrPartner); // Fetch tolls only if partner has tolls
      } else {
        setTolls([]);
        setSelectedToll('');
      }
    } else {
      setHasToll(false);
      setFilteredProjects([]);
      setTolls([]);
      setSelectedToll('');
    }
  }, [selectedCsrPartner, csrPartners]);

  // Fix Assigned To Dropdown
  useEffect(() => {
    if (selectedProject) {
      fetchProjectTeamMembers(selectedProject);
    } else {
      setProjectTeamMembers(null);
    }
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTasks, allDepartments] = await Promise.all([
        taskService.getAllTasks(),
        taskService.getAllDepartments(),
      ]);

      setTasks(allTasks);
      setDepartments(allDepartments);

      // Calculate stats from all tasks
      const taskStats: TaskStats = {
        totalTasks: allTasks.length,
        total: allTasks.length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        inProgress: allTasks.filter(t => t.status === 'in_progress').length,
        pending: allTasks.filter(t => t.status === 'not_started').length,
        notStarted: allTasks.filter(t => t.status === 'not_started').length,
      };
      setStats(taskStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch CSR Partners
  const fetchCsrPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('csr_partners')
        .select('id, name, has_toll')
        .eq('is_active', true);
      if (error) throw error;
      setCsrPartners(data || []);
    } catch (error) {
      console.error('Error fetching CSR partners:', error);
      setCsrPartners([]);
    }
  };

  // Fetch Projects for selected CSR Partner
  const fetchProjectsForPartner = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true);
      if (error) throw error;
      setFilteredProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setFilteredProjects([]);
    }
  };

  // Fetch Tolls for selected CSR Partner
  const fetchTollsForPartner = async (partnerId: string) => {
    try {
      const { data, error } = await supabase
        .from('csr_partner_tolls')
        .select('id, toll_name')
        .eq('csr_partner_id', partnerId)
        .eq('is_active', true);
      if (error) throw error;
      setTolls(data || []);
    } catch (error) {
      console.error('Error fetching tolls:', error);
      setTolls([]);
    }
  };

  // Fetch team members for selected project
  const fetchProjectTeamMembers = async (projectId: string) => {
    if (!projectId) {
      setProjectTeamMembers(null);
      return;
    }
    try {
      // Get all project_team_members for the project
      const { data: ptmData, error: ptmError } = await supabase
        .from('project_team_members')
        .select('user_id, role')
        .eq('project_id', projectId)
        .eq('is_active', true);
      if (ptmError) throw ptmError;
      if (!ptmData || ptmData.length === 0) {
        setProjectTeamMembers([]);
        return;
      }
      // Get user details for those user_ids
      const userIds = ptmData.map((ptm: any) => ptm.user_id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);
      if (userError) throw userError;
      // Merge role and full_name
      const members = ptmData.map((ptm: any) => {
        const user = userData.find((u: any) => u.id === ptm.user_id);
        return {
          user_id: ptm.user_id,
          role: ptm.role,
          full_name: user ? user.full_name : '',
        };
      });
      setProjectTeamMembers(members);
    } catch (error) {
      console.error('Error fetching project team members:', error);
      setProjectTeamMembers([]);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || task.department === filterDepartment;
    return matchesPriority && matchesStatus && matchesDepartment;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.assigned_to || !selectedProject) {
      alert('Title, Project, and Assignee are required');
      return;
    }

    if (hasToll && !selectedToll) {
      alert('Toll is required for this CSR Partner');
      return;
    }

    try {
      const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
        task_code: `TASK-${Date.now()}`,
        project_id: selectedProject,
        toll_id: hasToll ? selectedToll : undefined, // Include toll_id only if hasToll is true
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to,
        status: newTask.status as Task['status'],
        priority: newTask.priority,
        due_date: newTask.due_date,
        completion_percentage: 0,
        department: newTask.department,
      };

      const created = await taskService.createTask(taskData);

      if (created) {
        setShowModal(false);
        setNewTask({
          title: '',
          description: '',
          project_id: '',
          assigned_to: '',
          department: '',
          priority: 'On Priority',
          status: 'not_started',
          due_date: '',
          task_type: 'Development',
        });
        setSelectedCsrPartner('');
        setSelectedProject('');
        setSelectedToll('');
        await loadData();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      await loadData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        await loadData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority?: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'on_priority':
        return 'bg-orange-100 text-orange-700';
      case 'not_started':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'not_started':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || stats?.total || 0, icon: CheckCircle2 },
    { label: 'Completed', value: stats?.completed || 0, icon: CheckCircle2 },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: Clock },
    { label: 'Not Started', value: stats?.pending || stats?.notStarted || 0, icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">To-Do List</h1>
            <p className="text-gray-600 mt-2">Manage and track tasks from database</p>
          </div>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-96">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
            <Loader className="w-10 h-10 text-emerald-500" />
          </motion.div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
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

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <h3 className="font-bold text-gray-900 mb-4">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
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
          </motion.div>

          {/* Tasks List */}
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(task.status)}
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority || 'medium'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        {task.department && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {task.department}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-xs text-gray-600 ml-auto">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {task.completion_percentage > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${task.completion_percentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {task.status !== 'completed' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCompleteTask(task.id)}
                          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Complete task"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-12 text-center"
            >
              <p className="text-gray-500 text-lg">No tasks found. Create one to get started.</p>
            </motion.div>
          )}
        </>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CSR Partner Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CSR Partner *</label>
                  <select
                    value={selectedCsrPartner}
                    onChange={e => setSelectedCsrPartner(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select CSR Partner</option>
                    {csrPartners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>

                {/* Toll Dropdown - Conditional */}
                {hasToll && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Toll *</label>
                    <select
                      value={selectedToll}
                      onChange={(e) => setSelectedToll(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Toll</option>
                      {tolls.map((toll) => (
                        <option key={toll.id} value={toll.id}>{toll.toll_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Project Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                  <select
                    value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {filteredProjects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Task title"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Task description"
                    rows={3}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="On Priority">On Priority</option>
                    <option value="High Priority">High Priority</option>
                    <option value="Less Priority">Less Priority</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={newTask.department}
                    onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
                  <select
                    value={newTask.task_type}
                    onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Development">Development</option>
                    <option value="Research">Research</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Review">Review</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Event">Event</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Education">Education</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To *</label>
                  <select
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Team Member</option>
                    {projectTeamMembers && projectTeamMembers
                      .filter((member) => {
                        // Filtering logic based on logged-in user's role
                        if (!currentRole) return true;
                        if (currentRole === 'admin') {
                          // Admin sees all roles
                          return true;
                        }
                        if (currentRole === 'project_manager' || currentRole === 'accountant') {
                          // Project manager/accountant sees only team_member
                          return member.role === 'team_member';
                        }
                        // Default: show all
                        return true;
                      })
                      .map((member) => (
                        <option key={member.user_id} value={member.user_id}>
                          {member.full_name} - {member.role}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ToDoList;
