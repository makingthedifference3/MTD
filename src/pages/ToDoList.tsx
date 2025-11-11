import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Clock, AlertCircle, Mail, Phone, ChevronDown } from 'lucide-react';
import { useFilter } from '../context/FilterContext';

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  csrPartner: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'in-progress' | 'not-started';
  dueDate: string;
  assignedTo: string;
  department: string;
  socialMedia?: string;
  timeline?: string;
}

interface PreviousTask {
  id: string;
  assignedTo: string;
  status: string;
  dueDate: string;
  priority: string;
  description: string;
}

const ToDoList = () => {
  const { selectedPartner, selectedProject } = useFilter();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [showTaskDetails, setShowTaskDetails] = useState<string | null>(null);
  
  const [tasks] = useState<Task[]>([
    { 
      id: 'T001', 
      title: 'Complete XYZ Task', 
      description: 'Complete social media posting for community center project',
      project: 'ACE Pipeline', 
      csrPartner: 'Tech Foundation',
      priority: 'high', 
      status: 'in-progress', 
      dueDate: '2024-06-20', 
      assignedTo: 'Lokesh Joshi',
      department: 'Marketing',
      socialMedia: 'Instagram',
      timeline: 'Connected from client timeline'
    },
    { 
      id: 'T002', 
      title: 'Review budget allocation', 
      description: 'Review and approve budget for education drive',
      project: 'LAJJA', 
      csrPartner: 'Education Trust',
      priority: 'high', 
      status: 'not-started', 
      dueDate: '2024-06-18', 
      assignedTo: 'Lokesh Joshi',
      department: 'Finance',
      socialMedia: 'Facebook'
    },
    { 
      id: 'T003', 
      title: 'Prepare monthly report', 
      description: 'Compile monthly progress report for health camp',
      project: 'ACE Pipeline', 
      csrPartner: 'Health Foundation',
      priority: 'medium', 
      status: 'completed', 
      dueDate: '2024-06-15', 
      assignedTo: 'Mike Johnson',
      department: 'Operations'
    },
  ]);

  const [previousTasks] = useState<PreviousTask[]>([
    { 
      id: 'PT001', 
      assignedTo: 'Lokesh', 
      status: 'not-started', 
      dueDate: 'Jun 25, 2024', 
      priority: 'ON PRIORITY',
      description: 'Previous social media campaign task'
    },
    { 
      id: 'PT002', 
      assignedTo: 'Lokesh', 
      status: 'not-started', 
      dueDate: 'Jun 28, 2024', 
      priority: 'ON PRIORITY',
      description: 'Budget review for Q2'
    },
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPartner = !selectedPartner || task.csrPartner === selectedPartner;
    const matchesProject = !selectedProject || task.project === selectedProject;
    return matchesPriority && matchesStatus && matchesPartner && matchesProject;
  });

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: CheckCircle2 },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2 },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: Clock },
    { label: 'Not Started', value: tasks.filter(t => t.status === 'not-started').length, icon: AlertCircle },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'not-started': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">To-Do List Assignment</h1>
            <p className="text-gray-600 mt-2">Manage and assign tasks to team members</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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

      {/* Filters - Enhanced with Social Media, Person, Timeline, Department */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Filter & Assignment Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Media</label>
            <select
              value={selectedSocialMedia}
              onChange={(e) => setSelectedSocialMedia(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Platform</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Person</option>
              <option value="Lokesh Joshi">Lokesh Joshi</option>
              <option value="Mike Johnson">Mike Johnson</option>
              <option value="Sarah Williams">Sarah Williams</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department / Name</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Departments</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </select>
        </div>
      </motion.div>

      {/* Tasks List - Enhanced with Description, Timeline, Icons */}
      <div className="space-y-4">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="space-y-4">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{task.title}</h3>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 font-medium mb-1">Description:</p>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Project:</span> {task.project}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Assigned:</span> 
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                          {task.assignedTo}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">Department:</span> {task.department}
                      </span>
                    </div>
                    {task.timeline && (
                      <div className="mt-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium inline-block">
                        🔗 {task.timeline}
                      </div>
                    )}
                    {task.socialMedia && (
                      <div className="mt-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                          📱 {task.socialMedia}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-cyan-100 text-cyan-700'
                  }`}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    DUE DATE
                  </span>
                  <span className={`px-4 py-2 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'ON PRIORITY' : task.priority.toUpperCase()}
                  </span>
                  <button 
                    onClick={() => setShowTaskDetails(showTaskDetails === task.id ? null : task.id)}
                    className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Task Details */}
              {showTaskDetails === task.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-gray-200 pt-4"
                >
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">📅 Due Date: {task.dueDate}</p>
                    <button className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Complete {task.title}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Previous Assigned Tasks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Previous Assigned Tasks</h2>
        <div className="space-y-4">
          {previousTasks.map((prevTask, index) => (
            <motion.div
              key={prevTask.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                  <p className="text-gray-800 mb-3">{prevTask.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      {prevTask.assignedTo}
                    </span>
                    <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-bold">
                      {prevTask.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    DUE DATE
                  </span>
                  <span className="px-4 py-2 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    {prevTask.priority}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ToDoList;
