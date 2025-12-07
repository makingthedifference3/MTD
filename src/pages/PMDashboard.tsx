import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderKanban, ChevronRight,
  ArrowLeft, MapPin, Briefcase, Leaf, Building2, Heart, Droplet, GraduationCap,
  CheckCircle2, Users, Activity, Award, type LucideIcon, BarChart3, Grid3x3,
  Target, Zap
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import { useFilter } from '../context/useFilter';
import { useProjectContext } from '../context/useProjectContext';
import { useProjectContextLock } from '../hooks/useProjectContext';
import FilterBar from '../components/FilterBar';
import LockedFilterBar from '../components/LockedFilterBar';
import type { Project } from '../services/filterService';
import {
  getImpactMetricValue,
} from '../utils/impactMetrics';
import {
  IMPACT_METRIC_ORDER,
  renderImpactMetricCard,
} from '../utils/impactMetricDisplay';

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

interface PMDashboardInnerProps {
  shouldLockContext?: boolean;
}

// Helper function to format large metric values
const formatMetricValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const getProjectDisplayTitle = (project: { name: string; project_code: string }) =>
  `${project.name} - ${project.project_code}`;

interface ProjectWithBeneficiaries extends Project {
  displayName?: string;
  total_budget?: number;
  utilized_budget?: number;
  meals_served?: number;
  pads_distributed?: number;
  students_enrolled?: number;
  trees_planted?: number;
  schools_renovated?: number;
  project_code: string;
}

const PMDashboardInner = ({ shouldLockContext = true }: PMDashboardInnerProps = {}) => {
  // Lock filters when viewing from project context (only for non-admin)
  // Always call the hook, but it will check shouldLockContext internally
  useProjectContextLock();
  
  // Disable the lock effect for admin
  useEffect(() => {
    if (!shouldLockContext) {
      // For admin, don't lock filters even if there's a project context
      localStorage.removeItem('projectContext');
    }
  }, [shouldLockContext]);

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

  const { isProjectSelected, csrPartnerId, projectId } = useProjectContext();

  const currentYear = new Date().getFullYear();
  const defaultStartDate = `${currentYear}-03-01`;
  const defaultEndDate = `${currentYear + 1}-03-31`;

  const [viewMode, setViewMode] = useState<'partners' | 'projects' | 'folderDetails' | 'projectDetails'>('partners');
  const [selectedProjectData, setSelectedProjectData] = useState<ProjectWithBeneficiaries | null>(null);
  const [dashboardView, setDashboardView] = useState<'hierarchy' | 'analytics'>('analytics');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [startDateFilter, setStartDateFilter] = useState<string>(defaultStartDate);
  const [endDateFilter, setEndDateFilter] = useState<string>(defaultEndDate);

  const DateFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          value={startDateFilter}
          onChange={(e) => setStartDateFilter(e.target.value)}
          className="w-full rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
        <input
          type="date"
          value={endDateFilter}
          onChange={(e) => setEndDateFilter(e.target.value)}
          className="w-full rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );

  // When project is pre-selected from ProjectsDashboard, sync it to FilterContext
  useEffect(() => {
    if (isProjectSelected && csrPartnerId && projectId) {
      console.log('PMDashboard - Syncing pre-selected project to FilterContext');
      console.log('PMDashboard - Setting selectedPartner to:', csrPartnerId);
      console.log('PMDashboard - Setting selectedProject to:', projectId);
      setSelectedPartner(csrPartnerId);
      setSelectedProject(projectId);
      setViewMode('projectDetails');
    }
  }, [isProjectSelected, csrPartnerId, projectId, setSelectedPartner, setSelectedProject]);

  // Auto-switch to projects view when a partner is selected via FilterBar
  useEffect(() => {
    if (selectedPartner && !isProjectSelected) {
      setViewMode('projects');
    }
  }, [selectedPartner, isProjectSelected]);

  // Auto-switch to project details when a project is selected via FilterBar
  useEffect(() => {
    console.log('PMDashboard - selectedProject:', selectedProject);
    if (selectedProject && filteredProjects.length > 0) {
      const project = filteredProjects.find(p => p.id === selectedProject);
      console.log('PMDashboard - Found project:', project?.name);
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

  // Get projects for selected partner - fall back to all filtered projects if no partner locked
  const analyticsProjects = useMemo(() => {
    const parseDate = (value?: string) => (value ? new Date(value) : null);
    const start = parseDate(startDateFilter);
    const end = parseDate(endDateFilter);

    return filteredProjects.filter((project) => {
      const projectDate = parseDate(project.start_date) || parseDate(project.expected_end_date);

      if (!projectDate) return true;
      if (start && projectDate < start) return false;
      if (end && projectDate > end) return false;
      return true;
    });
    }, [filteredProjects, startDateFilter, endDateFilter]);

    const partnerProjects = selectedPartner
      ? analyticsProjects.filter((p) => p.csr_partner_id === selectedPartner)
      : analyticsProjects;

  const groupedProjects = useMemo(() => {
    const grouped = partnerProjects.reduce<Record<string, {
      projects: Project[];
      totalBudget: number;
      totalUtilized: number;
      totalBeneficiaries: number;
      activeCount: number;
      completedCount: number;
      mealsServed: number;
      padsDistributed: number;
      studentsEnrolled: number;
      treesPlanted: number;
      schoolsRenovated: number;
      customMetrics: Record<string, number>;
    }>>((acc, project) => {
      const key = (project.name || 'Untitled Project').trim();
      if (!acc[key]) {
        acc[key] = {
          projects: [],
          totalBudget: 0,
          totalUtilized: 0,
          totalBeneficiaries: 0,
          activeCount: 0,
          completedCount: 0,
          mealsServed: 0,
          padsDistributed: 0,
          studentsEnrolled: 0,
          treesPlanted: 0,
          schoolsRenovated: 0,
          customMetrics: {},
        };
      }

      acc[key].projects.push(project);
      acc[key].totalBudget += project.total_budget || 0;
      acc[key].totalUtilized += project.utilized_budget || 0;
      acc[key].totalBeneficiaries += project.direct_beneficiaries || 0;
      if (project.status === 'completed') {
        acc[key].completedCount += 1;
      } else {
        acc[key].activeCount += 1;
      }

      const p = project as ProjectWithBeneficiaries;
      acc[key].mealsServed += Math.max(p.meals_served || 0, getImpactMetricValue(project.impact_metrics, 'meals_served'));
      acc[key].padsDistributed += Math.max(p.pads_distributed || 0, getImpactMetricValue(project.impact_metrics, 'pads_distributed'));
      acc[key].studentsEnrolled += Math.max(p.students_enrolled || 0, getImpactMetricValue(project.impact_metrics, 'students_enrolled'));
      acc[key].treesPlanted += Math.max(p.trees_planted || 0, getImpactMetricValue(project.impact_metrics, 'trees_planted'));
      acc[key].schoolsRenovated += Math.max(p.schools_renovated || 0, getImpactMetricValue(project.impact_metrics, 'schools_renovated'));

      const metrics = project.impact_metrics || [];
      metrics.forEach((metric) => {
        if (metric.key === 'custom' && metric.customLabel && metric.value > 0) {
          const label = metric.customLabel;
          acc[key].customMetrics[label] = (acc[key].customMetrics[label] || 0) + metric.value;
        }
      });

      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, details]) => ({
        name,
        ...details,
      }))
      .sort((a, b) => {
        if (b.projects.length === a.projects.length) {
          return a.name.localeCompare(b.name);
        }
        return b.projects.length - a.projects.length;
      });
  }, [partnerProjects]);

  const impactTotals = useMemo(() => {
    return analyticsProjects.reduce(
      (totals, project) => {
        const mealsFromColumn = (project as ProjectWithBeneficiaries).meals_served || 0;
        const padsFromColumn = (project as ProjectWithBeneficiaries).pads_distributed || 0;
        const studentsFromColumn = (project as ProjectWithBeneficiaries).students_enrolled || 0;
        const treesFromColumn = (project as ProjectWithBeneficiaries).trees_planted || 0;
        const schoolsFromColumn = (project as ProjectWithBeneficiaries).schools_renovated || 0;

        totals.beneficiaries += project.direct_beneficiaries || 0;
        totals.meals += Math.max(mealsFromColumn, getImpactMetricValue(project.impact_metrics, 'meals_served'));
        totals.pads += Math.max(padsFromColumn, getImpactMetricValue(project.impact_metrics, 'pads_distributed'));
        totals.students += Math.max(studentsFromColumn, getImpactMetricValue(project.impact_metrics, 'students_enrolled'));
        totals.trees += Math.max(treesFromColumn, getImpactMetricValue(project.impact_metrics, 'trees_planted'));
        totals.schools += Math.max(schoolsFromColumn, getImpactMetricValue(project.impact_metrics, 'schools_renovated'));
        return totals;
      },
      {
        beneficiaries: 0,
        meals: 0,
        pads: 0,
        students: 0,
        trees: 0,
        schools: 0,
      }
    );
  }, [analyticsProjects]);

  const customImpactMetrics = useMemo(() => {
    const metrics: Record<string, number> = {};
    analyticsProjects.forEach((project) => {
      const projectMetrics = project.impact_metrics || [];
      projectMetrics.forEach((metric) => {
        if (metric.key === 'custom' && metric.customLabel && metric.value > 0) {
          const label = metric.customLabel;
          metrics[label] = (metrics[label] || 0) + metric.value;
        }
      });
    });
    return metrics;
  }, [analyticsProjects]);

  const customImpactColorPalette = [
    { bg: 'bg-cyan-50', border: 'border-cyan-200', iconBg: 'bg-cyan-200', text: 'text-cyan-700', value: 'text-cyan-900' },
    { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-200', text: 'text-amber-700', value: 'text-amber-900' },
    { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-200', text: 'text-rose-700', value: 'text-rose-900' },
    { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-200', text: 'text-indigo-700', value: 'text-indigo-900' },
    { bg: 'bg-teal-50', border: 'border-teal-200', iconBg: 'bg-teal-200', text: 'text-teal-700', value: 'text-teal-900' },
  ];

  const standardImpactCards = useMemo(() => [
    {
      key: 'beneficiaries',
      label: 'Total Beneficiaries',
      value: impactTotals.beneficiaries,
      icon: Users,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-200',
      textColor: 'text-emerald-700',
      valueColor: 'text-emerald-900',
    },
    {
      key: 'meals',
      label: 'Meals Served',
      value: impactTotals.meals,
      icon: Activity,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-200',
      textColor: 'text-orange-700',
      valueColor: 'text-orange-900',
    },
    {
      key: 'pads',
      label: 'Pads Distributed',
      value: impactTotals.pads,
      icon: Award,
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      iconBg: 'bg-pink-200',
      textColor: 'text-pink-700',
      valueColor: 'text-pink-900',
    },
    {
      key: 'students',
      label: 'Students Enrolled',
      value: impactTotals.students,
      icon: GraduationCap,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-200',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900',
    },
    {
      key: 'trees',
      label: 'Trees Planted',
      value: impactTotals.trees,
      icon: Leaf,
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-200',
      textColor: 'text-green-700',
      valueColor: 'text-green-900',
    },
    {
      key: 'schools',
      label: 'Schools Renovated',
      value: impactTotals.schools,
      icon: FolderKanban,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-200',
      textColor: 'text-purple-700',
      valueColor: 'text-purple-900',
    },
  ], [impactTotals]);

  const visibleStandardImpactCards = standardImpactCards.filter((card) => card.value > 0);
  const hasAnyImpactMetrics = visibleStandardImpactCards.length > 0 || Object.keys(customImpactMetrics).length > 0;

  console.log('PMDashboard - selectedPartner:', selectedPartner);
  console.log('PMDashboard - partnerProjects count:', partnerProjects.length);
  console.log('PMDashboard - partnerProjects:', partnerProjects);
  
  // Debug: Check if impact metrics data is being loaded
  useEffect(() => {
    if (filteredProjects.length > 0) {
      const sampleProject = filteredProjects[0] as ProjectWithBeneficiaries;
      console.log('PMDashboard - Sample project impact data:', {
        name: sampleProject.name,
        meals_served: sampleProject.meals_served,
        pads_distributed: sampleProject.pads_distributed,
        students_enrolled: sampleProject.students_enrolled,
        trees_planted: sampleProject.trees_planted,
        schools_renovated: sampleProject.schools_renovated,
        impact_metrics: sampleProject.impact_metrics,
      });
    }
  }, [filteredProjects]);

  const handlePartnerClick = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setViewMode('projects');
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProjectData(project as ProjectWithBeneficiaries);
    setSelectedProject(project.id);
    setViewMode('projectDetails');
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setViewMode('folderDetails');
  };

  const handleBack = () => {
    if (viewMode === 'projectDetails') {
      // If we came from folder view, go back to folder
      if (selectedFolder) {
        setViewMode('folderDetails');
      } else {
        setViewMode('projects');
      }
      setSelectedProjectData(null);
      setSelectedProject(null);
    } else if (viewMode === 'folderDetails') {
      setViewMode('projects');
      setSelectedFolder(null);
    } else if (viewMode === 'projects') {
      setViewMode('partners');
      setSelectedPartner(null);
      resetFilters();
    }
  };

  return (
    <>
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
                  Project  Center
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {dashboardView === 'hierarchy' ? (
                    <>
                      {viewMode === 'partners' && 'Select CSR Partner to view their projects'}
                      {viewMode === 'projects' && selectedPartnerObject && `Projects by ${selectedPartnerObject.name}`}
                      {viewMode === 'folderDetails' && selectedFolder && `Folder: ${selectedFolder}`}
                      {viewMode === 'projectDetails' && selectedProjectData && `Project: ${selectedProjectData.name}`}
                    </>
                  ) : (
                    'Analytics Dashboard - All Projects Overview'
                  )}
                </p>
              </div>
            </div>
            {/* View Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (dashboardView === 'hierarchy') {
                  setDashboardView('analytics');
                } else {
                  setDashboardView('hierarchy');
                  setViewMode('partners');
                  resetFilters();
                }
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                dashboardView === 'analytics' 
                  ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500'
              }`}
            >
              {dashboardView === 'hierarchy' ? (
                <>
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </>
              ) : (
                <>
                  <Grid3x3 className="w-5 h-5" />
                  <span>Projects</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ANALYTICS VIEW */}
      {dashboardView === 'analytics' ? (
        <motion.div
          key="analytics-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Filter Bar for Analytics */}
          <div className="mb-4">
            <FilterBar />
          </div>

          {/* Date Filters */}
          <DateFilters />

          {/* Summary Stats - Updates with filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
            {/* Total Projects Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-linear-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-200 rounded-xl">
                  <FolderKanban className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">TOTAL</span>
              </div>
              <p className="text-3xl font-black text-emerald-900 mb-1">{analyticsProjects.length}</p>
              <p className="text-sm text-emerald-700 font-semibold">All Projects</p>
            </motion.div>

            {/* Active Projects Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-200 rounded-xl">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-200 px-3 py-1 rounded-full">ACTIVE</span>
              </div>
              <p className="text-3xl font-black text-blue-900 mb-1">{analyticsProjects.filter((p: Project) => p.status === 'active').length}</p>
              <p className="text-sm text-blue-700 font-semibold">Active Projects</p>
            </motion.div>

            {/* Total Budget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-200 rounded-xl">
                  <Zap className="w-6 h-6 text-purple-700" />
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-200 px-3 py-1 rounded-full">BUDGET</span>
              </div>
              <p className="text-3xl font-black text-purple-900 mb-1">
                ₹{(analyticsProjects.reduce((sum: number, p: Project) => sum + (p.total_budget || 0), 0) / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-sm text-purple-700 font-semibold">Total Budget</p>
            </motion.div>

            {/* Spent Budget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-linear-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-2xl p-6 shadow-lg hover:shadow-teal-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-teal-200 rounded-xl">
                  <Zap className="w-6 h-6 text-teal-700" />
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-200 px-3 py-1 rounded-full">SPENT</span>
              </div>
              <p className="text-3xl font-black text-teal-900 mb-1">
                ₹{(analyticsProjects.reduce((sum: number, p: Project) => sum + (p.utilized_budget || 0), 0) / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-sm text-teal-700 font-semibold">Total Utilized</p>
            </motion.div>

            {/* Remaining Budget Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-linear-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-6 shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-200 rounded-xl">
                  <Target className="w-6 h-6 text-amber-700" />
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-200 px-3 py-1 rounded-full">REMAINING</span>
              </div>
              <p className="text-3xl font-black text-amber-900 mb-1">
                ₹{((analyticsProjects.reduce((sum: number, p: Project) => sum + (p.total_budget || 0), 0) - analyticsProjects.reduce((sum: number, p: Project) => sum + (p.utilized_budget || 0), 0)) / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-sm text-amber-700 font-semibold">Budget Remaining</p>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget vs Utilization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Budget vs Utilization</h3>
                  <p className="text-sm text-gray-500">Total budget split by utilized and remaining</p>
                </div>
                <span className="text-sm text-gray-500">{analyticsProjects.length} projects</span>
              </div>

              {(() => {
                const totalBudget = analyticsProjects.reduce((sum: number, p: Project) => sum + (p.total_budget || 0), 0);
                const totalUtilized = analyticsProjects.reduce((sum: number, p: Project) => sum + (p.utilized_budget || 0), 0);
                const totalRemaining = Math.max(totalBudget - totalUtilized, 0);
                const pieData = [
                  { name: 'Utilized', value: totalUtilized, color: '#10b981' },
                  { name: 'Remaining', value: totalRemaining, color: '#f59e0b' },
                ];
                return (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label
                          value={`₹${(totalUtilized / 10000000).toFixed(1)}Cr`}
                          position="center"
                          className="text-xl font-black text-gray-900"
                        />
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${(Number(value) / 10000000).toFixed(2)}Cr`, '']} />
                      <Legend formatter={(value: string | number) => <span className="text-sm text-gray-700 font-semibold">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </motion.div>

            {/* Top CSR Partners by Project Count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top Partners by Projects</h3>
              <div className="flex items-center justify-center min-h-[300px]">
                {analyticsProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-semibold">No partner data available</p>
                    <p className="text-gray-400 text-sm mt-1">Partner statistics will appear here once projects are added</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={csrPartners.slice(0, 8).map(partner => ({
                      name: partner.name.substring(0, 12),
                      projects: analyticsProjects.filter((p: Project) => p.csr_partner_id === partner.id).length
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #10b981' }} />
                      <Bar dataKey="projects" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Impact Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Impact Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleStandardImpactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.key} className={`${card.bg} border-2 ${card.border} rounded-xl p-6 hover:shadow-lg transition-all`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 ${card.iconBg} rounded-lg`}>
                          <Icon className={`w-5 h-5 ${card.textColor}`} />
                        </div>
                        <span className={`text-sm font-bold ${card.textColor} uppercase`}>{card.label}</span>
                      </div>
                      <p className={`text-3xl font-black ${card.valueColor}`}>
                        {formatMetricValue(card.value)}
                      </p>
                    </div>
                  );
                })}

                {Object.entries(customImpactMetrics).map(([label, value], index) => {
                  const color = customImpactColorPalette[index % customImpactColorPalette.length];
                  return (
                    <div key={label} className={`${color.bg} border-2 ${color.border} rounded-xl p-6 hover:shadow-lg transition-all`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 ${color.iconBg} rounded-lg`}>
                          <Target className={`w-5 h-5 ${color.text}`} />
                        </div>
                        <span className={`text-sm font-bold ${color.text} uppercase`}>{label}</span>
                      </div>
                      <p className={`text-3xl font-black ${color.value}`}>
                        {formatMetricValue(value)}
                      </p>
                    </div>
                  );
                })}

                {!hasAnyImpactMetrics && (
                  <div className="col-span-full rounded-xl border-2 border-dashed border-gray-200 bg-white/80 p-6 text-center text-sm text-gray-500">
                    No impact metrics available with values greater than zero.
                  </div>
                )}
              </div>
          </motion.div>
        </motion.div>
      ) : (
        // HIERARCHY VIEW - All existing code
        <>
          <div className="mb-4">
            {isProjectSelected ? <LockedFilterBar /> : <FilterBar />}
          </div>
          <DateFilters />

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
              {csrPartners
                // When project is pre-selected, only show the selected partner
                .filter(partner => !isProjectSelected || partner.id === selectedPartner)
                .map((partner, index) => {
                // Count projects for this partner from the date-filtered list
                const partnerProjectCount = analyticsProjects.filter((p: Project) => p.csr_partner_id === partner.id).length;
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

            {groupedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedProjects.map((group, index) => {
                  const projectLabel = group.projects.length === 1 ? 'Project' : 'Projects';
                  const formattedBudget = group.totalBudget > 0
                    ? `₹${(group.totalBudget / 10000000).toFixed(2)}Cr`
                    : '';

                  const impactItems = [
                    { label: 'Schools Renovated', value: group.schoolsRenovated, color: 'purple' },
                    { label: 'Students Enrolled', value: group.studentsEnrolled, color: 'blue' },
                    { label: 'Trees Planted', value: group.treesPlanted, color: 'green' },
                    { label: 'Meals Served', value: group.mealsServed, color: 'orange' },
                    { label: 'Pads Distributed', value: group.padsDistributed, color: 'pink' },
                  ].filter(item => item.value > 0);

                  const customItems = Object.entries(group.customMetrics).map(([label, value]) => ({
                    label,
                    value,
                    color: 'gray',
                  }));

                  const allImpactItems = [...impactItems, ...customItems];

                  return (
                    <motion.button
                      key={group.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleFolderClick(group.name)}
                      className="group relative text-left"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100"></div>
                      
                      <div className="relative bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-all">
                              <FolderKanban className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              {group.projects.length} {projectLabel}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{group.name}</h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
                              {group.activeCount} Active
                            </span>
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                              {group.completedCount} Completed
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                              {formatMetricValue(group.totalBeneficiaries)} Beneficiaries
                            </span>
                            {formattedBudget && (
                              <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                                {formattedBudget}
                              </span>
                            )}
                          </div>

                          {allImpactItems.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                              {allImpactItems.slice(0, 3).map((item) => (
                                <span
                                  key={item.label}
                                  className={`text-xs font-medium px-2 py-1 rounded-full bg-${item.color}-100 text-${item.color}-700`}
                                >
                                  {item.label}: {formatMetricValue(item.value)}
                                </span>
                              ))}
                              {allImpactItems.length > 3 && (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                  +{allImpactItems.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mt-4 group-hover:gap-3 transition-all">
                            View Projects
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

        {/* FOLDER DETAILS VIEW */}
        {viewMode === 'folderDetails' && selectedFolder && (() => {
          const folderData = groupedProjects.find(g => g.name === selectedFolder);
          if (!folderData) return null;

          const impactItems = [
            { label: 'Schools Renovated', value: folderData.schoolsRenovated, color: 'purple', icon: '🏫' },
            { label: 'Students Enrolled', value: folderData.studentsEnrolled, color: 'blue', icon: '🎓' },
            { label: 'Trees Planted', value: folderData.treesPlanted, color: 'green', icon: '🌳' },
            { label: 'Meals Served', value: folderData.mealsServed, color: 'orange', icon: '🍽️' },
            { label: 'Pads Distributed', value: folderData.padsDistributed, color: 'pink', icon: '🩸' },
          ].filter(item => item.value > 0);

          const customItems = Object.entries(folderData.customMetrics).map(([label, value]) => ({
            label,
            value,
            color: 'cyan',
            icon: '📊',
          }));

          const allImpactItems = [...impactItems, ...customItems];

          return (
            <motion.div
              key="folderDetails"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Folder Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                    <Building2 className="w-4 h-4" />
                    {selectedPartnerObject?.name}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full font-semibold">
                    <FolderKanban className="w-4 h-4" />
                    {selectedFolder}
                  </div>
                </div>
              </div>

              {/* Folder Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-3xl p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-emerald-100 rounded-2xl">
                    <FolderKanban className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFolder}</h2>
                    <p className="text-gray-600">{folderData.projects.length} {folderData.projects.length === 1 ? 'Project' : 'Projects'} in this folder</p>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-700">{folderData.activeCount}</p>
                    <p className="text-xs font-semibold text-yellow-600 uppercase">Active</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{folderData.completedCount}</p>
                    <p className="text-xs font-semibold text-blue-600 uppercase">Completed</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-700">{formatMetricValue(folderData.totalBeneficiaries)}</p>
                    <p className="text-xs font-semibold text-purple-600 uppercase">Beneficiaries</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-700">
                      {folderData.totalBudget > 0 ? `₹${(folderData.totalBudget / 10000000).toFixed(2)}Cr` : '—'}
                    </p>
                    <p className="text-xs font-semibold text-orange-600 uppercase">Total Budget</p>
                  </div>
                </div>

                {/* Impact Metrics Grid */}
                {allImpactItems.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Folder Impact Totals</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {folderData.totalUtilized > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">💰</span>
                            <span className="text-xs font-bold text-emerald-700 uppercase">Utilized</span>
                          </div>
                          <p className="text-xl font-bold text-emerald-800">₹{formatMetricValue(folderData.totalUtilized)}</p>
                        </div>
                      )}
                      {allImpactItems.map((item) => (
                        <div key={item.label} className={`bg-${item.color}-50 border border-${item.color}-200 rounded-xl p-4`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className={`text-xs font-bold text-${item.color}-700 uppercase`}>{item.label}</span>
                          </div>
                          <p className={`text-xl font-bold text-${item.color}-800`}>{formatMetricValue(item.value)}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Projects Grid */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">Projects in {selectedFolder}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {folderData.projects.map((project, projectIndex) => {
                  const Icon = getIconComponent(project.display_icon);
                  const colorClass = project.display_color || 'emerald';

                  return (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: projectIndex * 0.05 }}
                      onClick={() => handleProjectClick(project)}
                      className="group relative text-left"
                    >
                      <div className={`absolute inset-0 bg-linear-to-br from-${colorClass}-500/15 to-${colorClass}-600/15 rounded-2xl blur-2xl group-hover:blur-3xl transition-all opacity-0 group-hover:opacity-100`}></div>

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

                          <h3 className="text-lg font-bold text-gray-900 mb-1">{getProjectDisplayTitle(project)}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                          )}

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
            </motion.div>
          );
        })()}

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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{getProjectDisplayTitle(selectedProjectData)}</h2>
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
                  {selectedProjectData.direct_beneficiaries !== undefined && selectedProjectData.direct_beneficiaries > 0 && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 uppercase">Total Reach</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-900">
                        {selectedProjectData.direct_beneficiaries.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {IMPACT_METRIC_ORDER.map((key) => {
                    const value = getImpactMetricValue(selectedProjectData.impact_metrics, key);
                    if (typeof value !== 'number' || value <= 0) return null;
                    return renderImpactMetricCard(key, value.toLocaleString());
                  })}
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
    </>
  );
};

const PMDashboard = () => (
  <div className="min-h-screen bg-linear-to-br from-gray-50 via-emerald-50/20 to-gray-50 p-4 md:p-8">
    <PMDashboardInner />
  </div>
);

export { PMDashboardInner };
export default PMDashboard;
