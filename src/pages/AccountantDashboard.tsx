import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, ChevronRight,
  ArrowLeft, MapPin, Briefcase, Leaf, Building2, Heart, Droplet, GraduationCap,
  CheckCircle2, Users, Activity, Award, type LucideIcon,
  TrendingUp, ArrowUpRight, ArrowDownRight, Wallet,
  FolderOpen, FileText, Edit2, Check, X
} from 'lucide-react';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useFilter } from '../context/useFilter';
import { useProjectContext } from '../context/useProjectContext';
import { useProjectContextLock } from '../hooks/useProjectContext';
import FilterBar from '../components/FilterBar';
import LockedFilterBar from '../components/LockedFilterBar';
import type { Project } from '../services/filterService';


// Helper function to map icon names to actual Lucide icons
const getIconComponent = (iconName?: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'Leaf': Leaf,
    'Heart': Heart,
    'GraduationCap': GraduationCap,
    'Droplet': Droplet,
    'FolderKanban': FolderKanban,
    'Activity': Activity,
    'Laptop': Building2,
    'Users': Users,
    'Briefcase': Briefcase,
    'AlertCircle': Award,
    'TrendingUp': Activity,
    'Wrench': Award,
    'Camera': FolderKanban,
    'Music': Heart,
    'Home': Building2,
    'Shield': Heart,
    'Hammer': Award,
    'ShoppingCart': Users,
    'Truck': Activity,
    'Apple': Heart,
    'BookOpen': Heart,
    'Lightbulb': Heart,
    'Bike': Heart,
    'Wallet': Heart,
  };
  return iconMap[iconName || 'FolderKanban'] || FolderKanban;
};

interface ProjectWithBeneficiaries extends Project {
  displayName?: string;
  total_budget?: number;
  utilized_budget?: number;
  meals_served?: number;
  pads_distributed?: number;
  students_enrolled?: number;
  trees_planted?: number;
  schools_renovated?: number;
}

const AccountantDashboard = () => {
  // Lock filters when viewing from project context
  useProjectContextLock();

  const {
    csrPartners,
    selectedPartner,
    selectedProject,
    filteredProjects,
    setSelectedPartner,
    setSelectedProject,
    resetFilters,
    isLoading,
    error,
  } = useFilter();

  const { isProjectSelected } = useProjectContext();

  const [viewMode, setViewMode] = useState<'partners' | 'projects' | 'projectDetails'>('partners');
  const [selectedProjectData, setSelectedProjectData] = useState<ProjectWithBeneficiaries | null>(null);
  const [budgetCategories, setBudgetCategories] = useState<any[]>([]);
  const [budgetCategoriesLoading, setBudgetCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ allocated: '', utilized: '' });

  // Fetch budget categories when project is selected
  useEffect(() => {
    const loadBudgetCategories = async () => {
      if (!selectedProjectData?.id) {
        setBudgetCategories([]);
        return;
      }

      try {
        setBudgetCategoriesLoading(true);
        const { getBudgetCategoriesByProject } = await import('../services/budgetCategoriesService');
        const categories = await getBudgetCategoriesByProject(selectedProjectData.id);
        setBudgetCategories(categories);
      } catch (error) {
        console.error('Failed to load budget categories:', error);
        setBudgetCategories([]);
      } finally {
        setBudgetCategoriesLoading(false);
      }
    };

    if (viewMode === 'projectDetails') {
      loadBudgetCategories();
    }
  }, [selectedProjectData?.id, viewMode]);

  // Auto-switch to projects view when a partner is selected via FilterBar
  useEffect(() => {
    if (selectedPartner) {
      setViewMode('projects');
    }
  }, [selectedPartner]);

  // Auto-switch to project details when a project is selected via FilterBar
  useEffect(() => {
    console.log('AccountantDashboard - selectedProject:', selectedProject);
    if (selectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find(p => p.id === selectedProject);
      console.log('AccountantDashboard - Found project:', project?.name);
      if (project) {
        setSelectedProjectData(project as ProjectWithBeneficiaries);
        setViewMode('projectDetails');
      }
    }
  }, [selectedProject, filteredProjects]);

  // Get selected partner object from csrPartners using the selectedPartner ID from context
  const selectedPartnerObject = selectedPartner 
    ? csrPartners.find(p => p.id === selectedPartner)
    : null;

  // Get projects for selected partner - directly use filteredProjects which is already filtered by context
  const partnerProjects = filteredProjects;

  console.log('AccountantDashboard - selectedPartner:', selectedPartner);
  console.log('AccountantDashboard - partnerProjects count:', partnerProjects.length);
  console.log('AccountantDashboard - partnerProjects:', partnerProjects);

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setViewMode('projects');
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProjectData(project as ProjectWithBeneficiaries);
    setSelectedProject(project.id);
    setViewMode('projectDetails');
  };

  const handleBack = () => {
    if (viewMode === 'projectDetails') {
      setViewMode('projects');
      setSelectedProjectData(null);
      setSelectedProject(null);
      setBudgetCategories([]);
    } else if (viewMode === 'projects') {
      setViewMode('partners');
      setSelectedPartner(null);
      resetFilters();
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category.id);
    setEditValues({ 
      allocated: category.allocated_amount.toString(),
      utilized: category.utilized_amount.toString()
    });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const { updateBudgetCategory } = await import('../services/budgetCategoriesService');
      await updateBudgetCategory(editingCategory, {
        allocated_amount: parseFloat(editValues.allocated || '0'),
        utilized_amount: parseFloat(editValues.utilized || '0'),
      });
      
      // Reload categories
      const { getBudgetCategoriesByProject } = await import('../services/budgetCategoriesService');
      const categories = await getBudgetCategoriesByProject(selectedProjectData!.id);
      setBudgetCategories(categories);
      
      // Reload project data to get updated utilized_budget
      const { projectsService } = await import('../services/projectsService');
      const updatedProject = await projectsService.getProjectById(selectedProjectData!.id);
      if (updatedProject) {
        setSelectedProjectData(updatedProject as ProjectWithBeneficiaries);
      }
      
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

  // Calculate budget statistics
  const budgetStats = useMemo(() => {
    if (!selectedProjectData) {
      return { total: 0, utilized: 0, remaining: 0, utilizationRate: 0 };
    }

    const total = selectedProjectData.total_budget || 0;
    const utilized = selectedProjectData.utilized_budget || 0;
    const remaining = total - utilized;
    const utilizationRate = total > 0 ? Math.round((utilized / total) * 100) : 0;

    return {
      total,
      utilized,
      remaining,
      utilizationRate,
    };
  }, [selectedProjectData]);

  // Prepare data for category breakdown chart
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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 via-emerald-400/5 to-transparent rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl shadow-emerald-500/5 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                  Budget Management Center
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {selectedProjectData ? `Budget Details - ${selectedProjectData.name}` : 'Select a project to view budget details'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Locked Filter Bar - Always show for accountant */}
      {isProjectSelected && <LockedFilterBar />}
      
      {/* Budget Overview Section */}
      {selectedProjectData && !budgetCategoriesLoading ? (
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
              className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500"
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
                  <h3 className="text-5xl font-bold">₹{(budgetStats.total / 1000).toFixed(1)}K</h3>
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
                  <h3 className="text-5xl font-bold">₹{(budgetStats.utilized / 1000).toFixed(1)}K</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3 py-1 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-400">
                      {budgetStats.utilizationRate}% used
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
                    budgetStats.remaining > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {budgetStats.remaining > 0 ? 'Available' : 'Exceeded'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Budget Remaining</p>
                  <h3 className="text-5xl font-bold text-black">₹{(Math.abs(budgetStats.remaining) / 1000).toFixed(1)}K</h3>
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
                <div className="p-8 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                  <h2 className="text-2xl font-bold text-black mb-1">Budget Categories</h2>
                  <p className="text-gray-500 text-sm">Allocation breakdown with subcategories</p>
                </div>
                <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                {budgetCategories.filter(c => !c.parent_id).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No budget categories defined</p>
                    <p className="text-sm mt-2">Add categories in the project edit page</p>
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
                                <div>
                                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                                  {category.description && (
                                    <p className="text-xs text-gray-500">{category.description}</p>
                                  )}
                                </div>
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
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Allocated Amount</label>
                                    <input
                                      type="number"
                                      value={editValues.allocated}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, allocated: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Utilized Amount</label>
                                    <input
                                      type="number"
                                      value={editValues.utilized}
                                      onChange={(e) => setEditValues(prev => ({ ...prev, utilized: e.target.value }))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSaveCategory()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold text-sm"
                                  >
                                    <Check className="w-4 h-4" />
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Visual Budget Breakdown */}
                                <div className="relative">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Budget Overview</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                      utilizationPercent > 100 ? 'bg-red-100 text-red-700' :
                                      utilizationPercent > 80 ? 'bg-amber-100 text-amber-700' :
                                      'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {utilizationPercent}% Used
                                    </span>
                                  </div>
                                  
                                  {/* Stacked Progress Bar */}
                                  <div className="relative h-8 bg-gray-100 rounded-xl overflow-hidden mb-3">
                                    <div
                                      className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-400 to-emerald-500 flex items-center justify-center transition-all duration-500"
                                      style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                                    >
                                      {utilizationPercent > 15 && (
                                        <span className="text-xs font-bold text-white px-2">₹{(category.utilized_amount / 1000).toFixed(0)}K</span>
                                      )}
                                    </div>
                                    {utilizationPercent > 100 && (
                                      <div className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-red-500 to-red-600 opacity-50 animate-pulse"></div>
                                    )}
                                  </div>

                                  {/* Amount Cards Grid */}
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                                      <div className="flex items-center gap-1 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        <p className="text-xs font-bold text-gray-600">Allocated</p>
                                      </div>
                                      <p className="text-lg font-black text-gray-900">₹{(category.allocated_amount / 1000).toFixed(1)}K</p>
                                    </div>
                                    <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
                                      <div className="flex items-center gap-1 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <p className="text-xs font-bold text-amber-700">Utilized</p>
                                      </div>
                                      <p className="text-lg font-black text-amber-900">₹{(category.utilized_amount / 1000).toFixed(1)}K</p>
                                    </div>
                                    <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
                                      <div className="flex items-center gap-1 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <p className="text-xs font-bold text-emerald-700">Available</p>
                                      </div>
                                      <p className="text-lg font-black text-emerald-900">₹{(category.available_amount / 1000).toFixed(1)}K</p>
                                    </div>
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
                                          <button onClick={() => handleSaveCategory()} className="flex-1 flex items-center justify-center gap-1 p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs font-semibold">
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
                className="bg-linear-to-br from-purple-500 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
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
                          stroke={budgetStats.utilizationRate > 100 ? '#ef4444' : budgetStats.utilizationRate > 80 ? '#f59e0b' : '#10b981'}
                          strokeWidth="16"
                          fill="none"
                          strokeDasharray={`${(Math.min(budgetStats.utilizationRate, 100) / 100) * 553} 553`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black">{budgetStats.utilizationRate}%</span>
                        <span className="text-sm text-purple-200 font-semibold mt-1">Utilized</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className={`text-center p-4 rounded-2xl ${
                    budgetStats.utilizationRate > 100 ? 'bg-red-500/20' :
                    budgetStats.utilizationRate > 80 ? 'bg-amber-500/20' :
                    'bg-emerald-500/20'
                  }`}>
                    <span className="text-lg font-bold">
                      {budgetStats.utilizationRate > 100 ? '⚠️ Over Budget' :
                       budgetStats.utilizationRate > 80 ? '⚡ High Utilization' :
                       '✓ Healthy Budget'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Charts */}
            <div className="space-y-6">
              {/* Budget Utilization Bar Chart */}
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
                className="bg-linear-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
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

              {/* Category Timeline Progress */}
              {categoryChartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-500"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-black mb-1">Budget Timeline</h2>
                    <p className="text-gray-500 text-sm">Category-wise spending progress</p>
                  </div>
                  <div className="space-y-6">
                    {categoryChartData.map((category, index) => {
                      const utilizationPercent = category.allocated > 0 
                        ? Math.round((category.utilized / category.allocated) * 100) 
                        : 0;
                      
                      return (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="font-bold text-gray-900 text-sm">{category.name}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-600">
                              ₹{(category.utilized / 1000).toFixed(1)}K / ₹{(category.allocated / 1000).toFixed(1)}K
                            </span>
                          </div>
                          
                          {/* Timeline Progress Bar */}
                          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                              style={{ 
                                width: `${Math.min(utilizationPercent, 100)}%`,
                                backgroundColor: category.color
                              }}
                            >
                              {/* Animated shimmer effect */}
                              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                            
                            {/* Milestone markers */}
                            <div className="absolute inset-0 flex items-center justify-between px-1">
                              <div className="w-0.5 h-2 bg-white/50 rounded-full"></div>
                              <div className="w-0.5 h-2 bg-white/50 rounded-full"></div>
                              <div className="w-0.5 h-2 bg-white/50 rounded-full"></div>
                              <div className="w-0.5 h-2 bg-white/50 rounded-full"></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1 text-xs">
                            <span className="text-gray-400">0%</span>
                            <span className={`font-bold ${
                              utilizationPercent > 100 ? 'text-red-600' :
                              utilizationPercent > 80 ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                              {utilizationPercent}%
                            </span>
                            <span className="text-gray-400">100%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      ) : budgetCategoriesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No project selected</p>
          <p className="text-sm mt-2">Please contact admin to assign a project</p>
        </div>
      )}
      
      {/* Keep hierarchy view for navigation if needed */}
      {!isProjectSelected && (
        <>
          {/* Regular Filter Bar */}
          <FilterBar />

          {/* Back Button */}
          {viewMode !== 'partners' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all font-semibold text-gray-900 hover:text-emerald-600 shadow-lg hover:shadow-emerald-500/20"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>
          )}

          <AnimatePresence mode="wait">
        {/* PARTNERS VIEW */}
        {viewMode === 'partners' && (
          <motion.div
            key="partners"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading partners...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            ) : csrPartners.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center">
                <p className="text-amber-800 font-semibold text-lg">No CSR Partners found</p>
                <p className="text-amber-700 mt-2">Please insert sample data into the database first</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {csrPartners.map((partner, index) => {
                // Count projects for this partner from filteredProjects
                const partnerProjectCount = filteredProjects.filter((p: Project) => p.csr_partner_id === partner.id).length;
                return (
                  <motion.button
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handlePartnerClick(partner.id)}
                    className="group relative text-left"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                    
                    <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-all">
                            <Briefcase className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            {partnerProjectCount} Projects
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                        {partner.company_name && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.company_name}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                          View Projects
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECTS VIEW */}
        {viewMode === 'projects' && selectedPartnerObject && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                <Building2 className="w-4 h-4" />
                {selectedPartnerObject.name}
              </div>
            </div>

            {partnerProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerProjects.map((project, index) => {
                  const Icon = getIconComponent(project.display_icon);
                  const colorClass = project.display_color || 'emerald';
                  
                  return (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleProjectClick(project)}
                      className="group relative text-left"
                    >
                      <div className={`absolute inset-0 bg-linear-to-br from-${colorClass}-500/20 to-${colorClass}-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100`}></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass}-500/5 rounded-bl-3xl group-hover:bg-${colorClass}-500/10 transition-colors`}></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 bg-${colorClass}-100 group-hover:bg-${colorClass}-200 rounded-xl transition-all`}>
                              <Icon className={`w-6 h-6 text-${colorClass}-600`} />
                            </div>
                            <div className={`text-sm font-bold text-${colorClass}-600 bg-${colorClass}-50 px-3 py-1 rounded-full`}>
                              {project.status || 'Active'}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                          
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            View Details
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No projects found for this partner</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PROJECT DETAILS VIEW */}
        {viewMode === 'projectDetails' && selectedProjectData && (
          <motion.div
            key="projectDetails"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Project Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-6 shadow-lg"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className={`p-4 bg-${selectedProjectData.display_color || 'emerald'}-100 rounded-xl`}>
                    {(() => {
                      const Icon = getIconComponent(selectedProjectData.display_icon);
                      return <Icon className={`w-8 h-8 text-${selectedProjectData.display_color || 'emerald'}-600`} />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProjectData.name}</h2>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        {selectedProjectData.status || 'Active'}
                      </span>
                      {selectedPartnerObject && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          <Building2 className="w-4 h-4" />
                          {selectedPartnerObject.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Project Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProjectData.description}</p>
                </div>

                {/* Impact Metrics - ALL FROM DATABASE */}
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Impact Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Total Beneficiaries */}
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700 uppercase">Total Reach</span>
                    </div>
                    <p className="text-2xl font-black text-emerald-900">
                      {(selectedProjectData.direct_beneficiaries || 0).toLocaleString()}
                    </p>
                  </div>

                  {/* Meals Served */}
                  {(selectedProjectData.meals_served || 0) > 0 && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="text-xs font-bold text-orange-700 uppercase">Meals</span>
                      </div>
                      <p className="text-2xl font-black text-orange-900">
                        {((selectedProjectData.meals_served || 0) / 1000).toFixed(1)}K
                      </p>
                    </div>
                  )}

                  {/* Pads Distributed */}
                  {(selectedProjectData.pads_distributed || 0) > 0 && (
                    <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-pink-600" />
                        <span className="text-xs font-bold text-pink-700 uppercase">Pads</span>
                      </div>
                      <p className="text-2xl font-black text-pink-900">
                        {((selectedProjectData.pads_distributed || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  )}

                  {/* Students Enrolled */}
                  {(selectedProjectData.students_enrolled || 0) > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase">Students</span>
                      </div>
                      <p className="text-2xl font-black text-blue-900">
                        {(selectedProjectData.students_enrolled || 0).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Trees Planted */}
                  {(selectedProjectData.trees_planted || 0) > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase">Trees</span>
                      </div>
                      <p className="text-2xl font-black text-green-900">
                        {((selectedProjectData.trees_planted || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                  )}

                  {/* Schools Renovated */}
                  {(selectedProjectData.schools_renovated || 0) > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderKanban className="w-5 h-5 text-purple-600" />
                        <span className="text-xs font-bold text-purple-700 uppercase">Schools</span>
                      </div>
                      <p className="text-2xl font-black text-purple-900">
                        {selectedProjectData.schools_renovated || '0'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Project Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
              >
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">PROJECT ID</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">PROJECT CODE</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.project_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">STATUS</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.status || 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">LOCATION</p>
                    <p className="text-gray-900 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {selectedProjectData.location || 'India'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">STATE</p>
                    <p className="text-gray-900 font-bold">{selectedProjectData.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">TOTAL BUDGET</p>
                    <p className="text-gray-900 font-bold text-lg">₹{(selectedProjectData.total_budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">UTILIZED BUDGET</p>
                    <p className="text-gray-900 font-bold text-lg">₹{(selectedProjectData.utilized_budget || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">BUDGET REMAINING</p>
                    <p className="text-emerald-600 font-bold text-lg">
                      ₹{((selectedProjectData.total_budget || 0) - (selectedProjectData.utilized_budget || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">INDIRECT BENEFICIARIES</p>
                    <p className="text-gray-900 font-bold">{(selectedProjectData.indirect_beneficiaries || 0).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AccountantDashboard;
