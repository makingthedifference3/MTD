import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { tasks as mockTasks } from '../mockData';
import { useFilter } from '../context/FilterContext';

const TeamMemberDashboard = () => {
  const { selectedProject } = useFilter();
  
  // Filter and format tasks from mockData
  const tasks = useMemo(() => 
    mockTasks
      .filter(task => {
        if (selectedProject) {
          return task.projectId === selectedProject;
        }
        return true;
      })
      .slice(0, 4) // Show first 4 tasks
      .map(task => ({
        id: task.id,
        title: task.title,
        project: task.projectId,
        dueDate: task.dueDate,
        priority: task.priority === 'On Priority' ? 'high' : 'low',
        status: task.status === 'Completed' ? 'completed' : task.status === 'In Progress' ? 'in-progress' : 'pending'
      }))
  , [selectedProject]);

  const stats = [
    { label: 'Assigned Tasks', value: mockTasks.length, icon: CheckSquare, color: 'emerald' },
    { label: 'In Progress', value: mockTasks.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'emerald' },
    { label: 'Completed', value: mockTasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'emerald' },
    { label: 'Pending', value: mockTasks.filter(t => t.status === 'Not Started').length, icon: AlertCircle, color: 'emerald' },
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
          {tasks.map((task, index) => (
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
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    task.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TeamMemberDashboard;
