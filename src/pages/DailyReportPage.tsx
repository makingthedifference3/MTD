import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Calendar, Loader, X, FileText } from 'lucide-react';
import { type Task } from '@/services/tasksService';
import { getUserById } from '@/services/usersService';
import { projectService } from '@/services/projectService';
import { createDailyReport } from '@/services/dailyReportsService';
import { useAuth } from '@/context/useAuth';
import { supabase } from '@/services/supabaseClient';
import * as taskService from '@/services/taskService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TaskWithUser extends Task {
  assignedByName?: string;
  assignedToName?: string;
  projectName?: string;
}

interface DailyReportStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  blockedTasks: number;
}

const DailyReportPage = () => {
  const { currentUser } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: today, end: today });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [stats, setStats] = useState<DailyReportStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    notStartedTasks: 0,
    blockedTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string; project_code: string }>>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; full_name: string; department: string }>>([]);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      const projectList = await projectService.getAllProjects();
      setProjects(projectList.map(p => ({ id: p.id, name: p.name, project_code: p.project_code })));
      
      const allDepartments = await taskService.getAllDepartments();
      setDepartments(allDepartments);
      
      const { data: members } = await supabase
        .from('users')
        .select('id, full_name, department')
        .eq('role', 'team_member')
        .order('full_name');
      setTeamMembers(members || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTasksData();
  }, [dateRange]);

  const fetchTasksData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all completed tasks
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Filter by date range using updated_at
      const filteredTasks = (allTasks || []).filter((task) => {
        const taskDate = task.updated_at?.split('T')[0];
        if (!taskDate) return false;
        return taskDate >= dateRange.start && taskDate <= dateRange.end;
      });
      
      // Fetch user names and project names
      const tasksWithDetails = await Promise.all(
        filteredTasks.map(async (task) => {
          let assignedByName = 'N/A';
          let assignedToName = 'N/A';
          let projectName = 'N/A';
          
          if (task.assigned_by) {
            const user = await getUserById(task.assigned_by);
            assignedByName = user?.full_name || 'Unknown';
          }
          
          if (task.assigned_to) {
            const user = await getUserById(task.assigned_to);
            assignedToName = user?.full_name || 'Unknown';
          }

          if (task.project_id) {
            const project = await projectService.getProjectById(task.project_id);
            projectName = project?.name || 'Unknown Project';
          }
          
          return {
            ...task,
            assignedByName,
            assignedToName,
            projectName,
          };
        })
      );
      
      setTasks(tasksWithDetails);
      calculateStats(tasksWithDetails);
    } catch (err) {
      setError('Failed to load task data');
      console.error('Error fetching task data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList: TaskWithUser[]) => {
    // All tasks are completed, so we just show the total
    setStats({
      totalTasks: taskList.length,
      completedTasks: taskList.length,
      inProgressTasks: 0,
      notStartedTasks: 0,
      blockedTasks: 0,
    });
  };

  const handleApplyDateRange = () => {
    fetchTasksData();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Daily Task Report', 14, 20);
    
    // Add date range
    doc.setFontSize(11);
    doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 14, 30);
    
    // Prepare table data
    const tableData = tasks.map((task) => [
      task.title,
      task.projectName || 'N/A',
      task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A',
      'COMPLETED',
      task.assignedToName || 'N/A',
      task.assignedByName || 'N/A',
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['Task Name', 'Project', 'Completed Date', 'Status', 'Assigned To', 'Assigned By']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
    });
    
    doc.save(`daily-report-${dateRange.start}-to-${dateRange.end}.pdf`);
    setShowExportOptions(false);
  };

  const handleExportExcel = () => {
    const exportData = tasks.map((task) => ({
      'Task Name': task.title,
      'Description': task.description || '',
      'Project': task.projectName || 'N/A',
      'Completed Date': task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A',
      'Status': 'COMPLETED',
      'Assigned To': task.assignedToName || 'N/A',
      'Assigned By': task.assignedByName || 'N/A',
      'Priority': task.priority || 'N/A',
      'Completion %': 100,
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
    XLSX.writeFile(wb, `daily-report-${dateRange.start}-to-${dateRange.end}.xlsx`);
    setShowExportOptions(false);
  };

  const handleExportCSV = () => {
    const exportData = tasks.map((task) => ({
      'Task Name': task.title,
      'Description': task.description || '',
      'Project': task.projectName || 'N/A',
      'Completed Date': task.completed_date ? new Date(task.completed_date).toLocaleDateString() : 'N/A',
      'Status': 'COMPLETED',
      'Assigned To': task.assignedToName || 'N/A',
      'Assigned By': task.assignedByName || 'N/A',
      'Priority': task.priority || 'N/A',
      'Completion %': 100,
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `daily-report-${dateRange.start}-to-${dateRange.end}.csv`;
    link.click();
    setShowExportOptions(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.assigned_to || !newTask.project_id) {
      alert('Title, Project, and Assignee are required');
      return;
    }

    try {
      const taskData = {
        task_code: `TASK-${Date.now()}`,
        project_id: newTask.project_id,
        title: newTask.title,
        description: newTask.description,
        assigned_to: newTask.assigned_to,
        status: newTask.status as 'not_started' | 'in_progress' | 'completed',
        priority: newTask.priority,
        due_date: newTask.due_date,
        completion_percentage: 0,
        department: newTask.department,
      };

      await taskService.createTask(taskData);

      setShowAddModal(false);
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
      
      alert('Task created successfully!');
      fetchTasksData();
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed':
      case 'COMPLETED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'in_progress':
      case 'In Progress':
      case 'INPROGRESS':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'not_started':
      case 'Not Started':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
          <p className="text-gray-600 mt-2">View completed tasks by date range</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>EXPORT</span>
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button 
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Export as PDF
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  Export as Excel
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Export as CSV
                </button>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>ADD NEW</span>
          </motion.button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filter by Date Range</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-32 focus:outline-none font-medium"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-32 focus:outline-none font-medium"
              />
            </div>
            <button onClick={handleApplyDateRange} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium">
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Task List - Card Style */}
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                )}
                {task.projectName && (
                  <p className="text-sm text-teal-600 font-medium mb-4">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Project: {task.projectName}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">STATUS:</span>
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold">
                      COMPLETED
                    </span>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(task.status)}`}>
                    {task.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">ASSIGNED BY:</span>
                    <span className="px-4 py-2 bg-white border-2 border-gray-900 rounded-full text-sm font-bold">
                      {task.assignedByName || 'N/A'}
                    </span>
                  </div>
                  {task.assignedToName && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500">ASSIGNED TO:</span>
                      <span className="px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-300 rounded-full text-sm font-bold">
                        {task.assignedToName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No completed tasks found for the selected date range</p>
            <p className="text-sm">Try adjusting your date filter</p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                  <select
                    value={newTask.project_id}
                    onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.project_code} - {project.name}
                      </option>
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
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name} - {member.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

export default DailyReportPage;
