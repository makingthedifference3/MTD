import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bell, TrendingUp } from 'lucide-react';
import { realTimeUpdatesService } from '../services/realTimeUpdatesService';
import type { RealTimeUpdateWithDetails, UpdateStats } from '../services/realTimeUpdatesService';
import { useFilter } from '../context/useFilter';

const RealTimeUpdate = () => {
  const { selectedProject } = useFilter();
  const [allUpdates, setAllUpdates] = useState<RealTimeUpdateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UpdateStats>({
    total: 0,
    progress: 0,
    issue: 0,
    achievement: 0,
    milestone: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });

  useEffect(() => {
    loadUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedProject) {
        data = await realTimeUpdatesService.getUpdatesByProject(selectedProject);
      } else {
        data = await realTimeUpdatesService.getAllUpdates();
      }

      setAllUpdates(data);
      const updateStats = await realTimeUpdatesService.getUpdateStats(data);
      setStats(updateStats);
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert updates to display format with priority
  const updates = allUpdates.map((update, index) => ({
    id: update.id,
    type: (update.update_type?.toLowerCase() || 'project') as 'progress' | 'issue' | 'achievement' | 'milestone' | 'project',
    title: update.title || `${update.school_name || update.institution_name || 'Update'} - ${update.update_code}`,
    description: update.description || 'No description provided',
    timestamp: update.days_ago || 'Recently',
    project: update.project_name || 'Unknown Project',
    priority: realTimeUpdatesService.getUpdatePriority(index, allUpdates.length),
  }));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      case 'achievement':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'milestone':
        return <Bell className="w-5 h-5 text-amber-600" />;
      case 'issue':
        return <Activity className="w-5 h-5 text-red-600" />;
      case 'project':
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress':
        return 'bg-emerald-50 border-emerald-200';
      case 'achievement':
        return 'bg-blue-50 border-blue-200';
      case 'milestone':
        return 'bg-amber-50 border-amber-200';
      case 'issue':
        return 'bg-red-50 border-red-200';
      case 'project':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Real-Time Updates</h1>
        <p className="text-gray-600 mt-2">Live feed of project activities and notifications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Total Updates</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">High Priority</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.highPriority}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Medium Priority</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.mediumPriority}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <p className="text-gray-600 text-sm font-medium mb-1">Low Priority</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.lowPriority}</h3>
        </motion.div>
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
                      update.type === 'progress' ? 'bg-emerald-100 text-emerald-700' :
                      update.type === 'achievement' ? 'bg-blue-100 text-blue-700' :
                      update.type === 'milestone' ? 'bg-amber-100 text-amber-700' :
                      update.type === 'issue' ? 'bg-red-100 text-red-700' :
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
