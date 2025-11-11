import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, FolderKanban, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  partner: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamSize: number;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  progress: number;
}

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [projects] = useState<Project[]>([
    { id: 'PRJ001', name: 'Community Center Build', partner: 'Green Earth Foundation', startDate: '2024-01-15', endDate: '2024-12-31', budget: 500000, spent: 350000, teamSize: 12, status: 'on-track', progress: 70 },
    { id: 'PRJ002', name: 'Education Drive', partner: 'Education First Trust', startDate: '2024-02-01', endDate: '2024-11-30', budget: 300000, spent: 180000, teamSize: 8, status: 'on-track', progress: 60 },
    { id: 'PRJ003', name: 'Health Camp Setup', partner: 'Healthcare Alliance', startDate: '2024-03-10', endDate: '2024-09-30', budget: 250000, spent: 200000, teamSize: 10, status: 'at-risk', progress: 80 },
    { id: 'PRJ004', name: 'Clean Water Initiative', partner: 'Clean Water Initiative', startDate: '2024-01-20', endDate: '2024-08-31', budget: 400000, spent: 320000, teamSize: 15, status: 'delayed', progress: 65 },
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.partner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
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
                  <p className="text-sm text-gray-600">{project.id} • {project.partner}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">{project.startDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">₹{(project.budget / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Spent</p>
                  <p className="text-sm font-semibold text-gray-900">₹{(project.spent / 1000).toFixed(0)}K</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-600">Team Size</p>
                  <p className="text-sm font-semibold text-gray-900">{project.teamSize}</p>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
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
