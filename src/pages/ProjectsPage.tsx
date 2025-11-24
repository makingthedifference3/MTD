import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, FolderKanban, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { projectsService } from '../services/projectsService';
import type { ProjectWithDetails } from '../services/projectsService';

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [allProjects, setAllProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAllProjects();
      setAllProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectStatus = (project: ProjectWithDetails): 'on-track' | 'at-risk' | 'delayed' | 'completed' => {
    // Map database status values to display status
    if (project.status === 'completed') return 'completed';
    if (project.status === 'on_hold' || project.status === 'cancelled') return 'delayed';
    
    // Check completion percentage to determine if on-track or at-risk
    const completion = project.completion_percentage || 0;
    if (completion < 50 && new Date(project.expected_end_date || new Date()) < new Date()) {
      return 'at-risk';
    }
    return 'on-track';
  };

  const filteredProjects = allProjects.filter(project => {
    const displayStatus = getProjectStatus(project);
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.partner_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (project.project_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || displayStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: 'on-track' | 'at-risk' | 'delayed' | 'completed') => {
    switch (status) {
      case 'on-track':
        return 'bg-emerald-100 text-emerald-700';
      case 'at-risk':
        return 'bg-amber-100 text-amber-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Manage and track all CSR projects</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="on-track">On Track</option>
            <option value="at-risk">At Risk</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <FolderKanban className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.project_code} • {project.partner_name}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getProjectStatus(project))}`}>
                {getProjectStatus(project).replace('-', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">₹{((project.total_budget || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Utilized</p>
                  <p className="text-sm font-semibold text-gray-900">₹{((project.utilized_budget || 0) / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Team Size</p>
                  <p className="text-sm font-semibold text-gray-900">{project.team_member_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{project.completion_percentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.completion_percentage || 0}%` }}
                />
              </div>
            </div>

            <button className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-2 rounded-lg transition-colors">
              View Project Details
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
