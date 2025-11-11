import { motion } from 'framer-motion';
import { Activity, Bell, TrendingUp } from 'lucide-react';
import { realTimeUpdates } from '../mockData';
import { useFilter } from '../context/FilterContext';

interface Update {
  id: string;
  type: 'project' | 'budget' | 'task' | 'system';
  title: string;
  description: string;
  timestamp: string;
  project?: string;
  priority: 'high' | 'medium' | 'low';
}

const RealTimeUpdate = () => {
  const { selectedProject } = useFilter();
  
  // Convert mockData realTimeUpdates to UI format and filter
  const updates: Update[] = realTimeUpdates
    .filter(update => {
      if (selectedProject) {
        return update.projectId === selectedProject;
      }
      return true;
    })
    .map((update, index) => ({
      id: update.id,
      type: 'project',
      title: `${update.schoolName} - ${update.documentHeading}`,
      description: update.description,
      timestamp: index === 0 ? '2 minutes ago' : index === 1 ? '15 minutes ago' : index === 2 ? '1 hour ago' : `${index} hours ago`,
      project: update.schoolName,
      priority: index < 3 ? 'high' : index < 7 ? 'medium' : 'low'
    }));

  const stats = [
    { label: 'Total Updates', value: updates.length },
    { label: 'High Priority', value: updates.filter(u => u.priority === 'high').length },
    { label: 'Medium Priority', value: updates.filter(u => u.priority === 'medium').length },
    { label: 'Low Priority', value: updates.filter(u => u.priority === 'low').length },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'budget': return <Activity className="w-5 h-5 text-blue-600" />;
      case 'task': return <Bell className="w-5 h-5 text-amber-600" />;
      case 'system': return <Activity className="w-5 h-5 text-gray-600" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-emerald-50 border-emerald-200';
      case 'budget': return 'bg-blue-50 border-blue-200';
      case 'task': return 'bg-amber-50 border-amber-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Real-Time Updates</h1>
        <p className="text-gray-600 mt-2">Live feed of project activities and notifications</p>
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
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Updates Feed */}
      <div className="space-y-4">
        {updates.map((update, index) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${getTypeColor(update.type)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                {getTypeIcon(update.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{update.title}</h3>
                    {update.project && (
                      <p className="text-sm text-gray-600 mt-1">Project: {update.project}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      update.type === 'project' ? 'bg-emerald-100 text-emerald-700' :
                      update.type === 'budget' ? 'bg-blue-100 text-blue-700' :
                      update.type === 'task' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {update.type.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      update.priority === 'high' ? 'bg-red-100 text-red-700' :
                      update.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {update.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{update.description}</p>
                <span className="text-sm text-gray-500">{update.timestamp}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeUpdate;
