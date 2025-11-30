import { motion } from 'framer-motion';
import { 
  IndianRupee, TrendingUp, TrendingDown, FolderKanban, Building2, 
  Wallet, Activity, ArrowUpRight, ArrowDownRight, Edit2, Check, X,
  FolderOpen, FileText, Users, MapPin, Briefcase
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useFilter } from '../context/useFilter';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CSRBudgetPage = () => {
  const { 
    filteredProjects, 
    csrPartners, 
    selectedPartner, 
    selectedProject: contextSelectedProject, 
    tolls, 
    selectedToll, 
    setSelectedPartner, 
    setSelectedToll, 
    setSelectedProject: setContextSelectedProject, 
    refreshData 
  } = useFilter();

  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
  const [budgetCategoriesLoading, setBudgetCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ allocated: '', utilized: '' });
  const [viewMode, setViewMode] = useState<'overview' | 'projectDetail'>('overview');
  const [selectedProjectData, setSelectedProjectData] = useState<any | null>(null);

  // Switch to project detail view when a specific project is selected
  useEffect(() => {
    if (contextSelectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find(p => p.id === contextSelectedProject);
      if (project) {
        setSelectedProjectData(project);
        setViewMode('projectDetail');
        loadBudgetCategories(project.id);
      }
    } else {
      setViewMode('overview');
      setSelectedProjectData(null);
      setBudgetCategories([]);
    }
  }, [contextSelectedProject, filteredProjects]);

  // Load budget categories for selected project
  const loadBudgetCategories = async (projectId: string) => {
    try {
      setBudgetCategoriesLoading(true);
      const { getBudgetCategoriesByProject } = await import('../services/budgetCategoriesService');
      const categories = await getBudgetCategoriesByProject(projectId);
      setBudgetCategories(categories);
    } catch (error) {
      console.error('Failed to load budget categories:', error);
      setBudgetCategories([]);
    } finally {
      setBudgetCategoriesLoading(false);
    }
  };

  // Calculate overall stats from filtered projects
  const overallStats = useMemo(() => {
    const totalAllocated = filteredProjects.reduce((sum, p) => sum + (p.total_budget || 0), 0);
    const totalUtilized = filteredProjects.reduce((sum, p) => sum + (p.utilized_budget || 0), 0);
    const totalRemaining = totalAllocated - totalUtilized;
    const utilizationRate = totalAllocated > 0 ? Math.round((totalUtilized / totalAllocated) * 100) : 0;

    return {
      totalAllocated,
      totalUtilized,
      totalRemaining,
      utilizationRate,
    };
  }, [filteredProjects]);

  // Prepare chart data for all projects
  const projectChartData = useMemo(() => {
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];
    
    return filteredProjects.slice(0, 10).map((project, index) => ({
      name: project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name,
      allocated: project.total_budget || 0,
      utilized: project.utilized_budget || 0,
      color: colors[index % colors.length],
    }));
  }, [filteredProjects]);

  // Budget stats for selected project
  const projectBudgetStats = useMemo(() => {
    if (!selectedProjectData) {
      return { total: 0, utilized: 0, remaining: 0, utilizationRate: 0 };
    }

    const total = selectedProjectData.total_budget || 0;
    const utilized = selectedProjectData.utilized_budget || 0;
    const remaining = total - utilized;
    const utilizationRate = total > 0 ? Math.round((utilized / total) * 100) : 0;

    return { total, utilized, remaining, utilizationRate };
  }, [selectedProjectData]);

  // Category chart data for selected project
  const categoryChartData = useMemo(() => {
    const rootCategories = budgetCategories.filter((cat: any) => !cat.parent_id);
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
    
    return rootCategories.map((cat: any, index: number) => ({
      name: cat.name,
      allocated: cat.allocated_amount,
      utilized: cat.utilized_amount,
      available: cat.available_amount,
      color: colors[index % colors.length],
    }));
  }, [budgetCategories]);

  const handleEditCategory = (category: any) => {
    setEditingCategory(category.id);
    setEditValues({ 
      allocated: category.allocated_amount.toString(),
      utilized: category.utilized_amount.toString()
    });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !selectedProjectData) return;
    
    try {
      const { updateBudgetCategory } = await import('../services/budgetCategoriesService');
      await updateBudgetCategory(editingCategory, {
        allocated_amount: parseFloat(editValues.allocated || '0'),
        utilized_amount: parseFloat(editValues.utilized || '0'),
      });
      
      // Reload categories
      const { getBudgetCategoriesByProject } = await import('../services/budgetCategoriesService');
      const categories = await getBudgetCategoriesByProject(selectedProjectData.id);
      setBudgetCategories(categories);
      
      // Reload project data
      const { projectsService } = await import('../services/projectsService');
      const updatedProject = await projectsService.getProjectById(selectedProjectData.id);
      if (updatedProject) {
        setSelectedProjectData(updatedProject);
      }

      // Refresh all data
      await refreshData();
      
      setEditingCategory(null);
      setEditValues({ allocated: '', utilized: '' });
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValues({ allocated: '', utilized: '' });
  };

  const handleBackToOverview = () => {
    setContextSelectedProject(null);
    setViewMode('overview');
    setSelectedProjectData(null);
    setBudgetCategories([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl shadow-emerald-500/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                  CSR Budget Management
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {viewMode === 'projectDetail' && selectedProjectData 
                    ? `Budget Details - ${selectedProjectData.name}` 
                    : 'Comprehensive budget overview across all projects'}
                </p>
              </div>
            </div>
            {viewMode === 'projectDetail' && (
              <button
                onClick={handleBackToOverview}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-semibold text-gray-900 hover:text-emerald-600 shadow-lg hover:shadow-emerald-500/20"
              >
                <ArrowDownRight className="w-5 h-5" />
                Back to Overview
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-white rounded-3xl shadow-lg border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSR Partner Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CSR Partner</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <select
                value={selectedPartner || 'all'}
                onChange={(e) => {
                  setSelectedPartner(e.target.value === 'all' ? null : e.target.value);
                  setSelectedToll(null);
                  setContextSelectedProject(null);
                }}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
              >
                <option value="all">All Partners</option>
                {csrPartners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toll Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Toll</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <select
                value={selectedToll || 'all'}
                onChange={(e) => {
                  setSelectedToll(e.target.value === 'all' ? null : e.target.value);
                  setContextSelectedProject(null);
                }}
                disabled={!selectedPartner || tolls.length === 0}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="all">All Tolls</option>
                {tolls.map(toll => (
                  <option key={toll.id} value={toll.id}>{toll.toll_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <select
                value={contextSelectedProject || 'all'}
                onChange={(e) => setContextSelectedProject(e.target.value === 'all' ? null : e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
              >
                <option value="all">All Projects</option>
                {filteredProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.project_code} - {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* OVERVIEW MODE */}
      {viewMode === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Allocated Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 opacity-70" />
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Allocated</p>
                  <h3 className="text-4xl font-bold break-words">₹{(overallStats.totalAllocated / 100000).toFixed(2)}L</h3>
                  <p className="text-emerald-200 text-xs">{filteredProjects.length} Projects</p>
                </div>
              </div>
            </motion.div>

            {/* Total Utilized Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <TrendingUp className="w-7 h-7 text-amber-400" />
                  </div>
                  <ArrowDownRight className="w-6 h-6 text-amber-400 opacity-70" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Total Utilized</p>
                  <h3 className="text-4xl font-bold break-words">₹{(overallStats.totalUtilized / 100000).toFixed(2)}L</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-400">
                      {overallStats.utilizationRate}% used
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Remaining Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <Activity className="w-7 h-7 text-emerald-600" />
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    overallStats.totalRemaining > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {overallStats.totalRemaining > 0 ? 'Available' : 'Exceeded'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Remaining</p>
                  <h3 className="text-4xl font-bold text-black break-words">₹{(Math.abs(overallStats.totalRemaining) / 100000).toFixed(2)}L</h3>
                </div>
              </div>
            </motion.div>

            {/* Utilization Rate Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-linear-to-br from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <Activity className="w-7 h-7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Utilization Rate</p>
                  <h3 className="text-5xl font-bold">{overallStats.utilizationRate}%</h3>
                  <div className="w-full bg-white/20 rounded-full h-3 mt-4">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-500"
                      style={{ width: `${Math.min(overallStats.utilizationRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Top Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-500"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-1">Top 10 Projects</h2>
                <p className="text-gray-500 text-sm">Budget allocated vs utilized comparison</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af" 
                    style={{ fontSize: '11px', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#000', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff',
                      padding: '12px 16px'
                    }}
                  />
                  <Bar dataKey="allocated" fill="#10b981" name="Allocated" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="utilized" fill="#f59e0b" name="Utilized" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart - Budget Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-1">Budget Distribution</h2>
                  <p className="text-gray-400 text-sm">Allocation across top projects</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={projectChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="allocated"
                    >
                      {projectChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#000',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {projectChartData.slice(0, 6).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-300 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Project Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-1">All Projects</h2>
              <p className="text-gray-500 text-sm">Click on a project to view detailed budget breakdown</p>
            </div>
            
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => {
                  const utilizationRate = (project.total_budget || 0) > 0 
                    ? Math.round(((project.utilized_budget || 0) / (project.total_budget || 0)) * 100) 
                    : 0;

                  return (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setContextSelectedProject(project.id)}
                      className="group relative text-left bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-all">
                            <FolderKanban className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                            utilizationRate > 100 ? 'bg-red-100 text-red-600' :
                            utilizationRate > 80 ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {utilizationRate}%
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{project.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{project.project_code}</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Allocated</span>
                            <span className="font-bold text-gray-900 truncate ml-2">₹{((project.total_budget || 0) / 100000).toFixed(2)}L</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Utilized</span>
                            <span className="font-bold text-amber-600 truncate ml-2">₹{((project.utilized_budget || 0) / 100000).toFixed(2)}L</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Remaining</span>
                            <span className={`font-bold truncate ml-2 ${
                              ((project.total_budget || 0) - (project.utilized_budget || 0)) >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              ₹{(Math.abs((project.total_budget || 0) - (project.utilized_budget || 0)) / 100000).toFixed(2)}L
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`rounded-full h-2 transition-all duration-500 ${
                                utilizationRate > 100 ? 'bg-red-500' :
                                utilizationRate > 80 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No projects available</p>
                <p className="text-sm mt-2">Adjust filters to view projects</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* PROJECT DETAIL MODE */}
      {viewMode === 'projectDetail' && selectedProjectData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Budget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 opacity-70" />
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Total Budget</p>
                  <h3 className="text-4xl font-bold break-words">₹{(projectBudgetStats.total / 100000).toFixed(2)}L</h3>
                </div>
              </div>
            </motion.div>

            {/* Budget Utilized Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <TrendingUp className="w-7 h-7 text-amber-400" />
                  </div>
                  <ArrowDownRight className="w-6 h-6 text-amber-400 opacity-70" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Budget Utilized</p>
                  <h3 className="text-4xl font-bold break-words">₹{(projectBudgetStats.utilized / 100000).toFixed(2)}L</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-400">
                      {projectBudgetStats.utilizationRate}% used
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Budget Remaining Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <Activity className="w-7 h-7 text-emerald-600" />
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    projectBudgetStats.remaining > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {projectBudgetStats.remaining > 0 ? 'Available' : 'Exceeded'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Budget Remaining</p>
                  <h3 className="text-4xl font-bold text-black break-words">₹{(Math.abs(projectBudgetStats.remaining) / 100000).toFixed(2)}L</h3>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Budget Categories & Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Budget Categories + Health Score */}
            <div className="space-y-6">
              {/* Budget Categories List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-500"
              >
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-2xl font-bold text-black mb-1">Budget Categories</h2>
                  <p className="text-gray-500 text-sm">Allocation breakdown with subcategories</p>
                </div>
                <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                {budgetCategoriesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                  </div>
                ) : budgetCategories.filter(c => !c.parent_id).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No budget categories defined</p>
                    <p className="text-sm mt-2">Add categories in the project settings</p>
                  </div>
                ) : (
                  budgetCategories
                    .filter(category => !category.parent_id)
                    .map((category) => {
                      const subcategories = budgetCategories.filter(c => c.parent_id === category.id);
                      const isEditing = editingCategory === category.id;
                      const utilizationPercent = category.allocated_amount > 0 
                        ? Math.round((category.utilized_amount / category.allocated_amount) * 100) 
                        : 0;

                      return (
                        <div key={category.id} className="border border-gray-200 rounded-2xl p-6 space-y-4 hover:border-emerald-300 transition-colors">
                          {/* Parent Category */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="font-bold text-gray-900 text-lg">{category.name}</span>
                              </div>
                              {!isEditing && (
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-emerald-600" />
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Allocated (₹)</label>
                                    <input
                                      type="number"
                                      value={editValues.allocated}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, allocated: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                                      placeholder="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Utilized (₹)</label>
                                    <input
                                      type="number"
                                      value={editValues.utilized}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, utilized: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={handleSaveCategory} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-semibold">
                                    <Check className="w-4 h-4" />
                                    Save Changes
                                  </button>
                                  <button onClick={handleCancelEdit} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        utilizationPercent > 100 ? 'bg-red-500' :
                                        utilizationPercent > 80 ? 'bg-amber-500' :
                                        'bg-emerald-500'
                                      }`}
                                      style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-gray-600 min-w-[50px] text-right">{utilizationPercent}%</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                                    <div className="flex items-center gap-1 mb-1">
                                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                      <p className="text-xs font-bold text-gray-700">Allocated</p>
                                    </div>
                                    <p className="text-lg font-black text-gray-900">₹{(category.allocated_amount / 1000).toFixed(1)}K</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
                                    <div className="flex items-center gap-1 mb-1">
                                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                      <p className="text-xs font-bold text-amber-700">Utilized</p>
                                    </div>
                                    <p className="text-lg font-black text-amber-900">₹{(category.utilized_amount / 1000).toFixed(1)}K</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
                                    <div className="flex items-center gap-1 mb-1">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                      <p className="text-xs font-bold text-emerald-700">Available</p>
                                    </div>
                                    <p className="text-lg font-black text-emerald-900">₹{(category.available_amount / 1000).toFixed(1)}K</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Subcategories */}
                          {subcategories.length > 0 && (
                            <div className="pl-6 border-l-2 border-gray-200 space-y-3">
                              {subcategories.map((sub) => {
                                const subIsEditing = editingCategory === sub.id;
                                const subUtilizationPercent = sub.allocated_amount > 0 
                                  ? Math.round((sub.utilized_amount / sub.allocated_amount) * 100) 
                                  : 0;

                                return (
                                  <div key={sub.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        <span className="font-semibold text-gray-800 text-sm">{sub.name}</span>
                                      </div>
                                      {!subIsEditing && (
                                        <button
                                          onClick={() => handleEditCategory(sub)}
                                          className="p-1 hover:bg-emerald-50 rounded transition-colors"
                                        >
                                          <Edit2 className="w-3 h-3 text-emerald-600" />
                                        </button>
                                      )}
                                    </div>

                                    {subIsEditing ? (
                                      <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Allocated</label>
                                            <input
                                              type="number"
                                              value={editValues.allocated}
                                              onChange={(e) => setEditValues(prev => ({ ...prev, allocated: e.target.value }))}
                                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                                              placeholder="0"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Utilized</label>
                                            <input
                                              type="number"
                                              value={editValues.utilized}
                                              onChange={(e) => setEditValues(prev => ({ ...prev, utilized: e.target.value }))}
                                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                                              placeholder="0"
                                            />
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button onClick={handleSaveCategory} className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs font-semibold">
                                            <Check className="w-3 h-3" />
                                            Save
                                          </button>
                                          <button onClick={handleCancelEdit} className="p-1.5 bg-gray-200 rounded hover:bg-gray-300">
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all ${
                                                subUtilizationPercent > 100 ? 'bg-red-500' :
                                                subUtilizationPercent > 80 ? 'bg-amber-500' :
                                                'bg-emerald-500'
                                              }`}
                                              style={{ width: `${Math.min(subUtilizationPercent, 100)}%` }}
                                            />
                                          </div>
                                          <span className="text-xs font-bold text-gray-600 min-w-[45px] text-right">{subUtilizationPercent}%</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-0.5">Allocated</p>
                                            <p className="text-sm font-bold text-gray-900">₹{(sub.allocated_amount / 1000).toFixed(1)}K</p>
                                          </div>
                                          <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                                            <p className="text-xs text-amber-600 mb-0.5">Utilized</p>
                                            <p className="text-sm font-bold text-amber-900">₹{(sub.utilized_amount / 1000).toFixed(1)}K</p>
                                          </div>
                                          <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                                            <p className="text-xs text-emerald-600 mb-0.5">Available</p>
                                            <p className="text-sm font-bold text-emerald-900">₹{(sub.available_amount / 1000).toFixed(1)}K</p>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
                </div>
              </motion.div>

              {/* Budget Health Gauge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">Budget Health Score</h2>
                    <p className="text-purple-200 text-sm">Overall financial status</p>
                  </div>
                  
                  {/* Circular Progress Gauge */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                      {/* Background Circle */}
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="16"
                          fill="none"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke={projectBudgetStats.utilizationRate > 100 ? '#ef4444' : projectBudgetStats.utilizationRate > 80 ? '#f59e0b' : '#10b981'}
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${(Math.min(projectBudgetStats.utilizationRate, 100) / 100) * 553} 553`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black">{projectBudgetStats.utilizationRate}%</span>
                        <span className="text-sm text-purple-200 font-semibold mt-1">Utilized</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`text-center p-4 rounded-2xl ${
                    projectBudgetStats.utilizationRate > 100 ? 'bg-red-500/20' :
                    projectBudgetStats.utilizationRate > 80 ? 'bg-amber-500/20' :
                    'bg-emerald-500/20'
                  }`}>
                    <span className="text-lg font-bold">
                      {projectBudgetStats.utilizationRate > 100 ? '⚠️ Over Budget' :
                       projectBudgetStats.utilizationRate > 80 ? '⚡ High Utilization' :
                       '✓ Healthy Budget'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Charts */}
            <div className="space-y-6">
              {/* Category Utilization Bar Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-500"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-black mb-1">Category Utilization</h2>
                  <p className="text-gray-500 text-sm">Allocated vs Utilized comparison</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af" 
                      style={{ fontSize: '11px', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff',
                        padding: '12px 16px'
                      }}
                    />
                    <Bar dataKey="allocated" fill="#10b981" name="Allocated" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="utilized" fill="#f59e0b" name="Utilized" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Budget Distribution Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">Budget Distribution</h2>
                    <p className="text-gray-400 text-sm">Allocation across categories</p>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="allocated"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: 'none', 
                          borderRadius: '12px',
                          color: '#000',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {categoryChartData.slice(0, 6).map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-gray-300 truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CSRBudgetPage;
