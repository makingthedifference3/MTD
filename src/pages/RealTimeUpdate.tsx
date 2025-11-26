import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, TrendingUp, Plus, X } from 'lucide-react';
import { realTimeUpdatesService } from '../services/realTimeUpdatesService';
import type { RealTimeUpdateWithDetails, UpdateStats } from '../services/realTimeUpdatesService';
import { useFilter } from '../context/useFilter';
import { supabase } from '../services/supabaseClient';
import FilterBar from '../components/FilterBar';

const RealTimeUpdate = () => {
  const { selectedProject, selectedPartner, projects, filteredProjects, csrPartners } = useFilter();
  const [allUpdates, setAllUpdates] = useState<RealTimeUpdateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // Form state
  const [formData, setFormData] = useState({
    partnerId: selectedPartner || '',
    projectId: selectedProject || '',
    title: '',
    description: '',
    updateType: 'Progress',
    schoolName: '',
    address: '',
    city: '',
    state: '',
    isPublic: true,
    isSentToClient: false,
  });

  // Load updates on mount and when project or partner changes
  useEffect(() => {
    loadUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, selectedPartner]);

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Generate unique update code using timestamp and random number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updateCode = `UPDATE-${timestamp}-${random}`;

      // Insert into Supabase
      const { error } = await supabase
        .from('real_time_updates')
        .insert([
          {
            update_code: updateCode,
            project_id: formData.projectId,
            title: formData.title,
            description: formData.description,
            update_type: formData.updateType,
            school_name: formData.schoolName || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            is_public: formData.isPublic,
            is_sent_to_client: formData.isSentToClient,
            images: [],
            videos: {},
            documents: {},
            impact_data: {},
            metrics: {},
            date: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error creating update:', error);
        alert('Failed to create update: ' + error.message);
        return;
      }

      // Reset form and reload
      setFormData({
        partnerId: selectedPartner || '',
        projectId: selectedProject || '',
        title: '',
        description: '',
        updateType: 'Progress',
        schoolName: '',
        address: '',
        city: '',
        state: '',
        isPublic: true,
        isSentToClient: false,
      });
      setShowModal(false);
      loadUpdates();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create update');
    } finally {
      setSubmitting(false);
    }
  };

  const loadUpdates = async () => {
    try {
      setLoading(true);
      let data;

      if (selectedProject) {
        // Show updates for selected project
        data = await realTimeUpdatesService.getUpdatesByProject(selectedProject);
      } else if (selectedPartner) {
        // Show updates for selected partner (filtered projects)
        const partnerProjectIds = filteredProjects.map(p => p.id);
        data = await realTimeUpdatesService.getAllUpdates();
        data = data.filter(u => partnerProjectIds.includes(u.project_id));
      } else {
        // Show all updates
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
      {/* FilterBar */}
      <div className="mb-6">
        <FilterBar />
      </div>

      {/* Header with Add Button */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Updates</h1>
          <p className="text-gray-600 mt-2">Live feed of project activities and notifications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Update</span>
        </button>
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

      {/* New Update Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Update</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddUpdate} className="space-y-4">
                {/* CSR Partner Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CSR Partner
                  </label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => {
                      setFormData({ ...formData, partnerId: e.target.value, projectId: '' });
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="">All Partners</option>
                    {csrPartners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                    required
                  >
                    <option value="">Select a project</option>
                    {formData.partnerId
                      ? projects
                          .filter(p => p.csr_partner_id === formData.partnerId)
                          .map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))
                      : projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))
                    }
                  </select>
                </div>

                {/* Update Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Update Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.updateType}
                    onChange={(e) => setFormData({ ...formData, updateType: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white"
                  >
                    <option value="Progress">Progress</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Issue">Issue</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., LAJJA Kit Distribution Drive"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the update..."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="e.g., St. Mary's School"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                </div>

                {/* Address */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all"
                  />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Make Public</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSentToClient}
                      onChange={(e) => setFormData({ ...formData, isSentToClient: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Send to Client</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Create Update</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeUpdate;
